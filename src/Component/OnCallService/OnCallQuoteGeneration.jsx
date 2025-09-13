import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OnCallQuoteGeneration() {
  const navigate = useNavigate();
  const [onCalls, setOnCalls] = useState([]);
  const [filteredOnCalls, setFilteredOnCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        // const approvedOnCalls = Array.isArray(data) ? data.filter(onCall => onCall?.status === "approved") : [];
        setOnCalls(data);
        setFilteredOnCalls(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOnCalls();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOnCalls(onCalls);
      return;
    }

    const filtered = onCalls.filter((onCall) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        onCall?.customer?.customercodeid?.toLowerCase().includes(searchLower) ||
        onCall?.customer?.customername?.toLowerCase().includes(searchLower) ||
        onCall?.onCallNumber?.toLowerCase().includes(searchLower) ||
        onCall?.complaint?.materialdescription
          ?.toLowerCase()
          .includes(searchLower) ||
        onCall?.complaint?.serialnumber?.toLowerCase().includes(searchLower) ||
        onCall?.complaint?.notification_complaintid
          ?.toLowerCase()
          .includes(searchLower)
      );
    });

    setFilteredOnCalls(filtered);
  }, [searchTerm, onCalls]);

  const handleSearchClear = () => {
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
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

  const handleOnCallClick = (onCall) => {
    navigate(`/oncall-quote-generation/${onCall?._id}`, { state: { onCall } });
  };

  const getStatusBadge = (onCall) => {
    if (onCall?.status === "completed") {
      return "bg-green-100 text-green-700";
    }
    if (onCall?.status === "revised") {
      return "bg-orange-100 text-orange-700";
    }
    if (onCall?.onCallproposalstatus === "Open") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const getStatusText = (onCall) => {
    if (onCall?.status === "completed") {
      return "COMPLETED";
    }
    if (onCall?.status === "revised") {
      return "REVISED";
    }
    if (onCall?.onCallproposalstatus === "Open") {
      return "OPEN";
    }
    return "PENDING";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate("/oncall-service")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              OnCall Quote Generation
            </h1>
          </div>
        </div>
        <div className="pt-20 flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading OnCall requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate("/oncall-service")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              OnCall Quote Generation
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
            <p className="text-red-600 font-medium">
              Error loading OnCall requests
            </p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with Search */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            onClick={() => navigate("/oncall-service")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">
            OnCall Quote Generation
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
                placeholder="Search by customer name, complaint ID, device, serial number..."
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
      <main className={`p-3 mb-20 space-y-3 ${isSearchOpen ? "pt-32" : "pt-20"}`}>
        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
            <p className="text-blue-700 text-sm">
              {filteredOnCalls.length > 0
                ? `Found ${filteredOnCalls.length} OnCall request${
                    filteredOnCalls.length !== 1 ? "s" : ""
                  } matching "${searchTerm}"`
                : `No OnCall requests found matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {filteredOnCalls.length === 0 ? (
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
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7h8M8 7l-1.5 8.5a2 2 0 002 2h7a2 2 0 002-2L16 7M12 11v4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "No OnCall requests match your search"
                : "No OnCall requests found for quote generation"}
            </p>
          </div>
        ) : (
          filteredOnCalls.map((onCall, index) => (
            <div
              key={onCall?._id}
              className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOnCallClick(onCall)}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-3 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-orange-500 text-white text-xs rounded-md w-6 h-6 flex items-center justify-center mr-3 font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {onCall?.customer?.customername || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer Code:{" "}
                        {onCall?.customer?.customercodeid || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${getStatusBadge(
                        onCall
                      )}`}
                    >
                      {getStatusText(onCall)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(onCall?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-medium text-sm">
                      {onCall?.customer?.city || "N/A"}
                      {onCall?.customer?.postalcode &&
                        `, ${onCall?.customer?.postalcode}`}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-1">Final Amount</p>
                    <p className="font-bold text-sm text-green-600">
                      {formatCurrency(onCall?.finalAmount)}
                    </p>
                  </div>
                </div>

                {/* Device Information */}
                <div className="bg-blue-50 rounded-md p-2 mb-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Device Information
                  </p>
                  <p className="font-medium text-sm text-blue-700 mb-1">
                    {onCall?.complaint?.materialdescription || "N/A"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Serial:</span>
                      <span className="font-medium ml-1">
                        {onCall?.complaint?.serialnumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Complaint ID:</span>
                      <span className="font-medium ml-1">
                        {onCall?.complaint?.notification_complaintid || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-md p-2 mb-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">OnCall No.</p>
                      <p className="font-semibold text-xs text-purple-600">
                        {onCall?.onCallNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Spares</p>
                      <p className="font-semibold text-xs text-blue-600">
                        {onCall?.productGroups?.reduce(
                          (total, group) => total + (group?.totalSpares || 0),
                          0
                        ) || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Revision</p>
                      <p className="font-semibold text-xs text-orange-600">
                        {onCall?.currentRevision || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                {onCall?.complaint?.reportedproblem && (
                  <div className="bg-red-50 rounded-md p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Reported Problem
                    </p>
                    <p className="text-sm text-red-700 font-medium">
                      {onCall?.complaint?.reportedproblem}
                    </p>
                  </div>
                )}

                {/* Generate Quote Button */}
                <div className="flex items-center justify-center bg-blue-700 text-white rounded-md p-2">
                  <div className="flex items-center text-white">
                    <svg
                      className="w-4 h-4 text-white mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7h8M8 7l-1.5 8.5a2 2 0 002 2h7a2 2 0 002-2L16 7M12 11v4"
                      />
                    </svg>
                    <span className="text-sm font-medium text-white">
                      Click to Generate OnCall Quote
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default OnCallQuoteGeneration;
