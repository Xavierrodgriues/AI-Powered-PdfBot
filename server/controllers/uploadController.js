const pdfParse = require("pdf-parse");
const fs = require("fs");
const { getEmbeddings } = require("../services/embeddingService");
const { pineconeIndex } = require("../services/pineconeService");

async function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    const chunkSize = 1000;
    const chunks = text.match(new RegExp(`(.|[\\r\\n]){1,${chunkSize}}`, 'g'));

    console.log(`📄 Extracted and split into ${chunks.length} chunks`);

    try {
      await pineconeIndex.deleteAll();
      console.log("🧹 Previous vectors deleted.");
    } catch (error) {
      if (error.name === "PineconeNotFoundError") {
        console.warn("⚠️ No vectors to delete – index is already empty.");
      } else {
        throw error;
      }
    }

    const batchSize = 10;
    const vectors = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const currentBatch = chunks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(chunks.length / batchSize);

      console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)})`);

      const batchPromises = currentBatch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        try {
          // Get embeddings from service
          const embedding = await getEmbeddings(chunk);
          
          // Debug log to check embedding format
          if (chunkIndex === 0) {
            console.log('First embedding type:', typeof embedding);
            console.log('Is array:', Array.isArray(embedding));
            console.log('Sample values:', Array.isArray(embedding) ? embedding.slice(0, 3) : 'Not an array');
          }
          
          // Ensure embedding is an array of numbers
          if (!embedding || !Array.isArray(embedding)) {
            console.error(`❌ Error embedding chunk ${chunkIndex}: Invalid embedding format`);
            return null;
          }
          
          // Create vector with proper format
          return {
            id: `${req.file.originalname}_${Date.now()}_${chunkIndex}`,
            values: embedding,
            metadata: {
              filename: req.file.originalname,
              chunkIndex: chunkIndex,
              text: chunk,
              uploadedAt: new Date().toISOString(),
            },
          };
        } catch (error) {
          console.error(`❌ Error embedding chunk ${chunkIndex}: ${error.message}`);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      vectors.push(...validResults);

      console.log(`✅ Completed batch ${batchNumber}/${totalBatches}`);
    }

    if (vectors.length > 0) {
      // Log the first vector structure for debugging
      console.log('First vector structure for Pinecone:', {
        id: vectors[0].id,
        metadataKeys: Object.keys(vectors[0].metadata),
        valuesType: typeof vectors[0].values,
        isArray: Array.isArray(vectors[0].values),
        valuesLength: Array.isArray(vectors[0].values) ? vectors[0].values.length : 'Not an array'
      });
      
      await pineconeIndex.upsert(vectors);
      console.log(`🚀 Successfully uploaded ${vectors.length} vectors to Pinecone`);
    } else {
      throw new Error("No valid vectors were generated from the PDF");
    }

    res.json({
      message: `✅ PDF processed. ${vectors.length} chunks embedded and stored in Pinecone.`,
      totalChunks: chunks.length,
      successfulChunks: vectors.length,
    });

  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    res.status(500).send("Failed to process PDF: " + error.message);
  }
}

async function parsePdf(req, res) {
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(pdfBuffer);

    console.log("✅ Parsed Text:", data.text);

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "PDF parsed successfully!",
      text: data.text,
    });
  } catch (err) {
    console.error("❌ Error parsing PDF:", err);
    res.status(500).json({ error: "Failed to parse PDF." });
  }
}

module.exports = { handleUpload, parsePdf };