import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Send,
  Edit3,
  Eye,
  EyeOff,
  Clock,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import MachineChecklist from "./MachineChecklist";

// Helper function to format a date as DD/MM/YYYY
function formatDate(date) {
  const d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1;
  const year = d.getFullYear();
  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;
  return `${day}/${month}/${year}`;
}

function PmDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPms } = location.state || {};

  // State management
  const [checklistData, setChecklistData] = useState({});
  const [globalOtp, setGlobalOtp] = useState("");
  const [globalOtpError, setGlobalOtpError] = useState("");
  const [loadingGlobalOtp, setLoadingGlobalOtp] = useState(false);
  const [showGlobalOtpModal, setShowGlobalOtpModal] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);

  const [progressStatus, setProgressStatus] = useState({
    current: 0,
    total: selectedPms ? selectedPms.length : 0,
    details: [],
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userInfo, setUserInfo] = useState({
    id: "",
    firstname: "",
    lastname: "",
    email: "",
    mobilenumber: "",
    status: "",
    branch: "",
    loginexpirydate: "",
    employeeid: "",
    country: "",
    state: "",
    city: "",
    department: "",
    profileimage: "",
    deviceid: "",
    deviceregistereddate: "",
    usertype: "",
    manageremail: [],
    roleName: "",
    roleId: "",
    dealerName: "",
    dealerId: "",
    dealerCode: "",
    dealerEmail: "",
    location: [],
    skills: "",
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);

        // extract states from demographics
        const stateDemographics = Array.isArray(userData.demographics)
          ? userData.demographics.find((d) => d.type === "state")
          : null;

        const stateNames = stateDemographics?.values?.map((s) => s.name) || [];

        setUserInfo({
          id: userData.id || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          mobilenumber: userData.mobilenumber || "",
          status: userData.status || "",
          branch: userData.branch || [],
          loginexpirydate: userData.loginexpirydate || "",
          employeeid: userData.employeeid || "",
          country: userData.country || "",
          state: stateNames, // <-- now states array of names
          city: userData.city || "",
          department: userData.department || "",
          profileimage: userData.profileimage || "",
          deviceid: userData.deviceid || "",
          deviceregistereddate: userData.deviceregistereddate || "",
          usertype: userData.usertype || "",
          manageremail: Array.isArray(userData.manageremail)
            ? userData.manageremail
            : userData.manageremail
            ? [userData.manageremail]
            : [],
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerCode || "",
          dealerCode: userData.dealerInfo?.dealerCode || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  useEffect(() => {
    let interval = null;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => {
          if (timer <= 1) {
            setIsOtpTimerActive(false);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    } else if (otpTimer === 0) {
      setIsOtpTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isOtpTimerActive, otpTimer]);

  // New states for checklist details and editing
  const [expandedDetails, setExpandedDetails] = useState({});
  const [editingPm, setEditingPm] = useState(null);

  if (!selectedPms || !selectedPms.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No PM Data Available
          </h2>
          <p className="text-gray-600 mb-4">Please go back and select PM(s).</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if all PMs belong to same customer
  const allSameCustomer = selectedPms.every(
    (pm) => pm.customerCode === selectedPms[0].customerCode
  );
  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(300); // 5 minutes (300 seconds)
    setIsOtpTimerActive(true);
  };

  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle OTP regeneration
  const handleRegenerateOtp = () => {
    sendGlobalOtp();
    startOtpTimer();
    setGlobalOtp("");
    setGlobalOtpError("");
    toast.success("New OTP sent successfully!");
  };

  // When a PM's checklist is completed, store its responses
  const handleChecklistComplete = (pmId, data) => {
    setChecklistData((prev) => ({ ...prev, [pmId]: data }));
    setEditingPm(null); // Close edit mode when completed
  };

  // Toggle checklist details visibility
  const toggleChecklistDetails = (pmId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [pmId]: !prev[pmId],
    }));
  };

  // Enable edit mode for a PM
  const handleEditPm = (pmId) => {
    setEditingPm(pmId);
    // Remove the completed checklist data to allow re-entry
    setChecklistData((prev) => {
      const newData = { ...prev };
      delete newData[pmId];
      return newData;
    });
  };

  // Get checklist summary for a PM
  const getChecklistSummary = (pmId) => {
    const data = checklistData[pmId];
    if (!data || !data.items) return null;

    const items = data.items;
    const totalChecks = items.length;
    const passedChecks = items.filter((item) => {
      const result = item.result;
      return result && !["No", "NOT OK", "Failed"].includes(result);
    }).length;
    const failedChecks = totalChecks - passedChecks;

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      items,
      globalRemark: data.globalRemark || "",
      summary: data.summary,
    };
  };

  // Render machine data
  const renderMachineData = (pm) => {
    return (
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Hash className="w-4 h-4 mr-2" />
          Machine Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-gray-500 w-20">Part No:</span>
              <span className="font-medium text-gray-900">{pm.partNumber}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-500 w-20">Customer:</span>
              <span className="font-medium text-gray-900">
                {pm.customerCode}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {pm.serialNumber && (
              <div className="flex items-center">
                <span className="text-gray-500 w-20">Serial:</span>
                <span className="font-medium text-gray-900">
                  {pm.serialNumber}
                </span>
              </div>
            )}
            {pm.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-500 w-16">Location:</span>
                <span className="font-medium text-gray-900">{pm.location}</span>
              </div>
            )}
            {pm.pmDueDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-500 w-16">Due Date:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(pm.pmDueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render checklist details
  const renderChecklistDetails = (pmId) => {
    const summary = getChecklistSummary(pmId);
    if (!summary) return null;

    const { items, globalRemark, passedChecks, failedChecks, totalChecks } =
      summary;

    return (
      <div className="border-t border-gray-200 pt-4 px-4 pb-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalChecks}
            </div>
            <div className="text-xs text-blue-700">Total Checks</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {passedChecks}
            </div>
            <div className="text-xs text-green-700">Passed</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              {failedChecks}
            </div>
            <div className="text-xs text-red-700">Failed</div>
          </div>
        </div>

        {/* Global Remark */}
        {globalRemark && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Global Remark
            </h4>
            <p className="text-sm text-gray-600">{globalRemark}</p>
          </div>
        )}

        {/* Checklist Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Checklist Items
          </h4>
          {items.map((item, index) => {
            const isPassed =
              item.result && !["No", "NOT OK", "Failed"].includes(item.result);
            const isFailed =
              item.result && ["No", "NOT OK", "Failed"].includes(item.result);

            return (
              <div
                key={item._id || index}
                className={`border rounded-lg p-3 ${
                  isPassed
                    ? "border-green-200 bg-green-50"
                    : isFailed
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900 flex-1">
                    {item.checkpoint}
                  </h5>
                  <div className="flex items-center ml-3">
                    {isPassed && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {isFailed && <XCircle className="w-4 h-4 text-red-600" />}
                    {!item.result && (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Type:</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {item.resulttype}
                  </span>
                  {item.result && (
                    <>
                      <span className="text-xs text-gray-500">Result:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          isPassed
                            ? "bg-green-100 text-green-800"
                            : isFailed
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.result}
                      </span>
                    </>
                  )}
                </div>

                {/* Show voltage range for numeric entries */}
                {item.resulttype === "Numeric Entry" &&
                  item.startVoltage &&
                  item.endVoltage && (
                    <div className="text-xs text-gray-600 mb-2">
                      Expected Range: {item.startVoltage}V - {item.endVoltage}V
                    </div>
                  )}

                {/* Show remark if available */}
                {item.remark && (
                  <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs">
                    <span className="font-medium text-gray-700">Remark:</span>{" "}
                    <span className="text-gray-600">{item.remark}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const allCompleted = Object.keys(checklistData).length === selectedPms.length;
  const completedCount = Object.keys(checklistData).length;

  // Process each PM one by one
  const processPmsOneByOne = async () => {
    setProgressModalVisible(true);
    const details = [];
    let processedCount = 0;

    for (let i = 0; i < selectedPms.length; i++) {
      const pm = { ...selectedPms[i] };
      pm.pmDoneDate = formatDate(new Date());
      pm.pmEngineerCode = userInfo.employeeid || "UNKNOWN";
      pm.pmStatus = "Completed";

      // Fetch documents and formats
      let documentChlNo = "";
      let documentRevNo = "";
      let formatChlNo = "";
      let formatRevNo = "";

      try {
        const docsRes = await fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/docs/by-part/${pm.partNumber}`
        );
        const docsData = await docsRes.json();

        if (docsData.documents && docsData.documents.length > 0) {
          documentChlNo = docsData.documents[0].chlNo;
          documentRevNo = docsData.documents[0].revNo;
        } else {
          details.push(`⚠️ No Document found for part number ${pm.partNumber}`);
        }

        if (docsData.formats && docsData.formats.length > 0) {
          formatChlNo = docsData.formats[0].chlNo;
          formatRevNo = docsData.formats[0].revNo;
        } else {
          details.push(`⚠️ No Format found for part number ${pm.partNumber}`);
        }
      } catch (err) {
        details.push(
          `❌ Error fetching Docs for ${pm.partNumber}: ${err.message}`
        );
      }

      pm.documentChlNo = documentChlNo;
      pm.documentRevNo = documentRevNo;
      pm.formatChlNo = formatChlNo;
      pm.formatRevNo = formatRevNo;

      const pmChecklist = checklistData[pm._id];
      const responses = pmChecklist?.items || [];
      const globalRemark = pmChecklist?.globalRemark || "N/A";

      const payload = {
        pmData: pm,
        checklistData: responses,
        customerCode: pm.customerCode,
        globalRemark,
        userInfo,
      };

      try {
        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/reportAndUpdate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (data.message && data.message.includes("successfully")) {
          details.push(`✔️ Created PDF for ${pm.partNumber}`);
        } else {
          details.push(`❌ Failed for ${pm.partNumber}: ${data.message}`);
        }
      } catch (err) {
        details.push(`❌ Error for ${pm.partNumber}: ${err.message}`);
      }

      processedCount++;
      setProgressStatus({
        current: processedCount,
        total: selectedPms.length,
        details: [...details],
      });
    }

    // Send Combined Email
    setSendingEmail(true);
    try {
      const sendRes = await fetch(
        `${process.env.REACT_APP_BASE_URL}/upload/sendAllPdfs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerCode: selectedPms[0].customerCode,
            ...userInfo,
          }),
        }
      );

      const sendData = await sendRes.json();
      if (
        sendData.message &&
        sendData.message.includes("All PDF attachments sent successfully")
      ) {
        details.push("✔️ All PDFs emailed successfully.");
        toast.success("Combined email sent successfully!");
      } else {
        details.push("❌ Emailing PDFs failed: " + sendData.message);
        toast.error("Combined email failed: " + sendData.message);
      }

      setProgressStatus({
        current: processedCount,
        total: selectedPms.length,
        details: [...details],
      });
    } catch (err) {
      details.push(`❌ Error emailing PDFs: ${err.message}`);
      setProgressStatus({
        current: processedCount,
        total: selectedPms.length,
        details: [...details],
      });
      toast.error("Error in sending combined email: " + err.message);
    }

    setSendingEmail(false);
    setProgressModalVisible(false);
    toast.success("All PMs processed & email sent. Redirecting...");
    setTimeout(() => {
      navigate("/preventive-maintenance");
    }, 2000);
  };

  const handleGlobalOtpSubmit = () => {
    if (!globalOtp) {
      setGlobalOtpError("Please enter the OTP.");
      return;
    }
    setLoadingGlobalOtp(true);
    const customerCode = selectedPms[0].customerCode;
    fetch(`${process.env.REACT_APP_BASE_URL}/upload/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerCode, otp: globalOtp }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "OTP verified successfully") {
          toast.success("OTP verified successfully!");
          setShowGlobalOtpModal(false);
          processPmsOneByOne();
        } else {
          setGlobalOtpError(data.message || "OTP verification failed");
        }
        setLoadingGlobalOtp(false);
      })
      .catch((err) => {
        setLoadingGlobalOtp(false);
        setGlobalOtpError("An error occurred. Please try again.");
      });
  };

  const handleGlobalSubmit = () => {
    if (!allCompleted) {
      toast.error("Please complete all checklists before submitting.");
      return;
    }
    setShowGlobalOtpModal(true);
    sendGlobalOtp();
  };

  const sendGlobalOtp = () => {
    const customerCode = selectedPms[0].customerCode;
    fetch(`${process.env.REACT_APP_BASE_URL}/upload/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Global OTP sent:", data.message);
        if (!isOtpTimerActive) {
          startOtpTimer(); // Start timer only if not already active
        }
      })
      .catch((err) => {
        console.error("Error sending global OTP:", err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed left-0 right-0 z-40 bg-white shadow-sm">
        {/* Header */}
        <div className="bg-blue-600 text-white">
          <div className="flex items-center px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-1 hover:bg-white hover:bg-opacity-20 transition-colors rounded"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-xl font-semibold">
                Preventive Maintenance Details
              </h1>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-slate-50 border-l-4 border-blue-500 py-2 px-5 shadow-md">
          <div className="flex items-center justify-between text-sm font-medium text-gray-800 mb-3">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Checklist Progress</span>
            </div>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-semibold">
              {completedCount}/{selectedPms.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-in-out relative"
              style={{
                width: `${(completedCount / selectedPms.length) * 100}%`,
              }}
            >
              <div className="absolute top-0 left-0 h-full w-full bg-white opacity-20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto mb-10"
        style={{
          marginTop: "120px",
          paddingBottom: allSameCustomer ? "80px" : "20px",
        }}
      >
        <div className="p-2 py-4">
          {/* PM Cards */}
          <div className="space-y-3">
            {selectedPms.map((pm) => {
              const isCompleted = checklistData[pm._id];
              const isEditing = editingPm === pm._id;
              const isExpanded = expandedDetails[pm._id];

              return (
                <div
                  key={pm._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  {/* PM Card Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pm.partNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {pm.customerName}
                        </p>
                        <div className="flex items-center mt-1">
                          {isCompleted ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <>
                            <button
                              onClick={() => toggleChecklistDetails(pm._id)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title={
                                isExpanded ? "Hide Details" : "Show Details"
                              }
                            >
                              {isExpanded ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditPm(pm._id)}
                              className="px-3 py-1 text-blue-500 hover:text-blue-700 transition-colors text-sm font-medium border border-blue-200 rounded hover:bg-blue-50"
                              title="Edit Checklist"
                            >
                              EDIT
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Always render machine data */}
                  {renderMachineData(pm)}

                  {/* Checklist Component - Show when not completed or when editing */}
                  {(!isCompleted || isEditing) && (
                    <div className="p-4">
                      <MachineChecklist
                        pm={pm}
                        onComplete={handleChecklistComplete}
                        key={`${pm._id}-${isEditing ? "editing" : "initial"}`}
                      />
                    </div>
                  )}

                  {/* Checklist Details - Show when completed, expanded, and not editing */}
                  {isCompleted &&
                    isExpanded &&
                    !isEditing &&
                    renderChecklistDetails(pm._id)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Submit Section */}
      {allSameCustomer && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <div className="p-4 mb-10 pt-1">
            <div className="flex items-center justify-between">
              <button
                onClick={handleGlobalSubmit}
                disabled={!allCompleted}
                className="flex justify-center w-full mt-0 rounded text-center items-center space-x-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                <span>Submit All PMs</span>
              </button>
            </div>

            {!allCompleted && (
              <div className="mt-2 flex items-center justify-center text-yellow-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  Complete all checklists to proceed
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced OTP Modal */}
      {showGlobalOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white text-center">
                OTP Verification
              </h3>
              <p className="text-blue-100 text-sm text-center mt-2">
                Enter the 6-digit code sent to customer's contact details
              </p>
            </div>

            {/* Customer Information Section */}
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Customer:{" "}
                  {selectedPms[0]?.customername || selectedPms[0]?.customerCode}
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  {selectedPms[0]?.email && (
                    <div className="flex items-center justify-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{selectedPms[0].email}</span>
                    </div>
                  )}
                  {selectedPms[0]?.telephone && (
                    <div className="flex items-center justify-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{selectedPms[0].telephone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Timer Display */}
              {isOtpTimerActive && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">
                      Time remaining to regenerate OTP:
                    </span>
                    <span className="text-lg font-bold text-blue-600 font-mono">
                      {formatTime(otpTimer)}
                    </span>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={globalOtp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                      if (value.length <= 6) {
                        setGlobalOtp(value);
                        setGlobalOtpError("");
                      }
                    }}
                    className="w-full p-4 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                  {globalOtpError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-red-600 text-sm">{globalOtpError}</p>
                    </div>
                  )}
                </div>

                {/* Regenerate OTP Button */}
                <div className="text-center">
                  <button
                    onClick={handleRegenerateOtp}
                    disabled={isOtpTimerActive || loadingGlobalOtp}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                      isOtpTimerActive || loadingGlobalOtp
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                    }`}
                  >
                    {isOtpTimerActive
                      ? `Regenerate OTP in ${formatTime(otpTimer)}`
                      : "Regenerate OTP"}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowGlobalOtpModal(false);
                  setOtpTimer(0);
                  setIsOtpTimerActive(false);
                  setGlobalOtp("");
                  setGlobalOtpError("");
                }}
                className="px-5 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors rounded-lg font-medium"
                disabled={loadingGlobalOtp}
              >
                Cancel
              </button>
              <button
                onClick={handleGlobalOtpSubmit}
                disabled={loadingGlobalOtp || globalOtp.length !== 6}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium rounded-lg shadow-sm flex items-center space-x-2"
              >
                {loadingGlobalOtp && (
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
                )}
                <span>{loadingGlobalOtp ? "Verifying..." : "Verify OTP"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {progressModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Processing PMs
              </h2>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {progressStatus.current} / {progressStatus.total} (
                  {Math.round(
                    (progressStatus.current / progressStatus.total) * 100
                  )}
                  %)
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded transition-all duration-300"
                  style={{
                    width: `${
                      (progressStatus.current / progressStatus.total) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="max-h-60 overflow-y-auto text-sm border border-gray-200 rounded p-3 bg-gray-50">
                {progressStatus.details.map((line, idx) => (
                  <div key={idx} className="mb-1 font-mono text-xs">
                    {line}
                  </div>
                ))}
              </div>

              {sendingEmail && (
                <div className="mt-3 text-center text-blue-600 font-medium">
                  Sending email, please wait...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PmDetails;
