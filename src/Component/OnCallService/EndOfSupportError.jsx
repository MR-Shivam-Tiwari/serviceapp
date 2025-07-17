// EndOfSupportError.jsx
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EndOfSupportError = ({ endDate }) => {
  const navigate = useNavigate();

  // Parse the date from the message if needed
  const supportEndDate = endDate ? new Date(endDate).toDateString() : "the end of support date";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-red-500 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Error 001: End of Support</h1>
        <p className="text-gray-600 mb-6">
          This product has reached end of support on {supportEndDate}.
          Spare parts are no longer available for this product.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
        >
          <ArrowLeft className="mr-2" size={18} />
          Go Back
        </button>
      </div>
    </div>
  );
};