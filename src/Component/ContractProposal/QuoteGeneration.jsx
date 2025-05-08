import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function QuoteGeneration() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch("http://localhost:5000/phone/proposal");
        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const data = await response.json();
        setProposals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleProposalClick = (proposal) => {
    navigate(`/quote-generation/${proposal._id}`, { state: { proposal } });
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
        <button className="mr-2 text-white" onClick={() => navigate('/contract-proposal')}>
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
        <h2 className="text-xl font-bold">Quote Generation Pending</h2>
      </div>

      {/* Main Content */}
      <div className="pt-[95px]  pb-4 px-4">
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal._id}
              className="bg-white p-4 rounded shadow-md cursor-pointer"
              onClick={() => handleProposalClick(proposal)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {proposal.customer.customername}
                  </h3>
                  <p className="text-gray-600">
                    {proposal.customer.city}, {proposal.customer.postalcode}
                  </p>
                </div>
                {/* <span
                  className={`px-2 py-1 rounded text-xs ${
                    proposal.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : proposal.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : proposal.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {proposal.status.toUpperCase()}
                </span> */}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {proposal.proposalNumber}
                </span>
                <span className="text-sm font-semibold">
                  ₹{proposal.finalAmount.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Created: {formatDate(proposal.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuoteGeneration;
