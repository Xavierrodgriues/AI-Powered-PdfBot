const axios = require("axios");
const { getEmbeddings } = require("../services/embeddingService");
const { pineconeIndex } = require("../services/pineconeService");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function handleChat(req, res) {
  try {
    const { query, conversationHistory = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const queryEmbedding = await getEmbeddings(query);

    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    });

    const relevantContext = queryResponse.matches
      .map(match => match.metadata.text)
      .join("\n\n");

    if (!relevantContext) {
      return res.status(404).json({ error: "No relevant information found in the database" });
    }

    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that answers questions based on the provided context. 
                  Use ONLY the context provided to answer the question. If the information is not 
                  available in the context, say you don't know.
                  
                  Context:
                  ${relevantContext}`
      },
      ...conversationHistory,
      { role: "user", content: query }
    ];

    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      answer: groqResponse.data.choices[0].message.content,
      context: relevantContext
    });

  } catch (error) {
    console.error("❌ Error querying chatbot:", error);
    res.status(500).json({ 
      error: "Failed to process query", 
      details: error.message
    });
  }
}

module.exports = { handleChat };
