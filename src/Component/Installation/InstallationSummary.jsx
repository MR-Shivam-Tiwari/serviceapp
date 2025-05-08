import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function InstallationSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  // From previous screen:
  // - installItems: array of selected machines
  // - customer: chosen customer
  // - abnormalCondition, voltageData (if you are also passing them)
  const {
    installItems = [],
    customer,
    abnormalCondition = "",
    voltageData = {},
  } = location.state || {};

  // OTP + Loading + Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // For global checklist remark
  const [globalChecklistRemark, setGlobalChecklistRemark] = useState("");

  // Checklist states
  const [allINChecklists, setAllINChecklists] = useState([]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [activeMachineIndex, setActiveMachineIndex] = useState(null);

  // This array holds the question objects for the current machine
  const [tempChecklistResults, setTempChecklistResults] = useState([]);
  // Wizard index to show one question at a time
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Optionally load user info from localStorage
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
  });

  // ---------------------------------------
  // On mount, load user info
  // ---------------------------------------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
      });
    }
  }, []);

  // ---------------------------------------
  // Build data to send in one request
  // ---------------------------------------
  const buildEquipmentPayloadsAndPdfData = () => {
    const equipmentPayloads = [];
    const equipmentListForPdf = [];

    // For each machine:
    installItems.forEach((item) => {
      const { serialNumber, pendingInstallationData, palNumber } = item;

      // e.g. today's date for warranty start
      const warrantyStartDate = new Date();
      let warrantyEndDate = null;
      if (pendingInstallationData?.warrantyMonths) {
        warrantyEndDate = new Date(
          new Date().setMonth(
            new Date().getMonth() + pendingInstallationData.warrantyMonths
          )
        );
      }

      // Build the equipment payload
      const equipPayload = {
        serialnumber: serialNumber,
        materialdescription: pendingInstallationData?.description || "",
        materialcode: pendingInstallationData?.material || "",
        currentcustomer: customer?.customercodeid || "",
        status: pendingInstallationData?.status || "N/A",
        name: `${pendingInstallationData?.customername1 || "N/A"} ${
          pendingInstallationData?.customername2 || "N/A"
        }`.trim(),
        custWarrantystartdate: warrantyStartDate.toISOString(),
        custWarrantyenddate: warrantyEndDate
          ? warrantyEndDate.toISOString()
          : "",
        palnumber: pendingInstallationData?.palnumber || palNumber || "",
      };

      equipmentPayloads.push(equipPayload);

      // For the PDF's equipment table
      equipmentListForPdf.push({
        materialdescription: pendingInstallationData?.description || "",
        serialnumber: serialNumber,
        custWarrantyenddate: warrantyEndDate
          ? warrantyEndDate.toISOString()
          : "",
      });
    });

    // Build top-level PDF data (for emailing, etc.)
    const pdfData = {
      userInfo, // optional
      dateOfInstallation: new Date().toLocaleDateString("en-GB"),
      customerId: customer?.customercodeid || "",
      customerName: customer?.hospitalname || "",
      hospitalName: customer?.hospitalname || "",
      phoneNumber: customer?.telephone || "",
      street: customer?.street || "",
      email: customer?.email || "",
      city: customer?.city || "",
      postalCode: customer?.postalcode || "",
      state: customer?.region || "",
      equipmentList: equipmentListForPdf,
    };

    return { equipmentPayloads, pdfData };
  };

  // ---------------------------------------
  // Confirm => send OTP
  // ---------------------------------------
  const handleConfirmAndCompleteInstallation = async () => {
    setLoadingMessage("Sending OTP...");
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/send-otp`,
        {
          email: customer?.email,
        }
      );
      toast.success("OTP sent to customer's email.");
      setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // ---------------------------------------
  // Verify OTP + create everything => /equipment/bulk
  // ---------------------------------------
  const verifyOtpAndSubmit = async () => {
    setIsVerifyingOtp(true);
    setLoadingMessage("Verifying OTP & Creating Installation...");
    setIsLoading(true);

    try {
      // 1) Verify OTP
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/verify-otp`,
        {
          email: customer?.email,
          otp,
        }
      );
      toast.success("OTP verified successfully.");

      // 2) Build equipment + pdf
      const { equipmentPayloads, pdfData } = buildEquipmentPayloadsAndPdfData();
      const finalPdfData = { ...pdfData, otp };

      // 3) Build the checklists array including product group from checklist results
      const checklistPayloads = installItems.map((item) => {
        let prodGroup = "";
        if (item.checklistResults && item.checklistResults.length > 0) {
          prodGroup = item.checklistResults[0].prodGroup;
        }
        return {
          serialNumber: item.serialNumber,
          checklistResults: item.checklistResults || [],
          globalRemark: globalChecklistRemark,
          prodGroup,
        };
      });

      // 4) Post everything in a single call to /equipment/bulk
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/equipment/bulk`,
        {
          equipmentPayloads,
          pdfData: finalPdfData,
          checklistPayloads,
          abnormalCondition,
          voltageData,
        }
      );
      toast.success("All installations + checklists saved successfully!");

      // 5) Remove from pending
      for (let item of installItems) {
        await axios.delete(
          `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/serial/${item.serialNumber}`
        );
      }
      toast.success("Pending installations removed successfully.");

      // Done
      setShowOtpModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error verifying OTP or saving installations:", error);
      toast.error("Failed to verify OTP or save installations.");
    } finally {
      setIsVerifyingOtp(false);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // ---------------------------------------
  // Checklist Modal (Wizard) Logic
  // ---------------------------------------

  // Open the checklist wizard for a specific machine
  const handleOpenChecklist = async (machineIndex) => {
    setActiveMachineIndex(machineIndex);
    const machine = installItems[machineIndex];
    const materialCode = machine.pendingInstallationData?.material;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/checklistbymaterial/${materialCode}`
      );
      const data = response.data;
      let fetchedChecklists = [];
      if (data.checklists) {
        fetchedChecklists = data.checklists;
      }

      // If the machine already has checklist results, load them; otherwise build fresh checklist results.
      const existingResults = machine.checklistResults || [];
      if (existingResults.length > 0) {
        setTempChecklistResults(existingResults);
      } else {
        const fresh = fetchedChecklists.map((c) => ({
          _id: c._id,
          checkpoint: c.checkpoint,
          resulttype: c.resulttype, // must match EXACTLY from DB
          prodGroup: c.prodGroup,    // include product group
          result: "",
          remark: "",
        }));
        setTempChecklistResults(fresh);
      }
    } catch (error) {
      console.error("Error fetching checklists by material code:", error);
      toast.error("Checklists not Found by Part No.");
    }
    setCurrentQuestionIndex(0);
    setIsChecklistModalOpen(true);
  };

  // Update the "result" field for the current question
  const handleChecklistResultChange = (checkId, newVal) => {
    setTempChecklistResults((prev) =>
      prev.map((ch) => (ch._id === checkId ? { ...ch, result: newVal } : ch))
    );
  };

  // Update the "remark" field for the current question
  const handleChecklistRemarkChange = (checkId, value) => {
    setTempChecklistResults((prev) =>
      prev.map((ch) => (ch._id === checkId ? { ...ch, remark: value } : ch))
    );
  };

  // Go to next question
  const handleNextQuestion = () => {
    const currentItem = tempChecklistResults[currentQuestionIndex];
    // Validate user input
    if (!currentItem.result) {
      toast.error("Please select or enter a value before proceeding.");
      return;
    }

    // Validation for Yes / No: if 'No', require remark
    if (currentItem.resulttype === "Yes / No" && currentItem.result === "No") {
      if (!currentItem.remark.trim()) {
        toast.error("Please enter a remark for 'No' before proceeding.");
        return;
      }
    }

    // Validation for OK/NOT OK: if 'NOT OK', require remark
    if (
      currentItem.resulttype === "OK/NOT OK" &&
      currentItem.result === "NOT OK"
    ) {
      if (!currentItem.remark.trim()) {
        toast.error("Please enter a remark for 'NOT OK' before proceeding.");
        return;
      }
    }

    // Validation for Numeric Entry
    if (currentItem.resulttype === "Numeric Entry") {
      if (!currentItem.result) {
        toast.error("Please enter a numeric value.");
        return;
      }
    }

    // Move to next question or finish
    if (currentQuestionIndex < tempChecklistResults.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentQuestionIndex(tempChecklistResults.length);
    }
  };

  // Optional: go to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // After final "Finish"
  const handleFinishChecklist = () => {
    // Store the results in the active machine
    if (activeMachineIndex !== null) {
      const newItems = [...installItems];
      newItems[activeMachineIndex].checklistResults = tempChecklistResults;
      location.state.installItems = newItems;
    }

    setIsChecklistModalOpen(false);
    setActiveMachineIndex(null);
    setTempChecklistResults([]);
    setCurrentQuestionIndex(0);
  };

  // ---------------------------------------
  // Render
  // ---------------------------------------
  return (
    <div className="w-full mb-4">
      {/* Header */}
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Installation Summary</h2>
      </div>

      <div className="px-4 space-y-4">
        {/* Machines List */}
        <div className="border border-gray-200 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">Selected Machines</h3>
          {installItems.map((item, idx) => {
            const {
              serialNumber,
              pendingInstallationData,
              palNumber,
              checklistResults = [],
            } = item;

            const warrantyStartDate = new Date();
            let warrantyEndDate = null;
            if (pendingInstallationData?.warrantyMonths) {
              warrantyEndDate = new Date(
                new Date().setMonth(
                  new Date().getMonth() + pendingInstallationData.warrantyMonths
                )
              );
            }

            return (
              <div
                key={idx}
                className="border border-gray-300 p-3 rounded mb-4"
              >
                <p>
                  <strong>Machine #{idx + 1}</strong>
                </p>
                <p>
                  <strong>Serial No:</strong> {serialNumber}
                </p>
                <p>
                  <strong>Part No:</strong>{" "}
                  {pendingInstallationData?.material || "N/A"}
                </p>
                <p>
                  <strong>Material Description:</strong>{" "}
                  {pendingInstallationData?.description || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {pendingInstallationData?.status || "N/A"}
                </p>
                <p>
                  <strong>Warranty Description:</strong>{" "}
                  {pendingInstallationData?.mtl_grp4 || "N/A"}
                </p>
                <p>
                  <strong>Warranty Start:</strong>{" "}
                  {warrantyStartDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <strong>Warranty End:</strong>{" "}
                  {warrantyEndDate
                    ? warrantyEndDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>

                {/* Checklist */}
                <button
                  className="px-3 py-2 mt-3 w-full text-white bg-primary rounded hover:bg-blue-700"
                  onClick={() => handleOpenChecklist(idx)}
                >
                  Checklist
                </button>

                {checklistResults.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold">Checklist Results:</h4>
                    {checklistResults.map((res) => (
                      <p key={res._id} className="text-sm">
                        {res.checkpoint} = <strong>{res.result}</strong>
                        {res.result === "No" && res.remark && (
                          <>
                            {" "}
                            | Remark: <em>{res.remark}</em>
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Site Data */}
        <div className="border border-gray-200 p-4 rounded">
          <p>
            <strong>Abnormal Site Condition:</strong>{" "}
            {abnormalCondition || "N/A"}
          </p>
          <strong>Voltage</strong>
          <p>
            <strong>L-N / R-Y:</strong> {voltageData.lnry || "N/A"}
          </p>
          <p>
            <strong>L-G / Y-B:</strong> {voltageData.lgyb || "N/A"}
          </p>
          <p>
            <strong>N-G / B-R:</strong> {voltageData.ngbr || "N/A"}
          </p>
        </div>

        {/* Customer Details */}
        <div className="border border-gray-200 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">Customer Details</h3>
          <p>
            <strong>Hospital Name:</strong> {customer?.hospitalname || "N/A"}
          </p>
          <p>
            <strong>Customer Code:</strong> {customer?.customercodeid || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {customer?.telephone || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {customer?.email || "N/A"}
          </p>
          <p>
            <strong>City:</strong> {customer?.city || "N/A"}
          </p>
          <p>
            <strong>Postal Code:</strong> {customer?.postalcode || "N/A"}
          </p>
        </div>

        {/* Buttons */}
        <div>
          <button
            className="w-full px-4 mb-3 h-10 text-white bg-primary rounded"
            onClick={handleConfirmAndCompleteInstallation}
          >
            Confirm & Complete Installation
          </button>
          <button
            className="w-full px-4 h-10 text-white bg-red-600 rounded"
            onClick={() => setShowAbortModal(true)}
          >
            Abort Installation
          </button>
        </div>
      </div>

      {/* Checklist Modal */}
      {isChecklistModalOpen && (
        <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Checklist</h2>
            {currentQuestionIndex < tempChecklistResults.length ? (
              (() => {
                const currentItem = tempChecklistResults[currentQuestionIndex];
                return (
                  <div key={currentItem._id} className="mb-4">
                    <p className="text-sm mb-2 font-semibold">
                      {currentItem.checkpoint}
                    </p>
                    {/* Numeric Entry */}
                    {currentItem.resulttype === "Numeric Entry" && (
                      <input
                        type="number"
                        value={currentItem.result || ""}
                        onChange={(e) =>
                          handleChecklistResultChange(
                            currentItem._id,
                            e.target.value
                          )
                        }
                        className="border rounded p-1 w-full"
                      />
                    )}
                    {/* OK/NOT OK */}
                    {currentItem.resulttype === "OK/NOT OK" && (
                      <div className="space-x-3">
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            className="mr-1"
                            checked={currentItem.result === "OK"}
                            onChange={() =>
                              handleChecklistResultChange(currentItem._id, "OK")
                            }
                          />
                          OK
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            className="mr-1"
                            checked={currentItem.result === "NOT OK"}
                            onChange={() =>
                              handleChecklistResultChange(
                                currentItem._id,
                                "NOT OK"
                              )
                            }
                          />
                          NOT OK
                        </label>
                      </div>
                    )}
                    {/* Remark for NOT OK (if required) */}
                    {currentItem.resulttype === "OK/NOT OK" &&
                      currentItem.result === "NOT OK" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Enter remark for this item"
                            value={currentItem.remark || ""}
                            onChange={(e) =>
                              handleChecklistRemarkChange(
                                currentItem._id,
                                e.target.value
                              )
                            }
                            className="border rounded p-1 w-full"
                          />
                        </div>
                      )}
                    {/* Yes / No */}
                    {currentItem.resulttype === "Yes / No" && (
                      <div className="space-x-3">
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            className="mr-1"
                            checked={currentItem.result === "Yes"}
                            onChange={() =>
                              handleChecklistResultChange(
                                currentItem._id,
                                "Yes"
                              )
                            }
                          />
                          Yes
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            className="mr-1"
                            checked={currentItem.result === "No"}
                            onChange={() =>
                              handleChecklistResultChange(currentItem._id, "No")
                            }
                          />
                          No
                        </label>
                      </div>
                    )}
                    {/* Remark for Yes/No if answer is "No" */}
                    {currentItem.resulttype === "Yes / No" &&
                      currentItem.result === "No" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Enter remark for this item"
                            value={currentItem.remark || ""}
                            onChange={(e) =>
                              handleChecklistRemarkChange(
                                currentItem._id,
                                e.target.value
                              )
                            }
                            className="border rounded p-1 w-full"
                          />
                        </div>
                      )}
                    {/* Buttons: Next / Back */}
                    <div className="flex justify-end mt-4 space-x-2">
                      {currentQuestionIndex > 0 && (
                        <button
                          className="bg-gray-300 text-black px-4 py-2 rounded-md"
                          onClick={handlePrevQuestion}
                        >
                          Back
                        </button>
                      )}
                      <button
                        className="bg-primary text-white px-4 py-2 rounded-md"
                        onClick={handleNextQuestion}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              // Global Checklist Remark
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Global Checklist Remark
                </h3>
                <input
                  type="text"
                  placeholder="Enter global checklist remark"
                  value={globalChecklistRemark}
                  onChange={(e) => setGlobalChecklistRemark(e.target.value)}
                  className="border rounded p-1 w-full"
                />
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                    onClick={() => {
                      setIsChecklistModalOpen(false);
                      setActiveMachineIndex(null);
                      setTempChecklistResults([]);
                      setCurrentQuestionIndex(0);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-primary text-white px-4 py-2 rounded-md"
                    onClick={handleFinishChecklist}
                  >
                    Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">OTP Verification</h2>
            <p className="mb-4">
              An OTP has been sent to <strong>{customer?.email}</strong>. Please
              enter it below.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                disabled={isVerifyingOtp}
                onClick={verifyOtpAndSubmit}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Installation Complete!</h2>
            <p className="mb-4">
              All selected machines have been installed successfully.
            </p>
            <div className="flex justify-end">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/installation");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abort Confirmation Modal */}
      {showAbortModal && (
        <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Abort Installation</h2>
            <p className="mb-4">
              Are you sure you want to abort this installation?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
                onClick={() => setShowAbortModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setShowAbortModal(false);
                  navigate("/installation");
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <svg
              className="animate-spin h-6 w-6 text-primary"
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
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span className="font-medium">{loadingMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallationSummary;
