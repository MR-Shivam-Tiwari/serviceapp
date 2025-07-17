import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function OnCallRevision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [onCall, setOnCall] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [discountType, setDiscountType] = useState("percentage"); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [roeSelections, setRoeSelections] = useState([]); // Track ROE selections for each spare
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch oncall data
        const onCallResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall/${id}`
        );
        if (!onCallResponse.ok) throw new Error("Failed to fetch oncall data");
        const onCallData = await onCallResponse.json();
        setOnCall(onCallData);
        
        // Initialize discount based on existing data
        setDiscountValue(onCallData.discountPercentage || 0);
        
        // Initialize ROE selections (false for all spares)
        const initialRoeSelections = onCallData.productGroups.map(group => 
          group.spares.map(() => false)
        );
        setRoeSelections(initialRoeSelections);

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

  useEffect(() => {
    // Check for changes whenever discount or ROE selections change
    if (onCall) {
      const originalDiscount = onCall.discountPercentage || 0;
      const hasDiscountChanged = discountType === "percentage" 
        ? discountValue !== originalDiscount
        : discountValue > 0;

      const hasRoeChanged = onCall.currentRevision > 0 && 
        roeSelections.some(group => group.some(selected => selected));

      setHasChanges(hasDiscountChanged || hasRoeChanged);
    }
  }, [discountValue, discountType, roeSelections, onCall]);

  const extractPercentageValue = (discountStr) => {
    const match = discountStr.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    // Reset discount value when switching types
    setDiscountValue(0);
  };

  const handleDiscountValueChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountValue(value);
  };

  const handleRoeChange = (groupIndex, spareIndex) => (e) => {
    const newRoeSelections = [...roeSelections];
    newRoeSelections[groupIndex] = [...roeSelections[groupIndex]];
    newRoeSelections[groupIndex][spareIndex] = e.target.checked;
    setRoeSelections(newRoeSelections);
  };

  const calculateNewAmounts = () => {
    if (!onCall) return zeroAmounts();

    // Calculate new subtotal based on ROE selections
    let grandSubTotal = 0;
    onCall.productGroups.forEach((group, groupIndex) => {
      group.spares.forEach((spare, spareIndex) => {
        if (roeSelections[groupIndex]?.[spareIndex] && spare.Charges) {
          // Use Charges value if ROE is selected and available
          grandSubTotal += parseFloat(spare.Charges) || 0;
        } else {
          // Use original Rate if ROE not selected or no Charges available
          grandSubTotal += spare.Rate;
        }
      });
    });

    // Calculate discount amount based on type
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = grandSubTotal * (discountValue / 100);
    } else {
      // For fixed amount, cap at grandSubTotal to avoid negative amounts
      discountAmount = Math.min(discountValue, grandSubTotal);
    }

    const afterDiscount = grandSubTotal - discountAmount;
    const tdsAmount = afterDiscount * ((onCall.tdsPercentage || 0) / 100);
    const afterTds = afterDiscount - tdsAmount;
    const gstAmount = afterTds * ((onCall.gstPercentage || 0) / 100);
    const finalAmount = afterTds + gstAmount;

    return {
      grandSubTotal,
      discountAmount,
      afterDiscount,
      tdsAmount,
      afterTds,
      gstAmount,
      finalAmount,
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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate discount value
    if (discountType === "fixed" && discountValue > calculateNewAmounts().grandSubTotal) {
      setError("Discount amount cannot be greater than subtotal");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const newAmounts = calculateNewAmounts();

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/phone/oncall/${id}/revision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discountPercentage: discountType === "percentage" ? discountValue : 0,
            discountAmount: newAmounts.discountAmount,
            afterDiscount: newAmounts.afterDiscount,
            tdsAmount: newAmounts.tdsAmount,
            afterTds: newAmounts.afterTds,
            gstAmount: newAmounts.gstAmount,
            finalAmount: newAmounts.finalAmount,
            remark: `OnCall revised with ${
              discountType === "percentage" 
                ? `${discountValue}% discount` 
                : `₹${discountValue} fixed discount`
            }${onCall.currentRevision > 0 ? " (ROE applied)" : ""}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update oncall");
      }

      const updatedOnCall = await response.json();
      navigate("/pending-oncall", {
        state: {
          success: `OnCall revised successfully (Revision ${updatedOnCall.currentRevision})`,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const newAmounts = calculateNewAmounts();

  if (loading) {
    return (
      <div className="">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button className="mr-2 text-white" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="currentColor"
              className="bi bi-arrow-left-short"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
                0 0 1-.708.708l-3-3a.5.5 
                0 0 1 0-.708l3-3a.5.5 
                0 1 1 .708.708L5.707 7.5H11.5a.5.5 
                0 0 1 .5.5"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold">OnCall Revision</h2>
        </div>
        <div className="mt-20 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button className="mr-2 text-white" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="currentColor"
              className="bi bi-arrow-left-short"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
                0 0 1-.708.708l-3-3a.5.5 
                0 0 1 0-.708l3-3a.5.5 
                0 1 1 .708.708L5.707 7.5H11.5a.5.5 
                0 0 1 .5.5"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold">OnCall Revision</h2>
        </div>
        <div className="mt-20 p-4 text-red-500 text-center">Error: {error}</div>
        <div className="px-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!onCall) {
    return (
      <div className="">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button className="mr-2 text-white" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="currentColor"
              className="bi bi-arrow-left-short"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
                0 0 1-.708.708l-3-3a.5.5 
                0 0 1 0-.708l3-3a.5.5 
                0 1 1 .708.708L5.707 7.5H11.5a.5.5 
                0 0 1 .5.5"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold">OnCall Revision</h2>
        </div>
        <div className="mt-20 p-4 text-center">OnCall not found</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button className="mr-2 text-white" onClick={() => navigate(-1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="currentColor"
            className="bi bi-arrow-left-short"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
              0 0 1-.708.708l-3-3a.5.5 
              0 0 1 0-.708l3-3a.5.5 
              0 1 1 .708.708L5.707 7.5H11.5a.5.5 
              0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">OnCall Revision</h2>
      </div>

      <main className="mb-6 px-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4">
            OnCall #{onCall.onCallNumber} (Revision: {onCall.currentRevision})
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{onCall.customer.customername}</p>
              <p className="text-sm text-gray-500">{onCall.customer.city}</p>
            </div>
            <div>
              <p className="text-gray-500">Complaint ID</p>
              <p className="font-medium">{onCall.complaint.notification_complaintid}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Device</p>
            <p className="font-medium">
              {onCall.complaint.materialdescription} ({onCall.complaint.serialnumber})
            </p>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Reported Problem</p>
            <p className="font-medium">{onCall.complaint.reportedproblem}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Spare Requested</p>
            <p className="font-medium">{onCall.complaint.sparerequest}</p>
          </div>

          {/* ROE SECTION - Only show if currentRevision > 0 */}
          {onCall.currentRevision > 0 && (
            <div className="mb-4 p-3 border rounded-lg bg-yellow-50">
              <h4 className="font-semibold mb-3 text-orange-700">
                Rate of Exchange Options
              </h4>
              {onCall.productGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-3">
                  <h5 className="font-medium text-gray-700">
                    {group.productPartNo} - {group.subgroup}
                  </h5>
                  <div className="space-y-2 ml-4">
                    {group.spares.map((spare, spareIndex) => (
                      <div key={spareIndex} className="flex items-start">
                        <input
                          type="checkbox"
                          id={`roe-${groupIndex}-${spareIndex}`}
                          checked={roeSelections[groupIndex]?.[spareIndex] || false}
                          onChange={handleRoeChange(groupIndex, spareIndex)}
                          className="mt-1 mr-2"
                          disabled={!spare.Charges}
                        />
                        <label 
                          htmlFor={`roe-${groupIndex}-${spareIndex}`} 
                          className="flex-1"
                        >
                          <div className="font-medium">{spare.PartNumber}</div>
                          <div className="text-sm text-gray-600">
                            {spare.Description}
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span>Original Rate: ₹{spare.Rate.toFixed(2)}</span>
                            {spare.Charges ? (
                              <span className="text-blue-600">
                                Exchange Charge: ₹{parseFloat(spare.Charges).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-red-500">No exchange option</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-sm text-gray-500 mt-2">
                Note: Selecting exchange will use the exchange charge instead of the original rate
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="discountType"
                    value="percentage"
                    checked={discountType === "percentage"}
                    onChange={() => handleDiscountTypeChange("percentage")}
                  />
                  <span className="ml-2">Percentage</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="discountType"
                    value="fixed"
                    checked={discountType === "fixed"}
                    onChange={() => handleDiscountTypeChange("fixed")}
                  />
                  <span className="ml-2">Fixed Amount</span>
                </label>
              </div>

              {discountType === "percentage" ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <select
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseInt(e.target.value, 10))}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
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
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={handleDiscountValueChange}
                    min="0"
                    max={newAmounts.grandSubTotal}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum allowed: ₹{newAmounts.grandSubTotal.toFixed(2)}
                  </p>
                </>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="font-semibold mb-3">Financial Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Revised Subtotal:</span>
                  <span>₹{newAmounts.grandSubTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {discountType === "percentage"
                      ? `Discount (${discountValue}%):`
                      : "Discount (Fixed):"}
                  </span>
                  <span className="text-red-600">
                    -₹{newAmounts.discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>After Discount:</span>
                  <span>₹{newAmounts.afterDiscount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>TDS ({onCall.tdsPercentage}%):</span>
                  <span>-₹{newAmounts.tdsAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>After TDS:</span>
                  <span>₹{newAmounts.afterTds.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST ({onCall.gstPercentage}%):</span>
                  <span>+₹{newAmounts.gstAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>New Final Amount:</span>
                  <span className="text-green-600">
                    ₹{newAmounts.finalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm pt-2">
                  <span>Previous Final Amount:</span>
                  <span className="text-gray-500">
                    ₹{(onCall.finalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded ${
                  !hasChanges ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={updating || !hasChanges}
              >
                {updating ? (
                  <span className="flex items-center justify-center">
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
                    Updating...
                  </span>
                ) : (
                  "Revise OnCall"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default OnCallRevision;