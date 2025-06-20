import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/joy";
import toast from "react-hot-toast";

function Installation() {
  const navigate = useNavigate();

  // Single Abnormal & Voltage for all machines
  const [abnormalCondition, setAbnormalCondition] = useState("");
  const [voltageData, setVoltageData] = useState({
    lnry: "",
    lgyb: "",
    ngbr: "",
  });

  // ----------- Autocomplete + Serial Data -----------
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [loadingSerialNumbers, setLoadingSerialNumbers] = useState(true);

  // The user's current selection in Autocomplete
  const [selectedSerial, setSelectedSerial] = useState("");

  // The fetched data for the *currently selected* serial
  const [currentSerialData, setCurrentSerialData] = useState(null);
  // If palnumber === "", user can type a new one here:
  const [palNumber, setPalNumber] = useState("");

  // The final "cards"
  const [installItems, setInstallItems] = useState([]);
  // Add these states near your other state declarations
  const [abnormalConditionError, setAbnormalConditionError] = useState("");
  const [voltageError, setVoltageError] = useState("");

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

    // Validate Voltage - at least one voltage field should be filled
    if (!voltageData.lnry && !voltageData.lgyb && !voltageData.ngbr) {
      setVoltageError("Please enter at least one voltage reading");
      isValid = false;
    } else {
      setVoltageError("");
    }

    if (!isValid) {
      toast.error("Please fill all required fields");
    }

    return isValid;
  };

  // ----------- Fetch Serial Number List on Mount -----------
  useEffect(() => {
    const fetchSerialList = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/serialnumbers`
        );
        setSerialNumbers(res.data || []);
      } catch (err) {
        console.error("Error fetching serial numbers:", err);
      } finally {
        setLoadingSerialNumbers(false);
      }
    };
    fetchSerialList();
  }, []);

  // ----------- Handle Selecting Serial -----------
  // As soon as the user picks a serial, we remove it from `serialNumbers` so they can't pick it again
  const handleSerialChange = async (newVal) => {
    // user cleared Autocomplete
    if (!newVal) {
      setSelectedSerial("");
      setCurrentSerialData(null);
      setPalNumber("");
      return;
    }

    setSelectedSerial(newVal);
    // Remove this serial from the Autocomplete options immediately
    setSerialNumbers((prev) => prev.filter((sn) => sn !== newVal));

    // Reset
    setCurrentSerialData(null);
    setPalNumber("");

    // Fetch data from the server
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/pendinginstallations/serial/${newVal}`
      );
      const data = res.data || {};
      setCurrentSerialData(data);

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
    }
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

    // Build the new item
    const newItem = {
      serialNumber: selectedSerial,
      pendingInstallationData: currentSerialData,
      palNumber:
        typeof currentSerialData.palnumber === "string"
          ? currentSerialData.palnumber === ""
            ? palNumber // user typed
            : currentSerialData.palnumber // from API
          : undefined, // not defined => skip
    };

    setInstallItems((prev) => [...prev, newItem]);

    // Clear the "current"
    setSelectedSerial("");
    setCurrentSerialData(null);
    setPalNumber("");
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
      // Clear voltage error when user starts typing
      if (val && voltageError) {
        setVoltageError("");
      }
    }
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
        // Build a new item with the same logic as Add More
        const newItem = {
          serialNumber: selectedSerial,
          pendingInstallationData: currentSerialData,
          palNumber:
            typeof currentSerialData.palnumber === "string"
              ? currentSerialData.palnumber === ""
                ? palNumber
                : currentSerialData.palnumber
              : undefined,
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
    <div className="">
      {/* HEADER */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button className="mr-2 text-white" onClick={() => navigate("/")}>
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
        <h2 className="text-xl font-bold">Equipment Installation Detail</h2>
      </div>

      {/* MAIN CONTENT */}
      <main className="  pb-24 flex-1 overflow-y-auto px-4">
        {/* Autocomplete */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Search & Select Serial Number
          </label>
          {loadingSerialNumbers ? (
            <p>Loading serial numbers...</p>
          ) : (
            <Autocomplete
              placeholder="Search by Serial Number..."
              options={serialNumbers}
              getOptionLabel={(option) => option}
              value={selectedSerial}
              onChange={(event, newValue) => handleSerialChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Search by Serial Number..."
                />
              )}
            />
          )}
          <button
            className="mt-2 w-full px-4 py-2 text-white bg-primary rounded 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => alert("Scan barcode not implemented!")}
          >
            Scan Barcode
          </button>
        </div>

        {/* Immediately showing currentSerialData if selected */}
        {currentSerialData && (
          <div className="border border-gray-200 p-3 rounded mb-4">
            <p>
              <strong>Serial Number:</strong>{" "}
              {currentSerialData.serialnumber || selectedSerial}
            </p>
            <p>
              <strong>Part No:</strong> {currentSerialData.material || "N/A"}
            </p>
            <p>
              <strong>Material Description:</strong>{" "}
              {currentSerialData.description || "N/A"}
            </p>
            <p>
              <strong>Current Customer:</strong>{" "}
              {currentSerialData.currentcustomername1 || "N/A"}{" "}
              {currentSerialData.currentcustomername2 || ""}
            </p>
            <p>
              <strong>City:</strong> {currentSerialData.customercity || "N/A"}
            </p>
            <p>
              <strong>Pin Code:</strong>{" "}
              {currentSerialData.customerpostalcode || "N/A"}
            </p>
            <p>
              <strong>Warranty Description:</strong>{" "}
              {currentSerialData.mtl_grp4 || "N/A"}
            </p>
            <p>
              <strong>Warranty Start:</strong>{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p>
              <strong>Warranty End:</strong>{" "}
              {currentSerialData?.warrantyMonths
                ? new Date(
                    new Date().setMonth(
                      new Date().getMonth() + currentSerialData.warrantyMonths
                    )
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
            {/* Pal Number logic */}
            {typeof currentSerialData.palnumber === "string" ? (
              currentSerialData.palnumber === "" ? (
                <div className="mt-2">
                  <label className="font-medium">Add Pal Number:</label>
                  <input
                    type="text"
                    className="h-10 w-full p-2 bg-gray-100 rounded"
                    value={palNumber}
                    onChange={(e) => handlePalNumberChange(e.target.value)}
                  />
                </div>
              ) : (
                <p>
                  <strong>Pal Number:</strong> {currentSerialData.palnumber}
                </p>
              )
            ) : null}
          </div>
        )}

        {/* Cards */}
        {installItems.length > 0 && (
          <div className="space-y-4 mb-4">
            {installItems.map((item, idx) => {
              const data = item.pendingInstallationData;
              return (
                <div
                  key={idx}
                  className="border border-gray-200 p-3 rounded relative"
                >
                  <button
                    className="absolute top-2 right-2 text-red-600 text-sm"
                    onClick={() => handleRemoveCard(idx)}
                  >
                    Remove
                  </button>
                  <p>
                    <strong>Serial No:</strong>{" "}
                    {data?.serialnumber || item.serialNumber}
                  </p>
                  <p>
                    <strong>Part No:</strong> {data?.material || "N/A"}
                  </p>
                  <p>
                    <strong>Material Description:</strong>{" "}
                    {data?.description || "N/A"}
                  </p>
                  <p>
                    <strong>Current Customer:</strong>{" "}
                    {data?.currentcustomername1 || "N/A"}{" "}
                    {data?.currentcustomername2 || ""}
                  </p>
                  <p>
                    <strong>City:</strong> {data?.customercity || "N/A"}
                  </p>
                  <p>
                    <strong>Pin Code:</strong>{" "}
                    {data?.customerpostalcode || "N/A"}
                  </p>
                  <p>
                    <strong>Warranty Description:</strong>{" "}
                    {data?.mtl_grp4 || "N/A"}
                  </p>
                  <p>
                    <strong>Warranty Start:</strong>{" "}
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Warranty End:</strong>{" "}
                    {data?.warrantyMonths
                      ? new Date(
                          new Date().setMonth(
                            new Date().getMonth() + data.warrantyMonths
                          )
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                  {/* Pal Number for the card */}
                  {typeof item.palNumber === "string" ? (
                    item.palNumber === "" ? (
                      <p>
                        <strong>Pal Number:</strong> N/A
                      </p>
                    ) : (
                      <p>
                        <strong>Pal Number:</strong> {item.palNumber}
                      </p>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Abnormal Site Condition (one for all) */}
        <div className="mb-4">
          <label className="block font-medium">Abnormal Site Condition</label>
          <input
            type="text"
            placeholder="Enter abnormal condition..."
            className={`w-full px-4 py-2 mb-1 bg-gray-100 border ${
              abnormalConditionError ? "border-red-500" : "border-gray-300"
            } rounded`}
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
            <p className="text-red-500 text-sm">{abnormalConditionError}</p>
          )}
        </div>

        {/* Voltage (one for all) */}
        <div className="mb-10">
          <p className="font-medium mb-1">Voltage</p>
          <input
            type="text"
            placeholder="L-N / R-Y"
            value={voltageData.lnry}
            onChange={(e) => handleVoltageInput("lnry", e.target.value)}
            className={`w-full px-4 py-2 mb-2 bg-gray-100 border ${
              voltageError ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
          <input
            type="text"
            placeholder="L-G / Y-B"
            value={voltageData.lgyb}
            onChange={(e) => handleVoltageInput("lgyb", e.target.value)}
            className={`w-full px-4 py-2 mb-2 bg-gray-100 border ${
              voltageError ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
          <input
            type="text"
            placeholder="N-G / B-R"
            value={voltageData.ngbr}
            onChange={(e) => handleVoltageInput("ngbr", e.target.value)}
            className={`w-full px-4 py-2 mb-2 bg-gray-100 border ${
              voltageError ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
          {voltageError && (
            <p className="text-red-500 text-sm">{voltageError}</p>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white fixed bottom-0 w-full z-10 p-4 pb-10 border-t shadow-sm">
        <div className="flex flex-col space-y-2">
          <button
            className="w-full px-4 py-2 text-white bg-primary rounded-lg 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleAddMore}
            disabled={!currentSerialData}
          >
            Add More
          </button>
          <button
            className="w-full px-4 py-2 text-white bg-primary rounded-lg 
    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleInstall}
          >
            Install
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Installation;