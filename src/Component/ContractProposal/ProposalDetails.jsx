import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProposalDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || [];
  const [submitError, setSubmitError] = useState(null);
  // initialize per-item selection state
  const [selections, setSelections] = useState(() =>
    items.reduce((acc, { equipment }) => {
      acc[equipment._id] = { cmc: false, ncmc: false, years: 1 };
      return acc;
    }, {})
  );

  const [prices, setPrices] = useState({});
  const [tdsPercentage, setTdsPercentage] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [tdsOptions, setTdsOptions] = useState([]);
  const [gstOptions, setGstOptions] = useState([]);
  const [discountOptions, setDiscountOptions] = useState([]);

  // Check if any item has CMC or NCMC selected
  const hasSelectedWarranty = Object.values(selections).some(
    (selection) => selection.cmc || selection.ncmc
  );

  useEffect(() => {
    // Fetch all required data when component mounts
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch prices
        const pricesResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/admin/cmcncmcprice`
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
    return <div className="p-4">No proposals selected.</div>;
  }

  const customer = items[0].customer;
  const equipmentdealer = items[0].equipment;

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

  // Helper function to extract numeric value from percentage strings
  const extractPercentageValue = (str) => {
    if (!str) return 0;
    const match = str.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
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

    // Prepare the complete proposal data
    const proposalData = {
      customer: {
        customercodeid: customer?.customercodeid,
        customername: customer?.customername,
        city: customer?.city,
        postalcode: customer?.postalcode,
        taxnumber1: customer?.taxnumber1, // PAN
        taxnumber2: customer?.taxnumber2, // GST
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
      status: "submitted", // Initial status
    };

    try {
      setLoading(true);

      // Save to backend API
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/phone/proposal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proposalData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save proposal");
      }

      const savedProposal = await response.json();

      // Navigate to summary with the saved data (including generated proposal number)
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
    <div className=" ">
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/create-proposal")}
        >
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Proposal Details</h2>
      </div>

      <main className="  px-4 space-y-6">
        {/* Customer */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Customer Info</h3>
          <p>
            <strong>Code:</strong> {customer?.customercodeid}
          </p>
          <p>
            <strong>Name:</strong> {customer?.customername}
          </p>
          <p>
            <strong>City:</strong> {customer?.city}
          </p>
          <p>
            <strong>Pincode:</strong> {customer?.postalcode}
          </p>
          <p>
            <strong>Pan Number:</strong> {customer?.taxnumber1}
          </p>
          <p>
            <strong>GST Number:</strong> {customer?.taxnumber2}
          </p>
          <p>
            <strong>Phone Number:</strong> {customer?.telephone}
          </p>
          <p>
            <strong>Email :</strong> {customer?.email}
          </p>
          <p>
            <strong>Dealer :</strong> {equipmentdealer.dealer}
          </p>
        </section>

        {/* Each proposal with its own controls and calculations */}
        <section className="space-y-4">
          {items.map(({ equipment }) => {
            const sel = selections[equipment._id];
            const itemCalc = calculation.itemCalculations.find(
              (item) => item.equipmentId === equipment._id
            );

            return (
              <div
                key={equipment._id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{equipment.name}</h4>
                    <p className="text-gray-600 text-sm">
                      {equipment.materialdescription}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Code: {equipment.materialcode}
                    </p>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`warranty-${equipment._id}`}
                        checked={sel.cmc}
                        onChange={() => handleToggle(equipment._id, "cmc")}
                        className="form-radio h-5 w-5 text-primary mr-2"
                      />
                      CMC
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`warranty-${equipment._id}`}
                        checked={sel.ncmc}
                        onChange={() => handleToggle(equipment._id, "ncmc")}
                        className="form-radio h-5 w-5 text-primary mr-2"
                      />
                      NCMC
                    </label>

                    <div className="flex items-center">
                      <label
                        htmlFor={`years-${equipment._id}`}
                        className="mr-2"
                      >
                        Years:
                      </label>
                      <select
                        id={`years-${equipment._id}`}
                        value={sel.years}
                        onChange={(e) =>
                          handleYearsChange(equipment._id, e.target.value)
                        }
                        className="border w-[90px] rounded p-1 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Individual Item Calculation */}
                {(sel.cmc || sel.ncmc) && (
                  <div className="mt-4 border-t pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Warranty Type</p>
                        <p className="font-medium">{itemCalc?.warrantyType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price/Year</p>
                        <p className="font-medium">
                          ₹{itemCalc?.pricePerYear?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Years</p>
                        <p className="font-medium">{itemCalc?.years}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Subtotal</p>
                        <p className="font-medium">
                          ₹{itemCalc?.subtotal?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Grand Total Calculation */}
        {hasSelectedWarranty && (
          <>
            <section className="bg-white p-4 rounded-lg shadow space-y-4">
              <h3 className="font-semibold text-lg">Grand Total Calculation</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    TDS (%)
                  </label>
                  <select
                    value={tdsPercentage}
                    onChange={(e) =>
                      setTdsPercentage(parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="0">Select TDS</option>
                    {tdsOptions.map((option) => (
                      <option key={option._id} value={option.tds}>
                        {option.tds}%
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount (%)
                  </label>
                  <select
                    value={discountPercentage}
                    onChange={(e) =>
                      setDiscountPercentage(parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="0">Select Discount</option>
                    {discountOptions.map((option) => (
                      <option
                        key={option._id}
                        value={extractPercentageValue(option.discount)}
                      >
                        {option.discount}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    GST (%)
                  </label>
                  <select
                    value={gstPercentage}
                    onChange={(e) =>
                      setGstPercentage(parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="0">Select GST</option>
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

              <div className="bg-gray-100 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Grand Total Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>
                      Total Subtotal (
                      {
                        calculation.itemCalculations.filter(
                          (item) => item.warrantyType !== "None"
                        ).length
                      }{" "}
                      items):
                    </span>
                    <span>₹{calculation.grandSubTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount ({discountPercentage}%):</span>
                    <span>-₹{calculation.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Discount:</span>
                    <span>₹{calculation.afterDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS ({tdsPercentage}%):</span>
                    <span>-₹{calculation.tdsAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After TDS:</span>
                    <span>₹{calculation.afterTds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({gstPercentage}%):</span>
                    <span>+₹{calculation.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Final Amount:</span>
                    <span>₹{calculation.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Remark */}
            <section className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Remark</h3>
              <textarea
                maxLength={400}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                rows={4}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <p
                className={`text-xs font-medium text-right mt-1 ${
                  remark.length > 380
                    ? "text-red-600"
                    : remark.length > 350
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {remark.length}/400 characters used
              </p>
            </section>
          </>
        )}

        {/* Submit Button */}
        {submitError && (
          <div className="text-red-500 text-center mb-4">
            Error: {submitError.message || "Failed to save proposal"}
          </div>
        )}
        {(isNaN(calculation.finalAmount) || calculation.finalAmount <= 0) && (
          <div className="text-red-600 text-sm text-center mb-4 font-medium">
            Final amount must be greater than zero to submit the proposal.
          </div>
        )}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !hasSelectedWarranty ||
              isNaN(calculation.finalAmount) ||
              calculation.finalAmount <= 0
            }
            className={`bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ${
              loading ||
              !hasSelectedWarranty ||
              isNaN(calculation.finalAmount) ||
              calculation.finalAmount <= 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary-dark"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Saving...
              </span>
            ) : (
              "Submit to Customer"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
