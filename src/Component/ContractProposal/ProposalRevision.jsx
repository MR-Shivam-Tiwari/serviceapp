import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ProposalRevision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch proposal data
        const proposalResponse = await fetch(
          `http://localhost:5000/phone/proposal/${id}`
        );
        if (!proposalResponse.ok) throw new Error("Failed to fetch proposal");
        const proposalData = await proposalResponse.json();
        setProposal(proposalData);
        setSelectedDiscount(proposalData.discountPercentage);

        // Fetch discount options
        const discountResponse = await fetch(
          "http://localhost:5000/admin/discount"
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
    setSelectedDiscount(parseInt(e.target.value, 10));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const newAmounts = calculateNewAmounts();

      const response = await fetch(
        `http://localhost:5000/phone/proposal/${id}/revision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discountPercentage: selectedDiscount,
            discountAmount: newAmounts.discountAmount,
            afterDiscount: newAmounts.afterDiscount,
            tdsAmount: newAmounts.tdsAmount,
            afterTds: newAmounts.afterTds,
            gstAmount: newAmounts.gstAmount,
            finalAmount: newAmounts.finalAmount,
            remark: "Discount updated to " + selectedDiscount + "%",
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
    if (!proposal) return {};

    const grandSubTotal = proposal.grandSubTotal;
    const discountAmount = grandSubTotal * (selectedDiscount / 100);
    const afterDiscount = grandSubTotal - discountAmount;
    const tdsAmount = afterDiscount * (proposal.tdsPercentage / 100);
    const afterTds = afterDiscount - tdsAmount;
    const gstAmount = afterTds * (proposal.gstPercentage / 100);
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

  const newAmounts = calculateNewAmounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
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
          <h2 className="text-xl font-bold">Proposal Revision</h2>
        </div>
        <div className="mt-20 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button className="mr-2 text-white" onClick={() => navigate(-1)}>
            {/* Back button SVG */}
          </button>
          <h2 className="text-xl font-bold">Proposal Revision</h2>
        </div>
        <div className="mt-20 p-4 text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
          <button className="mr-2 text-white" onClick={() => navigate(-1)}>
            {/* Back button SVG */}
          </button>
          <h2 className="text-xl font-bold">Proposal Revision</h2>
        </div>
        <div className="mt-20 p-4 text-center">Proposal not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
        <h2 className="text-xl font-bold">Proposal Revision</h2>
      </div>

      <main className="mt-20 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4">
            Proposal #{proposal.proposalNumber}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{proposal.customer.customername}</p>
            </div>
            <div>
              <p className="text-gray-500">Current Discount</p>
              <p className="font-medium">{proposal.discountPercentage}%</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select New Discount
              </label>
              <select
                value={selectedDiscount}
                onChange={handleDiscountChange}
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
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="font-semibold mb-3">Financial Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Original Subtotal:</span>
                  <span>₹{proposal.grandSubTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Current Discount ({proposal.discountPercentage}%):
                  </span>
                  <span>-₹{proposal.discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-medium text-blue-600">
                  <span>New Discount ({selectedDiscount}%):</span>
                  <span>-₹{newAmounts.discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>After Discount:</span>
                  <span>₹{newAmounts.afterDiscount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>TDS ({proposal.tdsPercentage}%):</span>
                  <span>-₹{newAmounts.tdsAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>After TDS:</span>
                  <span>₹{newAmounts.afterTds.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST ({proposal.gstPercentage}%):</span>
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
                    ₹{proposal.finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

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
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
                disabled={
                  updating || selectedDiscount === proposal.discountPercentage
                }
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
                  "Revise"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProposalRevision;
