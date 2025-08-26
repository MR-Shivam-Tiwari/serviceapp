import { ArrowLeft, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

// A simple inline modal component for OTP
const OtpModal = ({
  isOpen,
  onClose,
  customerEmail,
  onSendOtp,
  onVerifyOtp,
  loading,
  hasSentOtp,
  customerMobile,
  error,
}) => {
  const [otpInput, setOtpInput] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white p-4 rounded shadow-md max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-2">OTP Verification</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        {!hasSentOtp ? (
          <>
            <p className="mb-4">
              We will send an OTP to:
              <br />
              <strong>Email:</strong> {customerEmail || "NA"}
              <br />
              <strong>Mobile:</strong> {customerMobile || "NA"}
            </p>
            <button
              className="bg-primary w-full text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={onSendOtp}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <p className="mb-4">
              OTP has been sent to: <br />
              <strong>Email:</strong> {customerEmail || "NA"} <br />
              <strong>Mobile:</strong> {customerMobile || "NA"} <br />
              Please enter it below to verify and send the final email.
            </p>

            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Enter OTP"
              className="border p-2 rounded w-full mb-2"
            />
            <button
              className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
              onClick={() => onVerifyOtp(otpInput)}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Send Email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ComplaintSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data passed from ComplaintDetailsPage
  const {
    complaint,
    actionTaken,
    instruction,
    voltageLN_RY,
    voltageLG_YB,
    voltageNG_BR,
    injuryDetails,
    selectedSpares,
    customer,
  } = location.state || {};

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserInfo({
          id: userData.id || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          mobilenumber: userData.mobilenumber || "",
          status: userData.status || "",
          branch: userData.branch || "",
          loginexpirydate: userData.loginexpirydate || "",
          employeeid: userData.employeeid || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          department: userData.department || "",
          profileimage: userData.profileimage || "",
          deviceid: userData.deviceid || "",
          deviceregistereddate: userData.deviceregistereddate || "",
          usertype: userData.usertype || "",
          manageremail: userData.manageremail || "",
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerId || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  // Add this with your other state declarations
  const [otpInput, setOtpInput] = useState("");

  console.log("customasaser", customer);
  // The customer's email we want to send the OTP to:
  const customerEmail = customer?.email || "unknown@noemail.com";
  const customerMobile = customer?.telephone || "NA";

  // 1) When user clicks "PROCEED FOR OTP," open the modal
  const handleProceedForOTP = () => {
    setShowOtpModal(true);
    setHasSentOtp(false);
    setOtpError("");
    setOtpInput("");
  };
  console.log(customer, "customer");
  // 2) Send OTP to the customer's email
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setOtpError("");

      // Prepare payload with data for OTP email template
      const payload = {
        customerEmail,

        // Service details for email template
        serviceCallNo: complaint?.notification_complaintid || "",
        unitSerialNo: complaint?.serialnumber || "",
        productDescription: complaint?.materialdescription || "",
        problemReported: complaint?.reportedproblem || "",
        actionTaken: actionTaken || "",

        // Additional customer info
        customerDetails: {
          customername: customer?.customername || "",
          hospitalName: customer?.hospitalname || "",
          phone: customer?.telephone || "",
        },
      };

      // Call your backend API to send the OTP
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/sendOtpEmail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setHasSentOtp(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (enteredOtp) => {
    try {
      setLoading(true);
      setOtpError("");

      // Create a new variable for the current date (date attended)
      const dateAttended = new Date().toISOString();

      // Prepare a comprehensive payload with ALL details, including new fields:
      const payload = {
        // OTP data
        customerEmail, // Same email used to send OTP
        otp: enteredOtp,

        // Complaint Fields
        complaintNumber: complaint?.notification_complaintid,
        partNumber: complaint?.materialcode,
        notificationType: complaint?.notificationtype, // New field
        customerCode: complaint?.customercode, // New field
        dateAttended, // New field with today's date
        serialNumber: complaint?.serialnumber,
        productCode: complaint?.productCode,
        description: complaint?.materialdescription,
        productGroup: complaint?.productgroup,
        productType: complaint?.problemtype,
        problemName: complaint?.problemname,
        reportedProblem: complaint?.reportedproblem,
        notificationDate: complaint?.notificationdate,

        // User Inputs (Action, Instruction, Voltage Readings)
        actionTaken,
        instructionToCustomer: instruction,
        voltageLN_RY,
        voltageLG_YB,
        voltageNG_BR,

        // Spare Parts (send the entire array)
        sparesReplaced: selectedSpares,

        // Injury Details (send the complete object)
        injuryDetails, // This includes device users, exposureProtocol, outcomeAttributed, description, etc.

        // Customer Details
        customerDetails: {
          city: customer?.city,
          customername: customer?.customername,
          hospitalName: customer?.hospitalname,
          email: customer?.email,
          phone: customer?.telephone,
          street: customer?.street,
          city: customer?.city,
          postalCode: customer?.postalcode,
        },

        // Complete User Info with all details
        userInfo: {
          // Basic Info
          id: userInfo.id || "",
          firstName: userInfo.firstname || "",
          lastName: userInfo.lastname || "",
          email: userInfo.email || "",
          mobilenumber: userInfo.mobilenumber || "",

          // User Type & Status
          usertype: userInfo.usertype || "",
          status: userInfo.status || "",

          // Location & Branch Info
          branch: userInfo.branch || [],
          location: userInfo.location || [],
          country: userInfo.country || "",
          state: userInfo.state || "",
          city: userInfo.city || "",

          // Professional Details
          employeeid: userInfo.employeeid || "",
          department: userInfo.department || "",
          skills: userInfo.skills || "",

          // Login & Device Info
          loginexpirydate: userInfo.loginexpirydate || "",
          deviceid: userInfo.deviceid || "",
          deviceregistereddate: userInfo.deviceregistereddate || "",
          profileimage: userInfo.profileimage || "",

          // Role Information
          roleName: userInfo.roleName || "",
          roleId: userInfo.roleId || "",

          // Dealer Information
          dealerName: userInfo.dealerName || "",
          dealerId: userInfo.dealerId || "",
          dealerEmail: userInfo.dealerEmail || "",

          // Manager Emails (Array)
          manageremail: userInfo.manageremail || [],
        },
      };

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/verifyOtpAndSendFinalEmail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      toast.success("OTP verified and final email sent successfully!");
      setShowOtpModal(false);
      navigate("/pendingcomplaints");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg sticky top-0 z-50">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white"> Complaint Summary</h1>
        </div>
      </div>
      <div className="p-3 max-w-4xl mx-auto">
        {/* Complaint Information Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              Complaint Information
            </h3>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">
                Complaint Number:
              </span>
              <span className="text-gray-800 font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs">
                {complaint?.notification_complaintid || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">
                Part Number:
              </span>
              <span className="text-gray-800 text-xs">
                {complaint?.materialcode || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">
                Serial Number:
              </span>
              <span className="text-gray-800 text-xs">
                {complaint?.serialnumber || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-start py-1.5">
              <span className="font-medium text-gray-600 text-xs">
                Description:
              </span>
              <span className="text-gray-800 text-right max-w-xs text-xs leading-tight">
                {complaint?.materialdescription || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              Service Details
            </h3>
          </div>
          <div className="p-3 space-y-3">
            {/* Voltage Readings */}
            <div>
              <span className="font-medium text-gray-700 text-xs block mb-1">
                Voltage Readings:
              </span>
              <div className="bg-gray-50 p-2 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">L-N / R-Y:</span>
                  <span className="font-medium">{voltageLN_RY || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">L-G / Y-B:</span>
                  <span className="font-medium">{voltageLG_YB || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">N-G / B-R:</span>
                  <span className="font-medium">{voltageNG_BR || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Action Taken */}
            <div>
              <span className="font-medium text-gray-700 text-xs block mb-1">
                Action Taken:
              </span>
              <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-800 leading-tight min-h-[60px]">
                {actionTaken || "No action provided."}
              </div>
            </div>

            {/* Instruction to Customer */}
            <div>
              <span className="font-medium text-gray-700 text-xs block mb-1">
                Instruction to Customer:
              </span>
              <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-800 leading-tight min-h-[60px]">
                {instruction || "No instruction provided."}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              Customer Details
            </h3>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">Name:</span>
              <span className="text-gray-800 text-xs text-right max-w-xs">
                {customer?.hospitalname || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">Email:</span>
              <span className="text-gray-800 text-xs text-right max-w-xs break-words">
                {customer?.email || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">Phone:</span>
              <span className="text-gray-800 text-xs">
                {customer?.telephone || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">Street:</span>
              <span className="text-gray-800 text-xs text-right max-w-xs">
                {customer?.street || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-medium text-gray-600 text-xs">City:</span>
              <span className="text-gray-800 text-xs">
                {customer?.city || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-medium text-gray-600 text-xs">
                Postal Code:
              </span>
              <span className="text-gray-800 text-xs">
                {customer?.postalcode || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Injury Details Card */}
        {injuryDetails && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-3 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">
                Injury Details
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <div>
                <span className="font-medium text-gray-700 text-xs block mb-1">
                  Device Users:
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(injuryDetails.deviceUsers)
                    .filter(([_, value]) => value)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                      >
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    ))}
                </div>
              </div>

              {injuryDetails.deviceUserRemarks && (
                <div>
                  <span className="font-medium text-gray-700 text-xs block mb-1">
                    User Remarks:
                  </span>
                  <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-800">
                    {injuryDetails.deviceUserRemarks}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-gray-700 text-xs block mb-1">
                    Incident During Procedure:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      injuryDetails.incidentDuringProcedure === "yes"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {injuryDetails.incidentDuringProcedure === "yes"
                      ? "Yes"
                      : "No"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-xs block mb-1">
                    Outcome:
                  </span>
                  <div className="text-xs text-gray-800">
                    {Array.isArray(injuryDetails.outcomeAttributed)
                      ? injuryDetails.outcomeAttributed.join(", ")
                      : injuryDetails.outcomeAttributed || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700 text-xs block mb-1">
                  Exposure Protocol:
                </span>
                <div className="bg-gray-50 p-2 rounded-lg grid grid-cols-2 gap-2">
                  {["kv", "maMas", "distance", "time"].map((key) => (
                    <div key={key} className="text-xs">
                      <span className="text-gray-600">
                        {key.toUpperCase()}:
                      </span>
                      <span className="font-medium ml-1">
                        {injuryDetails.exposureProtocol[key] || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {injuryDetails.description && (
                <div>
                  <span className="font-medium text-gray-700 text-xs block mb-1">
                    Description:
                  </span>
                  <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-800 leading-tight">
                    {injuryDetails.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spare Parts Card */}
        {selectedSpares && selectedSpares.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">
                Spare Parts
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {selectedSpares.map((spare, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-2 rounded-lg border border-gray-200"
                >
                  {typeof spare === "string" ? (
                    <div>
                      <div className="text-xs font-medium text-gray-800">
                        Spare Part No: {spare}
                      </div>
                      <div className="text-xs text-gray-600">
                        Description: N/A
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-medium text-gray-800">
                        Spare Part No: {spare.PartNumber}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        Description: {spare.Description}
                      </div>
                      {spare.defectivePartNumber && (
                        <div className="text-xs text-gray-600">
                          Defective Part: {spare.defectivePartNumber}
                        </div>
                      )}
                      {spare.replacedPartNumber && (
                        <div className="text-xs text-gray-600">
                          Replaced Part: {spare.replacedPartNumber}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proceed Button */}
        <div className="mb-6">
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
            onClick={handleProceedForOTP}
          >
            PROCEED FOR OTP
          </button>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
          <div className="bg-white p-4 rounded-xl shadow-2xl max-w-md w-full relative transform transition-all">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                OTP Verification
              </h2>
              {otpError && (
                <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
                  <p className="text-red-600 text-sm">{otpError}</p>
                </div>
              )}
            </div>

            {!hasSentOtp ? (
              <div>
                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    We will send an OTP to:
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Email:
                      </span>
                      <span className="text-xs text-gray-800">
                        {customerEmail || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Mobile:
                      </span>
                      <span className="text-xs text-gray-800">
                        {customerMobile || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold text-sm disabled:opacity-50"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Sending OTP...
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    OTP has been sent to:
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Email:
                      </span>
                      <span className="text-xs text-gray-800">
                        {customerEmail || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Mobile:
                      </span>
                      <span className="text-xs text-gray-800">
                        {customerMobile || "N/A"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Please enter the OTP below to verify and send the final
                    email.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm"
                  />
                  <button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg font-semibold text-sm disabled:opacity-50"
                    onClick={() => handleVerifyOtp(otpInput)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Verifying...
                      </div>
                    ) : (
                      "Verify & Send Email"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintSummaryPage;
