import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProposalStatusButton = ({
  proposal,
  onStatusUpdate,
  fetchProposals,
  cnoteNumber,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    proposal.Cmcncmcsostatus || "Open"
  );
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openModal = () => {
    if (isClickable) {
      setModalOpen(true);
      setSelectedStatus(proposal.Cmcncmcsostatus || "Open");
      setRemark("");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStatus(proposal.Cmcncmcsostatus || "Open");
    setRemark("");
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    if (e.target.value !== "Lost") {
      setRemark("");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        Cmcncmcsostatus: selectedStatus,
      };

      if (selectedStatus === "Lost" && remark.trim()) {
        payload.proposalRemark = remark.trim();
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/phone/proposal/${proposal._id}/update-proposal-status`,
        payload
      );

      if (response.data.success) {
        onStatusUpdate(proposal._id, selectedStatus, remark);
        closeModal();
        if (fetchProposals) fetchProposals();
        navigate("/quote-generation");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200";
      case "lost":
        return "bg-red-100 text-red-800 border border-red-200";
      case "closed_won":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const isLostWithoutRemark = selectedStatus === "Lost" && !remark.trim();
  const isClickable =
    (proposal.Cmcncmcsostatus || "").toLowerCase() === "open" && !cnoteNumber;

  // Check if Close Quotation is available based on approval logic
  const canCloseQuotation = () => {
    if (proposal.discountPercentage > 10) {
      return proposal.items?.every(
        (item) => item.RSHApproval?.approved && item.NSHApproval?.approved
      );
    } else if (proposal.discountPercentage >= 6) {
      return proposal.items?.every((item) => item.RSHApproval?.approved);
    }
    return true;
  };

  const getApprovalMessage = () => {
    if (proposal.discountPercentage > 10) {
      return "Both RSH and NSH approvals are required for discounts above 10%";
    } else if (proposal.discountPercentage >= 6) {
      return "RSH approval is required for discounts between 6-10%";
    }
    return "";
  };

  return (
    <>
      <button
        className={`w-full px-3 py-2 rounded border transition-colors duration-200 text-sm font-medium ${getStatusColor(
          proposal.Cmcncmcsostatus
        )} ${isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        onClick={isClickable ? openModal : undefined}
        disabled={!isClickable}
        title={
          !isClickable && cnoteNumber
            ? "Status cannot be changed because CNote is already generated"
            : isClickable
            ? "Click to change status"
            : "Status cannot be changed"
        }
      >
        {proposal.Cmcncmcsostatus === "Closed_Won" ||
        proposal.Cmcncmcsostatus === "Open"
          ? "Close Proposal"
          : proposal.Cmcncmcsostatus || "Open"}
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Change Proposal Status
            </h3>

            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={handleStatusChange}
                disabled={loading}
              >
                <option value="Open">Open</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Remark Textarea - Only show for Lost status */}
            {selectedStatus === "Lost" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full h-20 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please provide reason for marking as Lost..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Remark is required when marking proposal as Lost
                </p>
              </div>
            )}

            {/* Close Quotation Section - Only show for Closed_Won status */}
            {selectedStatus === "Closed_Won" && (
              <div className="mb-4">
                {canCloseQuotation() ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-700 font-medium text-sm mb-3">
                      ✅ Proposal can be closed. All required approvals are met.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                      <p className="text-blue-700 text-xs">
                        After closing, you can download the quotation and
                        generate CNote.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 font-medium text-sm mb-2">
                      ❌ Cannot close proposal
                    </p>
                    <p className="text-red-600 text-xs">
                      {getApprovalMessage()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition duration-200"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  isLostWithoutRemark ||
                  loading ||
                  (selectedStatus === "Closed_Won" && !canCloseQuotation())
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleSave}
                disabled={
                  isLostWithoutRemark ||
                  loading ||
                  (selectedStatus === "Closed_Won" && !canCloseQuotation())
                }
              >
                {loading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalStatusButton;
