import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShortcutFooter from "../Home/ShortcutFooter";

function PendingProposal() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/proposal`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const data = await response.json();
        const proposalData = data.data || data;
        setProposals(proposalData);
        setFilteredProposals(proposalData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProposals(proposals);
      return;
    }

    const filtered = proposals.filter((proposal) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        proposal.customer?.customercodeid
          ?.toLowerCase()
          .includes(searchLower) ||
        proposal.customer?.customername?.toLowerCase().includes(searchLower) ||
        proposal.proposalNumber?.toLowerCase().includes(searchLower) ||
        proposal.serialNumber?.toString().toLowerCase().includes(searchLower)
      );
    });

    setFilteredProposals(filtered);
  }, [searchTerm, proposals]);

  const handleSearchClear = () => {
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseDetails = () => {
    setSelectedProposal(null);
  };

  const handleRevision = (proposalId) => {
    navigate(`/proposal-revision/${proposalId}`);
  };

  const shouldShowRevisionButton = (proposal) => {
    return !proposal?.cnoteNumber;
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    }
    if (value !== null && value !== undefined && !isNaN(Number(value))) {
      return `₹${Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`;
    }
    return "₹0.00";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate("/contract-proposal")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              Pending Opportunity
            </h1>
          </div>
        </div>
        <div className="pt-20 flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading proposals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate("/contract-proposal")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              Pending Opportunity
            </h1>
          </div>
        </div>
        <div className="pt-20 p-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <div className="text-red-500 mb-2">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading proposals</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            onClick={() => navigate("/contract-proposal")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">
            Pending Opportunity
          </h1>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-full ml-2 transition-all ${
              isSearchOpen ? "bg-white/30" : "bg-white/20 hover:bg-white/30"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer code, name, proposal number, or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-10 bg-white text-gray-800 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 text-sm"
                autoFocus
              />
              <svg
                className="absolute left-3 top-3.5 h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main
        className={`p-2 mb-20 space-y-3 ${isSearchOpen ? "pt-32" : "pt-20"}`}
      >
        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
            <p className="text-blue-700 text-sm">
              {filteredProposals.length > 0
                ? `Found ${filteredProposals.length} proposal${
                    filteredProposals.length !== 1 ? "s" : ""
                  } matching "${searchTerm}"`
                : `No proposals found matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {filteredProposals.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "No proposals match your search"
                : "No pending proposals found"}
            </p>
          </div>
        ) : (
          filteredProposals.map((proposal, index) => (
            <div
              key={proposal?._id}
              className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-blue-500 text-white text-xs rounded-md w-6 h-6 flex items-center justify-center mr-3 font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {proposal.customer?.customername || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer Code:{" "}
                        {proposal.customer?.customercodeid || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-md">
                      {proposal.proposalNumber || "N/A"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(proposal.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-1">City</p>
                    <p className="font-medium text-sm">
                      {proposal.customer?.city || "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-1">Final Amount</p>
                    <p className="font-bold text-sm text-green-600">
                      {formatCurrency(proposal.finalAmount)}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 mb-3 rounded-md p-2">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {/* <div>
                      <p className="text-xs text-gray-500 mb-1">Serial No.</p>
                      <p className="font-semibold text-xs text-purple-600">
                        {proposal.serialNumber || "N/A"}
                      </p>
                    </div> */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Items</p>
                      <p className="font-semibold text-xs text-blue-600">
                        {proposal.items?.length ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Revision</p>
                      <p className="font-semibold text-xs text-orange-600">
                        {proposal.currentRevision || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(proposal)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center transition-colors text-sm font-medium"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
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
                    View Details
                  </button>

                  {shouldShowRevisionButton(proposal) ? (
                    <button
                      onClick={() => handleRevision(proposal?._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md flex items-center justify-center transition-colors text-sm font-medium"
                    >
                      <svg
                        className="h-4 w-4 mr-1"
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
                      className="flex-1 bg-gray-200 text-gray-400 py-2 px-3 rounded-md cursor-not-allowed flex items-center justify-center text-sm"
                    >
                      <svg
                        className="h-4 w-4 mr-1"
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
                      Locked
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Proposal Details Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 rounded bg-black/50 flex items-center justify-center p-3 z-50">
            <div className="bg-white rounded-md shadow-xl w-full max-w-lg max-h-[80vh] ">
              {/* Modal Header */}
              <div className="bg-blue-600 rounded-t text-white p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">Proposal Details</h3>
                <button
                  onClick={handleCloseDetails}
                  className="p-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
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

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-70px)] p-4 space-y-4">
                {/* Customer Information */}
                <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Name</p>
                      <p className="font-medium">
                        {selectedProposal.customer?.customername || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">City</p>
                      <p className="font-medium">
                        {selectedProposal.customer?.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Customer Code</p>
                      <p className="font-medium">
                        {selectedProposal.customer?.customercodeid || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">GST Number</p>
                      <p className="font-medium text-xs">
                        {selectedProposal.customer?.taxnumber2 || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Items ({selectedProposal.items?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedProposal.items?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-md p-2 border border-gray-200"
                      >
                        <p className="font-medium text-sm">
                          {item.equipment?.name ||
                            item.equipment?.materialcode ||
                            "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.equipment?.materialdescription || ""}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <p className="font-medium">{item.warrantyType}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Years:</span>
                            <p className="font-medium">{item.years}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <p className="font-medium text-green-600">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-green-50 rounded-md p-3 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">
                    Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedProposal.grandSubTotal)}
                      </span>
                    </div>
                    {selectedProposal.discountPercentage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Discount ({selectedProposal.discountPercentage}%):
                        </span>
                        <span className="text-red-600 font-medium">
                          -{formatCurrency(selectedProposal.discountAmount)}
                        </span>
                      </div>
                    )}
                    {selectedProposal.tdsPercentage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          TDS ({selectedProposal.tdsPercentage}%):
                        </span>
                        <span className="text-red-600 font-medium">
                          -{formatCurrency(selectedProposal.tdsAmount)}
                        </span>
                      </div>
                    )}
                    {selectedProposal.gstPercentage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          GST ({selectedProposal.gstPercentage}%):
                        </span>
                        <span className="text-green-600 font-medium">
                          +{formatCurrency(selectedProposal.gstAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-green-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">
                          Final Amount:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(selectedProposal.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remark */}
                {selectedProposal.remark && (
                  <div className="bg-yellow-50 rounded-md p-3 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Remarks
                    </h4>
                    <p className="text-sm text-gray-700">
                      {selectedProposal.remark}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}

export default PendingProposal;
