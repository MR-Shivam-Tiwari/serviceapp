// AddInjuryModal.js
import React, { useState, useRef, useEffect } from "react";

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

  const [selectedOutcomes, setSelectedOutcomes] = useState([]);
  const [outcomeQuery, setOutcomeQuery] = useState("");
  const [description, setDescription] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOutcomes = outcomeOptions.filter(
    (option) =>
      option.toLowerCase().includes(outcomeQuery.toLowerCase()) &&
      !selectedOutcomes.includes(option)
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isDropdownOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOutcomes.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOutcomes.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && filteredOutcomes[focusedIndex]) {
            handleOutcomeSelect(filteredOutcomes[focusedIndex]);
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen, focusedIndex, filteredOutcomes]);

  // Helper for toggling checkboxes
  const handleCheckboxChange = (groupState, setGroupState, key) => {
    setGroupState({
      ...groupState,
      [key]: !groupState[key],
    });
  };

  // Handle outcome selection
  const handleOutcomeSelect = (option) => {
    setSelectedOutcomes([...selectedOutcomes, option]);
    setOutcomeQuery("");
    setIsDropdownOpen(false);
    setFocusedIndex(-1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setOutcomeQuery(e.target.value);
    setIsDropdownOpen(true);
    setFocusedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = () => {
    const injuryDetails = {
      deviceUsers,
      deviceUserRemarks,
      incidentDuringProcedure,
      exposureProtocol,
      outcomeAttributed: selectedOutcomes,
      description,
    };
    onSave(injuryDetails);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[100vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gray-200 text-black p-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Injury Details</h3>
              <p className="text-black mt-1">
                Please fill out all required information
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-black hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-2 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* 1) Device User / Affected Person */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="  w-8 h-8 flex items-center justify-center font-bold mr-3">
                1
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800">
                  Device User / Affected Person
                </label>
                <p className="text-sm text-gray-500">
                  Multiple selection allowed; "None" means problem noted prior
                  to use
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4  ">
              {[
                {
                  key: "healthcareProfessional",
                  label: "Healthcare Professional",
                },
                { key: "patient", label: "Patient" },
                { key: "unauthorizedUser", label: "Unauthorized User" },
                { key: "operator", label: "Operator" },
                {
                  key: "serviceEngineer",
                  label: "Service/Application Engineer",
                },
                { key: "none", label: "None" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    checked={deviceUsers[item.key]}
                    onChange={() =>
                      handleCheckboxChange(
                        deviceUsers,
                        setDeviceUsers,
                        item.key
                      )
                    }
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 2) Did Incident occur during procedure? */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="  w-8 h-8 flex items-center justify-center font-bold mr-3">
                2
              </div>
              <label className="block text-lg font-semibold text-gray-800">
                Did Incident occur during procedure?
              </label>
            </div>

            <div className="flex gap-6 ml-11">
              {["yes", "no"].map((value) => (
                <label
                  key={value}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="incidentProcedure"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    checked={incidentDuringProcedure === value}
                    onChange={() => setIncidentDuringProcedure(value)}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 3) Provide user/equipment exposure protocol */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <div className="  w-8 h-8 flex items-center justify-center font-bold mr-3 mt-1">
                3
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800">
                  User/Equipment Exposure Protocol
                </label>
                <p className="text-sm text-gray-500">
                  Enter detailed data for each field
                </p>
              </div>
            </div>

            <div className="  grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "kv", label: "KV", placeholder: "Enter KV details" },
                {
                  key: "maMas",
                  label: "mA/mAs",
                  placeholder: "Enter mA/mAs details",
                },
                {
                  key: "distance",
                  label: "Distance from X-Ray Source",
                  placeholder: "Enter distance details",
                },
                {
                  key: "time",
                  label: "Time",
                  placeholder: "Enter time details",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={exposureProtocol[field.key]}
                    onChange={(e) =>
                      setExposureProtocol({
                        ...exposureProtocol,
                        [field.key]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4) Outcome Attributed to Event - Material UI Style Autocomplete */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <div className="  w-8 h-8 flex items-center justify-center font-bold mr-3 mt-1">
                4
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800">
                  Outcome Attributed to Event
                </label>
                <p className="text-sm text-gray-500">
                  Search and select one or more outcomes
                </p>
              </div>
            </div>

            {/* Material UI Style Autocomplete */}
            <div className=" " ref={dropdownRef}>
              <div className="relative">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={outcomeQuery}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    placeholder="Type to search outcomes..."
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-gray-700 bg-white shadow-sm"
                  />

                  {/* Search/Dropdown Icon */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isDropdownOpen
                          ? "rotate-180 text-blue-500"
                          : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Material UI Style Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden">
                    {filteredOutcomes.length > 0 ? (
                      <div className="py-2">
                        {filteredOutcomes.map((option, index) => (
                          <div
                            key={index}
                            className={`px-4 py-3 cursor-pointer transition-all duration-150 ${
                              index === focusedIndex
                                ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                            onClick={() => handleOutcomeSelect(option)}
                            onMouseEnter={() => setFocusedIndex(index)}
                          >
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-60"></div>
                              <span className="text-sm font-medium">
                                {option}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : outcomeQuery ? (
                      <div className="p-4 text-center text-gray-500">
                        <svg
                          className="w-8 h-8 mx-auto mb-2 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.463-.64-6.318-1.76M12 15a7.962 7.962 0 01-6.318-1.76M12 15V9a6 6 0 016-6z"
                          />
                        </svg>
                        <p className="text-sm">
                          No outcomes found for "{outcomeQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">
                          Start typing to search outcomes
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Outcomes - Material Chip Style */}
              {selectedOutcomes.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Selected Outcomes ({selectedOutcomes.length})
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedOutcomes.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center  bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <span className="mr-2">{option}</span>
                        <button
                          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all duration-150"
                          onClick={() =>
                            setSelectedOutcomes(
                              selectedOutcomes.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Field */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description (Required) *
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    placeholder="Enter detailed remarks about the incident..."
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={400}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none outline-none"
                    rows={4}
                  />
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        description.length > 380
                          ? "bg-red-100 text-red-600"
                          : description.length > 350
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {description.length}/400
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50  py-2 flex justify-between px-2 gap-4 border-t border-gray-200">
          <button
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200 flex items-center"
            onClick={onCancel}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
          <button
            className="px-6 py-3  bg-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
            onClick={handleSubmit}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInjuryModal;
