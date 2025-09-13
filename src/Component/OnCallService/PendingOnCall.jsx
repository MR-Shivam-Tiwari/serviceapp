import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PendingOnCall() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const data = await response.json();
        setProposals(data.data || []); // Access the data array from response
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
    navigate(`/on-call-revision/${proposalId}`);
  };

  const shouldShowRevisionButton = (proposal) => {
    // Only disable if cnoteNumber has a value, otherwise always enable
    return !proposal?.cnoteNumber;
  };

  const formatCurrency = (value) => {
    return value !== null ? `₹${parseFloat(value).toFixed(2)}` : "₹0.00";
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const filteredProposals = proposals.filter((proposal) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      proposal?.onCallNumber?.toLowerCase().includes(searchLower) ||
      proposal?.customer?.customername?.toLowerCase().includes(searchLower) ||
      proposal?.customer?.city?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate("/oncall-service")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
              Pending OnCall Proposals
            </h1>
          </div>
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
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate("/oncall-service")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
              Pending OnCall Proposals
            </h1>
          </div>
        </div>
        <div className="mt-20 p-4 text-red-500 text-center">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/oncall-service")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            Pending OnCall Proposals
          </h1>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by customer, city or OnCall number..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredProposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              No pending OnCall proposals found
            </h3>
            <p className="mt-1 text-gray-500">
              {searchTerm
                ? "Try a different search term"
                : "All OnCall proposals are processed"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal?._id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {proposal?.customer?.customername || "N/A"}
                    </h3>
                    <p>
                      <span className="text-gray-600">Revision:</span>{" "}
                      {proposal?.currentRevision || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {proposal?.onCallNumber || "N/A"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {formatDate(proposal?.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Complaint ID</p>
                    <p className="font-medium">
                      {proposal?.complaint?.notification_complaintid || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Device</p>
                    <p className="font-medium">
                      {proposal?.complaint?.materialdescription || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Total Spares</p>
                    <p>
                      {proposal?.productGroups?.reduce(
                        (total, group) => total + (group.totalSpares || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Final Amount</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(proposal?.finalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between space-x-2">
                  <button
                    onClick={() => handleViewDetails(proposal)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Details
                  </button>
                  {shouldShowRevisionButton(proposal) ? (
                    <button
                      onClick={() => handleRevision(proposal?._id)}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Revision
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-200 text-gray-500 py-2 px-4 rounded cursor-not-allowed flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Revision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Proposal Details Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[75vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    OnCall Proposal Details
                  </h3>
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
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      OnCall Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <span className="text-gray-600">Number:</span>{" "}
                        {selectedProposal.onCallNumber || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">Created:</span>{" "}
                        {formatDate(selectedProposal.createdAt)}
                      </p>
                      <p>
                        <span className="text-gray-600">Status:</span>{" "}
                        <span className="capitalize">
                          {selectedProposal.status}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Revision:</span>{" "}
                        {selectedProposal.currentRevision || 0}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <span className="text-gray-600">Name:</span>{" "}
                        {selectedProposal.customer?.customername || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">City:</span>{" "}
                        {selectedProposal.customer?.city || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">Code:</span>{" "}
                        {selectedProposal.customer?.customercodeid || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">GST:</span>{" "}
                        {selectedProposal.customer?.taxnumber2 || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Complaint Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <span className="text-gray-600">ID:</span>{" "}
                        {selectedProposal.complaint?.notification_complaintid ||
                          "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">Date:</span>{" "}
                        {selectedProposal.complaint?.notificationdate || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">Device:</span>{" "}
                        {selectedProposal.complaint?.materialdescription ||
                          "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">S/N:</span>{" "}
                        {selectedProposal.complaint?.serialnumber || "N/A"}
                      </p>
                      <p className="col-span-2">
                        <span className="text-gray-600">Problem:</span>{" "}
                        {selectedProposal.complaint?.reportedproblem || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Spares (
                      {selectedProposal.productGroups?.reduce(
                        (total, group) => total + (group.totalSpares || 0),
                        0
                      )}
                      )
                    </h4>
                    <div className="space-y-3">
                      {selectedProposal.productGroups?.map(
                        (group, groupIndex) => (
                          <div key={groupIndex}>
                            {group.spares?.map((item, itemIndex) => (
                              <div
                                key={`${groupIndex}-${itemIndex}`}
                                className="border-b border-gray-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0"
                              >
                                <p className="font-medium">
                                  {item.PartNumber || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.Description || "No description"}
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-sm mt-1">
                                  <p>
                                    <span className="text-gray-500">Type:</span>{" "}
                                    {item.Type || "N/A"}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Rate:</span>{" "}
                                    {formatCurrency(item.Rate)}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">DP:</span>{" "}
                                    {formatCurrency(item.DP)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Financial Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedProposal.grandSubTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Discount ({selectedProposal.discountPercentage || 0}
                          %):
                        </span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedProposal.discountAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          TDS ({selectedProposal.tdsPercentage || 0}%):
                        </span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedProposal.tdsAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          GST ({selectedProposal.gstPercentage || 0}%):
                        </span>
                        <span className="text-green-600">
                          +{formatCurrency(selectedProposal.gstAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2 mt-2 text-lg">
                        <span className="text-gray-800">Final Amount:</span>
                        <span className="text-green-600">
                          {formatCurrency(selectedProposal.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedProposal.remark && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        Remark
                      </h4>
                      <p className="text-sm">{selectedProposal.remark}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingOnCall;
