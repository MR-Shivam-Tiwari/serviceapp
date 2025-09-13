import { ArrowLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CommercialOfferPdf from "./CommercialOfferPdf";
import { offerData } from "./offerData";
import toast from "react-hot-toast";
import ProposalStatusButton from "./ProposalStatusButton";

function CNoteGen() {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const handleProposalStatusUpdate = (proposalId, newStatus, remark) => {
    // You can add any additional logic here if needed
    console.log(
      `Proposal ${proposalId} status updated to ${newStatus}`,
      remark
    );
  };
  const fetchProposals = () => {
    // This can be empty or you can add logic to refresh the proposal data
    console.log("Proposals refreshed");
  };
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserInfo({
          id: userData.id || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          mobilenumber: userData.mobilenumber || "",
          status: userData.status || "",
          branch: userData.branch || "",
          loginexpirydate: userData.loginexpirydate || "",
          employeeid: userData.employeeid || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          department: userData.department || "",
          profileimage: userData.profileimage || "",
          deviceid: userData.deviceid || "",
          deviceregistereddate: userData.deviceregistereddate || "",
          usertype: userData.usertype || "",
          manageremail: userData.manageremail || "",
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerId || "",
          dealerCode: userData.dealerInfo?.dealerCode || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleGenerateCNote = async (proposal) => {
    try {
      setIsGenerating(true);

      const serialNumber = proposal?.serialNumber || "";

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/phone/cnote`,
        {
          proposalId: proposal._id,
          serialNumber: serialNumber,

          // ✅ User Info payload (with dealer details flattened)
          user: {
            id: userInfo.id,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            email: userInfo.email,
            employeeid: userInfo.employeeid,
            branch: userInfo.branch,
            region: userInfo.region || "",
            dealerName: userInfo.dealerName || "",
            dealerId: userInfo.dealerCode || "",
            dealerEmail: userInfo.dealerEmail || "",
          },

          // ✅ Full proposal data
          proposal: {
            ...proposal,
            items: proposal.items.map((item) => ({
              ...item,
              equipment: {
                ...item.equipment,
                serialnumber: item.equipment?.serialnumber || "",
              },
            })),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        toast.success("CNote generated successfully!");
      }
    } catch (error) {
      console.error("Error generating CNote:", error);
      toast.error(error.response?.data?.message || "Failed to generate CNote", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProposal = location.state?.proposal;
  const [expandedSections, setExpandedSections] = useState({
    customer: true, // Always expanded by default
    equipment: false,
    financial: false,
    revisions: false,
  });

  if (!selectedProposal) {
    navigate("/quote-generation");
    return null;
  }

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

  const handleBackToList = () => {
    navigate("/quote-generation");
  };

  const toggleSection = (section) => {
    // Don't allow customer section to be collapsed
    if (section === "customer") return;

    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDownloadQuote = (proposalId) => {
    navigate(`/cmc-ncmc-quote-download/${proposalId}`);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
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
          <h1 className="text-xl font-bold text-white flex-1">
            Proposal Details
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 p-3 mb-20 space-y-3">
        {/* Proposal Header Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Proposal #{selectedProposal?.proposalNumber}
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-md">
                Serial: {selectedProposal?.serialNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details - Always Expanded */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Customer Details
              </h3>
              <div className="flex items-center text-green-600">
                <span className="text-xs font-medium mr-1">Always Visible</span>
                <svg
                  className="w-4 h-4"
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
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.customername || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Customer Code</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.customercodeid || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">City</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.city || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Postal Code</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.postalcode || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.taxnumber1 || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">GST Number</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.taxnumber2 || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Telephone</p>
                <p className="font-medium text-sm">
                  {selectedProposal.customer?.telephone || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-medium text-sm break-all">
                  {selectedProposal.customer?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Details Accordion */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <button
            className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-3 border-b border-gray-100 hover:from-purple-100 hover:to-indigo-100 transition-colors"
            onClick={() => toggleSection("equipment")}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Equipment Details ({selectedProposal.items?.length || 0} items)
              </h3>
              <svg
                className={`w-5 h-5 text-gray-600 transform transition-transform ${
                  expandedSections.equipment ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
          {expandedSections.equipment && (
            <div className="p-3 space-y-3">
              {selectedProposal.items?.map((item, index) => {
                const showBothApprovals =
                  selectedProposal.discountPercentage > 10;
                const showOnlyRSH =
                  selectedProposal.discountPercentage >= 6 &&
                  selectedProposal.discountPercentage <= 10;
                const showNoApprovals = selectedProposal.discountPercentage < 6;

                return (
                  <div
                    key={item._id}
                    className="bg-gray-50 rounded-md p-3 border border-gray-200"
                  >
                    <div className="flex items-center mb-2">
                      <span className="bg-purple-500 text-white text-xs rounded-md w-6 h-6 flex items-center justify-center mr-2 font-medium">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-800">
                        {item.equipment?.name ||
                          item.equipment?.materialdescription ||
                          "N/A"}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Material Code
                        </p>
                        <p className="font-medium text-sm">
                          {item.equipment?.materialcode || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Serial Number
                        </p>
                        <p className="font-medium text-sm text-blue-600">
                          {item.equipment?.serialnumber || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">Dealer</p>
                        <p className="font-medium text-sm">
                          {item.equipment?.dealer || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="font-medium text-sm">
                          {item.equipment?.status || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Warranty Type
                        </p>
                        <p className="font-medium text-sm">
                          {item.warrantyType || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">Years</p>
                        <p className="font-medium text-sm">{item.years || 0}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">Price/Year</p>
                        <p className="font-medium text-sm text-green-600">
                          {formatCurrency(item.pricePerYear)}
                        </p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                        <p className="font-bold text-sm text-green-600">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="font-medium text-sm">
                        {item.equipment?.materialdescription || "N/A"}
                      </p>
                    </div>

                    {!showNoApprovals && (
                      <div className="mt-3 bg-yellow-50 rounded-md p-2 border border-yellow-200">
                        <h5 className="font-semibold text-yellow-800 mb-2 text-sm">
                          Approval Status
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                          {(showOnlyRSH || showBothApprovals) && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                RSH Approval:
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  item.RSHApproval?.approved
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {item.RSHApproval?.approved
                                  ? `Approved (${formatDate(
                                      item.RSHApproval.approvedAt
                                    )})`
                                  : "Pending"}
                              </span>
                            </div>
                          )}

                          {showBothApprovals && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                NSH Approval:
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  item.NSHApproval?.approved
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {item.NSHApproval?.approved
                                  ? `Approved (${formatDate(
                                      item.NSHApproval.approvedAt
                                    )})`
                                  : "Pending"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Details Accordion */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <button
            className="w-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-3 border-b border-gray-100 hover:from-green-100 hover:to-emerald-100 transition-colors"
            onClick={() => toggleSection("financial")}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Financial Summary
              </h3>
              <svg
                className={`w-5 h-5 text-gray-600 transform transition-transform ${
                  expandedSections.financial ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
          {expandedSections.financial && (
            <div className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">Grand Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProposal.grandSubTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">
                    Discount ({selectedProposal.discountPercentage}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedProposal.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">After Discount:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProposal.afterDiscount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">
                    TDS ({selectedProposal.tdsPercentage}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedProposal.tdsAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">After TDS:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProposal.afterTds)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">
                    GST ({selectedProposal.gstPercentage}%):
                  </span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(selectedProposal.gstAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
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
          )}
        </div>

        {/* Enhanced Revisions Accordion with Detailed Approval History */}
        {selectedProposal.revisions?.length > 0 && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <button
              className="w-full bg-gradient-to-r from-orange-50 to-red-50 px-3 py-3 border-b border-gray-100 hover:from-orange-100 hover:to-red-100 transition-colors"
              onClick={() => toggleSection("revisions")}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Revision History ({selectedProposal.revisions.length})
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-600 transform transition-transform ${
                    expandedSections.revisions ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
            {expandedSections.revisions && (
              <div className="p-2 space-y-4">
                {selectedProposal.revisions.map((revision, index) => (
                  <div
                    key={revision._id}
                    className="bg-orange-50 rounded-lg p-2 border border-orange-200"
                  >
                    {/* Revision Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-orange-800 text-lg">
                        Revision #{revision.revisionNumber}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(
                            revision.status
                          )}`}
                        >
                          {revision.status?.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(revision.revisionDate)}
                        </span>
                      </div>
                    </div>

                    {/* Financial Changes */}
                    <div className="bg-white rounded-md p-3 mb-3 border border-gray-200">
                      <h5 className="font-semibold text-gray-700 mb-2">
                        Financial Changes
                      </h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium">
                            {revision.changes?.discountPercentage}% (
                            {formatCurrency(revision.changes?.discountAmount)})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Final Amount:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(revision.changes?.finalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">After Discount:</span>
                          <span className="font-medium">
                            {formatCurrency(revision.changes?.afterDiscount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST Amount:</span>
                          <span className="font-medium">
                            {formatCurrency(revision.changes?.gstAmount)}
                          </span>
                        </div>
                      </div>
                      {revision.changes?.remark && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-blue-400">
                          <span className="text-gray-600 text-sm font-medium">
                            Revision Remark:
                          </span>
                          <p className="text-sm mt-1">
                            {revision.changes.remark}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Approval History Timeline */}
                    {revision.approvalHistory &&
                      revision.approvalHistory.length > 0 && (
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
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
                              .sort(
                                (a, b) =>
                                  new Date(a.changedAt) - new Date(b.changedAt)
                              )
                              .map((approval, approvalIndex) => (
                                <div
                                  key={approvalIndex}
                                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md border-l-4 border-gray-300"
                                >
                                  {/* Timeline dot */}
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        approval.status === "approved"
                                          ? "bg-green-500"
                                          : approval.status === "rejected"
                                          ? "bg-red-500"
                                          : "bg-yellow-500"
                                      }`}
                                    ></div>
                                    {approvalIndex <
                                      revision.approvalHistory.length - 1 && (
                                      <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
                                    )}
                                  </div>

                                  {/* Approval details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`px-2 py-1 rounded-md text-xs font-medium ${getApprovalTypeColor(
                                            approval.approvalType
                                          )}`}
                                        >
                                          {approval.approvalType}
                                        </span>
                                        <span
                                          className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeStyle(
                                            approval.status
                                          )}`}
                                        >
                                          {approval.status?.toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        Step {approvalIndex + 1}
                                      </span>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-1">
                                      <span className="font-medium">Date:</span>{" "}
                                      {formatDate(approval.changedAt)}
                                    </div>

                                    {approval.changedBy && (
                                      <div className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">
                                          Changed By:
                                        </span>{" "}
                                        {approval.changedBy}
                                      </div>
                                    )}

                                    {approval.remark && (
                                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                        <span className="text-xs font-medium text-gray-500">
                                          Remark:
                                        </span>
                                        <p className="text-sm mt-1">
                                          {approval.remark}
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
                              {revision.approvalHistory.some(
                                (a) => a.approvalType === "RSH"
                              ) && (
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-700">
                                    RSH Status:
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeStyle(
                                      revision.approvalHistory
                                        .filter((a) => a.approvalType === "RSH")
                                        .slice(-1)[0]?.status
                                    )}`}
                                  >
                                    {revision.approvalHistory
                                      .filter((a) => a.approvalType === "RSH")
                                      .slice(-1)[0]
                                      ?.status?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              {revision.approvalHistory.some(
                                (a) => a.approvalType === "NSH"
                              ) && (
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-700">
                                    NSH Status:
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeStyle(
                                      revision.approvalHistory
                                        .filter((a) => a.approvalType === "NSH")
                                        .slice(-1)[0]?.status
                                    )}`}
                                  >
                                    {revision.approvalHistory
                                      .filter((a) => a.approvalType === "NSH")
                                      .slice(-1)[0]
                                      ?.status?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 rounded-md shadow-sm border border-gray-200 p-3">
          {/* Download Quotation Button */}
          <div className="">
            {selectedProposal.discountPercentage > 10 ? (
              selectedProposal.items?.every(
                (item) =>
                  item.RSHApproval?.approved && item.NSHApproval?.approved
              ) ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors">
                  <a onClick={() => handleDownloadQuote(selectedProposal?._id)}>
                    <div className="flex justify-center items-center ">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Quotation
                    </div>
                  </a>
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                  <p className="text-red-600 font-medium text-sm">
                    Both RSH and NSH approvals are required for discounts above
                    10%
                  </p>
                </div>
              )
            ) : selectedProposal.discountPercentage >= 6 ? (
              selectedProposal.items?.every(
                (item) => item.RSHApproval?.approved
              ) ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors">
                  <a onClick={() => handleDownloadQuote(selectedProposal?._id)}>
                    <div className="flex justify-center items-center ">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Quotation
                    </div>
                  </a>
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                  <p className="text-red-600 font-medium text-sm">
                    RSH approval is required for discounts between 6-10%
                  </p>
                </div>
              )
            ) : (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors">
                <a onClick={() => handleDownloadQuote(selectedProposal?._id)}>
                  <div className="flex justify-center items-center ">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Quotation
                  </div>
                </a>
              </button>
            )}
          </div>

          {/* Generate CNote Button */}
          <div className="">
            {isGenerating ? (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-3 px-4 rounded-md flex items-center justify-center cursor-not-allowed"
              >
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Generating CNote...
              </button>
            ) : selectedProposal?.discountPercentage > 10 ? (
              selectedProposal?.items?.every(
                (item) =>
                  item?.RSHApproval?.approved && item?.NSHApproval?.approved
              ) ? (
                <button
                  onClick={() => handleGenerateCNote(selectedProposal)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generate CNote
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                  <p className="text-red-600 font-medium text-sm">
                    Both RSH and NSH approvals are required for discounts above
                    10%
                  </p>
                </div>
              )
            ) : selectedProposal?.discountPercentage >= 6 ? (
              selectedProposal?.items?.every(
                (item) => item?.RSHApproval?.approved
              ) ? (
                <button
                  onClick={() => handleGenerateCNote(selectedProposal)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generate CNote
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                  <p className="text-red-600 font-medium text-sm">
                    RSH approval is required for discounts between 6-10%
                  </p>
                </div>
              )
            ) : (
              <button
                onClick={() => handleGenerateCNote(selectedProposal)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate CNote
              </button>
            )}
          </div>
          <div className="space-y-3 rounded-md shadow-sm border border-gray-200 p-3">
            {/* Close Proposal Button - NEW */}
            <div className="">
              <ProposalStatusButton
                proposal={selectedProposal}
                cnoteNumber={selectedProposal?.cnoteNumber}
                fetchProposals={fetchProposals}
                onStatusUpdate={handleProposalStatusUpdate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const downloadButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  margin: "20px",
};

const hiddenContentStyle = {
  position: "absolute",
  left: "-9999px",
  top: 0,
  width: "210mm", // A4 width
  minHeight: "297mm", // A4 height
};

export default CNoteGen;
