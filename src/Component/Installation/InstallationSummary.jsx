import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function InstallationSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  // Destructure the data passed via location.state
  const {
    equipmentData,
    pendingInstallationData,
    selectedSerialNumber,
    abnormalCondition,
    voltageData,
    customer,
  } = location.state || {};

  // Local state to show/hide success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // NEW: State to show/hide the "Abort Installation" confirmation modal
  const [showAbortModal, setShowAbortModal] = useState(false);

  // Handler for "Confirm & Complete Installation"
  const handleConfirmAndCompleteInstallation = async () => {
    try {
      // Build the payload to match your installationSchema
      const payload = {
        serialNumber: selectedSerialNumber || "",
        description: pendingInstallationData?.description || "",
        name: equipmentData?.name || "", // or if you prefer customerName
        city: customer?.city || "",
        postalCode: customer?.postalcode || "",
        street: customer?.street || "",
        district: "", // no data in your summary, so empty
        region: "", // no data in your summary, so empty
        country: "", // no data in your summary, so empty
        telephone: customer?.telephone || "",
        invoiceno: pendingInstallationData?.invoiceno || "",
        abnormalSiteCondition: abnormalCondition || "",
        // If your schema auto-generates equipmentId, you can skip passing it.
        // Otherwise, pass the equipmentId from equipmentData if needed:
        equipmentId: equipmentData?.equipmentid || "",

        // Nested object for voltage
        enterVoltage: {
          lNry: voltageData?.lnry || "",
          lgYb: voltageData?.lgyb || "",
          ngBr: voltageData?.ngbr || "",
        },

        // Nested object for customer
        customer: {
          customerCodeId: customer?.customercodeid || "",
          customerName: customer?.customername || "",
          email: customer?.email || "",
          postalCode: customer?.postalcode || "",
          street: customer?.street || "",
          city: customer?.city || "",
          hospital: "", // not provided in summary
          telephone: customer?.telephone || "",
        },
      };

      // POST to your API
      const response = await axios.post(
        "http://localhost:5000/installations",
        payload
      );

      // If successful, show a toast and show success modal
      toast.success("Installation saved successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving installation:", error);
      toast.error("Failed to save installation. Check console for details.");
    }
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
            <strong>Equipment Name:</strong> {equipmentData?.name || "N/A"}
          </p>
          <p>
            <strong>Equipment ID:</strong> {equipmentData?.equipmentid || "N/A"}
          </p>
          <p>
            <strong>PAL Number:</strong> {equipmentData?.palnumber || "N/A"}
          </p>
          <p>
            <strong>Material Description:</strong>{" "}
            {equipmentData?.materialdescription || "N/A"}
          </p>
          <p>
            <strong>Invoice No:</strong>{" "}
            {pendingInstallationData?.invoiceno || "N/A"}
          </p>
          <p>
            <strong>Status (Pending):</strong>{" "}
            {pendingInstallationData?.status || "N/A"}
          </p>
        </div>

        {/* Customer Details Section */}
        <div className="border border-gray-200 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">Customer Details</h3>
          <p>
            <strong>Name:</strong> {customer?.customername || "N/A"}
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

        {/* Abnormal Condition & Voltage */}
        <div className="border border-gray-200 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">Site & Voltage Data</h3>
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

        {/* Final Buttons */}
        <div className="  ">
          <button
            onClick={handleConfirmAndCompleteInstallation}
            className=" w-full px-4 mb-3 h-10 text-white bg-primary rounded"
          >
            Confirm & Complete Installation
          </button>

          {/* NEW Abort Installation Button */}
          <button
            onClick={() => setShowAbortModal(true)}
            className="w-full px-4 h-10  text-white bg-red-600 rounded"
          >
            Abort Installation
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL (unchanged) */}
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
                  navigate("/installation"); // Replace '/dashboard' with your desired route
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: ABORT INSTALLATION CONFIRMATION MODAL */}
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
                  navigate("/installation"); // or any route you want
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallationSummary;
