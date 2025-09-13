import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProposalDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || [];
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({});
  const [tdsPercentage, setTdsPercentage] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [remark, setRemark] = useState("");
  const [tdsOptions, setTdsOptions] = useState([]);
  const [gstOptions, setGstOptions] = useState([]);
  const [discountOptions, setDiscountOptions] = useState([]);

  const [selections, setSelections] = useState(() =>
    items.reduce((acc, { equipment }) => {
      acc[equipment._id] = { cmc: false, ncmc: false, years: 1 };
      return acc;
    }, {})
  );

  // Check if any item has CMC or NCMC selected
  const hasSelectedWarranty = Object.values(selections).some(
    (selection) => selection.cmc || selection.ncmc
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch prices
        const pricesResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/admin/cmcncmcprice/all`
        );
        const pricesData = await pricesResponse.json();
        const pricesMap = {};
        pricesData.records.forEach((item) => {
          pricesMap[item.partNumber] = {
            cmcPrice: item.cmcPriceWithGst,
            ncmcPrice: item.ncmcPriceWithGst,
          };
        });
        setPrices(pricesMap);

        // Fetch TDS options
        const tdsResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/admin/cmc-ncmc-tds`
        );
        const tdsData = await tdsResponse.json();
        setTdsOptions(tdsData.records || []);

        // Fetch GST options
        const gstResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/admin/gst`
        );
        const gstData = await gstResponse.json();
        setGstOptions(gstData.records || []);

        // Fetch Discount options
        const discountResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/admin/discount`
        );
        const discountData = await discountResponse.json();
        setDiscountOptions(discountData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (items.length > 0) {
      fetchData();
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="p-3 text-center text-sm">No proposals selected.</div>
    );
  }

  const customer = items[0].customer;
  const equipmentdealer = items.equipment;

  const handleToggle = (id, field) => {
    setSelections((prev) => {
      const isCmc = field === "cmc";
      return {
        ...prev,
        [id]: {
          ...prev[id],
          cmc: isCmc ? !prev[id].cmc : false,
          ncmc: isCmc ? false : !prev[id].ncmc,
          years: prev[id].years,
        },
      };
    });
  };

  const handleYearsChange = (id, value) => {
    setSelections((prev) => ({
      ...prev,
      [id]: { ...prev[id], years: parseInt(value, 10) },
    }));
  };

  const extractPercentageValue = (str) => {
    if (!str) return 0;
    const match = str.match(/(\d*\.?\d*)%/);
    return match ? parseFloat(match[1]) : 0;
  };

  const calculateTotalAmount = () => {
    const itemCalculations = items.map(({ equipment }) => {
      const sel = selections[equipment._id];
      const materialCode = equipment.materialcode;
      const priceInfo = prices[materialCode] || {};

      const basePrice = sel.cmc
        ? priceInfo.cmcPrice
        : sel.ncmc
        ? priceInfo.ncmcPrice
        : 0;
      const subtotal = basePrice * sel.years;

      return {
        equipmentId: equipment._id,
        equipmentName: equipment.name,
        materialCode,
        years: sel.years,
        pricePerYear: basePrice,
        subtotal,
        warrantyType: sel.cmc ? "CMC" : sel.ncmc ? "NCMC" : "None",
      };
    });

    const grandSubTotal = itemCalculations.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const discountAmount = grandSubTotal * (discountPercentage / 100);
    const afterDiscount = grandSubTotal - discountAmount;
    const tdsAmount = afterDiscount * (tdsPercentage / 100);
    const afterTds = afterDiscount - tdsAmount;
    const gstAmount = afterTds * (gstPercentage / 100);
    const finalAmount = afterTds + gstAmount;

    return {
      itemCalculations,
      grandSubTotal,
      discountAmount,
      afterDiscount,
      tdsAmount,
      afterTds,
      gstAmount,
      finalAmount,
    };
  };

  const handleSubmit = async () => {
    if (!hasSelectedWarranty) {
      alert("Please select at least one warranty type (CMC or NCMC)");
      return;
    }

    const calculation = calculateTotalAmount();
    // const serialNumber = Date.now();

    const proposalData = {
      // serialNumber,
      customer: {
        customercodeid: customer?.customercodeid,
        customername: customer?.customername,
        city: customer?.city,
        postalcode: customer?.postalcode,
        taxnumber1: customer?.taxnumber1,
        taxnumber2: customer?.taxnumber2,
        telephone: customer?.telephone,
        email: customer?.email,
      },
      items: items.map(({ equipment }) => {
        const sel = selections[equipment._id];
        const materialCode = equipment.materialcode;
        const priceInfo = prices[materialCode] || {};
        const basePrice = sel.cmc
          ? priceInfo.cmcPrice
          : sel.ncmc
          ? priceInfo.ncmcPrice
          : 0;

        return {
          equipment: {
            _id: equipment._id,
            name: equipment.name,
            materialcode: equipment.materialcode,
            materialdescription: equipment.materialdescription,
            dealer: equipment.dealer,
            serialnumber: equipment.serialnumber,
          },
          warrantyType: sel.cmc ? "CMC" : sel.ncmc ? "NCMC" : "None",
          years: sel.years,
          pricePerYear: basePrice,
          subtotal: basePrice * sel.years,
        };
      }),
      tdsPercentage,
      discountPercentage,
      gstPercentage,
      remark,
      grandSubTotal: calculation.grandSubTotal,
      discountAmount: calculation.discountAmount,
      afterDiscount: calculation.afterDiscount,
      tdsAmount: calculation.tdsAmount,
      afterTds: calculation.afterTds,
      gstAmount: calculation.gstAmount,
      finalAmount: calculation.finalAmount,
      status: "submitted",
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/phone/proposal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(proposalData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save proposal");
      }

      const savedProposal = await response.json();

      navigate("/create-proposal", {
        state: {
          ...proposalData,
          _id: savedProposal._id,
          proposalNumber: savedProposal.proposalNumber,
          createdAt: savedProposal.createdAt,
        },
      });
      toast.success("Proposal Created Successfully");
    } catch (error) {
      console.error("Error saving proposal:", error);
      alert("Failed to save proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculation = calculateTotalAmount();

  return (
    <div className=" bg-gray-50">
      {/* Header - Unchanged */}
      <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/create-proposal")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Proposal Details</h1>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <svg
              className="animate-spin h-6 w-6 text-blue-600 mx-auto"
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
            <p className="text-sm text-gray-600 mt-2">Loading...</p>
          </div>
        </div>
      )}

      <main className="pt-20 pb-6 px-2 space-y-3">
        {/* Customer Section - Enhanced */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Customer Information
            </h3>
          </div>
          <div className="p-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Customer Code</p>
                <p className="font-medium text-sm">
                  {customer?.customercodeid || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-medium text-sm truncate">
                  {customer?.customername || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">City</p>
                <p className="font-medium text-sm">{customer?.city || "N/A"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Pincode</p>
                <p className="font-medium text-sm">
                  {customer?.postalcode || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Pan Number</p>
                <p className="font-medium text-sm">
                  {customer?.taxnumber1 || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">GST Number</p>
                <p className="font-medium text-sm">
                  {customer?.taxnumber2 || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-500 mb-1">Contact</p>
              <p className="font-medium text-sm">
                {customer?.telephone || "N/A"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {customer?.email || "N/A"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-xs text-blue-600 mb-1">Dealer</p>
              <p className="font-medium text-sm text-blue-800">
                {equipmentdealer?.dealer || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Equipment Items - Enhanced */}
        <div className="space-y-3">
          {items.map(({ equipment }, index) => {
            const sel = selections[equipment._id];
            const itemCalc = calculation.itemCalculations.find(
              (item) => item.equipmentId === equipment._id
            );

            return (
              <div
                key={equipment._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 text-sm flex items-center">
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                        {index + 1}
                      </span>
                      {equipment.name}
                    </h4>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {equipment.materialcode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                      {equipment.materialdescription}
                    </p>
                    <p className="text-gray-600 bg-green-200 px-1 rounded-full text-xs mt-1 leading-relaxed">
                      Sno: {equipment.serialnumber}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Warranty Selection */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Select Warranty Type:
                    </p>
                    <div className="flex gap-3">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name={`warranty-${equipment._id}`}
                          checked={sel.cmc}
                          onChange={() => handleToggle(equipment._id, "cmc")}
                          className="sr-only"
                        />
                        <div
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer text-center ${
                            sel.cmc
                              ? "border-green-400 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="font-medium text-sm">CMC</span>
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name={`warranty-${equipment._id}`}
                          checked={sel.ncmc}
                          onChange={() => handleToggle(equipment._id, "ncmc")}
                          className="sr-only"
                        />
                        <div
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer text-center ${
                            sel.ncmc
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="font-medium text-sm">NCMC</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Years Selection */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Duration (Years):
                    </p>
                    <select
                      value={sel.years}
                      onChange={(e) =>
                        handleYearsChange(equipment._id, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map((y) => (
                        <option key={y} value={y}>
                          {y} Year{y > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calculation Display */}
                  {(sel.cmc || sel.ncmc) && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">
                            Price per Year
                          </p>
                          <p className="font-bold text-lg text-green-600">
                            ₹
                            {itemCalc?.pricePerYear?.toLocaleString("en-IN") ||
                              "0"}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Total Amount</p>
                          <p className="font-bold text-lg text-green-600">
                            ₹
                            {itemCalc?.subtotal?.toLocaleString("en-IN") || "0"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calculation Section - Enhanced */}
        {hasSelectedWarranty && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Tax Configuration
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    TDS Percentage
                  </label>
                  <select
                    value={tdsPercentage}
                    onChange={(e) =>
                      setTdsPercentage(parseFloat(e.target.value) || 0)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0">Select TDS Rate</option>
                    {tdsOptions.map((option) => (
                      <option key={option._id} value={option.tds}>
                        {option.tds}%
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    GST Percentage
                  </label>
                  <select
                    value={gstPercentage}
                    onChange={(e) =>
                      setGstPercentage(parseFloat(e.target.value) || 0)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0">Select GST Rate</option>
                    {gstOptions.map((option) => (
                      <option
                        key={option._id}
                        value={extractPercentageValue(option.gst)}
                      >
                        {option.gst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grand Total Summary - Enhanced */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg text-white overflow-hidden">
              <div className="px-4 py-3 border-b border-white/20">
                <h3 className="font-bold text-white flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  Payment Summary
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-100">Subtotal</span>
                  <span className="font-semibold">
                    ₹{calculation.grandSubTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-100">
                      Discount ({discountPercentage}%)
                    </span>
                    <span className="font-semibold text-red-300">
                      -₹{calculation.discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {tdsPercentage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-100">
                      TDS ({tdsPercentage}%)
                    </span>
                    <span className="font-semibold text-red-300">
                      -₹{calculation.tdsAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {gstPercentage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-100">
                      GST ({gstPercentage}%)
                    </span>
                    <span className="font-semibold text-green-300">
                      +₹{calculation.gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Final Amount</span>
                    <span className="text-2xl font-bold text-yellow-300">
                      ₹{calculation.finalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remark Section - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  Additional Remarks
                </h3>
              </div>
              <div className="p-4">
                <textarea
                  maxLength={400}
                  className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 resize-none text-sm"
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter any additional remarks or notes..."
                />
                <div className="flex justify-between items-center mt-2">
                  <div></div>
                  <p
                    className={`text-xs font-medium ${
                      remark.length > 380
                        ? "text-red-600"
                        : remark.length > 350
                        ? "text-orange-500"
                        : "text-gray-500"
                    }`}
                  >
                    {remark.length}/400
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error Messages */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm text-center font-medium">
              Error: {submitError.message || "Failed to save proposal"}
            </p>
          </div>
        )}

        {(isNaN(calculation.finalAmount) || calculation.finalAmount <= 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-700 text-sm text-center font-medium">
              Final amount must be greater than zero to submit the proposal.
            </p>
          </div>
        )}

        {/* Submit Button - Enhanced */}
        <div className="sticky bottom-0 pb-14 bg-gray-50 p-3 -mx-3">
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !hasSelectedWarranty ||
              isNaN(calculation.finalAmount) ||
              calculation.finalAmount <= 0
            }
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform ${
              loading ||
              !hasSelectedWarranty ||
              isNaN(calculation.finalAmount) ||
              calculation.finalAmount <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-green-200"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Submit Proposal</span>
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
