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

  const handleCardClick = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleBackToList = () => {
    setSelectedProposal(null);
  };

  if (loading) {
    return (
      <div className="flex mt-64 items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  if (selectedProposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-6 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
                Order Details
              </h1>
              <p className="text-sm text-nowrap font-bold text-white tracking-wide">
                Completed Order #{selectedProposal.proposalNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Order Completed
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                Customer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Full Name
                    </label>
                    <p className="text-slate-800 font-medium">
                      {selectedProposal.customer?.customername}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Email Address
                    </label>
                    <p className="text-slate-800">
                      {selectedProposal.customer?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Phone Number
                    </label>
                    <p className="text-slate-800">
                      {selectedProposal.customer?.telephone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Location
                    </label>
                    <p className="text-slate-800">
                      {selectedProposal.customer?.city},{" "}
                      {selectedProposal.customer?.postalcode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Proposal Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Proposal Number
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {selectedProposal.proposalNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      CNote Number
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {selectedProposal.cnoteNumber}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Created Date
                    </span>
                    <span className="text-slate-800">
                      {formatDate(selectedProposal.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {selectedProposal.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                Order Items ({selectedProposal.items.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {selectedProposal.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-5 border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {item.equipment.name}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">
                          {item.equipment.materialdescription}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">
                          ₹{item.subtotal.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500">Total Amount</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Material Code
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {item.equipment.materialcode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Dealer</span>
                          <span className="text-sm font-medium text-slate-700">
                            {item.equipment.dealer}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Warranty Type
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {item.warrantyType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Duration
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {item.years} years
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Price per Year
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            ₹{item.pricePerYear.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                Financial Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">Grand Subtotal</span>
                  <span className="text-slate-800 font-semibold">
                    ₹{selectedProposal.grandSubTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">
                    Discount ({selectedProposal.discountPercentage}%)
                  </span>
                  <span className="text-red-600 font-semibold">
                    -₹{selectedProposal.discountAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">After Discount</span>
                  <span className="text-slate-800 font-semibold">
                    ₹{selectedProposal.afterDiscount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">
                    TDS ({selectedProposal.tdsPercentage}%)
                  </span>
                  <span className="text-red-600 font-semibold">
                    -₹{selectedProposal.tdsAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">After TDS</span>
                  <span className="text-slate-800 font-semibold">
                    ₹{selectedProposal.afterTds.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">
                    GST ({selectedProposal.gstPercentage}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    +₹{selectedProposal.gstAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-slate-50 rounded-lg px-4 mt-4">
                  <span className="text-lg font-bold text-slate-800">
                    Final Amount
                  </span>
                  <span className="text-2xl font-bold text-slate-800">
                    ₹{selectedProposal.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                Approval History
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {selectedProposal.revisions.map((revision, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-green-600">
                            {revision.revisionNumber}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            Revision {revision.revisionNumber}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {formatDate(revision.revisionDate)}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                        {revision.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Remark:</span>{" "}
                        {revision.changes.remark || "No remark provided"}
                      </p>
                    </div>

                    {revision.approvalHistory.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-700 mb-3">
                          Approval Details
                        </h4>
                        <div className="space-y-2">
                          {revision.approvalHistory.map((approval, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0"
                            >
                              <div>
                                <span className="font-medium text-slate-700">
                                  {approval.approvalType}
                                </span>
                                <p className="text-sm text-slate-500">
                                  {approval.remark || "No remark"}
                                </p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                {approval.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/contract-proposal")}
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
              Completed Proposals
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 mx-auto">
        {/* Header */}

        {/* Proposals Grid */}
        {proposals.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No proposals found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first proposal to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal, index) => (
              <div
                key={proposal._id}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-200"
                onClick={() => handleCardClick(proposal)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Company Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {proposal.customer?.customername}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{proposal.customer?.city}</span>
                  </div>
                </div>

                {/* Proposal Number */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-mono text-gray-600">
                    {proposal.proposalNumber}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{proposal.finalAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">Final Amount</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500 pt-4 border-t border-gray-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Created {formatDate(proposal.createdAt)}
                  </span>
                </div>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletedOrder;
