// CloseComplaintPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddInjuryModal from "./AddInjuryModal";
import AddSparePartsModal from "./AddSparePartsModal";
import { ArrowLeft, Plus, X } from "lucide-react";

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
          <h1 className="text-2xl font-bold text-white"> Close Complaint</h1>
        </div>
      </div>
      <div className="p-3 max-w-4xl mx-auto">
        {/* Complaint Basic Info Card */}
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
            <div className="flex justify-between items-center py-1.5">
              <span className="font-medium text-gray-600 text-xs">
                Part Number:
              </span>
              <span className="text-gray-800 text-xs">
                {complaint?.materialcode || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Taken Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              Action Details
            </h3>
          </div>
          <div className="p-3 space-y-3">
            {/* Action Taken */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Action Taken:
              </label>
              <textarea
                placeholder="Describe the action taken to resolve the complaint..."
                value={actionTaken}
                maxLength={400}
                className="w-full px-2 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none text-xs"
                rows={3}
                onChange={(e) => setActionTaken(e.target.value)}
              />
              <p
                className={`text-xs font-medium text-right mt-1 ${
                  actionTaken.length > 380
                    ? "text-red-600"
                    : actionTaken.length > 350
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {actionTaken.length}/400 characters
              </p>
            </div>

            {/* Instruction to Customer */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Instruction to Customer:
              </label>
              <textarea
                maxLength={400}
                className="w-full px-2 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none text-xs"
                rows={3}
                placeholder="Any instructions given to the customer..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              />
              <p
                className={`text-xs font-medium text-right mt-1 ${
                  instruction.length > 380
                    ? "text-red-600"
                    : instruction.length > 350
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {instruction.length}/400 characters
              </p>
            </div>
          </div>
        </div>

        {/* Voltage Measurements Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              Voltage Measurements
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  L-N / R-Y
                </label>
                <input
                  type="number"
                  className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-xs"
                  placeholder="0-999"
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
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  L-G / Y-B
                </label>
                <input
                  type="number"
                  className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-xs"
                  placeholder="0-999"
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
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  N-G / B-R
                </label>
                <input
                  type="number"
                  className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-xs"
                  placeholder="0-999"
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
                <h4 className="font-semibold text-xs text-gray-700 mb-1">
                  Device Users:
                </h4>
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
                  <h4 className="font-semibold text-xs text-gray-700">
                    User Remarks:
                  </h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {injuryDetails.deviceUserRemarks}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-semibold text-xs text-gray-700">
                    Incident During Procedure:
                  </h4>
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
                  <h4 className="font-semibold text-xs text-gray-700">
                    Outcome:
                  </h4>
                  <p className="text-xs text-gray-600">
                    {Array.isArray(injuryDetails.outcomeAttributed)
                      ? injuryDetails.outcomeAttributed.join(", ")
                      : injuryDetails.outcomeAttributed || "N/A"}
                  </p>
                </div>
              </div>
              {injuryDetails.description && (
                <div>
                  <h4 className="font-semibold text-xs text-gray-700">
                    Description:
                  </h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {injuryDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spare Parts Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Spare Parts</h3>
          </div>
          <div className="p-3">
            {selectedSpares.length > 0 ? (
              <div className="space-y-2">
                {selectedSpares.map((spare, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {typeof spare === "string" ? (
                          <span className="text-xs font-medium text-gray-800">
                            {spare}
                          </span>
                        ) : (
                          <div>
                            <div className="text-xs font-medium text-gray-800">
                              {spare.PartNumber} - {spare.Description}
                            </div>
                            {spare.defectivePartNumber && (
                              <p className="text-xs text-gray-600 mt-1">
                                Defective: {spare.defectivePartNumber}
                              </p>
                            )}
                            {spare.replacedPartNumber && (
                              <p className="text-xs text-gray-600">
                                Replaced: {spare.replacedPartNumber}
                              </p>
                            )}
                            {spare.remark && (
                              <p className="text-xs text-gray-600">
                                Remark: {spare.remark}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        onClick={() => handleRemoveSpare(index)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">
                No spare parts added
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-6">
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm flex items-center justify-center"
            onClick={() => setShowInjuryModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD INJURY DETAILS
          </button>
          <button
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm flex items-center justify-center"
            onClick={() => setShowSpareModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD SPARE PARTS
          </button>
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
            onClick={handleCloseComplaintSubmit}
          >
            CLOSE COMPLAINT
          </button>
        </div>

        {/* Modals */}
        {showInjuryModal && (
          <AddInjuryModal
            onSave={handleSaveInjuryDetails}
            onCancel={handleCancelInjuryModal}
          />
        )}

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
