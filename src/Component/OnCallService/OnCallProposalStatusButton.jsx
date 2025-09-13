import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OnCallProposalStatusButton = ({
  onCall,
  onStatusUpdate,
  fetchOnCalls,
  cnoteNumber,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    onCall.onCallproposalstatus || "Open"
  );
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openModal = () => {
    if (isClickable) {
      setModalOpen(true);
      setSelectedStatus(onCall.onCallproposalstatus || "Open");
      setRemark("");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStatus(onCall.onCallproposalstatus || "Open");
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
        onCallproposalstatus: selectedStatus,
      };

      if (selectedStatus === "Lost" && remark.trim()) {
        payload.remark = remark.trim();
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/phone/oncall/${onCall._id}/update-proposal-status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast.success(
          `OnCall status updated to ${selectedStatus} successfully!`
        );
        onStatusUpdate(onCall._id, selectedStatus, remark);
        closeModal();
        if (fetchOnCalls) fetchOnCalls();
        navigate("/oncall-quote-generation");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update OnCall status";
      toast.error(errorMessage);
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
      case "closed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const isLostWithoutRemark = selectedStatus === "Lost" && !remark.trim();
  const isClickable =
    (onCall.onCallproposalstatus || "").toLowerCase() === "open" && cnoteNumber;

  // Check if Close OnCall is available based on approval logic
  const canCloseOnCall = () => {
    if (onCall.discountPercentage > 10) {
      return onCall.RSHApproval?.approved && onCall.NSHApproval?.approved;
    } else if (onCall.discountPercentage >= 6) {
      return onCall.RSHApproval?.approved;
    }
    return true;
  };

  const getApprovalMessage = () => {
    if (onCall.discountPercentage > 10) {
      return "Both RSH and NSH approvals are required for discounts above 10%";
    } else if (onCall.discountPercentage >= 6) {
      return "RSH approval is required for discounts between 6-10%";
    }
    return "";
  };

  return (
    <>
      <button
        className={`w-full px-3 py-2 rounded border transition-colors duration-200 text-sm font-medium ${getStatusColor(
          onCall.onCallproposalstatus
        )} ${isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        onClick={isClickable ? openModal : undefined}
        disabled={!isClickable}
        title={
          !isClickable && !cnoteNumber
            ? "CNote must be generated before closing OnCall"
            : isClickable
            ? "Click to change status"
            : "Status cannot be changed"
        }
      >
        {onCall.onCallproposalstatus === "Closed" ||
        onCall.onCallproposalstatus === "Open"
          ? "Close OnCall"
          : onCall.onCallproposalstatus || "Open"}
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Change OnCall Status
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                OnCall Number:{" "}
                <span className="font-medium">{onCall?.onCallNumber}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Current Status:{" "}
                <span className="font-medium capitalize">
                  {onCall?.onCallproposalstatus}
                </span>
              </p>
            </div>

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
                  Remark is required when marking OnCall as Lost
                </p>
              </div>
            )}

            {/* Close OnCall Section - Show for Closed status */}
            {(selectedStatus === "Closed" ||
              selectedStatus === "Completed") && (
              <div className="mb-4">
                {canCloseOnCall() ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-700 font-medium text-sm mb-3">
                      ✅ OnCall can be closed. All required approvals are met.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                      <p className="text-blue-700 text-xs">
                        After closing, the OnCall status will be updated and
                        CNote is already generated.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 font-medium text-sm mb-2">
                      ❌ Cannot close OnCall
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
                  ((selectedStatus === "Closed" ||
                    selectedStatus === "Completed") &&
                    !canCloseOnCall())
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleSave}
                disabled={
                  isLostWithoutRemark ||
                  loading ||
                  ((selectedStatus === "Closed" ||
                    selectedStatus === "Completed") &&
                    !canCloseOnCall())
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

export default OnCallProposalStatusButton;
