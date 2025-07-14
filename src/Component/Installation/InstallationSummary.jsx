"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ChecklistModal from "./InstallationChecklistModal";
import ProgressModal from "./ProgressModal";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  Hash,
  Zap,
  Settings,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
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
    manageremail: [],
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
        manageremail: Array.isArray(storedUser.manageremail)
          ? storedUser.manageremail
          : storedUser.manageremail
          ? [storedUser.manageremail]
          : [],
      });
    }
  }, []);

  // Build data to send in one request
  const buildEquipmentPayloadsAndPdfData = () => {
    const equipmentPayloads = [];
    const equipmentListForPdf = [];

    installItems.forEach((item) => {
      const {
        serialNumber,
        pendingInstallationData,
        palNumber,
        checklistResults = [],
      } = item;

      // Get equipment info from first checklist item
      let equipmentUsed = "";
      let calibrationDate = "";
      if (checklistResults.length > 0) {
        equipmentUsed = checklistResults[0].equipmentUsedSerial || "";
        calibrationDate = checklistResults[0].calibrationDueDate || "";
      }

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
        equipmentUsedSerial: equipmentUsed,
        calibrationDueDate: calibrationDate,
      };

      equipmentPayloads.push(equipPayload);
      equipmentListForPdf.push({
        materialdescription: pendingInstallationData?.description || "",
        serialnumber: serialNumber,
        custWarrantyenddate: warrantyEndDate
          ? warrantyEndDate.toISOString()
          : "",
        equipmentUsedSerial: equipmentUsed,
        calibrationDueDate: calibrationDate,
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
      let initialEquipment = "";
      let initialCalibrationDate = "";

      if (existingResults.length > 0) {
        // Get equipment info from first checklist item
        initialEquipment = existingResults[0].equipmentUsedSerial || "";
        initialCalibrationDate = existingResults[0].calibrationDueDate || "";
      }

      const updatedChecklists = fetchedChecklists.map((c, idx) => ({
        ...c,
        result: existingResults[idx]?.result || "",
        remark: existingResults[idx]?.remark || "",
        voltageData: {
          lnry: voltageData.lnry,
          lgyb: voltageData.lgyb,
          ngbr: voltageData.ngbr,
        },
        // Only set on first item
        equipmentUsedSerial: idx === 0 ? initialEquipment : undefined,
        calibrationDueDate: idx === 0 ? initialCalibrationDate : undefined,
      }));

      setTempChecklistResults(updatedChecklists);
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
        <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <h2 className="flex items-center gap-2 text-blue-900 text-xl font-semibold">
              <Settings className="h-5 w-5" />
              Selected Machines ({installItems.length})
            </h2>
          </div>
          <div>
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
                    new Date().getMonth() +
                      pendingInstallationData.warrantyMonths
                  )
                );
              }

              return (
                <div
                  key={idx}
                  className="p-6 border-b last:border-b-0 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {pendingInstallationData?.description || "N/A"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Serial: {serialNumber}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pendingInstallationData?.status === "Ready"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pendingInstallationData?.status || "N/A"}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Part No:</span>
                        <span className="font-medium">
                          {pendingInstallationData?.material || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium">
                          {pendingInstallationData?.mtl_grp4 || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Warranty Period:</span>
                        <div className="font-medium text-green-700">
                          {warrantyStartDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {warrantyEndDate
                            ? warrantyEndDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Results */}
                  {checklistResults.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Checklist Results
                      </h4>
                      <div className="space-y-1">
                        {checklistResults.map((res) => (
                          <div
                            key={res._id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {res.checkpoint}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  res.result === "Yes"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {res.result}
                              </span>
                              {res.result === "No" && res.remark && (
                                <span className="text-red-600 italic text-xs">
                                  ({res.remark})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenChecklist(idx)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Open Checklist
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Site Data */}
        <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6">
            <h2 className="flex items-center gap-2 text-amber-900 text-xl font-semibold">
              <Zap className="h-5 w-5" />
              Site Conditions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Abnormal Conditions
                </h4>
                <p className="text-gray-700 bg-amber-50 p-3 rounded-lg">
                  {abnormalCondition || "None reported"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Voltage Readings
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-gray-600">L-N / R-Y:</span>
                    <span className="font-medium text-blue-700">
                      {voltageData.lnry || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-gray-600">L-G / Y-B:</span>
                    <span className="font-medium text-blue-700">
                      {voltageData.lgyb || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-gray-600">N-G / B-R:</span>
                    <span className="font-medium text-blue-700">
                      {voltageData.ngbr || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <h2 className="flex items-center gap-2 text-green-900 text-xl font-semibold">
              <Building className="h-5 w-5" />
              Customer Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Hospital Name</p>
                    <p className="font-medium text-gray-900">
                      {customer?.hospitalname || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Customer Code</p>
                    <p className="font-medium text-gray-900">
                      {customer?.customercodeid || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">
                      {customer?.telephone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {customer?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">
                      {customer?.city || "N/A"}, {customer?.postalcode || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">
                      {customer?.street || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleConfirmAndCompleteInstallation}
            className="flex-1 text-nowrap bg-gradient-to-r  from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-lg text-lg font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Confirm & Complete Installation
              </>
            )}
          </button>
          <button
            onClick={() => setShowAbortModal(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg text-lg font-medium shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-5 w-5" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center border-b">
              <h2 className="text-xl font-semibold mb-2">OTP Verification</h2>
              <p className="text-gray-600">
                An OTP has been sent to <strong>{customer?.email}</strong>
              </p>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                maxLength={6}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyOtpAndSubmit}
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}

      {/* Abort Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Installation Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                All selected machines have been installed successfully.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/installation");
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showAbortModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Abort Installation
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to abort this installation? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbortModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAbortModal(false);
                    navigate("/installation");
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Yes, Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Global Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="font-medium text-gray-900">{loadingMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallationSummary;
