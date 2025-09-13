import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ProposalRevision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch proposal data
        const proposalResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/proposal/${id}`
        );
        if (!proposalResponse.ok) throw new Error("Failed to fetch proposal");
        const proposalData = await proposalResponse.json();
        setProposal(proposalData);
        setSelectedDiscount(proposalData.discountPercentage ?? 0);

        // Fetch discount options
        const discountResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/admin/discount`
        );
        if (!discountResponse.ok) throw new Error("Failed to fetch discounts");
        const discountData = await discountResponse.json();
        setDiscountOptions(discountData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const extractPercentageValue = (discountStr) => {
    const match = discountStr.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleDiscountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      // When "Select Discount" is chosen, fall back to original discount
      setSelectedDiscount(null);
    } else {
      setSelectedDiscount(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const newAmounts = calculateNewAmounts();

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/phone/proposal/${id}/revision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discountPercentage: selectedDiscount ?? proposal.discountPercentage,
            discountAmount: newAmounts.discountAmount,
            afterDiscount: newAmounts.afterDiscount,
            tdsAmount: newAmounts.tdsAmount,
            afterTds: newAmounts.afterTds,
            gstAmount: newAmounts.gstAmount,
            finalAmount: newAmounts.finalAmount,
            remark:
              "Discount updated to " +
              (selectedDiscount ?? proposal.discountPercentage) +
              "%",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update proposal");
      }

      const updatedProposal = await response.json();
      navigate("/pending-proposal", {
        state: {
          success: `Proposal revised successfully (Revision ${updatedProposal.currentRevision})`,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const calculateNewAmounts = () => {
    if (!proposal) {
      return {
        discountAmount: 0,
        afterDiscount: 0,
        tdsAmount: 0,
        afterTds: 0,
        gstAmount: 0,
        finalAmount: 0,
      };
    }

    // Use original discount when selectedDiscount is null or invalid
    const discountPercent =
      selectedDiscount === null
        ? proposal.discountPercentage
        : selectedDiscount;

    const grandSubTotal = proposal?.grandSubTotal || 0;
    const discountAmount = grandSubTotal * (discountPercent / 100);
    const afterDiscount = grandSubTotal - discountAmount;
    const tdsAmount = afterDiscount * ((proposal?.tdsPercentage || 0) / 100);
    const afterTds = afterDiscount - tdsAmount;
    const gstAmount = afterTds * ((proposal?.gstPercentage || 0) / 100);
    const finalAmount = afterTds + gstAmount;

    return {
      discountAmount,
      afterDiscount,
      tdsAmount,
      afterTds,
      gstAmount,
      finalAmount,
    };
  };

  // Initialize with default values
  const newAmounts = calculateNewAmounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              Proposal Revision
            </h1>
          </div>
        </div>
        <div className="pt-20 flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading proposal...</p>
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
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              Proposal Revision
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
            <p className="text-red-600 font-medium">Error loading proposal</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">
              Proposal Revision
            </h1>
          </div>
        </div>
        <div className="pt-20 p-4">
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
            <p className="text-gray-500 text-sm">Proposal not found</p>
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">
            Proposal Revision
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 p-3 space-y-3">
        {/* Proposal Header Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Proposal #{proposal?.proposalNumber}
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="font-medium text-sm">
                  {proposal?.customer?.customername}
                </p>
              </div>
              <div className="bg-orange-50 rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">Current Discount</p>
                <p className="font-semibold text-sm text-orange-600">
                  {proposal?.discountPercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Selection Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Update Discount
            </h3>
          </div>
          <div className="p-3">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Discount
                </label>
                <select
                  value={selectedDiscount ?? ""}
                  onChange={handleDiscountChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="">Select Discount</option>
                  {discountOptions.map((option) => (
                    <option
                      key={option._id}
                      value={extractPercentageValue(option.discount)}
                    >
                      {option.discount}{" "}
                      {option.status === "Active" ? "" : "(Inactive)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-3 mb-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Financial Summary
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Subtotal:</span>
                    <span className="font-medium">
                      ₹
                      {(proposal?.grandSubTotal || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Current Discount ({proposal?.discountPercentage}%):
                    </span>
                    <span className="text-red-600 font-medium">
                      -₹
                      {(proposal?.discountAmount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <span>
                      New Discount (
                      {selectedDiscount ?? proposal.discountPercentage}%):
                    </span>
                    <span>
                      -₹
                      {(newAmounts.discountAmount || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">After Discount:</span>
                    <span className="font-medium">
                      ₹
                      {(newAmounts.afterDiscount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      TDS ({proposal?.tdsPercentage}%):
                    </span>
                    <span className="text-red-600 font-medium">
                      -₹
                      {(newAmounts.tdsAmount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">After TDS:</span>
                    <span className="font-medium">
                      ₹
                      {(newAmounts.afterTds || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      GST ({proposal?.gstPercentage}%):
                    </span>
                    <span className="text-green-600 font-medium">
                      +₹
                      {(newAmounts.gstAmount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">
                        New Final Amount:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        ₹
                        {newAmounts.finalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-100 px-2 py-1 rounded mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Previous Final Amount:
                      </span>
                      <span className="text-gray-700 font-medium">
                        ₹
                        {(proposal?.finalAmount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors text-sm"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-colors ${
                    updating ||
                    selectedDiscount === proposal?.discountPercentage
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  disabled={
                    updating ||
                    selectedDiscount === proposal?.discountPercentage
                  }
                >
                  {updating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Revise Proposal"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProposalRevision;
