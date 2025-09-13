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
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

function CompletedOrder() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/cnote`
        );
        const data = await response.json();
        setProposals(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  const handleCardClick = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleBackToList = () => {
    setSelectedProposal(null);
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
        selectedProposal.discountPercentage > 10
          ? ["RSH", "NSH"]
          : selectedProposal.discountPercentage >= 6
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
              onClick={() => navigate("/contract-proposal")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Completed Orders</h1>
          </div>
        </div>
        <div className="pt-20 flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProposal) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Header */}
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Order Details</h1>
              <p className="text-xs text-white/80">
                #{selectedProposal.proposalNumber}
              </p>
            </div>
          </div>
        </div>

        <main className="py-20 p-3 space-y-3">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              Order Completed
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
                    {selectedProposal.customer?.customername}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-sm">
                    {selectedProposal.customer?.telephone}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-sm break-all">
                    {selectedProposal.customer?.email}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-sm">
                    {selectedProposal.customer?.city},{" "}
                    {selectedProposal.customer?.postalcode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Proposal Information
              </h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Proposal Number</p>
                  <p className="font-medium text-sm">
                    {selectedProposal.proposalNumber}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">CNote Number</p>
                  <p className="font-medium text-sm">
                    {selectedProposal.cnoteNumber}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Created Date</p>
                  <p className="font-medium text-sm">
                    {formatDate(selectedProposal.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Current Revision</p>
                  <p className="font-medium text-sm">
                    Rev {selectedProposal.currentRevision}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Order Items ({selectedProposal.items?.length || 0})
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {selectedProposal.items?.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-md p-3 border border-gray-200"
                >
                  <div className="flex items-center mb-2">
                    <span className="bg-orange-500 text-white text-xs rounded w-5 h-5 flex items-center justify-center mr-2 font-medium">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {item?.equipment?.materialdescription}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Material Code
                      </p>
                      <p className="font-medium text-xs">
                        {item?.equipment?.materialcode}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Dealer</p>
                      <p className="font-medium text-xs">
                        {item?.equipment?.dealer}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Serial Number
                      </p>
                      <p className="font-medium text-xs">
                        {item?.equipment?.serialnumber}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Warranty</p>
                      <p className="font-medium text-xs">
                        {item?.warrantyType} - {item?.years} years
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-bold text-xs text-green-600">
                        {formatCurrency(item?.subtotal)}
                      </p>
                    </div>
                  </div>

                  {/* Approval Status for each item */}
                  {selectedProposal.discountPercentage >= 6 && (
                    <div className="bg-white rounded p-2 mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Approval Status
                      </p>
                      <div className="flex gap-2">
                        {selectedProposal.discountPercentage >= 6 && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.RSHApproval?.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            RSH:{" "}
                            {item.RSHApproval?.approved
                              ? "Approved"
                              : "Pending"}
                          </span>
                        )}
                        {selectedProposal.discountPercentage > 10 && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.NSHApproval?.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            NSH:{" "}
                            {item.NSHApproval?.approved
                              ? "Approved"
                              : "Pending"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
                    {formatCurrency(selectedProposal.grandSubTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">
                    Discount ({selectedProposal.discountPercentage}%):
                  </span>
                  <span className="text-red-600 font-medium text-sm">
                    -{formatCurrency(selectedProposal.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">After Discount:</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(selectedProposal.afterDiscount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">
                    TDS ({selectedProposal.tdsPercentage}%):
                  </span>
                  <span className="text-red-600 font-medium text-sm">
                    -{formatCurrency(selectedProposal.tdsAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">After TDS:</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(selectedProposal.afterTds)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">
                    GST ({selectedProposal.gstPercentage}%):
                  </span>
                  <span className="text-green-600 font-medium text-sm">
                    +{formatCurrency(selectedProposal.gstAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center bg-green-50 rounded p-2">
                    <span className="font-bold text-gray-800 text-sm">
                      Final Amount:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedProposal.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Revision History */}
          {selectedProposal.revisions?.length > 0 && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Revision History ({selectedProposal.revisions.length})
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {selectedProposal.revisions
                  .sort((a, b) => b.revisionNumber - a.revisionNumber)
                  .map((revision, index) => {
                    const isCurrentRevision =
                      revision.revisionNumber ===
                      selectedProposal.currentRevision;
                    const isSuperseded =
                      revision.revisionNumber <
                      selectedProposal.currentRevision;
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
                            <div className="bg-white rounded p-2">
                              <h5 className="font-medium text-gray-700 mb-2 text-xs">
                                Approval Details
                              </h5>
                              <div className="space-y-1">
                                {Object.values(
                                  revision.approvalHistory.reduce(
                                    (acc, approval) => {
                                      const key = approval.approvalType;
                                      if (
                                        !acc[key] ||
                                        new Date(approval.changedAt) >
                                          new Date(acc[key].changedAt)
                                      ) {
                                        acc[key] = approval;
                                      }
                                      return acc;
                                    },
                                    {}
                                  )
                                ).map((approval, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div>
                                      <span className="font-medium text-gray-700 text-xs">
                                        {approval.approvalType}
                                      </span>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(approval.changedAt)}
                                      </p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-1 py-0.5 rounded capitalize">
                                      {approval.status}
                                    </span>
                                  </div>
                                ))}
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
      {/* Fixed Header */}
      <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            onClick={() => navigate("/contract-proposal")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Completed Orders</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-20 p-3">
        {proposals.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <FileText className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No completed orders found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Orders will appear here once completed
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal, index) => (
              <div
                key={proposal._id}
                className="bg-white rounded-md shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick(proposal)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center mr-3">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {proposal.customer?.customername}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {proposal.customer?.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md">
                      Completed
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Rev {proposal.currentRevision}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Proposal Number
                    </p>
                    <p className="font-medium text-sm font-mono">
                      {proposal.proposalNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">CNote Number</p>
                    <p className="font-medium text-sm font-mono">
                      {proposal.cnoteNumber}
                    </p>
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mr-2">
                      <IndianRupee className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(proposal.finalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">Final Amount</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(proposal.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {proposal.items?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CompletedOrder;
