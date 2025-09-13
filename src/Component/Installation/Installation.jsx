import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import ShortcutFooter from "../Home/ShortcutFooter";

function Installation() {
  const navigate = useNavigate();

  // Single Abnormal & Voltage for all machines
  const [abnormalCondition, setAbnormalCondition] = useState("");
  const [voltageData, setVoltageData] = useState({
    lnry: "",
    lgyb: "",
    ngbr: "",
  });

  // User info
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
    manageremail: [],
  });
  // const [safeAreaInsets] = useState({ bottom: 20 });
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
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

  // ----------- Enhanced Search Functionality -----------
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [loadingSerialNumbers, setLoadingSerialNumbers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs for handling dropdown and input
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // The user's current selection
  const [selectedSerial, setSelectedSerial] = useState("");

  // The fetched data for the *currently selected* serial
  const [currentSerialData, setCurrentSerialData] = useState(null);
  // If palnumber === "", user can type a new one here:
  const [palNumber, setPalNumber] = useState("");

  // NEW: State to track if material code exists in AERB
  const [materialCodeExists, setMaterialCodeExists] = useState(false);
  const [checkingMaterialCode, setCheckingMaterialCode] = useState(false);

  // The final "cards"
  const [installItems, setInstallItems] = useState([]);
  // Add these states near your other state declarations
  const [abnormalConditionError, setAbnormalConditionError] = useState("");
  const [voltageError, setVoltageError] = useState("");
  const [voltageFieldErrors, setVoltageFieldErrors] = useState({
    lnry: "",
    lgyb: "",
    ngbr: "",
  });
  const [palNumberError, setPalNumberError] = useState("");

  // NEW: Function to check if material code exists in AERB
  const checkMaterialCodeInAERB = async (materialCode) => {
    if (!materialCode) {
      setMaterialCodeExists(false);
      return false;
    }

    setCheckingMaterialCode(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/aerb/check/${materialCode}`
      );
      const exists = response.data.exists;
      console.log("AERB Check Response:", response.data); // Debug log
      setMaterialCodeExists(exists);
      return exists;
    } catch (error) {
      console.error("Error checking material code in AERB:", error);
      setMaterialCodeExists(false);
      return false;
    } finally {
      setCheckingMaterialCode(false);
    }
  };

  // Enhanced fetch serial numbers with search and pagination
  const fetchSerialNumbers = async (search = "") => {
    if (!userInfo?.employeeId) return;

    setLoadingSerialNumbers(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) {
        queryParams.append("search", search.trim());
      }
      queryParams.append("limit", "100");
      queryParams.append("skip", "0");

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/user-serialnumbers/${userInfo.employeeId}?${queryParams}`
      );

      const data = response.data;

      // Handle both old and new response formats
      if (data.serialNumbers) {
        // New format with pagination
        setSerialNumbers(data.serialNumbers);
      } else if (Array.isArray(data)) {
        // Old format (array of serial numbers)
        setSerialNumbers(data);
      } else {
        setSerialNumbers([]);
      }
    } catch (err) {
      console.error("Error fetching serial numbers:", err);
      if (err.response?.status === 404) {
        setError(err.response.data.message || "No installations found");
      } else {
        setError(err.message || "Failed to fetch equipment serial numbers");
      }
      setSerialNumbers([]);
    } finally {
      setLoadingSerialNumbers(false);
    }
  };

  // Initial load - fetch all serial numbers when userInfo is available
  useEffect(() => {
    if (userInfo.employeeId) {
      fetchSerialNumbers();
    }
  }, [userInfo.employeeId]);

  // Debounced search effect - Only trigger after 5 characters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        userInfo.employeeId &&
        searchTerm.length >= 5 &&
        searchTerm !== selectedSerial
      ) {
        fetchSerialNumbers(searchTerm);
      } else if (userInfo.employeeId && searchTerm.length === 0) {
        // Reset to initial load when search is cleared
        fetchSerialNumbers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSerial, userInfo.employeeId]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    setSelectedIndex(-1);

    if (!value) {
      setSelectedSerial("");
      setCurrentSerialData(null);
      setPalNumber("");
      setMaterialCodeExists(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || serialNumbers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < serialNumbers.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : serialNumbers.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < serialNumbers.length) {
          handleSerialSelect(serialNumbers[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle serial selection
  const handleSerialSelect = async (serial) => {
    setSelectedSerial(serial);
    setSearchTerm(serial);
    setShowDropdown(false);
    setSelectedIndex(-1);

    // Remove this serial from the options immediately
    setSerialNumbers((prev) => prev.filter((sn) => sn !== serial));

    // Reset
    setCurrentSerialData(null);
    setPalNumber("");
    setMaterialCodeExists(false);

    // Fetch data from the server
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/serial/${serial}`
      );
      const data = res.data || {};
      setCurrentSerialData(data);

      // Check material code in AERB if material exists
      if (data.material) {
        const exists = await checkMaterialCodeInAERB(data.material);
        console.log("Material exists in AERB:", exists); // Debug log
      }

      // Pal number logic
      if (typeof data.palnumber === "string") {
        if (data.palnumber === "") {
          // user can type
          setPalNumber("");
        } else {
          // data has a non-empty palnumber
          setPalNumber(""); // We won't let user override existing
        }
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setCurrentSerialData(null);
      setPalNumber("");
      setMaterialCodeExists(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add this validation function
  const validateFields = () => {
    let isValid = true;

    // Validate Abnormal Condition
    if (!abnormalCondition.trim()) {
      setAbnormalConditionError("Please enter abnormal site condition");
      isValid = false;
    } else {
      setAbnormalConditionError("");
    }

    // Validate Voltage - all three voltage fields are mandatory
    const voltageErrors = {};
    if (!voltageData.lnry.trim()) {
      voltageErrors.lnry = "L-N/R-Y voltage reading is required";
      isValid = false;
    } else {
      voltageErrors.lnry = "";
    }
    if (!voltageData.lgyb.trim()) {
      voltageErrors.lgyb = "L-G/Y-B voltage reading is required";
      isValid = false;
    } else {
      voltageErrors.lgyb = "";
    }
    if (!voltageData.ngbr.trim()) {
      voltageErrors.ngbr = "N-G/B-R voltage reading is required";
      isValid = false;
    } else {
      voltageErrors.ngbr = "";
    }

    setVoltageFieldErrors(voltageErrors);

    // Set general voltage error if any field is missing
    if (!isValid) {
      setVoltageError("All voltage readings are required");
    } else {
      setVoltageError("");
    }

    // Validate PAL Number - required when material exists in AERB and no existing PAL number
    if (shouldShowProcurementInput() && !palNumber.trim()) {
      setPalNumberError("Please enter the Procurement Number (PAL Number)");
      isValid = false;
    } else {
      setPalNumberError("");
    }

    if (!isValid) {
      toast.error("Please fill all required fields");
    }

    return isValid;
  };

  // If user is typing new palNumber
  const handlePalNumberChange = (val) => {
    setPalNumber(val);
  };

  // ----------- Add More => Move currentSerialData into final array -----------
  const handleAddMore = () => {
    // limit to 5
    if (installItems.length >= 5) {
      alert("You can only add up to 5 machines.");
      return;
    }
    if (!selectedSerial || !currentSerialData) {
      alert("No valid serial data to add!");
      return;
    }
    // Check if already in the list
    if (installItems.some((it) => it.serialNumber === selectedSerial)) {
      alert("This serial is already in the list!");
      return;
    }

    // Build the new item - Updated logic for PAL number
    const newItem = {
      serialNumber: selectedSerial,
      pendingInstallationData: currentSerialData,
      palNumber: (() => {
        // If there's already a palnumber from API and it's not empty, use it
        if (
          typeof currentSerialData.palnumber === "string" &&
          currentSerialData.palnumber !== ""
        ) {
          return currentSerialData.palnumber;
        }
        // If material exists in AERB and user entered procurement number, use that as PAL number
        if (materialCodeExists && palNumber && palNumber.trim() !== "") {
          return palNumber.trim();
        }
        // Otherwise return empty string
        return "";
      })(),
      materialCodeExists: materialCodeExists, // Store AERB check result
    };

    setInstallItems((prev) => [...prev, newItem]);

    // Clear the "current"
    setSelectedSerial("");
    setCurrentSerialData(null);
    setPalNumber("");
    setMaterialCodeExists(false);
    setSearchTerm("");
  };

  // Remove a card
  const handleRemoveCard = (index) => {
    setInstallItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate up to 3 digits for voltage
  const handleVoltageInput = (field, val) => {
    if (/^[1-9][0-9]{0,2}$/.test(val) || val === "") {
      setVoltageData((prev) => ({
        ...prev,
        [field]: val,
      }));
      // Clear individual field error when user starts typing
      if (val && voltageFieldErrors[field]) {
        setVoltageFieldErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
      // Clear general voltage error when user starts typing
      if (val && voltageError) {
        setVoltageError("");
      }
    }
  };

  // NEW: Function to determine if Procurement Number input should be shown
  const shouldShowProcurementInput = () => {
    // If there's already a palnumber from data and it's not empty, don't show input
    if (currentSerialData?.palnumber && currentSerialData.palnumber !== "") {
      return false;
    }

    // If material code exists in AERB and palnumber is empty or undefined, show input
    if (
      materialCodeExists &&
      (!currentSerialData?.palnumber || currentSerialData.palnumber === "")
    ) {
      return true;
    }

    // Otherwise don't show input
    return false;
  };

  // ------------- On "Install" => user might not have clicked "Add More" -----------
  // We also want to include the currentSerialData if the user hasn't added it yet
  const handleInstall = () => {
    if (!validateFields()) {
      return;
    }
    let finalItems = [...installItems];

    // If there's a currently selected item that is not in the list, add it
    if (currentSerialData && selectedSerial) {
      const alreadyInList = finalItems.some(
        (it) => it.serialNumber === selectedSerial
      );
      if (!alreadyInList) {
        // Build a new item with the same logic as Add More - Updated
        const newItem = {
          serialNumber: selectedSerial,
          pendingInstallationData: currentSerialData,
          palNumber: (() => {
            // If there's already a palnumber from API and it's not empty, use it
            if (
              typeof currentSerialData.palnumber === "string" &&
              currentSerialData.palnumber !== ""
            ) {
              return currentSerialData.palnumber;
            }
            // If material exists in AERB and user entered procurement number, use that as PAL number
            if (materialCodeExists && palNumber && palNumber.trim() !== "") {
              return palNumber.trim();
            }
            // Otherwise return empty string
            return "";
          })(),
          materialCodeExists: materialCodeExists,
        };
        // If finalItems is already at 5, we do a quick check
        if (finalItems.length >= 5) {
          alert("You can only install up to 5 machines.");
          return;
        }
        finalItems.push(newItem);
      }
    }

    // Now navigate
    navigate("/search-customer", {
      state: {
        installItems: finalItems,
        abnormalCondition,
        voltageData,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            Equipment Installation Detail
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-1  pt-16 pb-64 overflow-y-auto">
        {/* Enhanced Search Section with Custom Autocomplete */}
        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <div className="mb-3 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search & Select Serial Number
            </label>

            {/* Custom Autocomplete Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by Serial Number..."
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Loading indicator */}
              {loadingSerialNumbers && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Dropdown */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {loadingSerialNumbers ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Searching...</span>
                    </div>
                  ) : serialNumbers.length === 0 ? (
                    <div className="p-3 text-gray-500 text-center">
                      {searchTerm.length < 5 && searchTerm.length > 0
                        ? `Type ${
                            5 - searchTerm.length
                          } more character(s) to search`
                        : error || "No serial numbers found"}
                    </div>
                  ) : (
                    serialNumbers.map((serial, index) => (
                      <div
                        key={serial}
                        className={`px-3 py-2 cursor-pointer transition-colors ${
                          index === selectedIndex
                            ? "bg-blue-100 text-blue-900"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleSerialSelect(serial)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {serial}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Helper text */}
            <p className="mt-1 text-xs text-gray-500">
              {searchTerm.length < 5 && searchTerm.length > 0
                ? `Type ${5 - searchTerm.length} more character(s) to search`
                : serialNumbers.length === 100
                ? "Showing first 100 results. Type to search for specific serial numbers."
                : `Found ${serialNumbers.length} equipment(s)`}
            </p>

            {/* Error display */}
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium flex items-center">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>

          <button
            className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => alert("Scan barcode not implemented!")}
          >
            Scan Barcode
          </button>
        </div>

        {/* Current Serial Data Display */}
        {currentSerialData && (
          <div className="bg-white rounded-md shadow-sm border border-blue-200 p-4 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <h3 className="font-medium text-gray-900">
                Selected Equipment Details
              </h3>
              {/* Show AERB check status */}
              {checkingMaterialCode && (
                <div className="ml-auto flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-1"></div>
                  Checking AERB...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Serial Number:</span>
                <span className="font-medium text-gray-900">
                  {currentSerialData.serialnumber || selectedSerial}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Part No:</span>
                <span className="font-medium text-gray-900 flex items-center">
                  {currentSerialData.material || "N/A"}
                  {/* Show AERB status indicator */}
                  {currentSerialData.material && !checkingMaterialCode && (
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        materialCodeExists
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {materialCodeExists ? "AERB" : "Non-AERB"}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-gray-900 text-right">
                  {currentSerialData.description || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Code ID:</span>
                <span className="font-medium text-gray-900 text-right">
                  {currentSerialData.currentcustomerid || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900 text-right">
                  {currentSerialData.Customer || "N/A"}{" "}
                  {currentSerialData.currentcustomername2 || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">City:</span>
                <span className="font-medium text-gray-900">
                  {currentSerialData.City || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pin Code:</span>
                <span className="font-medium text-gray-900">
                  {currentSerialData.PinCode || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warranty:</span>
                <span className="font-medium text-gray-900 text-right">
                  {currentSerialData.mtl_grp4 || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warranty Start:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warranty End:</span>
                <span className="font-medium text-gray-900">
                  {currentSerialData?.warrantyMonths
                    ? new Date(
                        new Date().setMonth(
                          new Date().getMonth() +
                            currentSerialData.warrantyMonths
                        )
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Updated Procurement Number Section */}
            {currentSerialData.palnumber &&
            currentSerialData.palnumber !== "" ? (
              // Show existing pal number if it exists and is not empty
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pal Number:</span>
                  <span className="font-medium text-gray-900">
                    {currentSerialData.palnumber}
                  </span>
                </div>
              </div>
            ) : shouldShowProcurementInput() ? (
              // Show input field when conditions are met
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <label className="block text-sm font-medium text-green-800">
                    Procurement Number Required
                  </label>
                </div>
                <p className="text-xs text-green-700 mb-3">
                  This is an AERB equipment. Please enter the Procurement
                  Number.
                </p>
                <input
                  type="text"
                  placeholder="Enter Procurement No (PAL Number)"
                  className={`w-full px-3 py-3 border ${
                    palNumberError
                      ? "border-red-500 bg-red-50"
                      : "border-green-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white`}
                  value={palNumber}
                  onChange={(e) => {
                    handlePalNumberChange(e.target.value);
                    if (e.target.value.trim()) {
                      setPalNumberError("");
                    }
                  }}
                />
                {palNumberError && (
                  <p className="mt-1 text-red-500 text-sm">{palNumberError}</p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Install Items Cards */}
        {installItems.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                {installItems.length}
              </span>
              Added Equipment
            </h3>

            {installItems.map((item, idx) => {
              const data = item.pendingInstallationData;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-md shadow-sm border border-gray-200 p-4 relative"
                >
                  <button
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => handleRemoveCard(idx)}
                  >
                    <svg
                      className="w-4 h-4"
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

                  <div className="grid grid-cols-1 gap-2 text-sm pr-8">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial No:</span>
                      <span className="font-medium text-gray-900">
                        {data?.serialnumber || item.serialNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Part No:</span>
                      <span className="font-medium text-gray-900 flex items-center">
                        {data?.material || "N/A"}
                        {/* Show AERB status in cards too */}
                        {data?.material && (
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              item.materialCodeExists
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.materialCodeExists ? "AERB" : "Non-AERB"}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-gray-900 text-right">
                        {data?.description || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900 text-right">
                        {data?.currentcustomername1 || "N/A"}{" "}
                        {data?.currentcustomername2 || ""}
                      </span>
                    </div>

                    {/* Show PAL Number if exists */}
                    {item.palNumber && item.palNumber !== "" && (
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-600">PAL Number:</span>
                        <span className="font-medium text-gray-900">
                          {item.palNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Abnormal Site Condition */}
          <div className="bg-white rounded-md shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Abnormal Site Condition <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter abnormal condition..."
              className={`w-full px-3 py-3 border ${
                abnormalConditionError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={abnormalCondition}
              onChange={(e) => {
                setAbnormalCondition(e.target.value);
                if (e.target.value.trim()) {
                  setAbnormalConditionError("");
                }
              }}
              required
            />
            {abnormalConditionError && (
              <p className="mt-1 text-red-500 text-sm">
                {abnormalConditionError}
              </p>
            )}
          </div>

          {/* Voltage Section */}
          <div className="bg-white rounded-md shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Voltage Readings <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="L-N / R-Y"
                  value={voltageData.lnry}
                  onChange={(e) => handleVoltageInput("lnry", e.target.value)}
                  className={`w-full px-3 py-3 border ${
                    voltageFieldErrors.lnry
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {voltageFieldErrors.lnry && (
                  <p className="mt-1 text-red-500 text-sm">
                    {voltageFieldErrors.lnry}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="L-G / Y-B"
                  value={voltageData.lgyb}
                  onChange={(e) => handleVoltageInput("lgyb", e.target.value)}
                  className={`w-full px-3 py-3 border ${
                    voltageFieldErrors.lgyb
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {voltageFieldErrors.lgyb && (
                  <p className="mt-1 text-red-500 text-sm">
                    {voltageFieldErrors.lgyb}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="N-G / B-R"
                  value={voltageData.ngbr}
                  onChange={(e) => handleVoltageInput("ngbr", e.target.value)}
                  className={`w-full px-3 py-3 border ${
                    voltageFieldErrors.ngbr
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {voltageFieldErrors.ngbr && (
                  <p className="mt-1 text-red-500 text-sm">
                    {voltageFieldErrors.ngbr}
                  </p>
                )}
              </div>
            </div>
            {voltageError && (
              <p className="mt-2 text-red-500 text-sm">{voltageError}</p>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-20 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="px-2 py-2 pb-7">
          <div className="space-y-3">
            <button
              className={`w-full px-4 py-3 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                !currentSerialData
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
              onClick={handleAddMore}
              disabled={!currentSerialData}
            >
              Add More Equipment
            </button>
            <button
              className="w-full px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={handleInstall}
            >
              Proceed to Install
            </button>
          </div>
        </div>
      </footer>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}

export default Installation;
