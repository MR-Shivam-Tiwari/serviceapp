import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  FileText,
  IndianRupee,
  TrendingUp,
  Building2,
  Wrench,
  Package,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

function OnCallCompletedOrder() {
  const navigate = useNavigate();
  const [onCallCNotes, setOnCallCNotes] = useState([]);
  const [filteredOnCalls, setFilteredOnCalls] = useState([]);
  const [selectedOnCall, setSelectedOnCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchOnCallCNotes = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall-cnote`
        );
        const data = await response.json();
        // Filter only issued/completed OnCall CNotes
        const completedCNotes = (data.data || data).filter(
          (cnote) =>
            cnote.status === "issued" ||
            cnote.status === "draft" ||
            (cnote.RSHApproval?.approved && cnote.NSHApproval?.approved)
        );
        setOnCallCNotes(completedCNotes);
        setFilteredOnCalls(completedCNotes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching OnCall CNotes:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOnCallCNotes();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOnCalls(onCallCNotes);
      return;
    }

    const filtered = onCallCNotes.filter((onCall) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        onCall?.customer?.customercodeid?.toLowerCase().includes(searchLower) ||
        onCall?.customer?.customername?.toLowerCase().includes(searchLower) ||
        onCall?.onCallNumber?.toLowerCase().includes(searchLower) ||
        onCall?.cnoteNumber?.toLowerCase().includes(searchLower) ||
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
  }, [searchTerm, onCallCNotes]);

  const handleSearchClear = () => {
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
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

  const handleCardClick = (onCallCNote) => {
    setSelectedOnCall(onCallCNote);
  };

  const handleBackToList = () => {
    setSelectedOnCall(null);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "issued":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getApprovalTypeColor = (type) => {
    switch (type) {
      case "RSH":
        return "bg-blue-500 text-white";
      case "NSH":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Helper function to get revision status and approval summary
  const getRevisionStatusInfo = (revision, isCurrentRevision) => {
    if (revision.status === "approved") {
      return {
        status: "approved",
        color: "green",
        icon: CheckCircle,
        summary: `Approved by ${
          revision.approvalHistory?.length || 0
        } approvers`,
        approvers: revision.approvalHistory?.reduce((acc, approval) => {
          const type = approval.approvalType;
          if (!acc[type]) acc[type] = [];
          acc[type].push(approval);
          return acc;
        }, {}),
      };
    } else if (revision.status === "pending") {
      const requiredApprovals =
        selectedOnCall?.discountPercentage > 10
          ? ["RSH", "NSH"]
          : selectedOnCall?.discountPercentage >= 6
          ? ["RSH"]
          : [];

      const receivedApprovals =
        revision.approvalHistory?.reduce((acc, approval) => {
          acc[approval.approvalType] = true;
          return acc;
        }, {}) || {};

      const pendingApprovals = requiredApprovals.filter(
        (type) => !receivedApprovals[type]
      );

      return {
        status: "pending",
        color: pendingApprovals.length > 0 ? "orange" : "blue",
        icon: Clock,
        summary:
          pendingApprovals.length > 0
            ? `Pending with ${pendingApprovals.join(", ")}`
            : "Processing approval",
        pendingWith: pendingApprovals,
      };
    } else {
      return {
        status: "rejected",
        color: "red",
        icon: XCircle,
        summary: "Rejected",
        pendingWith: [],
      };
    }
  };

  if (loading) {
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
            <h1 className="text-xl font-bold text-white">
              Completed OnCall Orders
            </h1>
          </div>
        </div>
        <div className="pt-20 flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading OnCall orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate("/oncall-service")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
              Completed OnCall Orders
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
              Error loading OnCall orders
            </p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOnCall) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Header */}
        <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                OnCall Service Details
              </h1>
              <p className="text-xs text-white/80">
                #{selectedOnCall.onCallNumber}
              </p>
            </div>
          </div>
        </div>

        <main className="py-20 p-3 space-y-3">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              OnCall Service Completed
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Customer Information
              </h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-sm">
                    {selectedOnCall.customer?.customername}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Customer Code</p>
                  <p className="font-medium text-sm font-mono">
                    {selectedOnCall.customer?.customercodeid}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-sm">
                    {selectedOnCall.customer?.telephone}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-sm">
                    {selectedOnCall.customer?.city},{" "}
                    {selectedOnCall.customer?.postalcode}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2 col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-sm break-all">
                    {selectedOnCall.customer?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* OnCall Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                OnCall Service Information
              </h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">OnCall Number</p>
                  <p className="font-medium text-sm font-mono">
                    {selectedOnCall.onCallNumber}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">CNote Number</p>
                  <p className="font-medium text-sm font-mono">
                    {selectedOnCall.cnoteNumber}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Service Date</p>
                  <p className="font-medium text-sm">
                    {formatDate(selectedOnCall.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadgeStyle(
                      selectedOnCall.status
                    )}`}
                  >
                    {selectedOnCall.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Device & Complaint Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Device & Complaint Details
              </h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Device</p>
                  <p className="font-medium text-sm">
                    {selectedOnCall.complaint?.materialdescription}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                  <p className="font-medium text-sm font-mono text-blue-600">
                    {selectedOnCall.complaint?.serialnumber}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Complaint ID</p>
                  <p className="font-medium text-sm font-mono">
                    {selectedOnCall.complaint?.notification_complaintid}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Material Code</p>
                  <p className="font-medium text-sm font-mono">
                    {selectedOnCall.complaint?.materialcode}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Sales Office</p>
                  <p className="font-medium text-sm">
                    {selectedOnCall.complaint?.salesoffice}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Dealer Code</p>
                  <p className="font-medium text-sm">
                    {selectedOnCall.complaint?.dealercode}
                  </p>
                </div>
              </div>
              <div className="bg-red-50 rounded p-2">
                <p className="text-xs text-gray-500 mb-1">Reported Problem</p>
                <p className="font-medium text-sm text-red-700">
                  {selectedOnCall.complaint?.reportedproblem}
                </p>
              </div>
            </div>
          </div>

          {/* Spare Parts */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Spare Parts ({selectedOnCall.spares?.length || 0})
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {selectedOnCall.spares?.map((spare, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-md p-3 border border-gray-200"
                >
                  <div className="flex items-center mb-2">
                    <span className="bg-purple-500 text-white text-xs rounded w-5 h-5 flex items-center justify-center mr-2 font-medium">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {spare.Description}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Part Number</p>
                      <p className="font-medium text-xs font-mono">
                        {spare.PartNumber}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <p className="font-medium text-xs">{spare.Type}</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Rate</p>
                      <p className="font-medium text-xs text-green-600">
                        {formatCurrency(spare.Rate)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">DP</p>
                      <p className="font-medium text-xs">
                        {formatCurrency(spare.DP)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Charges</p>
                      <p className="font-bold text-xs text-green-600">
                        {formatCurrency(spare.Charges)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Subgroup</p>
                      <p className="font-medium text-xs">{spare.subgroup}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Financial Summary
              </h3>
            </div>
            <div className="p-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">Grand Subtotal:</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(selectedOnCall.grandSubTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">
                    Discount ({selectedOnCall.discountPercentage}%):
                  </span>
                  <span className="text-red-600 font-medium text-sm">
                    -{formatCurrency(selectedOnCall.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">After Discount:</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(selectedOnCall.afterDiscount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">
                    TDS ({selectedOnCall.tdsPercentage}%):
                  </span>
                  <span className="text-red-600 font-medium text-sm">
                    -{formatCurrency(selectedOnCall.tdsAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">After TDS:</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(selectedOnCall.afterTds)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">
                    GST ({selectedOnCall.gstPercentage}%):
                  </span>
                  <span className="text-green-600 font-medium text-sm">
                    +{formatCurrency(selectedOnCall.gstAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center bg-green-50 rounded p-2">
                    <span className="font-bold text-gray-800 text-sm">
                      Final Amount:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedOnCall.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Approvals */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                Current Approval Status
              </h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded p-2 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-700">
                      RSH Approval
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedOnCall.RSHApproval?.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOnCall.RSHApproval?.approved
                        ? "Approved"
                        : "Pending"}
                    </span>
                  </div>
                  {selectedOnCall.RSHApproval?.approvedAt && (
                    <p className="text-xs text-blue-600 mt-1">
                      {formatDate(selectedOnCall.RSHApproval.approvedAt)}
                    </p>
                  )}
                </div>
                <div className="bg-purple-50 rounded p-2 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-700">
                      NSH Approval
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedOnCall.NSHApproval?.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOnCall.NSHApproval?.approved
                        ? "Approved"
                        : "Pending"}
                    </span>
                  </div>
                  {selectedOnCall.NSHApproval?.approvedAt && (
                    <p className="text-xs text-purple-600 mt-1">
                      {formatDate(selectedOnCall.NSHApproval.approvedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Revision History */}
          {selectedOnCall.revisions?.length > 0 && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Revision History ({selectedOnCall.revisions.length})
                </h3>
              </div>
              <div className="p-3 space-y-4">
                {selectedOnCall.revisions
                  ?.sort((a, b) => b.revisionNumber - a.revisionNumber)
                  ?.map((revision, index) => {
                    const isCurrentRevision =
                      revision.revisionNumber ===
                      selectedOnCall.currentRevision;
                    const isSuperseded =
                      revision.revisionNumber < selectedOnCall.currentRevision;
                    const statusInfo = getRevisionStatusInfo(
                      revision,
                      isCurrentRevision
                    );
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={index}
                        className={`rounded-md p-3 border transition-all ${
                          isSuperseded
                            ? "bg-gray-100 border-gray-300 opacity-60"
                            : isCurrentRevision
                            ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                            : `bg-${statusInfo.color}-50 border-${statusInfo.color}-200`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                isSuperseded
                                  ? "bg-gray-400"
                                  : isCurrentRevision
                                  ? "bg-blue-500"
                                  : `bg-${statusInfo.color}-500`
                              }`}
                            >
                              <span className="text-xs font-bold text-white">
                                {revision.revisionNumber}
                              </span>
                            </div>
                            <div>
                              <h4
                                className={`font-semibold text-sm flex items-center ${
                                  isSuperseded
                                    ? "text-gray-500"
                                    : "text-gray-800"
                                }`}
                              >
                                Revision {revision.revisionNumber}
                                {isCurrentRevision && (
                                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                    Current
                                  </span>
                                )}
                                {isSuperseded && (
                                  <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                                    Superseded
                                  </span>
                                )}
                              </h4>
                              <p
                                className={`text-xs ${
                                  isSuperseded
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatDate(revision.revisionDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <StatusIcon
                              className={`w-4 h-4 mr-1 ${
                                isSuperseded
                                  ? "text-gray-400"
                                  : `text-${statusInfo.color}-600`
                              }`}
                            />
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                                isSuperseded
                                  ? "bg-gray-200 text-gray-600"
                                  : statusInfo.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : statusInfo.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {revision.status}
                            </span>
                          </div>
                        </div>

                        {/* Status Summary */}
                        <div
                          className={`rounded p-2 mb-2 ${
                            isSuperseded
                              ? "bg-gray-200"
                              : isCurrentRevision
                              ? "bg-blue-100"
                              : "bg-white"
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              isSuperseded ? "text-gray-500" : "text-gray-700"
                            }`}
                          >
                            <span className="font-medium">Status:</span>{" "}
                            {statusInfo.summary}
                          </p>
                          <p
                            className={`text-xs ${
                              isSuperseded ? "text-gray-500" : "text-gray-600"
                            }`}
                          >
                            <span className="font-medium">Remark:</span>{" "}
                            {revision.changes?.remark || "No remark provided"}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isSuperseded ? "text-gray-500" : "text-gray-600"
                            }`}
                          >
                            <span className="font-medium">Discount:</span>{" "}
                            {revision.changes?.discountPercentage}%
                            <span className="ml-2 font-medium">
                              Final Amount:
                            </span>{" "}
                            {formatCurrency(revision.changes?.finalAmount)}
                          </p>
                        </div>

                        {/* Detailed Approval History - only for current/recent revisions */}
                        {!isSuperseded &&
                          revision.approvalHistory?.length > 0 && (
                            <div className="bg-white rounded-md p-3 border border-gray-200">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center text-xs">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Step-by-Step Approval Flow
                              </h5>

                              <div className="space-y-3">
                                {revision.approvalHistory
                                  ?.sort(
                                    (a, b) =>
                                      new Date(a.changedAt) -
                                      new Date(b.changedAt)
                                  )
                                  ?.map((approval, approvalIndex) => (
                                    <div
                                      key={approvalIndex}
                                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md border-l-4 border-gray-300"
                                    >
                                      {/* Timeline dot */}
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={`w-3 h-3 rounded-full ${
                                            approval?.status === "approved"
                                              ? "bg-green-500"
                                              : approval?.status === "rejected"
                                              ? "bg-red-500"
                                              : "bg-yellow-500"
                                          }`}
                                        ></div>
                                        {approvalIndex <
                                          revision.approvalHistory?.length -
                                            1 && (
                                          <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
                                        )}
                                      </div>

                                      {/* Approval details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center space-x-2">
                                            <span
                                              className={`px-2 py-1 rounded-md text-xs font-medium ${getApprovalTypeColor(
                                                approval?.approvalType
                                              )}`}
                                            >
                                              {approval?.approvalType}
                                            </span>
                                            <span
                                              className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeStyle(
                                                approval?.status
                                              )}`}
                                            >
                                              {approval?.status?.toUpperCase()}
                                            </span>
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            Step {approvalIndex + 1}
                                          </span>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-1">
                                          <span className="font-medium">
                                            Date:
                                          </span>{" "}
                                          {formatDate(approval?.changedAt)}
                                        </div>

                                        {approval?.changedBy && (
                                          <div className="text-sm text-gray-600 mb-1">
                                            <span className="font-medium">
                                              Changed By:
                                            </span>{" "}
                                            {approval?.changedBy}
                                          </div>
                                        )}

                                        {approval?.remark && (
                                          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                            <span className="text-xs font-medium text-gray-500">
                                              Remark:
                                            </span>
                                            <p className="text-sm mt-1">
                                              {approval?.remark}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              {/* Current Status Summary */}
                              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                                <h6 className="font-medium text-blue-800 mb-2">
                                  Current Approval Status:
                                </h6>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {revision.approvalHistory?.some(
                                    (a) => a?.approvalType === "RSH"
                                  ) && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-blue-700">
                                        RSH Status:
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeStyle(
                                          revision.approvalHistory
                                            ?.filter(
                                              (a) => a?.approvalType === "RSH"
                                            )
                                            ?.slice(-1)[0]?.status
                                        )}`}
                                      >
                                        {revision.approvalHistory
                                          ?.filter(
                                            (a) => a?.approvalType === "RSH"
                                          )
                                          ?.slice(-1)[0]
                                          ?.status?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  {revision.approvalHistory?.some(
                                    (a) => a?.approvalType === "NSH"
                                  ) && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-blue-700">
                                        NSH Status:
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeStyle(
                                          revision.approvalHistory
                                            ?.filter(
                                              (a) => a?.approvalType === "NSH"
                                            )
                                            ?.slice(-1)[0]?.status
                                        )}`}
                                      >
                                        {revision.approvalHistory
                                          ?.filter(
                                            (a) => a?.approvalType === "NSH"
                                          )
                                          ?.slice(-1)[0]
                                          ?.status?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with Search */}
      <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            onClick={() => navigate("/oncall-service")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">
            Completed OnCall Orders
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
                placeholder="Search by customer name, OnCall number, CNote number, device, serial number..."
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
        className={`p-3 mb-20 space-y-3 ${isSearchOpen ? "pt-32" : "pt-20"}`}
      >
        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
            <p className="text-blue-700 text-sm">
              {filteredOnCalls.length > 0
                ? `Found ${filteredOnCalls.length} completed OnCall order${
                    filteredOnCalls.length !== 1 ? "s" : ""
                  } matching "${searchTerm}"`
                : `No completed OnCall orders found matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {filteredOnCalls.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {searchTerm
                ? "No OnCall orders match your search"
                : "No completed OnCall orders found"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm
                ? "Try a different search term"
                : "Complete your first OnCall service to see it here"}
            </p>
          </div>
        ) : (
          filteredOnCalls.map((onCallCNote, index) => (
            <div
              key={onCallCNote._id}
              className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(onCallCNote)}
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
                        {onCallCNote.customer?.customername || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer Code:{" "}
                        {onCallCNote.customer?.customercodeid || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${getStatusBadgeStyle(
                        onCallCNote.status
                      )}`}
                    >
                      {onCallCNote.status?.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(onCallCNote.createdAt)}
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
                      {onCallCNote.customer?.city || "N/A"}
                      {onCallCNote.customer?.postalcode &&
                        `, ${onCallCNote.customer?.postalcode}`}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-1">Service Amount</p>
                    <p className="font-bold text-sm text-green-600">
                      {formatCurrency(onCallCNote.finalAmount)}
                    </p>
                  </div>
                </div>

                {/* OnCall & CNote Numbers */}
                <div className="bg-blue-50 rounded-md p-2 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        OnCall Number
                      </p>
                      <p className="font-semibold text-xs text-blue-600 font-mono">
                        {onCallCNote.onCallNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">CNote Number</p>
                      <p className="font-semibold text-xs text-blue-600 font-mono">
                        {onCallCNote.cnoteNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Device Information */}
                <div className="bg-red-50 rounded-md p-2 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Device & Problem</p>
                  <p className="font-medium text-sm text-red-700 mb-1">
                    {onCallCNote.complaint?.materialdescription || "N/A"}
                  </p>
                  <p className="text-xs text-red-600">
                    {onCallCNote.complaint?.reportedproblem || "N/A"}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-md p-2 mb-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Serial No.</p>
                      <p className="font-semibold text-xs text-purple-600 font-mono">
                        {onCallCNote.complaint?.serialnumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Spares</p>
                      <p className="font-semibold text-xs text-blue-600">
                        {onCallCNote.spares?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Revision</p>
                      <p className="font-semibold text-xs text-orange-600">
                        {onCallCNote.currentRevision || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-white">
                      Click to View Details
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

export default OnCallCompletedOrder;
