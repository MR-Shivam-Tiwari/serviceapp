import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function OnCallRevision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [onCall, setOnCall] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [pricingMode, setPricingMode] = useState("rate");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const onCallResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall/${id}`
        );
        if (!onCallResponse.ok) throw new Error("Failed to fetch oncall data");
        const onCallData = await onCallResponse.json();
        setOnCall(onCallData);

        setDiscountValue(onCallData.discountPercentage || 0);

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

  useEffect(() => {
    if (onCall) {
      const originalDiscount = onCall?.discountPercentage || 0;
      const hasDiscountChanged =
        discountType === "percentage"
          ? discountValue !== originalDiscount
          : discountValue > 0;

      const hasPricingModeChanged = pricingMode !== "rate";

      setHasChanges(hasDiscountChanged || hasPricingModeChanged);
    }
  }, [discountValue, discountType, pricingMode, onCall]);

  const extractPercentageValue = (discountStr) => {
    const match = discountStr.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    setDiscountValue(0);
    setError(null);
  };

  const handleDiscountValueChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const maxDiscount = getMaxDiscountAmount();

    if (value > maxDiscount) {
      setError(`Maximum discount allowed is ₹${maxDiscount.toFixed(2)}`);
      return;
    }

    setError(null);
    setDiscountValue(value);
  };

  const getMaxDiscountAmount = () => {
    if (!onCall) return 0;

    let maxDiscount = 0;

    onCall?.productGroups.forEach((group) => {
      group.spares.forEach((spare) => {
        const chargesValue = parseFloat(spare?.Charges) || 0;
        const dpValue = spare?.DP || 0;
        const rateValue = spare?.Rate || 0; // Add this line

        if (onCall?.currentRevision === 0) {
          // For currentRevision = 0, max discount is Rate - DP
          maxDiscount += Math.max(0, rateValue - dpValue);
        } else {
          // For currentRevision > 0, max discount is Rate - Charges
          maxDiscount += Math.max(0, rateValue - chargesValue);
        }
      });
    });

    return maxDiscount;
  };

  const calculateNewAmounts = () => {
    if (!onCall) return zeroAmounts();

    let grandSubTotal = 0;
    let applicableDiscountBase = 0;

    onCall?.productGroups.forEach((group) => {
      group.spares.forEach((spare) => {
        const chargesValue = parseFloat(spare?.Charges) || 0;
        const dpValue = spare?.DP || 0;
        const rateValue = spare?.Rate || 0; // Add this line

        if (onCall?.currentRevision === 0) {
          // For currentRevision = 0
          grandSubTotal += rateValue;
          applicableDiscountBase += Math.max(0, rateValue - dpValue);
        } else {
          // For currentRevision > 0
          if (pricingMode === "rate") {
            grandSubTotal += rateValue;
            applicableDiscountBase += Math.max(0, rateValue - chargesValue);
          } else if (pricingMode === "exchange") {
            if (chargesValue > 0) {
              grandSubTotal += chargesValue;
            } else {
              grandSubTotal += rateValue;
            }
            applicableDiscountBase += Math.max(0, rateValue - chargesValue);
          }
        }
      });
    });

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = applicableDiscountBase * (discountValue / 100);
    } else {
      discountAmount = Math.min(discountValue, applicableDiscountBase);
    }

    const afterDiscount = grandSubTotal - discountAmount;
    const tdsAmount = afterDiscount * ((onCall?.tdsPercentage || 0) / 100);
    const afterTds = afterDiscount + tdsAmount;
    const gstAmount = afterTds * ((onCall?.gstPercentage || 0) / 100);
    const finalAmount = afterTds + gstAmount;

    return {
      grandSubTotal,
      discountAmount,
      afterDiscount,
      tdsAmount,
      afterTds,
      gstAmount,
      finalAmount,
      applicableDiscountBase,
    };
  };

  const zeroAmounts = () => ({
    grandSubTotal: 0,
    discountAmount: 0,
    afterDiscount: 0,
    tdsAmount: 0,
    afterTds: 0,
    gstAmount: 0,
    finalAmount: 0,
    applicableDiscountBase: 0,
  });

  const convertFixedToPercentage = (fixedAmount, base) => {
    if (base === 0) return 0;
    return (fixedAmount / base) * 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAmounts = calculateNewAmounts();

    if (newAmounts.discountAmount > newAmounts.applicableDiscountBase) {
      setError(
        `Discount cannot exceed maximum allowed amount of ₹${newAmounts.applicableDiscountBase.toFixed(
          2
        )}`
      );
      toast.error(
        `Discount cannot exceed ₹${newAmounts.applicableDiscountBase.toFixed(
          2
        )}`
      );
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const discountPercentage =
        discountType === "percentage"
          ? discountValue
          : convertFixedToPercentage(
              discountValue,
              newAmounts.applicableDiscountBase
            );

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/phone/oncall/${id}/revision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discountPercentage,
            discountAmount: newAmounts.discountAmount,
            afterDiscount: newAmounts.afterDiscount,
            tdsAmount: newAmounts.tdsAmount,
            afterTds: newAmounts.afterTds,
            gstAmount: newAmounts.gstAmount,
            finalAmount: newAmounts.finalAmount,
            pricingMode,
            remark: `OnCall revised with ${pricingMode} pricing - ${
              discountType === "percentage"
                ? `${discountValue}% discount`
                : `₹${discountValue} fixed discount (${discountPercentage.toFixed(
                    2
                  )}%)`
            }`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update oncall");
      }

      await response.json();

      toast.success("OnCall revised successfully!");
      navigate("/on-call-pending");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const shouldShowExchangeMode = onCall?.currentRevision > 0;
  const hasExchangeOptions = onCall?.productGroups.some((group) =>
    group.spares.some((spare) => parseFloat(spare?.Charges) > 0)
  );

  const newAmounts = calculateNewAmounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">OnCall Revision</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !onCall) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">OnCall Revision</h1>
          </div>
        </div>
        <div className="p-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!onCall) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">OnCall Revision</h1>
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
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
            <h2 className="text-lg font-medium text-gray-800 mb-1">
              OnCall Not Found
            </h2>
            <p className="text-gray-600 text-sm">
              The requested OnCall could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">OnCall Revision</h1>
        </div>
      </div>
      <div className="p-3 space-y-3 py-20">
        {/* OnCall Info */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              #{onCall?.onCallNumber}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Rev: {onCall?.currentRevision}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-medium text-gray-800 text-sm">
                {onCall?.customer?.customername}
              </p>
              <p className="text-xs text-gray-600">{onCall?.customer?.city}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Complaint ID</p>
              <p className="font-medium text-gray-800 text-sm">
                {onCall?.complaint?.notification_complaintid}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500">Device</p>
            <p className="font-medium text-gray-800 text-sm">
              {onCall?.complaint?.materialdescription}
            </p>
            <p className="text-xs text-gray-600">
              S/N: {onCall?.complaint?.serialnumber}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Problem</p>
            <p className="font-medium text-gray-800 text-sm">
              {onCall?.complaint?.reportedproblem}
            </p>
          </div>
        </div>

        {/* Pricing Mode - Only show if currentRevision > 0 */}
        {shouldShowExchangeMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <svg
                className="w-4 h-4 text-amber-600 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Pricing Mode
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setPricingMode("rate")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  pricingMode === "rate"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rate
              </button>
              {hasExchangeOptions && (
                <button
                  onClick={() => setPricingMode("exchange")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    pricingMode === "exchange"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Exchange
                </button>
              )}
            </div>
          </div>
        )}

        {/* Spares */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <svg
              className="w-4 h-4 text-gray-600 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Spares
          </h3>
          <div className="space-y-2">
            {onCall?.productGroups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="border border-gray-200 rounded-lg p-2"
              >
                <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center">
                  <svg
                    className="w-3 h-3 text-blue-600 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {group.productPartNo}
                </h4>
                <div className="space-y-2">
                  {group.spares.map((spare, spareIndex) => {
                    const chargesValue = parseFloat(spare?.Charges) || 0;
                    const dpValue = spare?.DP || 0;
                    const rateValue = spare?.Rate || 0; // Always use this for Rate

                    let discountableAmount, effectivePrice;

                    if (onCall?.currentRevision === 0) {
                      // For currentRevision = 0
                      discountableAmount = Math.max(0, rateValue - dpValue);
                      effectivePrice = rateValue;
                    } else {
                      // For currentRevision > 0
                      discountableAmount = Math.max(
                        0,
                        rateValue - chargesValue
                      );
                      if (pricingMode === "rate") {
                        effectivePrice = rateValue;
                      } else {
                        effectivePrice =
                          chargesValue > 0 ? chargesValue : rateValue;
                      }
                    }

                    return (
                      <div
                        key={spareIndex}
                        className="bg-gray-50 rounded-lg p-2"
                      >
                        <div className="mb-2">
                          <p className="font-medium text-gray-800 text-sm">
                            {spare?.PartNumber}
                          </p>
                          <p className="text-xs text-gray-600">
                            {spare?.Description}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              spare?.Type === "Spare"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {spare?.Type}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">
                              Rate:{" "}
                              <span className="font-medium">
                                ₹{rateValue.toFixed(2)}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              {onCall?.currentRevision === 0 ? "DP" : "Charges"}
                              :
                              <span className="font-medium">
                                ₹
                                {(onCall?.currentRevision === 0
                                  ? dpValue
                                  : chargesValue
                                ).toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-blue-600">
                              Subtotal:{" "}
                              <span className="font-semibold">
                                ₹{effectivePrice.toFixed(2)}
                              </span>
                            </p>
                            <p className="text-green-600">
                              Max Disc:{" "}
                              <span className="font-semibold">
                                ₹{discountableAmount.toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {onCall?.currentRevision === 0 && (
                          <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-1 rounded border border-blue-200">
                            <div className="flex items-center">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Subtotal: Rate | Max Discount: Rate - DP
                            </div>
                          </div>
                        )}

                        {pricingMode === "exchange" &&
                          chargesValue > 0 &&
                          onCall?.currentRevision > 0 && (
                            <div className="mt-2 text-xs text-green-700 bg-green-50 p-1 rounded border border-green-200">
                              <div className="flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Subtotal: Charges | Max Discount: Rate - Charges
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <svg
              className="w-4 h-4 text-purple-600 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            Discount
          </h3>

          <div className="mb-3">
            <div className="flex space-x-3 mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value="percentage"
                  checked={discountType === "percentage"}
                  onChange={() => handleDiscountTypeChange("percentage")}
                  className="mr-1 text-blue-600"
                />
                <span className="text-sm text-gray-700">Percentage</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value="fixed"
                  checked={discountType === "fixed"}
                  onChange={() => handleDiscountTypeChange("fixed")}
                  className="mr-1 text-blue-600"
                />
                <span className="text-sm text-gray-700">Fixed Amount</span>
              </label>
            </div>

            {discountType === "percentage" ? (
              <select
                value={discountValue}
                onChange={(e) => setDiscountValue(parseInt(e.target.value, 10))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Discount %</option>
                {discountOptions.map((option) => (
                  <option
                    key={option._id}
                    value={extractPercentageValue(option.discount)}
                  >
                    {option.discount}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="number"
                  value={discountValue}
                  onChange={handleDiscountValueChange}
                  min="0"
                  max={newAmounts.applicableDiscountBase}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter discount amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: ₹{newAmounts.applicableDiscountBase.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                />
              </svg>
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        {/* Financial Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <svg
              className="w-4 h-4 text-green-600 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            Financial Summary
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-800">
                ₹{newAmounts.grandSubTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Max Discount:</span>
              <span className="font-medium text-blue-600">
                ₹{newAmounts.applicableDiscountBase.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">
                Discount (
                {discountType === "percentage" ? `${discountValue}%` : "Fixed"}
                ):
              </span>
              <span className="font-medium text-red-600">
                -₹{newAmounts.discountAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">After Discount:</span>
              <span className="font-medium text-gray-800">
                ₹{newAmounts.afterDiscount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">
                TDS ({onCall?.tdsPercentage}%):
              </span>
              <span className="font-medium text-green-600">
                +₹{newAmounts.tdsAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">
                GST ({onCall?.gstPercentage}%):
              </span>
              <span className="font-medium text-green-600">
                +₹{newAmounts.gstAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-2 bg-white rounded-lg px-3 shadow-sm">
              <span className="font-semibold text-gray-800">Final Amount:</span>
              <span className="font-bold text-lg text-green-600">
                ₹{newAmounts.finalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 text-xs">
              <span className="text-gray-500">Previous:</span>
              <span className="text-gray-500">
                ₹{(onCall?.finalAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 text-xs">
              <span className="text-gray-500">Difference:</span>
              <span
                className={`font-medium ${
                  newAmounts.finalAmount > onCall?.finalAmount
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {newAmounts.finalAmount > onCall?.finalAmount ? "+" : ""}₹
                {(newAmounts.finalAmount - onCall?.finalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ==== Additional Service Charge Card ==== */}
        {onCall?.additionalServiceCharge && (
          <div className="bg-yellow-50 border border-yellow-100 p-5 rounded-xl shadow-lg max-w-xl mx-auto flex flex-col gap-2 my-4">
            <div className="flex items-center gap-2 mb-2">
              <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#F59E42" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 5a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 6a1.25 1.25 0 110 2.5A1.25 1.25 0 0110 11z"
                  fill="#fff"
                />
              </svg>
              <span className="text-orange-700 font-bold text-sm tracking-wide">
                Additional Service Charge
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Location</span>
              <span className="font-semibold capitalize text-sm text-gray-900">
                {onCall?.additionalServiceCharge.location}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Entered Charge</span>
              <span className="font-semibold text-sm text-blue-800">
                ₹
                {onCall?.additionalServiceCharge.enteredCharge.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">GST (18%)</span>
              <span className="font-semibold text-sm text-green-700">
                ₹
                {onCall?.additionalServiceCharge.gstAmount
                  ? onCall?.additionalServiceCharge.gstAmount.toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 }
                    )
                  : "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-yellow-300 mt-1">
              <span className="font-bold text-sm text-gray-800">
                Total with GST
              </span>
              <span className="font-bold text-sm text-orange-700">
                ₹
                {onCall?.additionalServiceCharge.totalAmount
                  ? onCall?.additionalServiceCharge.totalAmount.toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 }
                    )
                  : "0.00"}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            disabled={updating}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              !hasChanges || updating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            } text-white`}
            disabled={updating || !hasChanges}
          >
            {updating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                <span className="text-sm">Updating...</span>
              </span>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Revise OnCall</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnCallRevision;
