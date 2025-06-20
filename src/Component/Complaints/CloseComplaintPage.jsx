// CloseComplaintPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddInjuryModal from "./AddInjuryModal";
import AddSparePartsModal from "./AddSparePartsModal";

const CloseComplaintPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // "complaint" was passed via navigate("/closecomplaint", { state: { complaint } })
  const { complaint, customer } = location.state || {};

  // Local state for Close Complaint form fields:
  const [actionTaken, setActionTaken] = useState("");
  const [instruction, setInstruction] = useState("");
  const [voltageLN_RY, setVoltageLN_RY] = useState("");
  const [voltageLG_YB, setVoltageLG_YB] = useState("");
  const [voltageNG_BR, setVoltageNG_BR] = useState("");

  // Injury Modal State
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [injuryDetails, setInjuryDetails] = useState(null);

  // Spare Parts Modal State
  const [showSpareModal, setShowSpareModal] = useState(false);
  const [spareOptions, setSpareOptions] = useState([]);
  // Initialize selectedSpares with complaint's spare parts if available
  const [selectedSpares, setSelectedSpares] = useState(
    Array.isArray(complaint?.sparerequest)
      ? complaint.sparerequest
      : complaint?.sparerequest
      ? [complaint.sparerequest]
      : []
  );

  // If complaint updates, update selectedSpares accordingly
  useEffect(() => {
    if (complaint?.sparerequest) {
      setSelectedSpares(
        Array.isArray(complaint.sparerequest)
          ? complaint.sparerequest
          : [complaint.sparerequest]
      );
    }
  }, [complaint]);

  // Fetch spare parts using the complaint's materialcode
  useEffect(() => {
    if (complaint && complaint.materialcode) {
      fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/search/${complaint.materialcode}`
      )
        .then((response) => response.json())
        .then((data) => setSpareOptions(data))
        .catch((error) => console.error("Error fetching spare parts:", error));
    }
  }, [complaint]);

  // Injury Modal callbacks
  const handleSaveInjuryDetails = (details) => {
    setInjuryDetails(details);
    setShowInjuryModal(false);
  };
  const handleCancelInjuryModal = () => {
    setShowInjuryModal(false);
  };

  // Spare Parts Modal callback - Append new spare parts to the existing list
  const handleSaveSpares = (spares) => {
    setSelectedSpares((prevSpares) => [...prevSpares, ...spares]);
    setShowSpareModal(false);
  };

  // "Close Complaint" => Navigate to the summary page with all data
  const handleCloseComplaintSubmit = () => {
    navigate("/complaintsummary", {
      state: {
        complaint,
        actionTaken,
        instruction,
        voltageLN_RY,
        voltageLG_YB,
        voltageNG_BR,
        injuryDetails,
        selectedSpares,
        customer,
      },
    });
  };

  const handleRemoveSpare = (index) => {
    setSelectedSpares((prevSpares) => prevSpares.filter((_, i) => i !== index));
  };
  return (
    <div className=" ">
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
        <h2 className="text-xl font-bold">Close Complaint</h2>
      </div>
      <div className="px-3">
        {/* Complaint Basic Info */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Complaint Number:</label>
          <div className="border p-2 rounded bg-gray-100">
            {complaint?.notification_complaintid || "N/A"}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Part Number:</label>
          <div className="border p-2 rounded bg-gray-100">
            {complaint?.materialcode || "N/A"}
          </div>
        </div>

        {/* Action Taken */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Action Taken:</label>
          <textarea
            className="border p-2 rounded w-full"
            placeholder="Describe the action taken to resolve the complaint..."
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
          />
        </div>

        {/* Instruction to Customer */}
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Instruction to Customer:
          </label>
          <textarea
            className="border p-2 rounded w-full"
            placeholder="Any instructions given to the customer..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
        </div>

        {/* Enter Voltage Fields */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Enter Voltage:</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="L-N / R-Y"
              value={voltageLN_RY}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (value.length <= 3 && parseInt(value) <= 999)
                ) {
                  setVoltageLN_RY(value);
                }
              }}
            />
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="L-G / Y-B"
              value={voltageLG_YB}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (value.length <= 3 && parseInt(value) <= 999)
                ) {
                  setVoltageLG_YB(value);
                }
              }}
            />
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="N-G / B-R"
              value={voltageNG_BR}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (value.length <= 3 && parseInt(value) <= 999)
                ) {
                  setVoltageNG_BR(value);
                }
              }}
            />
          </div>
        </div>

        {/* Display Injury Details if available */}
        {injuryDetails && (
          <div className="mb-4 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Injury Details Added</h3>
            <div className="mb-2">
              <h4 className="font-semibold">Device Users:</h4>
              <ul className="list-disc list-inside">
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
                <h4 className="font-semibold">User Remarks:</h4>
                <p>{injuryDetails.deviceUserRemarks}</p>
              </div>
            )}
            <div className="mb-2">
              <h4 className="font-semibold">
                Incident Occurred During Procedure:
              </h4>
              <p>
                {injuryDetails.incidentDuringProcedure === "yes" ? "Yes" : "No"}
              </p>
            </div>
            <div className="mb-2">
              <h4 className="font-semibold">Exposure Protocol:</h4>
              <ul className="list-disc list-inside">
                <li>
                  <strong>KV:</strong>{" "}
                  {injuryDetails.exposureProtocol.kv || "N/A"}
                </li>
                <li>
                  <strong>mA/mAs:</strong>{" "}
                  {injuryDetails.exposureProtocol.maMas || "N/A"}
                </li>
                <li>
                  <strong>Distance:</strong>{" "}
                  {injuryDetails.exposureProtocol.distance || "N/A"}
                </li>
                <li>
                  <strong>Time:</strong>{" "}
                  {injuryDetails.exposureProtocol.time || "N/A"}
                </li>
              </ul>
            </div>
            <div className="mb-2">
              <h4 className="font-semibold">Outcome Attributed to Event:</h4>
              <p>
                {Array.isArray(injuryDetails.outcomeAttributed)
                  ? injuryDetails.outcomeAttributed.join(", ")
                  : injuryDetails.outcomeAttributed || "N/A"}
              </p>
            </div>
            <div className="mb-2">
              <h4 className="font-semibold">Description:</h4>
              <p>{injuryDetails.description}</p>
            </div>
          </div>
        )}

        {/* Spare Parts Section - Always Rendered */}
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Spare Parts Added:</h3>
          {selectedSpares.length > 0 ? (
            <ul>
              {selectedSpares.map((spare, index) => {
                if (typeof spare === "string") {
                  return (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{spare}</span>
                      <button
                        className="text-red-500 ml-2"
                        onClick={() => handleRemoveSpare(index)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                }
                return (
                  <li
                    key={index}
                    className="mb-2 flex justify-between items-center"
                  >
                    <div>
                      <strong>{spare.PartNumber}</strong> - {spare.Description}
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
                      {spare.remark && (
                        <p className="text-sm text-gray-600">
                          Remark: {spare.remark}
                        </p>
                      )}
                    </div>
                    <button
                      className="text-red-500 ml-2"
                      onClick={() => handleRemoveSpare(index)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>

        {/* Buttons for Injury Details and Spare Parts */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="bg-primary text-white py-2 px-4 rounded-md w-full hover:bg-blue-700"
            onClick={() => setShowInjuryModal(true)}
          >
            + ADD INJURY DETAILS
          </button>
          <button
            className="bg-primary text-white py-2 px-4 rounded-md w-full hover:bg-blue-700"
            onClick={() => setShowSpareModal(true)}
          >
            + ADD SPARE PARTS
          </button>
        </div>

        {/* Close Complaint => Go to summary */}
        <button
          className="bg-primary mb-8 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700"
          onClick={handleCloseComplaintSubmit}
        >
          CLOSE COMPLAINT
        </button>

        {/* Injury Details Modal */}
        {showInjuryModal && (
          <AddInjuryModal
            onSave={handleSaveInjuryDetails}
            onCancel={handleCancelInjuryModal}
          />
        )}

        {/* Spare Parts Modal */}
        {showSpareModal && (
          <AddSparePartsModal
            spareOptions={spareOptions}
            onSave={handleSaveSpares}
            onCancel={() => setShowSpareModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CloseComplaintPage;
