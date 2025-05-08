import React, { useEffect, useState } from "react";
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
              We will send an OTP to: <strong>{customerEmail}</strong>
            </p>
            <button
              className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={onSendOtp}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <p className="mb-4">
              OTP has been sent to: <strong>{customerEmail}</strong>. <br />
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

  // Load the logged-in user info (service engineer) from localStorage
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobilenumber: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        email: storedUser.email,
        mobilenumber: storedUser.mobilenumber,
      });
    }
  }, []);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // The customer's email we want to send the OTP to:
  const customerEmail = customer?.email || "unknown@noemail.com";

  // 1) When user clicks "PROCEED FOR OTP," open the modal
  const handleProceedForOTP = () => {
    setShowOtpModal(true);
    setHasSentOtp(false);
    setOtpError("");
  };

  // 2) Send OTP to the customer's email
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setOtpError("");

      // Call your backend API to send the OTP
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/sendOtpEmail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerEmail }),
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

  // 3) Verify OTP & Send Final Email
  // 3) Verify OTP & Send Final Email
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
      customerCode: complaint?.customercode,         // New field
      dateAttended,                                  // New field with today's date
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
        hospitalName: customer?.hospitalname,
        email: customer?.email,
        phone: customer?.telephone,
        street: customer?.street,
        city: customer?.city,
        postalCode: customer?.postalcode,
      },

      // Service Engineer (user) Details
      serviceEngineer: {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        mobileNumber: userInfo.mobilenumber,
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

    alert("OTP verified and final email sent successfully!");
    setShowOtpModal(false);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    setOtpError(error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="">
      {/* Top header with Back button */}
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
        <h2 className="text-xl font-bold">Complaint Summary</h2>
      </div>

      <div className="px-4">
        {/* Show all the complaint data again */}
        <div className="bg-gray-100 p-2 rounded">
          <div className="mb-4 flex justify-between items-center ">
            <label className="block font-medium mb-1">Complaint Number:</label>
            <div>{complaint?.notification_complaintid || "N/A"}</div>
          </div>
          <div className="mb-4 flex justify-between items-center ">
            <label className="block font-medium mb-1">Part Number:</label>
            <div>{complaint?.materialcode || "N/A"}</div>
          </div>

          {/* Other complaint fields */}
          <div className="mb-4 flex justify-between items-center">
            <label className="block font-medium mb-1">Serial Number:</label>
            <div>{complaint?.serialnumber || "N/A"}</div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="block font-medium mb-1">Product Code:</label>
            <div>{complaint?.productCode || "N/A"}</div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="block font-medium mb-1">Description:</label>
            <div>{complaint?.materialdescription || "N/A"}</div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="block font-medium mb-1">Product Group:</label>
            <div>{complaint?.productgroup || "N/A"}</div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="block font-medium mb-1">Product Type:</label>
            <div>{complaint?.problemtype || "N/A"}</div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="block font-medium mb-1">Problem Name:</label>
            <div>{complaint?.problemname || "N/A"}</div>
          </div>

          {/* Show user inputs (voltage, action, instruction) */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Voltage Readings:</label>
            <ul className="list-disc list-inside pl-4">
              <li>L-N / R-Y: {voltageLN_RY || "N/A"}</li>
              <li>L-G / Y-B: {voltageLG_YB || "N/A"}</li>
              <li>N-G / B-R: {voltageNG_BR || "N/A"}</li>
            </ul>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Action Taken:</label>
            <div className="border p-2 rounded bg-gray-200 whitespace-pre-wrap">
              {actionTaken || "No action provided."}
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              Instruction to Customer:
            </label>
            <div className="border p-2 rounded bg-gray-200 whitespace-pre-wrap">
              {instruction || "No instruction provided."}
            </div>
          </div>
        </div>

        {/* Customer details again */}
        <h3 className="text-xl font-semibold mt-2">Customer Details</h3>
        <div className="my-3 bg-gray-100 p-2">
          <div className="mb-2">
            <label className="block font-medium">Name:</label>
            <div className="border p-2 rounded bg-gray-200">
              {customer?.hospitalname || "N/A"}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-medium">Email:</label>
            <div className="border p-2 rounded bg-gray-200">
              {customer?.email || "N/A"}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-medium">Phone:</label>
            <div className="border p-2 rounded bg-gray-200">
              {customer?.telephone || "N/A"}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-medium">Street:</label>
            <div className="border p-2 rounded bg-gray-200">
              {customer?.street || "N/A"}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-medium">City:</label>
            <div className="border p-2 rounded bg-gray-200">
              {customer?.city || "N/A"}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-medium">Postal Code:</label>
            <div className="border p-2 rounded bg-gray-200">
              {customer?.postalcode || "N/A"}
            </div>
          </div>
        </div>

        {/* INJURY DETAILS (if any) */}
        {injuryDetails && (
          <div className="mb-4 p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Injury Details</h3>
            <div className="mb-2">
              <strong>Device Users:</strong>
              <ul className="list-disc list-inside ml-4">
                {Object.entries(injuryDetails.deviceUsers)
                  .filter(([_, value]) => value)
                  .map(([key]) => (
                    <li key={key}>
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </li>
                  ))}
              </ul>
            </div>
            {injuryDetails.deviceUserRemarks && (
              <div className="mb-2">
                <strong>User Remarks:</strong>
                <p>{injuryDetails.deviceUserRemarks}</p>
              </div>
            )}
            <div className="mb-2">
              <strong>Incident During Procedure:</strong>{" "}
              {injuryDetails.incidentDuringProcedure === "yes" ? "Yes" : "No"}
            </div>
            <div className="mb-2">
              <strong>Exposure Protocol:</strong>
              <ul className="list-disc list-inside ml-4">
                {["kv", "maMas", "distance", "time"].map((key) => (
                  <li key={key}>
                    <strong>{key.toUpperCase()}:</strong>{" "}
                    {injuryDetails.exposureProtocol[key] || "N/A"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <strong>Outcome Attributed to Event:</strong>{" "}
              {Array.isArray(injuryDetails.outcomeAttributed)
                ? injuryDetails.outcomeAttributed.join(", ")
                : injuryDetails.outcomeAttributed || "N/A"}
            </div>
            <div className="mb-2">
              <strong>Description:</strong>
              <p>{injuryDetails.description}</p>
            </div>
          </div>
        )}

        {/* SPARE PARTS (if any) */}
        {/* SPARE PARTS (if any) */}
        {selectedSpares && selectedSpares.length > 0 && (
          <div className="mb-4 p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Spare Parts</h3>
            <ul>
              {selectedSpares.map((spare, index) => {
                if (typeof spare === "string") {
                  return (
                    <li key={index} className="mb-2">
                      <strong>Spare Part No: {spare}</strong>
                      <p>Description: </p>
                    </li>
                  );
                } else {
                  return (
                    <li key={index} className="mb-2">
                      <strong>Spare Part No: {spare.PartNumber}</strong>
                      <p>Description: {spare.Description}</p>
                      {spare.defectivePartNumber && (
                        <p className="text-sm text-gray-600">
                          Defective Part Number: {spare.defectivePartNumber}
                        </p>
                      )}
                      {spare.replacedPartNumber && (
                        <p className="text-sm text-gray-600">
                          Replaced Part Number: {spare.replacedPartNumber}
                        </p>
                      )}
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        )}

        {/* Final Button => Open OTP Modal */}
        <button
          className="bg-primary text-white py-2 mb-4 px-4 rounded-md w-full hover:bg-blue-700"
          onClick={handleProceedForOTP}
        >
          PROCEED FOR OTP
        </button>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        customerEmail={customerEmail}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
        loading={loading}
        hasSentOtp={hasSentOtp}
        error={otpError}
      />
    </div>
  );
};

export default ComplaintSummaryPage;
