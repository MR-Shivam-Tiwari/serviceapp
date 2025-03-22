import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function InstallationSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  // Destructure data passed via location.state
  const {
    equipmentData,
    pendingInstallationData,
    selectedSerialNumber,
    abnormalCondition,
    voltageData,
    palNumber,
    customer,
  } = location.state || {};

  // Local state for modals, OTP, loading, etc.
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Global spinner state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // user info from localStorage
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userName: "",
  });

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored User Data:", storedUser); // Logging the data
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
      });
    }
  }, []);
  console.log("Current Local User Info:", userInfo); // Logging the data

  // Build payload for equipment creation (DB data)
  const equipmentPayload = {
    serialnumber: selectedSerialNumber || "",
    materialdescription: pendingInstallationData?.description || "",
    materialcode: pendingInstallationData?.material || "",
    currentcustomer: customer?.customercodeid || "",
    status: pendingInstallationData?.status || "",
    name: `${pendingInstallationData?.customername1 || "N/A"} ${
      pendingInstallationData?.customername2 || "N/A"
    }`.trim(),
    custWarrantystartdate: pendingInstallationData?.warrantyStartDate || "",
    custWarrantyenddate: pendingInstallationData?.warrantyEndDate || "",
    palnumber: equipmentData?.palnumber || palNumber || "",
  };

  // Build separate data just for the PDF (NOT stored in DB)
  const pdfData = {
    userInfo: {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      employeeId: userInfo.employeeId,
      userName: userInfo.userid,
    },
    dateOfInstallation: new Date().toLocaleDateString("en-GB"),
    customerId: customer?.customercodeid || "",
    customerName: customer?.customername || "",
    hospitalName: customer?.hospitalname || "",
    phoneNumber: customer?.telephone || "",
    email: customer?.email || "",
    city: customer?.city || "",
    postalCode: customer?.postalcode || "",
    state: customer?.region || "",
    abnormalSiteCondition: abnormalCondition || "",
    supplyVoltage: {
      lnry: voltageData?.lnry || "",
      lgyb: voltageData?.lgyb || "",
      ngbr: voltageData?.ngbr || "",
    },
    // We'll add the OTP in verifyOtpAndSubmit
  };

  // Send OTP to customer email
  const sendOtp = async () => {
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

  // Verify OTP and then submit all data
  const verifyOtpAndSubmit = async () => {
    setIsVerifyingOtp(true);
    setLoadingMessage("Verifying OTP & Creating Installation...");
    setIsLoading(true);

    try {
      // 1) Verify the OTP
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/verify-otp`,
        {
          email: customer?.email,
          otp: otp,
        }
      );
      toast.success("OTP verified successfully.");

      // 2) Create the equipment record
      //    We send BOTH equipmentPayload and pdfData in one request
      //    // ADDED OTP TO PDFDATA
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/equipment`,
        {
          equipmentPayload,
          pdfData: {
            ...pdfData,
            otp, // <--- We attach the verified OTP here
          },
        }
      );
      toast.success("Installation saved successfully!");

      // 3) Delete the pending installation
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/serial/${selectedSerialNumber}`
      );
      toast.success("Pending installation Moved in Equipment successfully.");

      // 4) Show success
      setShowOtpModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error verifying OTP or saving installation:", error);
      toast.error("Failed to verify OTP or save installation.");
    } finally {
      setIsVerifyingOtp(false);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // When user clicks "Confirm & Complete Installation"
  const handleConfirmAndCompleteInstallation = async () => {
    await sendOtp(); // also triggers the spinner
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

      {/* Main Content */}
      <div className="px-4 space-y-4">
        {/* Equipment Details Section */}
        <div className="border border-gray-200 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">Equipment Details</h3>
          <p>
            <strong>Serial No:</strong> {selectedSerialNumber}
          </p>
          <p>
            <strong>Part No :</strong>{" "}
            {pendingInstallationData?.material || "N/A"}
          </p>
          <p>
            <strong>Name:</strong>{" "}
            {pendingInstallationData?.customername1 || "N/A"}{" "}
            {pendingInstallationData?.customername2 || "N/A"}
          </p>
          <p>
            <strong>PAL Number:</strong>{" "}
            {equipmentData?.palnumber || palNumber || "N/A"}
          </p>
          <p>
            <strong>Material Description:</strong>{" "}
            {pendingInstallationData?.description || "N/A"}
          </p>
          <p>
            <strong>Invoice No:</strong>{" "}
            {pendingInstallationData?.invoiceno || "N/A"}
          </p>
          <p>
            <strong>Invoice Date:</strong>{" "}
            {pendingInstallationData?.invoicedate || "N/A"}
          </p>
          <p>
            <strong>Status (Pending):</strong>{" "}
            {pendingInstallationData?.status || "N/A"}
          </p>
          <p>
            <strong>Current Customer Name:</strong>{" "}
            {pendingInstallationData?.currentcustomername1 || "N/A"}{" "}
            {pendingInstallationData?.currentcustomername2 || "N/A"}
          </p>
          <p>
            <strong>Warranty Description:</strong>{" "}
            {pendingInstallationData?.mtl_grp4 || "N/A"}
          </p>
          <p>
            <strong>Warranty Start:</strong>{" "}
            {pendingInstallationData?.warrantyStartDate
              ? new Date(
                  pendingInstallationData.warrantyStartDate
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </p>
          <p>
            <strong>Warranty End:</strong>{" "}
            {pendingInstallationData?.warrantyEndDate
              ? new Date(
                  pendingInstallationData.warrantyEndDate
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </p>
          {/* Abnormal Condition & Voltage */}
          <h3 className="font-bold text-lg my-2">Site & Voltage Data</h3>
          <p>
            <strong>Abnormal Site Condition:</strong>{" "}
            {abnormalCondition || "N/A"}
          </p>
          <p>
            <strong>L-N/R-Y:</strong> {voltageData?.lnry || "N/A"}
          </p>
          <p>
            <strong>L-G/Y-B:</strong> {voltageData?.lgyb || "N/A"}
          </p>
          <p>
            <strong>N-G/B-R:</strong> {voltageData?.ngbr || "N/A"}
          </p>
        </div>

        {/* Customer Details Section */}
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

        {/* Final Buttons */}
        <div>
          <button
            onClick={handleConfirmAndCompleteInstallation}
            className="w-full px-4 mb-3 h-10 text-white bg-primary rounded"
          >
            Confirm & Complete Installation
          </button>
          <button
            onClick={() => setShowAbortModal(true)}
            className="w-full px-4 h-10 text-white bg-red-600 rounded"
          >
            Abort Installation
          </button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 px-5 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">OTP Verification</h2>
            <p className="mb-4">
              An OTP has been sent to {customer?.email}. Please enter it below.
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
                onClick={verifyOtpAndSubmit}
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-5 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Installation Successfully!
            </h2>
            <p className="mb-4">Installation has been saved successfully.</p>
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

      {/* Abort Installation Confirmation Modal */}
      {showAbortModal && (
        <div className="fixed inset-0 px-5 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-4">
              Do you really want to abort this installation?
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

      {/* Global Loading Spinner Overlay */}
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
