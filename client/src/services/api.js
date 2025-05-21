// services/api.js

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Upload PDF file to the server
 * @param {File} pdfFile - The PDF file to be uploaded
 * @returns {Promise<Object>} - Server response with processing results
 */
export const uploadPdf = async (pdfFile) => {
  const formData = new FormData();
  formData.append("pdf", pdfFile);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload the PDF.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

/**
 * Send a query to the server and get a response
 * @param {string} query - User's question about the PDF
 * @param {Array} conversationHistory - History of the conversation
 * @returns {Promise<string>} - AI response to the query
 */
export const askQuestion = async (query, conversationHistory) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        conversationHistory: conversationHistory
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get response");
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
};

export default {
  uploadPdf,
  askQuestion
};