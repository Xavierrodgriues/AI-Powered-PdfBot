// components/PdfUploadSection.jsx
import React from "react";
import { toast } from "react-toastify";

const PdfUploadSection = ({
  pdfFile,
  pdfUploaded,
  loading,
  isProcessing,
  processedChunks,
  totalChunks,
  progressPercentage,
  progressRef,
  handleFileChange,
  handleFileUpload
}) => {
  const validateFileType = (file) => {
    if (file && file.type === "application/pdf") {
      return true;
    }
    toast.error("Please select a valid PDF file.");
    return false;
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (validateFileType(file)) {
      handleFileChange(e);
      toast.success("PDF file selected!");
    }
  };

  return (
    <div className="w-full md:w-1/2 p-6 flex items-center justify-center bg-gray-950 border-b md:border-b-0 md:border-r border-gray-700">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-2xl shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-bold">📄 Upload your PDF</h2>
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-10 hover:border-blue-600 transition duration-300 bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-blue-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-blue-300">
            Click to select or drag and drop a PDF
          </p>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
        {pdfFile && (
          <p className="text-sm text-gray-300 mt-2">
            Selected File:{" "}
            <span className="text-blue-300">{pdfFile.name}</span>
            {pdfUploaded && <span className="ml-2 text-green-400">(Uploaded)</span>}
          </p>
        )}

        {/* Progress Bar with Smooth Animation */}
        {isProcessing && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Processing PDF...</span>
              <span>{processedChunks} of {totalChunks} chunks ({progressPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                ref={progressRef}
                className="bg-blue-600 h-2.5 rounded-full will-change-[width] ease-out" 
                style={{ width: `${progressPercentage}%`, transition: "none" }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={handleFileUpload}
          disabled={loading || !pdfFile}
          className={`w-full text-white px-4 py-2 hover:cursor-pointer rounded-lg mt-4 ${
            loading || !pdfFile ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : "Upload PDF"}
        </button>
      </div>
    </div>
  );
};

export default PdfUploadSection;