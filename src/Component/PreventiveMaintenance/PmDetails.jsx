import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, CheckCircle, AlertTriangle, Send } from "lucide-react";
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
  const [progressStatus, setProgressStatus] = useState({
    current: 0,
    total: selectedPms ? selectedPms.length : 0,
    details: [],
  });
  const [sendingEmail, setSendingEmail] = useState(false);
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
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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

  // When a PM's checklist is completed, store its responses
  const handleChecklistComplete = (pmId, data) => {
    setChecklistData((prev) => ({ ...prev, [pmId]: data }));
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
      })
      .catch((err) => {
        console.error("Error sending global OTP:", err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
        {/* Header */}
        <div className="bg-blue-600 text-white">
          <div className="flex items-center px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
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
        className="flex-1 overflow-y-auto"
        style={{
          marginTop: "120px",
          paddingBottom: allSameCustomer ? "80px" : "20px",
        }}
      >
        <div className="p-2 py-4">
          {/* Customer validation warning */}
          {/* Fixed Submit Section */}
          {allSameCustomer && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleGlobalSubmit}
                    disabled={!allCompleted}
                    className="flex justify-center mt-0 w-full rounded text-center items-center space-x-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
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

          {/* PM Cards */}
          <div className="space-y-2">
            {selectedPms.map((pm) => (
              <MachineChecklist
                key={pm._id}
                pm={pm}
                onComplete={handleChecklistComplete}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Submit Section */}
      {allSameCustomer && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <div className="p-4 pt-1">
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

      {/* OTP Modal */}
      {showGlobalOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                OTP Verification
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                An OTP has been sent to the customer's registered email address.
              </p>
            </div>

            <div className="p-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={globalOtp}
                onChange={(e) => {
                  setGlobalOtp(e.target.value);
                  setGlobalOtpError("");
                }}
                className="w-full p-3 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                maxLength={6}
              />
              {globalOtpError && (
                <p className="text-red-600 text-sm mt-2">{globalOtpError}</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowGlobalOtpModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleGlobalOtpSubmit}
                disabled={loadingGlobalOtp}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium rounded"
              >
                {loadingGlobalOtp ? "Verifying..." : "Verify OTP"}
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
