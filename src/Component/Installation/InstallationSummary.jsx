"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ChecklistModal from "./InstallationChecklistModal";
import ProgressModal from "./ProgressModal";

function InstallationSummary() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [showProgressModal, setShowProgressModal] = useState(false);

  // For global checklist remark
  const [globalChecklistRemark, setGlobalChecklistRemark] = useState("");

  // Checklist states
  const [allINChecklists, setAllINChecklists] = useState([]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [activeMachineIndex, setActiveMachineIndex] = useState(null);
  const [tempChecklistResults, setTempChecklistResults] = useState([]);

  // Progress data
  const [progressData, setProgressData] = useState({
    status: "initializing",
    totalRecords: 0,
    processedRecords: 0,
    currentPhase: "",
    completionPercentage: 0,
    currentEquipment: "",
    reportNumber: "",
    isComplete: false,
    messages: [],
  });

  // User info
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
  });

  // Load user info on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
        email: storedUser.email,
        dealerEmail: storedUser.dealerInfo?.dealerEmail,
      });
    }
  }, []);

  // Build data to send in one request
  const buildEquipmentPayloadsAndPdfData = () => {
    const equipmentPayloads = [];
    const equipmentListForPdf = [];

    installItems.forEach((item) => {
      const { serialNumber, pendingInstallationData, palNumber } = item;

      const warrantyStartDate = new Date();
      let warrantyEndDate = null;
      if (pendingInstallationData?.warrantyMonths) {
        warrantyEndDate = new Date(
          new Date().setMonth(
            new Date().getMonth() + pendingInstallationData.warrantyMonths
          )
        );
      }

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

      equipmentListForPdf.push({
        materialdescription: pendingInstallationData?.description || "",
        serialnumber: serialNumber,
        custWarrantyenddate: warrantyEndDate
          ? warrantyEndDate.toISOString()
          : "",
      });
    });

    const pdfData = {
      userInfo,
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

  // Handle streaming response
  const handleStreamingResponse = (data) => {
    setProgressData((prev) => {
      const newMessages = [
        ...prev.messages,
        {
          ...data,
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      let updatedProgress = { ...prev, messages: newMessages };

      if (data.currentPhase) {
        updatedProgress.currentPhase = data.currentPhase;
      }

      if (data.processedRecords !== undefined) {
        updatedProgress.processedRecords = data.processedRecords;
        updatedProgress.totalRecords = data.totalRecords;
        updatedProgress.completionPercentage =
          data.summary?.completionPercentage ||
          Math.round((data.processedRecords / data.totalRecords) * 100);
      }

      if (data.equipmentResults?.length > 0) {
        const lastEquipment =
          data.equipmentResults[data.equipmentResults.length - 1];
        updatedProgress.currentEquipment = lastEquipment.serialnumber;
      }

      if (data.reportNo) {
        updatedProgress.reportNumber = data.reportNo;
      }

      if (data.status === "completed") {
        updatedProgress.isComplete = true;
        updatedProgress.status = "completed";
      }

      return updatedProgress;
    });
  };

  // Confirm => send OTP
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

  // Verify OTP + create everything => /equipment/bulk with streaming
  const verifyOtpAndSubmit = async () => {
    setIsVerifyingOtp(true);
    setIsLoading(true);

    try {
      // Verify OTP
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/verify-otp`,
        {
          email: customer?.email,
          otp,
        }
      );
      toast.success("OTP verified successfully.");

      // Close OTP modal and show progress modal
      setShowOtpModal(false);
      setIsLoading(false);
      setShowProgressModal(true);

      // Reset progress state
      setProgressData({
        status: "initializing",
        totalRecords: installItems.length,
        processedRecords: 0,
        currentPhase: "",
        completionPercentage: 0,
        currentEquipment: "",
        reportNumber: "",
        isComplete: false,
        messages: [],
      });

      // Build payloads
      const { equipmentPayloads, pdfData } = buildEquipmentPayloadsAndPdfData();
      const finalPdfData = { ...pdfData, otp };

      // Build checklists array
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

      // Create streaming request
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/equipment/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            equipmentPayloads,
            pdfData: finalPdfData,
            checklistPayloads,
            abnormalCondition,
            voltageData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        lines.forEach((line) => {
          if (line.startsWith("data: ") && line.length > 6) {
            try {
              const data = JSON.parse(line.substring(6));
              handleStreamingResponse(data);
            } catch (error) {
              console.error("Error parsing streaming data:", error);
            }
          }
        });
      }

      // Remove from pending after completion
      for (const item of installItems) {
        await axios.delete(
          `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/serial/${item.serialNumber}`
        );
      }

      toast.success("All installations completed successfully!");
    } catch (error) {
      console.error("Error in installation process:", error);
      toast.error("Failed to complete installation process.");
      setShowProgressModal(false);
      setShowOtpModal(true);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Checklist functions
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

      const existingResults = machine.checklistResults || [];
      if (existingResults.length > 0) {
        setTempChecklistResults(existingResults);
      } else {
        const fresh = fetchedChecklists.map((c) => ({
          ...c,
          result: "",
          remark: "",
          voltageData: {
            lnry: voltageData.lnry,
            lgyb: voltageData.lgyb,
            ngbr: voltageData.ngbr,
          },
        }));
        setTempChecklistResults(fresh);
      }
    } catch (error) {
      console.error("Error fetching checklists by material code:", error);
      toast.error("Checklists not Found by Part No.");
    }
    setIsChecklistModalOpen(true);
  };

  const handleFinishChecklist = (results, globalRemark) => {
    if (activeMachineIndex !== null) {
      const newItems = [...installItems];
      newItems[activeMachineIndex].checklistResults = results;
      location.state.installItems = newItems;
      setGlobalChecklistRemark(globalRemark);
    }
    setActiveMachineIndex(null);
  };

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
        <div className=" ">
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

      {/* Progress Modal */}
      {showProgressModal && (
        <ProgressModal
          progressData={progressData}
          onClose={() => {
            setShowProgressModal(false);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Checklist Modal */}
      {isChecklistModalOpen && (
        <ChecklistModal
          isOpen={isChecklistModalOpen}
          onClose={() => {
            setIsChecklistModalOpen(false);
            setActiveMachineIndex(null);
          }}
          checklistItems={tempChecklistResults}
          onFinish={handleFinishChecklist}
          initialGlobalRemark={globalChecklistRemark}
          voltageData={voltageData}
        />
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
