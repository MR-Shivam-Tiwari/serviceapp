import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

function OnCallCNoteGen() {
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
          scale: 1,
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

      pdf.save(`${selectedOnCall.onCallNumber}-Quote.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // In OnCallCNoteGen.jsx
  const handleGenerateCNote = async (onCall) => {
    try {
      setIsGenerating(true);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/phone/oncall-cnote`,
        {
          onCallId: onCall._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        toast.success("OnCall CNote generated successfully!");
      }
    } catch (error) {
      console.error("Error generating OnCall CNote:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate OnCall CNote"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedOnCall = location.state?.onCall;
  const [expandedSections, setExpandedSections] = useState({
    customer: false,
    complaint: false,
    spares: false,
    financial: false,
    revisions: false,
  });

  if (!selectedOnCall) {
    navigate("/oncall-quote-generation");
    return null;
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBackToList = () => {
    navigate("/oncall-quote-generation");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="">
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
        <h2 className="text-xl font-bold">OnCall Details</h2>
      </div>

      {/* Main Content */}
      <div className="">
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
                    <p>{selectedOnCall.customer.customername}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Customer Code:</p>
                    <p>{selectedOnCall.customer.customercodeid}</p>
                  </div>
                  <div>
                    <p className="font-semibold">City:</p>
                    <p>{selectedOnCall.customer.city}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Postal Code:</p>
                    <p>{selectedOnCall.customer.postalcode}</p>
                  </div>
                  <div>
                    <p className="font-semibold">PAN:</p>
                    <p>{selectedOnCall.customer.taxnumber1}</p>
                  </div>
                  <div>
                    <p className="font-semibold">GST:</p>
                    <p>{selectedOnCall.customer.taxnumber2}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Telephone:</p>
                    <p>{selectedOnCall.customer.telephone}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{selectedOnCall.customer.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Complaint Details Accordion */}
          <div className="mb-6 border rounded overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection("complaint")}
            >
              <h2 className="text-xl font-bold">Complaint Details</h2>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  expandedSections.complaint ? "rotate-180" : ""
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
            {expandedSections.complaint && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100 p-3 rounded">
                  <div>
                    <p className="font-semibold">Complaint ID:</p>
                    <p>{selectedOnCall.complaint?.notification_complaintid}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Notification Date:</p>
                    <p>{selectedOnCall.complaint?.notificationdate}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Device:</p>
                    <p>{selectedOnCall.complaint?.materialdescription}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Serial Number:</p>
                    <p>{selectedOnCall.complaint?.serialnumber}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Material Code:</p>
                    <p>{selectedOnCall.complaint?.materialcode}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Sales Office:</p>
                    <p>{selectedOnCall.complaint?.salesoffice}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Dealer Code:</p>
                    <p>{selectedOnCall.complaint?.dealercode}</p>
                  </div>
                  <div>
                    <p className="font-semibold">User Status:</p>
                    <p>{selectedOnCall.complaint?.userstatus}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold">Reported Problem:</p>
                    <p>{selectedOnCall.complaint?.reportedproblem}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold">Device Data:</p>
                    <p>{selectedOnCall.complaint?.devicedata}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spare Parts Details Accordion */}
          <div className="mb-6 border rounded overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection("spares")}
            >
              <h2 className="text-xl font-bold">Spare Parts Details</h2>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  expandedSections.spares ? "rotate-180" : ""
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
            {expandedSections.spares && (
              <div className="p-4">
                {selectedOnCall.productGroups?.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="mb-6 p-4 border rounded bg-gray-50"
                  >
                    <h3 className="font-bold text-lg mb-3">
                      Product Group: {group.productPartNo} ({group.subgroup})
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Total Spares: {group.totalSpares}
                    </p>

                    {/* Spares List */}
                    {group.spares?.map((spare, spareIndex) => (
                      <div
                        key={spareIndex}
                        className="mb-4 p-3 border rounded bg-white"
                      >
                        <h4 className="font-semibold text-md mb-2">
                          Spare {spareIndex + 1}: {spare.Description}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <p className="font-semibold">Part Number:</p>
                            <p>{spare.PartNumber}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Type:</p>
                            <p>{spare.Type}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Rate:</p>
                            <p>₹{spare.Rate?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-semibold">DP:</p>
                            <p>₹{spare.DP?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Charges:</p>
                            <p>₹{spare.Charges?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Existing Spares */}
                    {group.existingSpares?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Existing Spares:</h4>
                        {group.existingSpares.map((existing, existingIndex) => (
                          <div
                            key={existingIndex}
                            className="p-2 bg-yellow-50 rounded mb-2"
                          >
                            <p>
                              <strong>Part Number:</strong>{" "}
                              {existing.PartNumber}
                            </p>
                            <p>
                              <strong>Description:</strong>{" "}
                              {existing.Description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
                    <p>₹{selectedOnCall.grandSubTotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Discount ({selectedOnCall.discountPercentage}%):
                    </p>
                    <p>₹{selectedOnCall.discountAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">After Discount:</p>
                    <p>₹{selectedOnCall.afterDiscount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      TDS ({selectedOnCall.tdsPercentage}%):
                    </p>
                    <p>₹{selectedOnCall.tdsAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">After TDS:</p>
                    <p>₹{selectedOnCall.afterTds?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      GST ({selectedOnCall.gstPercentage}%):
                    </p>
                    <p>₹{selectedOnCall.gstAmount?.toLocaleString()}</p>
                  </div>
                  {selectedOnCall.additionalServiceCharge && (
                    <>
                      <div>
                        <p className="font-semibold">
                          Additional Service Charge:
                        </p>
                        <p>
                          ₹
                          {selectedOnCall.additionalServiceCharge.enteredCharge?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Service Location:</p>
                        <p>{selectedOnCall.additionalServiceCharge.location}</p>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <p className="font-semibold text-lg">Final Amount:</p>
                    <p className="text-xl font-bold">
                      ₹{selectedOnCall.finalAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Revisions Accordion (only shown if there are revisions) */}
          {selectedOnCall.revisions?.length > 0 && (
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
                  {selectedOnCall.revisions.map((revision) => (
                    <div
                      key={revision.revisionNumber}
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
                            {revision.changes?.discountPercentage}% (₹
                            {revision.changes?.discountAmount?.toLocaleString()}
                            )
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">After Discount:</p>
                          <p>
                            ₹{revision.changes?.afterDiscount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">TDS:</p>
                          <p>
                            ₹{revision.changes?.tdsAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">After TDS:</p>
                          <p>₹{revision.changes?.afterTds?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold">GST:</p>
                          <p>
                            ₹{revision.changes?.gstAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">Final Amount:</p>
                          <p>
                            ₹{revision.changes?.finalAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-semibold">Remark:</p>
                          <p>{revision.changes?.remark}</p>
                        </div>
                      </div>

                      {/* Approval History */}
                      {revision.approvalHistory?.length > 0 && (
                        <div className="mt-3">
                          <p className="font-semibold">Approval History:</p>
                          {revision.approvalHistory.map((approval, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-white p-2 rounded mt-1"
                            >
                              <span
                                className={`font-medium ${
                                  approval.status === "approved"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {approval.approvalType} {approval.status}
                              </span>
                              {approval.remark && (
                                <span> - {approval.remark}</span>
                              )}
                              <div className="text-xs text-gray-500">
                                {formatDate(approval.changedAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generate CNote Button */}
          <div className="flex justify-end mt-6">
            {selectedOnCall.discountPercentage > 10 ? (
              selectedOnCall.RSHApproval?.approved &&
              selectedOnCall.NSHApproval?.approved ? (
                <button className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition">
                  <a
                    href={`/${selectedOnCall.onCallNumber}-Quote.pdf`}
                    download={`${selectedOnCall.onCallNumber}-Quote.pdf`}
                  >
                    Download Quotation
                  </a>
                </button>
              ) : (
                <p className="text-red-500 italic">
                  Both RSH and NSH approvals are required for discounts above
                  10%
                </p>
              )
            ) : selectedOnCall.discountPercentage >= 6 ? (
              selectedOnCall.RSHApproval?.approved ? (
                <button className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition">
                  <a
                    href={`/${selectedOnCall.onCallNumber}-Quote.pdf`}
                    download={`${selectedOnCall.onCallNumber}-Quote.pdf`}
                  >
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
                <a
                  href={`/${selectedOnCall.onCallNumber}-Quote.pdf`}
                  download={`${selectedOnCall.onCallNumber}-Quote.pdf`}
                >
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
                Generating OnCall CNote...
              </button>
            ) : selectedOnCall?.discountPercentage > 10 ? (
              selectedOnCall?.RSHApproval?.approved &&
              selectedOnCall?.NSHApproval?.approved ? (
                <button
                  onClick={() => handleGenerateCNote(selectedOnCall)}
                  className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                >
                  Generate OnCall CNote
                </button>
              ) : (
                <p className="text-red-500 italic">
                  Both RSH and NSH approvals are required for discounts above
                  10%
                </p>
              )
            ) : selectedOnCall?.discountPercentage >= 6 ? (
              selectedOnCall?.RSHApproval?.approved ? (
                <button
                  onClick={() => handleGenerateCNote(selectedOnCall)}
                  className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                >
                  Generate OnCall CNote
                </button>
              ) : (
                <p className="text-red-500 italic">
                  RSH approval is required for discounts between 6-10%
                </p>
              )
            ) : (
              <button
                onClick={() => handleGenerateCNote(selectedOnCall)}
                className="bg-primary w-full text-white px-6 py-2 rounded hover:bg-primary-dark transition"
              >
                Generate OnCall CNote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnCallCNoteGen;
