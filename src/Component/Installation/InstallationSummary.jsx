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
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
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
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes = 300 seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  // For global checklist remark
  const [globalChecklistRemark, setGlobalChecklistRemark] = useState("");
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [failedItems, setFailedItems] = useState([]);
  const [editingFailedItem, setEditingFailedItem] = useState(null);
  const [tempVoltageInput, setTempVoltageInput] = useState("");

  // Checklist states
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [activeMachineIndex, setActiveMachineIndex] = useState(null);
  const [tempChecklistResults, setTempChecklistResults] = useState([]);

  // Document information state
  const [documentInfo, setDocumentInfo] = useState({});

  // NEW: Accordion state for each machine's checklist
  const [expandedChecklists, setExpandedChecklists] = useState({});

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
    dealerCode: "",
    dealerName: "",
    usertype: "",
    states: [],
    stateNames: [],
    stateIds: [],
    cities: [],
    regions: [],
    countries: [],
    geos: [],
    branches: [],
    branchCodes: [],
    manageremail: [],
  });

  // Toggle accordion for checklist details
  const toggleChecklistAccordion = (index) => {
    setExpandedChecklists((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Add a new async function inside the component to handle abort with email API call
  const handleAbortInstallation = async () => {
    if (installItems.length === 0) {
      toast.error("No installations to abort.");
      setShowAbortModal(false);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Aborting installation, sending email...");

    try {
      // Prepare products data in required format for API
      const products = installItems.map((item, index) => ({
        name: item.pendingInstallationData?.description || "N/A",
        slno: item.serialNumber || "N/A",
        no: index + 1,
      }));

      // Compose user and branch/dealer info from userInfo state
      const payload = {
        products,
        userId: userInfo.userid || "",
        employeeId: userInfo.employeeId || "",
        userName: `${userInfo.firstName || ""} ${
          userInfo.lastName || ""
        }`.trim(),
        branchOrDealerCode: userInfo.dealerCode || "",
        branchOrDealerName: userInfo.dealerEmail || "",
        city: customer?.city || "",

        // User demographic information
        userStates: userInfo.states || [],
        userStateNames: userInfo.stateNames || [],
        userStateIds: userInfo.stateIds || [],
        userCities: userInfo.cities || [],
        userRegions: userInfo.regions || [],
        userCountries: userInfo.countries || [],
        userGeos: userInfo.geos || [],
        userBranches: userInfo.branches || [],
        userBranchCodes: userInfo.branchCodes || [],

        // Additional user info
        usertype: userInfo.usertype || "",
        userEmail: userInfo.email || "",
        managerEmails: userInfo.manageremail || [],
      };

      // Call your abort installation email API endpoint
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/abort-installation`,
        payload
      );
      toast.success("Abort email sent successfully.");
    } catch (error) {
      console.error("Error sending abort installation email:", error);
      toast.error("Failed to send abort email.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
      setShowAbortModal(false);
      navigate("/installation");
    }
  };

  // Load user info on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      // Extract all demographic data
      const demographics = storedUser.demographics || [];
      const stateData = demographics.find((demo) => demo.type === "state");
      const cityData = demographics.find((demo) => demo.type === "city");
      const regionData = demographics.find((demo) => demo.type === "region");
      const countryData = demographics.find((demo) => demo.type === "country");
      const geoData = demographics.find((demo) => demo.type === "geo");
      const branchData = demographics.find((demo) => demo.type === "branch");

      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
        email: storedUser.email,
        usertype: storedUser.usertype,
        dealerEmail: storedUser.dealerInfo?.dealerEmail,
        dealerCode: storedUser.dealerInfo?.dealerCode,
        dealerName: storedUser.dealerInfo?.dealerName,

        // State information
        states: stateData?.values || [],
        stateNames: stateData?.values?.map((state) => state.name) || [],
        stateIds: stateData?.values?.map((state) => state.id) || [],

        // Other demographic information
        cities: cityData?.values || [],
        regions: regionData?.values || [],
        countries: countryData?.values || [],
        geos: geoData?.values || [],
        branches: branchData?.values || [],

        // Branch array from root level
        branchCodes: storedUser.branch || [],

        manageremail: Array.isArray(storedUser.manageremail)
          ? storedUser.manageremail
          : storedUser.manageremail
          ? [storedUser.manageremail]
          : [],
      });
    }
  }, []);

  // Fetch document information for all items
  useEffect(() => {
    const fetchDocumentInfo = async () => {
      const docInfoMap = {};

      for (const item of installItems) {
        const materialCode = item.pendingInstallationData?.material;
        if (materialCode && !docInfoMap[materialCode]) {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_BASE_URL}/collections/informatedoc/by-part/${materialCode}`
            );
            const data = await response.json();
            if (data.success) {
              docInfoMap[materialCode] = data;
            }
          } catch (err) {
            console.error(
              `Error fetching document info for ${materialCode}:`,
              err
            );
          }
        }
      }

      setDocumentInfo(docInfoMap);
    };

    if (installItems.length > 0) {
      fetchDocumentInfo();
    }
  }, [installItems]);

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
        key: pendingInstallationData?.key || "",
        currentcustomer: customer?.customercodeid || "",
        status: pendingInstallationData?.status || "N/A",
        name: `${pendingInstallationData?.customername1 || "N/A"} ${
          pendingInstallationData?.customername2 || "N/A"
        }`.trim(),
        custWarrantystartdate: warrantyStartDate.toISOString(),
        custWarrantyenddate: warrantyEndDate
          ? warrantyEndDate.toISOString()
          : "",
        palnumber: palNumber || "",
        equipmentUsedSerial: equipmentUsed,
        calibrationDueDate: calibrationDate,
      };

      console.log("pendingInstallationData", pendingInstallationData?.key);
      equipmentPayloads.push(equipPayload);

      // Add to equipmentListForPdf
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

    // Move pdfData OUTSIDE the loop
    const pdfData = {
      userInfo,
      dateOfInstallation: new Date().toLocaleDateString("en-GB"),
      customerId: customer?.customercodeid || "",
      customerName: customer?.customername || "",
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

  // Confirm => send OTP with installation details
  const handleConfirmAndCompleteInstallation = async () => {
    const incompleteMachines = installItems.filter((item, index) => {
      const hasChecklist =
        item.checklistResults && item.checklistResults.length > 0;
      return !hasChecklist;
    });

    if (incompleteMachines.length > 0) {
      toast.error(
        `Please complete checklists for all machines. ${incompleteMachines.length} machine(s) pending.`
      );
      return;
    }

    // Additional validation: Check if any checklist has empty results
    const machinesWithIncompleteChecklists = installItems.filter(
      (item, index) => {
        if (!item.checklistResults || item.checklistResults.length === 0)
          return true;

        // Check if all checklist items have results
        const hasEmptyResults = item.checklistResults.some(
          (result) => !result.result || result.result.trim() === ""
        );

        return hasEmptyResults;
      }
    );

    if (machinesWithIncompleteChecklists.length > 0) {
      toast.error(
        `Please complete all checklist items for all machines. ${machinesWithIncompleteChecklists.length} machine(s) have incomplete checklists.`
      );
      return;
    }

    setLoadingMessage("Sending OTP...");
    setIsLoading(true);

    try {
      // Prepare equipment/products data for email template
      const products = installItems.map((item) => {
        const { serialNumber, pendingInstallationData } = item;

        // Calculate warranty dates
        const warrantyStartDate = new Date();
        let warrantyEndDate = null;

        if (pendingInstallationData?.warrantyMonths) {
          warrantyEndDate = new Date(
            new Date().setMonth(
              new Date().getMonth() + pendingInstallationData.warrantyMonths
            )
          );
        }

        return {
          serialNumber: serialNumber,
          material: pendingInstallationData?.material || "N/A",
          description: pendingInstallationData?.description || "N/A",
          warrantyStartDate: warrantyStartDate.toLocaleDateString("en-GB"),
          warrantyEndDate: warrantyEndDate
            ? warrantyEndDate.toLocaleDateString("en-GB")
            : "N/A",
          warrantyPeriod: pendingInstallationData?.mtl_grp4 || "N/A",
        };
      });

      // Prepare installation location details
      const installationLocation = {
        customerName: customer?.customername || "N/A",
        hospitalName: customer?.hospitalname || "",
        street: customer?.street || "",
        city: customer?.city || "",
        region: customer?.region || "",
        postalCode: customer?.postalcode || "",
        // Create formatted address similar to your template
        formattedAddress: `${
          customer?.hospitalname || customer?.customername || "N/A"
        }${customer?.street ? `,\n${customer.street}` : ""}${
          customer?.city ? `,\n${customer.city}` : ""
        }${customer?.region ? `\n${customer.region}` : ""}`,
      };

      // Send OTP with complete installation data
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/send-otp`,
        {
          email: customer?.email,
          products: products,
          installationLocation: installationLocation,
          customerDetails: {
            customerCode: customer?.customercodeid || "N/A",
            customerName: customer?.customername || "N/A",
            phone: customer?.telephone || "N/A",
            email: customer?.email || "N/A",
          },
          // Optional: Include service engineer details
          serviceEngineer: {
            name: `${userInfo.firstName || ""} ${
              userInfo.lastName || ""
            }`.trim(),
            employeeId: userInfo.employeeId || "",
            email: userInfo.email || "",
          },
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
    setLoadingMessage("Verifying OTP...");

    try {
      // Verify OTP
      const response = await axios.post(
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

        const materialCode = item.pendingInstallationData?.material;
        const docInfo = documentInfo[materialCode];

        return {
          serialNumber: item.serialNumber,
          checklistResults: item.checklistResults || [],
          globalRemark: globalChecklistRemark,
          prodGroup,
          documentInfo: docInfo || null,
        };
      });

      // Create streaming request
      const streamResponse = await fetch(
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

      if (!streamResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = streamResponse.body.getReader();
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
      console.error("Error in verification/installation process:", error);

      // **KEY CHANGES: Handle OTP failure properly**

      // Close loading modal immediately
      setIsLoading(false);
      setLoadingMessage("");
      setIsVerifyingOtp(false);

      // Check if error is related to OTP verification
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";

      if (
        error.response?.status === 400 ||
        errorMessage.toLowerCase().includes("otp")
      ) {
        // OTP verification failed
        toast.error("Invalid OTP. Please try again.");

        // Clear the entered OTP
        setOtp("");

        // Keep OTP modal open (don't close it)
        // The modal is already open, so we don't need to setShowOtpModal(true)

        // Focus back to OTP input after a short delay
        setTimeout(() => {
          const otpInput = document.querySelector('input[placeholder*="OTP"]');
          if (otpInput) {
            otpInput.focus();
          }
        }, 100);
      } else {
        // Other errors - close OTP modal and show error
        toast.error("Installation process failed. Please try again.");
        setShowOtpModal(false);
        setShowProgressModal(false);
      }
    }
  };

  const parseAndFormatDate = (dateStr) => {
    if (!dateStr || dateStr === "N/A") return "N/A";

    // Try parsing directly
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }

    // Try parsing yyyy-mm-dd format manually
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString();
      }
    }

    return "Invalid Date";
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
  useEffect(() => {
    let interval = null;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else if (!showOtpModal) {
      // Reset timer when modal closes
      setOtpTimer(300);
      setIsResendDisabled(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpModal, otpTimer]);

  // Format timer display - ADD THIS HELPER FUNCTION
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const handleResendOtp = async () => {
    setIsLoading(true);
    setLoadingMessage("Resending OTP...");

    try {
      // Prepare same data as in handleConfirmAndCompleteInstallation
      const products = installItems.map((item) => {
        const { serialNumber, pendingInstallationData } = item;
        const warrantyStartDate = new Date();
        let warrantyEndDate = null;

        if (pendingInstallationData?.warrantyMonths) {
          warrantyEndDate = new Date(
            new Date().setMonth(
              new Date().getMonth() + pendingInstallationData.warrantyMonths
            )
          );
        }

        return {
          serialNumber: serialNumber,
          material: pendingInstallationData?.material || "N/A",
          description: pendingInstallationData?.description || "N/A",
          warrantyStartDate: warrantyStartDate.toLocaleDateString("en-GB"),
          warrantyEndDate: warrantyEndDate
            ? warrantyEndDate.toLocaleDateString("en-GB")
            : "N/A",
          warrantyPeriod: pendingInstallationData?.mtl_grp4 || "N/A",
        };
      });

      const installationLocation = {
        customerName: customer?.customername || "N/A",
        hospitalName: customer?.hospitalname || "",
        street: customer?.street || "",
        city: customer?.city || "",
        region: customer?.region || "",
        postalCode: customer?.postalcode || "",
        formattedAddress: `${
          customer?.hospitalname || customer?.customername || "N/A"
        }${customer?.street ? `,\n${customer.street}` : ""}${
          customer?.city ? `,\n${customer.city}` : ""
        }${customer?.region ? `\n${customer.region}` : ""}`,
      };

      // Send OTP again
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/send-otp`,
        {
          email: customer?.email,
          products: products,
          installationLocation: installationLocation,
          customerDetails: {
            customerCode: customer?.customercodeid || "N/A",
            customerName: customer?.customername || "N/A",
            phone: customer?.telephone || "N/A",
            email: customer?.email || "N/A",
          },
          serviceEngineer: {
            name: `${userInfo.firstName || ""} ${
              userInfo.lastName || ""
            }`.trim(),
            employeeId: userInfo.employeeId || "",
            email: userInfo.email || "",
          },
        }
      );

      // Reset timer and states
      setOtpTimer(300); // Reset to 5 minutes
      setIsResendDisabled(true);
      setOtp(""); // Clear existing OTP
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
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
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            Installation Summary
          </h1>
        </div>
      </div>

      <div className="px-3 space-y-3 py-20">
        {/* Machines List */}
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
            <h2 className="flex items-center gap-2 text-blue-900 text-base font-semibold">
              <Settings className="h-4 w-4" />
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
                materialCodeExists,
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
              const materialCode = pendingInstallationData?.material;
              const docInfo = documentInfo[materialCode];

              return (
                <div
                  key={idx}
                  className="p-3 border-b last:border-b-0 hover:bg-slate-50/75 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-xs">
                          #{idx + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 truncate max-w-[140px]">
                          {pendingInstallationData?.description || "N/A"}
                        </h3>
                        <p className="text-gray-600 text-xs">
                          Serial: {serialNumber}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        pendingInstallationData?.status === "Ready"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pendingInstallationData?.status || "N/A"}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 text-xs mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">Part No:</span>
                        <span className="font-medium">
                          {pendingInstallationData?.material || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium">
                          {pendingInstallationData?.mtl_grp4 || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <span className="text-gray-600">Warranty Period:</span>
                        <div className="font-medium text-green-700">
                          {warrantyStartDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {" - "}
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

                  {/* Document Information Section */}
                  {docInfo && (
                    <div className="mb-2 p-2 bg-purple-50 rounded border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-1 flex items-center gap-2 text-xs">
                        <FileText className="h-3 w-3 text-purple-600" />
                        Document Info
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full">
                          {docInfo.productGroup}
                        </span>
                      </h4>
                      {docInfo.documents && docInfo.documents.length > 0 && (
                        <div className="mb-1">
                          <h5 className="text-xs font-medium text-purple-800 mb-1">
                            Documents:
                          </h5>
                          <div className="space-y-1">
                            {docInfo.documents.map((doc, docIdx) => (
                              <div
                                key={docIdx}
                                className="flex items-center justify-between text-xs bg-white p-1 rounded border border-purple-100"
                              >
                                <span className="text-purple-700 font-medium">
                                  CHL No: {doc.chlNo}
                                </span>
                                <span className="text-purple-600 text-[10px]">
                                  Rev: {doc.revNo}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {docInfo.formats && docInfo.formats.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-purple-800 mb-1">
                            Formats:
                          </h5>
                          <div className="space-y-1">
                            {docInfo.formats.map((format, formatIdx) => (
                              <div
                                key={formatIdx}
                                className="flex items-center justify-between text-xs bg-white p-1 rounded border border-purple-100"
                              >
                                <span className="text-purple-700 font-medium">
                                  CHL No: {format.chlNo}
                                </span>
                                <span className="text-purple-600 text-[10px]">
                                  Rev: {format.revNo}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checklist Results - Enhanced with Accordion */}
                  {checklistResults.length > 0 && (
                    <div className="mb-2 bg-gray-50 rounded border border-gray-200">
                      {/* Checklist Header - Always visible */}
                      <div className="p-2 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 flex items-center gap-1 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Checklist Completed ({checklistResults.length} items)
                        </h4>
                        <button
                          onClick={() => toggleChecklistAccordion(idx)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {expandedChecklists[idx] ? "Hide" : "View"}
                          </span>
                          {expandedChecklists[idx] ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Checklist Details */}
                      {expandedChecklists[idx] && (
                        <div className="px-2 pb-2 space-y-2 border-t border-gray-200 bg-white">
                          {/* Equipment Information */}
                          {(checklistResults[0]?.equipmentUsedSerial ||
                            checklistResults?.calibrationDueDate) && (
                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                              <h5 className="text-xs font-semibold text-blue-900 mb-1">
                                Equipment Information
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                                <div>
                                  <span className="text-blue-700 font-medium">
                                    Equipment Serial:
                                  </span>
                                  <div className="text-blue-800">
                                    {checklistResults[0]?.equipmentUsedSerial ||
                                      "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-medium">
                                    Calibration Due:
                                  </span>
                                  <div className="text-blue-800">
                                    {parseAndFormatDate(
                                      checklistResults[0]?.calibrationDueDate
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Individual Checklist Items */}
                          <div className="space-y-1">
                            <h5 className="text-xs font-semibold text-gray-700">
                              Checklist Items:
                            </h5>
                            {checklistResults.map((res, resIdx) => (
                              <div
                                key={resIdx}
                                className="bg-gray-50 p-2 rounded border border-gray-100"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <span className="text-xs text-gray-700 font-medium flex-1 pr-2">
                                    {res.checkpoint}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        res.result === "Yes" ||
                                        res.result === "OK" ||
                                        res.result === "Pass"
                                          ? "bg-green-100 text-green-800"
                                          : res.result === "No" ||
                                            res.result === "NOT OK" ||
                                            res.result === "Failed"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {res.result || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                {res.remark && (
                                  <div className="mt-1 p-1 hidden bg-white rounded border border-gray-200">
                                    <span className="text-[10px] font-medium text-gray-600">
                                      Remark:{" "}
                                    </span>
                                    <span className="text-[10px] text-gray-800">
                                      {res.remark}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Global Remark if exists */}
                          {globalChecklistRemark && (
                            <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                              <h5 className="text-xs font-semibold text-yellow-900 mb-1">
                                Global Remark:
                              </h5>
                              <p className="text-xs text-yellow-800">
                                {globalChecklistRemark}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {palNumber && palNumber.trim() !== "" && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-700 font-medium">
                            {materialCodeExists
                              ? "Procurement No (AERB):"
                              : "PAL Number:"}
                          </span>
                          {materialCodeExists && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded-full">
                              AERB
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-blue-900">
                          {palNumber}
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleOpenChecklist(idx)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm mt-2 border border-blue-500"
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
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3">
            <h2 className="flex items-center gap-2 text-amber-900 text-base font-semibold">
              <Zap className="h-4 w-4" />
              Site Conditions
            </h2>
          </div>
          <div className="p-3">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  Abnormal Conditions
                </h4>
                <p className="text-gray-700 bg-amber-50 p-2 rounded text-xs">
                  {abnormalCondition || "None reported"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-xs">
                  <Zap className="h-3 w-3 text-blue-500" />
                  Voltage Readings
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center p-1 bg-blue-50 rounded text-xs">
                    <span className="text-gray-600">L-N / R-Y:</span>
                    <span className="font-medium text-blue-700">
                      {voltageData.lnry || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-blue-50 rounded text-xs">
                    <span className="text-gray-600">L-G / Y-B:</span>
                    <span className="font-medium text-blue-700">
                      {voltageData.lgyb || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-blue-50 rounded text-xs">
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
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3">
            <h2 className="flex items-center gap-2 text-green-900 text-base font-semibold">
              <Building className="h-4 w-4" />
              Customer Information
            </h2>
          </div>
          <div className="p-3">
            <div className="grid md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Name</p>
                    <p className="font-medium text-gray-900 text-xs">
                      {customer?.customername || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">
                      Customer Code
                    </p>
                    <p className="font-medium text-gray-900 text-xs">
                      {customer?.customercodeid || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Phone</p>
                    <p className="font-medium text-gray-900 text-xs">
                      {customer?.telephone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Email</p>
                    <p className="font-medium text-gray-900 text-xs">
                      {customer?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Address</p>
                    <p className="font-medium text-gray-900 text-xs">
                      {customer?.street || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <button
            onClick={handleConfirmAndCompleteInstallation}
            className="flex-1 text-nowrap bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-2 rounded-lg text-base font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm & Complete Installation
              </>
            )}
          </button>
          <button
            onClick={() => setShowAbortModal(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-2 rounded-lg text-base font-medium shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Abort Installation
          </button>
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
                {/* Timer Display */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      OTP expires in:
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      otpTimer <= 60
                        ? "text-red-600"
                        : otpTimer <= 120
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {formatTimer(otpTimer)}
                  </div>
                  {otpTimer === 0 && (
                    <p className="text-red-600 text-sm mt-1">
                      OTP has expired. Please request a new one.
                    </p>
                  )}
                </div>

                {/* OTP Input */}
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 4-digit OTP"
                    className={`w-full p-3 border rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      otpTimer === 0
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    maxLength={4}
                    disabled={otpTimer === 0}
                  />
                </div>

                {/* Resend OTP Section */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the OTP?
                  </p>
                  <button
                    onClick={handleResendOtp}
                    disabled={isResendDisabled || isLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isResendDisabled || isLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    {isLoading ? "Resending..." : "Resend OTP"}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowOtpModal(false);
                      setOtp("");
                      setOtpTimer(300);
                      setIsResendDisabled(true);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyOtpAndSubmit}
                    disabled={
                      isVerifyingOtp || otp.length !== 4 || otpTimer === 0
                    }
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

        {/* Abort Confirmation Modal */}
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
                    onClick={handleAbortInstallation}
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
              <span className="font-medium text-gray-900">
                {loadingMessage}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstallationSummary;
