// AddInjuryModal.js
import React, { useState } from "react";

const AddInjuryModal = ({ onSave, onCancel }) => {
  // Local state for modal fields
  const [deviceUsers, setDeviceUsers] = useState({
    healthcareProfessional: false,
    patient: false,
    unauthorizedUser: false,
    operator: false,
    serviceEngineer: false,
    none: false,
  });
  const [deviceUserRemarks, setDeviceUserRemarks] = useState("");
  const [incidentDuringProcedure, setIncidentDuringProcedure] = useState("");
  const [exposureProtocol, setExposureProtocol] = useState({
    kv: false,
    maMas: false,
    distance: false,
    time: false,
  });
  const [outcomeAttributed, setOutcomeAttributed] = useState("");
  const [description, setDescription] = useState("");

  // Helper for toggling checkboxes
  const handleCheckboxChange = (groupState, setGroupState, key) => {
    setGroupState({
      ...groupState,
      [key]: !groupState[key],
    });
  };

  const handleSubmit = () => {
    const injuryDetails = {
      deviceUsers,
      deviceUserRemarks,
      incidentDuringProcedure,
      exposureProtocol,
      outcomeAttributed,
      description,
    };
    // Pass the details back to the parent component
    onSave(injuryDetails);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md w-full max-w-2xl h-[600px] mx-2 overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold">Injury Details</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
            &times;
          </button>
        </div>

        <hr className="mb-4" />

        {/* 1) Device User / Affected Person */}
        <div className="mb-4">
          <label className="block font-semibold">1) Device User / Affected Person</label>
          <p className="text-sm text-gray-500">(Multiple selection; “None” means problem noted prior to use)</p>
          <div className="flex flex-wrap mt-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.healthcareProfessional}
                onChange={() =>
                  handleCheckboxChange(deviceUsers, setDeviceUsers, "healthcareProfessional")
                }
              />
              Healthcare Professional
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.patient}
                onChange={() => handleCheckboxChange(deviceUsers, setDeviceUsers, "patient")}
              />
              Patient
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.unauthorizedUser}
                onChange={() => handleCheckboxChange(deviceUsers, setDeviceUsers, "unauthorizedUser")}
              />
              Unauthorized User
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.operator}
                onChange={() => handleCheckboxChange(deviceUsers, setDeviceUsers, "operator")}
              />
              Operator
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.serviceEngineer}
                onChange={() => handleCheckboxChange(deviceUsers, setDeviceUsers, "serviceEngineer")}
              />
              Service/Application Engineer
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.none}
                onChange={() => handleCheckboxChange(deviceUsers, setDeviceUsers, "none")}
              />
              None
            </label>
          </div>
        </div>

        {/* 2) Did Incident occur during procedure? */}
        <div className="mb-4">
          <label className="block font-semibold">2) Did Incident occur during procedure?</label>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="incidentProcedure"
                className="mr-2"
                checked={incidentDuringProcedure === "yes"}
                onChange={() => setIncidentDuringProcedure("yes")}
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="incidentProcedure"
                className="mr-2"
                checked={incidentDuringProcedure === "no"}
                onChange={() => setIncidentDuringProcedure("no")}
              />
              No
            </label>
          </div>
        </div>

        {/* 3) Provide user/equipment exposure protocol */}
        <div className="mb-4">
          <label className="block font-semibold">3) Provide user/equipment exposure protocol</label>
          <p className="text-sm text-gray-500">(Check all that apply for CC products)</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={exposureProtocol.kv}
                onChange={() => handleCheckboxChange(exposureProtocol, setExposureProtocol, "kv")}
              />
              KV
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={exposureProtocol.maMas}
                onChange={() => handleCheckboxChange(exposureProtocol, setExposureProtocol, "maMas")}
              />
              mA/mAs
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={exposureProtocol.distance}
                onChange={() =>
                  handleCheckboxChange(exposureProtocol, setExposureProtocol, "distance")
                }
              />
              Distance from X-Ray Source
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={exposureProtocol.time}
                onChange={() => handleCheckboxChange(exposureProtocol, setExposureProtocol, "time")}
              />
              Time
            </label>
          </div>
        </div>

        {/* 4) Outcome Attributed to Event */}
        <div className="mb-4">
          <label className="block font-semibold">4) Outcome Attributed to Event</label>
          <p className="text-sm text-gray-500 mb-1">
            (Select one; this information goes to Factory team & customer)
          </p>
          <select
            className="border p-2 rounded w-full"
            value={outcomeAttributed}
            onChange={(e) => setOutcomeAttributed(e.target.value)}
          >
            <option value="">-- Select Outcome --</option>
            <option value="Death/Life-threatening">Death / Life-threatening</option>
            <option value="Permanent Damage or Irreversible Injuries">
              Permanent Damage or Irreversible Injuries
            </option>
            <option value="Temporary & Medically Reversible Injuries">
              Temporary & Medically Reversible Injuries
            </option>
            <option value="Skin burn Infection/allergy to user">
              Skin burn Infection/allergy to user
            </option>
            <option value="Erythema (Skin inflammation or redness)">
              Erythema (Skin inflammation or redness)
            </option>
            <option value="Hospitalization (initial or prolonged)">
              Hospitalization (initial or prolonged)
            </option>
            <option value="Required medical Intervention to Prevent Permanent Impairment/Damage">
              Required medical Intervention to Prevent Permanent Impairment/Damage
            </option>
            <option value="Wrong diagnosis">Wrong diagnosis</option>
            <option value="Inconvenience / discomfort to user/patient">
              Inconvenience / discomfort to user/patient
            </option>
            <option value="Delay in Procedure / monitoring / Diagnostics">
              Delay in Procedure / monitoring / Diagnostics
            </option>
            <option value="Damage to property">Damage to property</option>
            <option value="None">None</option>
          </select>
          {/* Description Field */}
          <div className="mt-2">
            <label className="block text-sm font-medium">Description (Required)</label>
            <textarea
              className="border p-2 rounded w-full"
              value={description}
              placeholder="Other Serious (Remarks for limited char 100)"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInjuryModal;
