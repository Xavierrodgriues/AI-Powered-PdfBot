// components/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = () => {
  return (
    <svg
      className="animate-spin h-5 w-5 mr-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        fill="currentColor"
        d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8"
      />
    </svg>
  );
};

export default LoadingSpinner;