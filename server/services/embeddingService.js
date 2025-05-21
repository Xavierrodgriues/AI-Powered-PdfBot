const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Create Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Model ID for embeddings
const EMBEDDING_MODEL = 'embedding-001';

// Target dimension for Pinecone - update this to match your Pinecone index dimension
const TARGET_DIMENSION = 384;

async function getEmbeddings(text) {
  try {
    // Get the embedding model directly
    const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    
    // Generate embedding
    const result = await embeddingModel.embedContent(text);
    
    // Extract the actual embedding vector (flat array of numbers)
    let embedVector;
    
    if (Array.isArray(result.embedding)) {
      embedVector = result.embedding;
    } else if (result.embedding && typeof result.embedding === 'object') {
      if ('values' in result.embedding && Array.isArray(result.embedding.values)) {
        embedVector = result.embedding.values;
      } else {
        for (const key in result.embedding) {
          if (Array.isArray(result.embedding[key])) {
            embedVector = result.embedding[key];
            break;
          }
        }
      }
    }
    
    // Verify we have a valid embedding vector
    if (!embedVector || !Array.isArray(embedVector)) {
      console.error('Invalid embedding result:', result);
      throw new Error('Failed to extract valid embedding vector');
    }
    
    // Handle dimension mismatch
    const originalDimension = embedVector.length;
    
    if (originalDimension !== TARGET_DIMENSION) {
      console.log(`Adjusting embedding dimension from ${originalDimension} to ${TARGET_DIMENSION}`);
      embedVector = adjustDimension(embedVector, TARGET_DIMENSION);
    }
    
    return embedVector;
  } catch (error) {
    console.error("❌ Error generating embeddings from Gemini:", error.message);
    throw error;
  }
}

// Function to adjust the dimension of the embedding vector
function adjustDimension(vector, targetDim) {
  const originalDim = vector.length;
  
  if (originalDim === targetDim) {
    return vector;
  }
  
  if (originalDim < targetDim) {
    // If original dimension is smaller, pad with zeros
    return [...vector, ...Array(targetDim - originalDim).fill(0)];
  } else {
    // If original dimension is larger, use dimensionality reduction
    // Method 1: Simple truncation (fastest but loses information)
    // return vector.slice(0, targetDim);
    
    // Method 2: Stride-based sampling (better distribution of information)
    const result = new Array(targetDim);
    const stride = originalDim / targetDim;
    
    for (let i = 0; i < targetDim; i++) {
      const sourceIndex = Math.floor(i * stride);
      result[i] = vector[sourceIndex];
    }
    
    return result;
  }
}

module.exports = { getEmbeddings };