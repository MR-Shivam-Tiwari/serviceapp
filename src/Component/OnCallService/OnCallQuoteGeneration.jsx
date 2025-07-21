import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OnCallQuoteGeneration() {
  const navigate = useNavigate();
  const [onCalls, setOnCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnCalls = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch onCalls");
        }
        const result = await response.json();
        const data = result.data || result;
        
        // Filter only approved onCalls
        const approvedOnCalls = Array.isArray(data) ? data.filter(onCall => onCall.status === "approved") : [];
        setOnCalls(approvedOnCalls);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOnCalls();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleOnCallClick = (onCall) => {
    navigate(`/oncall-quote-generation/${onCall._id}`, { state: { onCall } });
  };

  if (loading)
    return (
      <div className="p-4">
        <div className="flex mt-20 items-center justify-center">
          <span className="loader"></span>
        </div>
      </div>
    );
  
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/oncall-service")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="currentColor"
            className="bi bi-arrow-left-short"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
              0 0 1-.708.708l-3-3a.5.5 
              0 0 1 0-.708l3-3a.5.5 
              0 1 1 .708.708L5.707 7.5H11.5a.5.5 
              0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">OnCall Quote Generation</h2>
      </div>

      {/* Main Content */}
      <div className="pb-4 px-4">
        <div className="space-y-4">
          {onCalls.map((onCall) => (
            <div
              key={onCall._id}
              className="bg-white p-4 rounded shadow-md cursor-pointer"
              onClick={() => handleOnCallClick(onCall)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {onCall.customer.customername}
                  </h3>
                  <p className="text-gray-600">
                    {onCall.customer.city}, {onCall.customer.postalcode}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Device: {onCall.complaint?.materialdescription}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  APPROVED
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {onCall.onCallNumber}
                </span>
                <span className="text-sm font-semibold">
                  ₹{onCall.finalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Created: {formatDate(onCall.createdAt)}
              </div>
              {onCall.currentRevision > 0 && (
                <div className="mt-1 text-xs text-blue-600">
                  Revision: {onCall.currentRevision}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OnCallQuoteGeneration;
