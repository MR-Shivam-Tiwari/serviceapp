import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PendingProposal() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

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

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseDetails = () => {
    setSelectedProposal(null);
  };

  const handleRevision = (proposalId) => {
    // Navigate to revision page with the proposal ID
    navigate(`/proposal-revision/${proposalId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button
            className="mr-2 text-white"
            onClick={() => navigate("/contract-proposal")}
          >
            {/* Back button SVG */}
          </button>
          <h2 className="text-xl font-bold">Pending Proposal</h2>
        </div>
        <div className="mt-20 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button
            className="mr-2 text-white"
            onClick={() => navigate("/contract-proposal")}
          >
            {/* Back button SVG */}
          </button>
          <h2 className="text-xl font-bold">Pending Proposal</h2>
        </div>
        <div className="mt-20 p-4 text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/contract-proposal")}
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
        <h2 className="text-xl font-bold">Pending Proposal</h2>
      </div>

      <main className="mt-20 space-y-4">
        {proposals.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No pending proposals found
          </div>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {proposal.customer.customername}
                  </h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {proposal.proposalNumber}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Customer City</p>
                  <p className="font-bold">{proposal.customer.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">Revision</p>
                  <p className="font-bold">{proposal.currentRevision}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Total Items</p>
                  <p>{proposal.items.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Final Amount</p>
                  <p className="font-bold">
                    ₹{proposal.finalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between space-x-2">
                <button
                  onClick={() => handleViewDetails(proposal)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRevision(proposal._id)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
                >
                  Revision
                </button>
              </div>
            </div>
          ))
        )}

        {/* Proposal Details Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Proposal Details</h3>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <span className="text-gray-500">Name:</span>{" "}
                        {selectedProposal.customer.customername}
                      </p>
                      <p>
                        <span className="text-gray-500">City:</span>{" "}
                        {selectedProposal.customer.city}
                      </p>
                      <p>
                        <span className="text-gray-500">Code:</span>{" "}
                        {selectedProposal.customer.customercodeid}
                      </p>
                      <p>
                        <span className="text-gray-500">GST:</span>{" "}
                        {selectedProposal.customer.taxnumber2}
                      </p>
                    </div>
                  </div>

                  <div className="">
                    <h4 className="font-semibold mb-2">
                      Items ({selectedProposal.items.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedProposal.items.map((item, index) => (
                        <div key={index} className="border-b pb-2 bg-gray-100 p-2 rounded">
                          <p className="font-medium">{item.equipment.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.equipment.materialdescription}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-sm mt-1">
                            <p>
                              <span className="text-gray-500">Type:</span>{" "}
                              {item.warrantyType}
                            </p>
                            <p>
                              <span className="text-gray-500">Years:</span>{" "}
                              {item.years}
                            </p>
                            <p>
                              <span className="text-gray-500">Price:</span> ₹
                              {item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Financial Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          ₹{selectedProposal.grandSubTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Discount ({selectedProposal.discountPercentage}%):
                        </span>
                        <span>
                          -₹{selectedProposal.discountAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>TDS ({selectedProposal.tdsPercentage}%):</span>
                        <span>-₹{selectedProposal.tdsAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST ({selectedProposal.gstPercentage}%):</span>
                        <span>+₹{selectedProposal.gstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Final Amount:</span>
                        <span>₹{selectedProposal.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProposal.remark && (
                    <div>
                      <h4 className="font-semibold mb-2">Remark</h4>
                      <p className="text-sm bg-gray-100 p-2 rounded">
                        {selectedProposal.remark}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingProposal;
