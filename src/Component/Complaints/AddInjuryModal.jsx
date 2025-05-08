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
  // Update the state initialization at the top of your component:
  const [exposureProtocol, setExposureProtocol] = useState({
    kv: "",
    maMas: "",
    distance: "",
    time: "",
  });

  const outcomeOptions = [
    "Death / Life-threatening",
    "Permanent Damage or Irreversible Injuries",
    "Temporary & Medically Reversible Injuries",
    "Skin burn Infection/allergy to user",
    "Erythema (Skin inflammation or redness)",
    "Hospitalization (initial or prolonged)",
    "Required medical Intervention to Prevent Permanent Impairment/Damage",
    "Wrong diagnosis",
    "Inconvenience / discomfort to user/patient",
    "Delay in Procedure / monitoring / Diagnostics",
    "Damage to property",
    "None",
  ];

  // Add these state variables:
  const [selectedOutcomes, setSelectedOutcomes] = useState([]);
  const [outcomeQuery, setOutcomeQuery] = useState("");
  const [description, setDescription] = useState("");
  const filteredOutcomes = outcomeOptions.filter(
    (option) =>
      option.toLowerCase().includes(outcomeQuery.toLowerCase()) &&
      !selectedOutcomes.includes(option)
  );
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
      outcomeAttributed: selectedOutcomes, // use selectedOutcomes here
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
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        <hr className="mb-4" />

        {/* 1) Device User / Affected Person */}
        <div className="mb-4">
          <label className="block font-semibold">
            1) Device User / Affected Person
          </label>
          <p className="text-sm text-gray-500">
            (Multiple selection; “None” means problem noted prior to use)
          </p>
          <div className="flex flex-wrap mt-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.healthcareProfessional}
                onChange={() =>
                  handleCheckboxChange(
                    deviceUsers,
                    setDeviceUsers,
                    "healthcareProfessional"
                  )
                }
              />
              Healthcare Professional
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.patient}
                onChange={() =>
                  handleCheckboxChange(deviceUsers, setDeviceUsers, "patient")
                }
              />
              Patient
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.unauthorizedUser}
                onChange={() =>
                  handleCheckboxChange(
                    deviceUsers,
                    setDeviceUsers,
                    "unauthorizedUser"
                  )
                }
              />
              Unauthorized User
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.operator}
                onChange={() =>
                  handleCheckboxChange(deviceUsers, setDeviceUsers, "operator")
                }
              />
              Operator
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.serviceEngineer}
                onChange={() =>
                  handleCheckboxChange(
                    deviceUsers,
                    setDeviceUsers,
                    "serviceEngineer"
                  )
                }
              />
              Service/Application Engineer
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={deviceUsers.none}
                onChange={() =>
                  handleCheckboxChange(deviceUsers, setDeviceUsers, "none")
                }
              />
              None
            </label>
          </div>
        </div>

        {/* 2) Did Incident occur during procedure? */}
        <div className="mb-4">
          <label className="block font-semibold">
            2) Did Incident occur during procedure?
          </label>
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
          <label className="block font-semibold">
            3) Provide user/equipment exposure protocol
          </label>
          <p className="text-sm text-gray-500">
            (Enter detailed data for each field)
          </p>
          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium">KV:</label>
              <input
                type="text"
                value={exposureProtocol.kv}
                onChange={(e) =>
                  setExposureProtocol({
                    ...exposureProtocol,
                    kv: e.target.value,
                  })
                }
                placeholder="Enter KV details"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block font-medium">mA/mAs:</label>
              <input
                type="text"
                value={exposureProtocol.maMas}
                onChange={(e) =>
                  setExposureProtocol({
                    ...exposureProtocol,
                    maMas: e.target.value,
                  })
                }
                placeholder="Enter mA/mAs details"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block font-medium">
                Distance from X-Ray Source:
              </label>
              <input
                type="text"
                value={exposureProtocol.distance}
                onChange={(e) =>
                  setExposureProtocol({
                    ...exposureProtocol,
                    distance: e.target.value,
                  })
                }
                placeholder="Enter distance details"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block font-medium">Time:</label>
              <input
                type="text"
                value={exposureProtocol.time}
                onChange={(e) =>
                  setExposureProtocol({
                    ...exposureProtocol,
                    time: e.target.value,
                  })
                }
                placeholder="Enter time details"
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </div>

        {/* 4) Outcome Attributed to Event */}
        <div className="mb-4">
          <label className="block font-semibold">
            4) Outcome Attributed to Event
          </label>
          <p className="text-sm text-gray-500 mb-1">
            (Search and select one or more outcomes; this information goes to
            Factory team & customer)
          </p>
          <div>
            <input
              type="text"
              value={outcomeQuery}
              onChange={(e) => setOutcomeQuery(e.target.value)}
              placeholder="Search outcomes..."
              className="border p-2 rounded w-full"
            />
            {outcomeQuery && filteredOutcomes.length > 0 && (
              <ul className="border rounded w-full bg-white max-h-40 overflow-y-auto mt-1">
                {filteredOutcomes.map((option, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setSelectedOutcomes([...selectedOutcomes, option]);
                      setOutcomeQuery("");
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
            {selectedOutcomes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedOutcomes.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 rounded px-2 py-1"
                  >
                    <span>{option}</span>
                    <button
                      className="ml-1 text-red-500"
                      onClick={() =>
                        setSelectedOutcomes(
                          selectedOutcomes.filter((_, i) => i !== index)
                        )
                      }
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Description Field */}
          <div className="mt-2">
            <label className="block text-sm font-medium">
              Description (Required)
            </label>
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
