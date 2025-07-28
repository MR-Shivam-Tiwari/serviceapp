import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CommercialOfferPdf from "./CommercialOfferPdf";
import { offerData } from "./offerData";
import toast from "react-hot-toast";
function CNoteGen() {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      const input = contentRef.current;
      const pdf = new jsPDF("p", "mm", "a4");
      const pages = Array.from(input.getElementsByClassName("page"));

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Make page temporarily visible for rendering
        page.style.visibility = "visible";

        const canvas = await html2canvas(page, {
          scale: 1, // Reduce scale for better compatibility
          useCORS: true,
          logging: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        // Hide page again after capture
        page.style.visibility = "hidden";

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save("SK-Q0307.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  const handleGenerateCNote = async (proposal) => {
    try {
      setIsGenerating(true);

      // Call your backend API to generate CNote
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/phone/cnote`,
        {
          proposalId: proposal._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        toast.success("CNote generated successfully!");
      }
    } catch (error) {
      console.error("Error generating CNote:", error);
      toast.error(error.response?.data?.message || "Failed to generate CNote", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProposal = location.state?.proposal;
  const [expandedSections, setExpandedSections] = useState({
    customer: false,
    equipment: false,
    financial: false,
    revisions: false,
  });

  if (!selectedProposal) {
    navigate("/quote-generation");
    return null;
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBackToList = () => {
    navigate("/quote-generation");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className=" ">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button className="mr-2 text-white" onClick={handleBackToList}>
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
        <h2 className="text-xl font-bold">Proposal Details</h2>
      </div>

      {/* Main Content */}
      <div className=" ">
        <div className="bg-white rounded shadow-md px-4">
          {/* Customer Details Accordion */}
          <div className="mb-6 border rounded overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection("customer")}
            >
              <h2 className="text-xl font-bold">Customer Details</h2>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  expandedSections.customer ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSections.customer && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100 p-3 rounded">
                  <div>
                    <p className="font-semibold">Customer Name:</p>
                    <p>{selectedProposal.customer?.customername}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Customer Code:</p>
                    <p>{selectedProposal.customer?.customercodeid}</p>
                  </div>
                  <div>
                    <p className="font-semibold">City:</p>
                    <p>{selectedProposal.customer?.city}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Postal Code:</p>
                    <p>{selectedProposal.customer?.postalcode}</p>
                  </div>
                  <div>
                    <p className="font-semibold">PAN:</p>
                    <p>{selectedProposal.customer?.taxnumber1}</p>
                  </div>
                  <div>
                    <p className="font-semibold">GST:</p>
                    <p>{selectedProposal.customer?.taxnumber2}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Telephone:</p>
                    <p>{selectedProposal.customer?.telephone}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{selectedProposal.customer?.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Equipment Details Accordion */}
          <div className="mb-6 border rounded overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection("equipment")}
            >
              <h2 className="text-xl font-bold">Equipment Details</h2>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  expandedSections.equipment ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSections.equipment && (
              <div className="p-4">
                {selectedProposal.items.map((item, index) => {
                  const showBothApprovals =
                    selectedProposal.discountPercentage > 10;
                  const showOnlyRSH =
                    selectedProposal.discountPercentage >= 6 &&
                    selectedProposal.discountPercentage <= 10;
                  const showNoApprovals =
                    selectedProposal.discountPercentage < 6;

                  const needsBothApprovals = showBothApprovals;
                  const hasRequiredApprovals = needsBothApprovals
                    ? item.RSHApproval.approved && item.NSHApproval.approved
                    : item.RSHApproval.approved;

                  return (
                    <div
                      key={item._id}
                      className="mb-4 p-4 border rounded bg-gray-50"
                    >
                      <h3 className="font-bold text-lg mb-2">
                        Equipment {index + 1}: {item.equipment.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <div>
                          <p className="font-semibold">Material Code:</p>
                          <p>{item.equipment.materialcode}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Material Description:</p>
                          <p>{item.equipment.materialdescription}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Dealer:</p>
                          <p>{item.equipment.dealer}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Warranty Type:</p>
                          <p>{item.warrantyType}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Years:</p>
                          <p>{item.years}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Price Per Year:</p>
                          <p>₹{item.pricePerYear.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Subtotal:</p>
                          <p>₹{item.subtotal.toLocaleString()}</p>
                        </div>
                      </div>

                      {!showNoApprovals && (
                        <div className="mt-4">
                          <h4 className="font-semibold">Approval Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {(showOnlyRSH || showBothApprovals) && (
                              <div>
                                <p className="font-semibold">RSH Approval:</p>
                                <p>
                                  {item.RSHApproval.approved ? (
                                    <span className="text-green-600">
                                      Approved on{" "}
                                      {formatDate(item.RSHApproval.approvedAt)}
                                    </span>
                                  ) : (
                                    <span className="text-red-600">
                                      Pending
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}

                            {showBothApprovals && (
                              <div>
                                <p className="font-semibold">NSH Approval:</p>
                                <p>
                                  {item.NSHApproval.approved ? (
                                    <span className="text-green-600">
                                      Approved on{" "}
                                      {formatDate(item.NSHApproval.approvedAt)}
                                    </span>
                                  ) : (
                                    <span className="text-red-600">
                                      Pending
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Financial Details Accordion */}
          <div className="mb-6 border rounded overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection("financial")}
            >
              <h2 className="text-xl font-bold">Financial Details</h2>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  expandedSections.financial ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSections.financial && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100 p-3 rounded">
                  <div>
                    <p className="font-semibold">Grand Subtotal:</p>
                    <p>₹{selectedProposal.grandSubTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Discount ({selectedProposal.discountPercentage}%):
                    </p>
                    <p>₹{selectedProposal.discountAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">After Discount:</p>
                    <p>₹{selectedProposal.afterDiscount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      TDS ({selectedProposal.tdsPercentage}%):
                    </p>
                    <p>₹{selectedProposal.tdsAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">After TDS:</p>
                    <p>₹{selectedProposal.afterTds.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      GST ({selectedProposal.gstPercentage}%):
                    </p>
                    <p>₹{selectedProposal.gstAmount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold text-lg">Final Amount:</p>
                    <p className="text-xl font-bold">
                      ₹{selectedProposal.finalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Revisions Accordion (only shown if there are revisions) */}
          {selectedProposal.revisions.length > 0 && (
            <div className="mb-6 border rounded overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
                onClick={() => toggleSection("revisions")}
              >
                <h2 className="text-xl font-bold">Revision History</h2>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    expandedSections.revisions ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedSections.revisions && (
                <div className="p-4">
                  {selectedProposal.revisions.map((revision) => (
                    <div
                      key={revision._id}
                      className="mb-4 p-4 border rounded bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">
                          Revision #{revision.revisionNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(revision.revisionDate)}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <div>
                          <p className="font-semibold">Discount:</p>
                          <p>
                            {revision.changes.discountPercentage}% (₹
                            {revision.changes.discountAmount.toLocaleString()})
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">After Discount:</p>
                          <p>
                            ₹{revision.changes.afterDiscount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">TDS:</p>
                          <p>₹{revision.changes.tdsAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold">After TDS:</p>
                          <p>₹{revision.changes.afterTds.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold">GST:</p>
                          <p>₹{revision.changes.gstAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Final Amount:</p>
                          <p>
                            ₹{revision.changes.finalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-semibold">Remark:</p>
                          <p>{revision.changes.remark}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generate CNote Button */}
          <div className="flex justify-end mt-6">
            {selectedProposal.discountPercentage > 10 ? (
              selectedProposal.items.every(
                (item) => item.RSHApproval.approved && item.NSHApproval.approved
              ) ? (
                <button className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition">
                  <a href="/SK-Q0307.pdf" download="SK-Q0307.pdf">
                    Download Quotation
                  </a>
                </button>
              ) : (
                <p className="text-red-500 italic">
                  Both RSH and NSH approvals are required for discounts above
                  10%
                </p>
              )
            ) : selectedProposal.discountPercentage >= 6 ? (
              selectedProposal.items.every(
                (item) => item.RSHApproval.approved
              ) ? (
                <button className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition">
                  <a href="/SK-Q0307.pdf" download="SK-Q0307.pdf">
                    Download Quotation
                  </a>
                </button>
              ) : (
                <p className="text-red-500 italic">
                  RSH approval is required for discounts between 6-10%
                </p>
              )
            ) : (
              <button className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition">
                <a href="/SK-Q0307.pdf" download="SK-Q0307.pdf">
                  Download Quotation
                </a>
              </button>
            )}
          </div>

          <div className="flex justify-end mt-6">
            {isGenerating ? (
              <button
                disabled
                className="bg-gray-400 w-full text-white px-6 py-2 rounded flex items-center justify-center cursor-not-allowed"
              >
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
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
                Generating CNote...
              </button>
            ) : selectedProposal?.discountPercentage > 10 ? (
              selectedProposal?.items?.every(
                (item) =>
                  item?.RSHApproval?.approved && item?.NSHApproval?.approved
              ) ? (
                <button
                  onClick={() => handleGenerateCNote(selectedProposal)}
                  className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                >
                  Generate CNote
                </button>
              ) : (
                <p className="text-red-500 italic">
                  Both RSH and NSH approvals are required for discounts above
                  10%
                </p>
              )
            ) : selectedProposal?.discountPercentage >= 6 ? (
              selectedProposal?.items?.every(
                (item) => item?.RSHApproval?.approved
              ) ? (
                <button
                  onClick={() => handleGenerateCNote(selectedProposal)}
                  className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                >
                  Generate CNote
                </button>
              ) : (
                <p className="text-red-500 italic">
                  RSH approval is required for discounts between 6-10%
                </p>
              )
            ) : (
              <button
                onClick={() => handleGenerateCNote(selectedProposal)}
                className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition"
              >
                Generate CNote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
const downloadButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  margin: "20px",
};

const hiddenContentStyle = {
  position: "absolute",
  left: "-9999px",
  top: 0,
  width: "210mm", // A4 width
  minHeight: "297mm", // A4 height
};

export default CNoteGen;
