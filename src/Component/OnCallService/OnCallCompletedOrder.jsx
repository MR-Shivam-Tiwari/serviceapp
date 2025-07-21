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
} from "lucide-react";

function OnCallCompletedOrder() {
  const navigate = useNavigate();
  const [onCallCNotes, setOnCallCNotes] = useState([]);
  const [selectedOnCall, setSelectedOnCall] = useState(null);
  const [loading, setLoading] = useState(true);

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
            (cnote.RSHApproval?.approved && cnote.NSHApproval?.approved)
        );
        setOnCallCNotes(completedCNotes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching OnCall CNotes:", error);
        setLoading(false);
      }
    };

    fetchOnCallCNotes();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCardClick = (onCallCNote) => {
    setSelectedOnCall(onCallCNote);
  };

  const handleBackToList = () => {
    setSelectedOnCall(null);
  };

  if (loading) {
    return (
      <div className="flex mt-64 items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  if (selectedOnCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-teal-700 shadow-lg">
          <div className="flex items-center p-4 py-6 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
                OnCall Service Details
              </h1>
              <p className="text-sm text-nowrap font-bold text-white tracking-wide">
                Completed OnCall #{selectedOnCall.onCallNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              OnCall Service Completed
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
                      Customer Name
                    </label>
                    <p className="text-slate-800 font-medium">
                      {selectedOnCall.customer.customername}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Email Address
                    </label>
                    <p className="text-slate-800">
                      {selectedOnCall.customer.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Customer Code
                    </label>
                    <p className="text-slate-800 font-mono">
                      {selectedOnCall.customer.customercodeid}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Phone Number
                    </label>
                    <p className="text-slate-800">
                      {selectedOnCall.customer.telephone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Location
                    </label>
                    <p className="text-slate-800">
                      {selectedOnCall.customer.city},{" "}
                      {selectedOnCall.customer.postalcode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      GST Number
                    </label>
                    <p className="text-slate-800 font-mono">
                      {selectedOnCall.customer.taxnumber2}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OnCall Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Wrench className="w-4 h-4 text-green-600" />
                </div>
                OnCall Service Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      OnCall Number
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {selectedOnCall.onCallNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      CNote Number
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {selectedOnCall.cnoteNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Current Revision
                    </span>
                    <span className="text-slate-800 font-semibold">
                      Rev {selectedOnCall.currentRevision}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Service Date
                    </span>
                    <span className="text-slate-800">
                      {formatDate(selectedOnCall.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {selectedOnCall.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Spare Parts
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {selectedOnCall.spares?.length || 0} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device & Complaint Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-4 h-4 text-red-600" />
                </div>
                Device & Complaint Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Device Description
                    </label>
                    <p className="text-slate-800 font-medium">
                      {selectedOnCall.complaint?.materialdescription}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Serial Number
                    </label>
                    <p className="text-slate-800 font-mono">
                      {selectedOnCall.complaint?.serialnumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Material Code
                    </label>
                    <p className="text-slate-800 font-mono">
                      {selectedOnCall.complaint?.materialcode}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Complaint ID
                    </label>
                    <p className="text-slate-800 font-mono">
                      {selectedOnCall.complaint?.notification_complaintid}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Sales Office
                    </label>
                    <p className="text-slate-800">
                      {selectedOnCall.complaint?.salesoffice}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Dealer Code
                    </label>
                    <p className="text-slate-800">
                      {selectedOnCall.complaint?.dealercode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-500">
                  Reported Problem
                </label>
                <p className="text-slate-800 mt-1 p-3 bg-slate-50 rounded-lg">
                  {selectedOnCall.complaint?.reportedproblem}
                </p>
              </div>
            </div>
          </div>

          {/* Spare Parts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                Spare Parts ({selectedOnCall.spares?.length || 0})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {selectedOnCall.spares?.map((spare, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-5 border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {spare.Description}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1 font-mono">
                          Part No: {spare.PartNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">
                          ₹{spare.Rate?.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500">Rate</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Type</span>
                          <span className="text-sm font-medium text-slate-700">
                            {spare.Type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Product Group
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {spare.productPartNo}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            DP Price
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            ₹{spare.DP?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Charges
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            ₹{spare.Charges || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Subgroup
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {spare.subgroup}
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
                  <IndianRupee className="w-4 h-4 text-green-600" />
                </div>
                Financial Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">Grand Subtotal</span>
                  <span className="text-slate-800 font-semibold">
                    ₹{selectedOnCall.grandSubTotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">
                    Discount ({selectedOnCall.discountPercentage?.toFixed(2)}%)
                  </span>
                  <span className="text-red-600 font-semibold">
                    -₹{selectedOnCall.discountAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">After Discount</span>
                  <span className="text-slate-800 font-semibold">
                    ₹{selectedOnCall.afterDiscount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">
                    TDS ({selectedOnCall.tdsPercentage}%)
                  </span>
                  <span className="text-red-600 font-semibold">
                    -₹{selectedOnCall.tdsAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">After TDS</span>
                  <span className="text-slate-800 font-semibold">
                    ₹{selectedOnCall.afterTds?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">
                    GST ({selectedOnCall.gstPercentage}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    +₹{selectedOnCall.gstAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-slate-50 rounded-lg px-4 mt-4">
                  <span className="text-lg font-bold text-slate-800">
                    Final Amount
                  </span>
                  <span className="text-2xl font-bold text-slate-800">
                    ₹{selectedOnCall.finalAmount?.toLocaleString()}
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
                Approval History & Revisions
              </h2>
            </div>
            <div className="p-6">
              {/* Current Approvals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">
                    RSH Approval
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Status:{" "}
                      <span className="font-medium text-green-700">
                        {selectedOnCall.RSHApproval?.approved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </p>
                    {selectedOnCall.RSHApproval?.approvedAt && (
                      <p className="text-sm text-green-600">
                        Date:{" "}
                        {formatDate(selectedOnCall.RSHApproval.approvedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    NSH Approval
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Status:{" "}
                      <span className="font-medium text-blue-700">
                        {selectedOnCall.NSHApproval?.approved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </p>
                    {selectedOnCall.NSHApproval?.approvedAt && (
                      <p className="text-sm text-blue-600">
                        Date:{" "}
                        {formatDate(selectedOnCall.NSHApproval.approvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Revision History */}
              <div className="space-y-6">
                {selectedOnCall.revisions?.map((revision, index) => (
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
                        {revision.changes?.remark || "No remark provided"}
                      </p>
                    </div>

                    {revision.approvalHistory?.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-700 mb-3">
                          Approval Timeline
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
                                  {formatDate(approval.changedAt)}
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
            onClick={() => navigate("/oncall-service")}
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white"> Completed OnCall</h1>
        </div>
      </div>
      <div className="max-w-6xl bg-gradient-to-br from-slate-50 via-green-50 to-teal-100 p-4 mx-auto">
        {/* OnCall CNotes Grid */}
        {onCallCNotes.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No completed OnCall services found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Complete your first OnCall service to see it here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onCallCNotes.map((onCallCNote, index) => (
              <div
                key={onCallCNote._id}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 hover:border-green-200"
                onClick={() => handleCardClick(onCallCNote)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Company Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                        {onCallCNote.customer.customername}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{onCallCNote.customer.city}</span>
                  </div>
                </div>

                {/* OnCall Numbers */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Wrench className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-mono text-green-800">
                      {onCallCNote.onCallNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-mono text-blue-800">
                      {onCallCNote.cnoteNumber}
                    </span>
                  </div>
                </div>

                {/* Device Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Device</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {onCallCNote.complaint?.materialdescription}
                  </p>
                  <p className="text-xs text-gray-600">
                    S/N: {onCallCNote.complaint?.serialnumber}
                  </p>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{onCallCNote.finalAmount?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">Service Amount</p>
                    </div>
                  </div>
                </div>

                {/* Spares Count */}
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {onCallCNote.spares?.length || 0} Spare Parts
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500 pt-4 border-t border-gray-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Completed {formatDate(onCallCNote.createdAt)}
                  </span>
                </div>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OnCallCompletedOrder;
