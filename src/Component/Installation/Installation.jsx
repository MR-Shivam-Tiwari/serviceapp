import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/joy";

function Installation() {
  const navigate = useNavigate();

  // State for all serial numbers
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [loadingSerialNumbers, setLoadingSerialNumbers] = useState(true);

  // Selected serial number
  const [selectedSerialNumber, setSelectedSerialNumber] = useState("");

  // States to store the fetched data
  const [equipmentData, setEquipmentData] = useState(null);
  const [pendingInstallationData, setPendingInstallationData] = useState(null);

  // NEW STATES for abnormal site condition & voltage
  const [abnormalCondition, setAbnormalCondition] = useState("");
  const [voltageData, setVoltageData] = useState({
    lnry: "", // L-N / R-Y
    lgyb: "", // L-G / Y-B
    ngbr: "", // N-G / B-R
  });

  // Fetch all serial numbers (unchanged)
  const fetchSerialNumbers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/collections/allequipment/serialnumbers"
      );
      setSerialNumbers(response.data);
    } catch (error) {
      console.error("Error fetching serial numbers:", error);
    } finally {
      setLoadingSerialNumbers(false);
    }
  };

  // Fetch equipment details when serial changes
  useEffect(() => {
    const fetchEquipmentDetails = async (serial) => {
      try {
        const response = await axios.get(
          `http://localhost:5000/collections/getbyserialno/${serial}`
        );
        const { equipmentData, pendingInstallationData } = response.data;
        setEquipmentData(equipmentData);
        setPendingInstallationData(pendingInstallationData);
      } catch (error) {
        console.error("Error fetching details:", error);
        setEquipmentData(null);
        setPendingInstallationData(null);
      }
    };

    if (selectedSerialNumber) {
      fetchEquipmentDetails(selectedSerialNumber);
    }
  }, [selectedSerialNumber]);

  // Fetch serial numbers on component mount
  useEffect(() => {
    fetchSerialNumbers();
  }, []);

  // Handle the Install button
  const handleProceedForInstallation = () => {
    // Navigate to "SearchCustomer" page, passing the relevant data
    navigate("/search-customer", {
      state: {
        // You can pass anything you need in here
        selectedSerialNumber,
        equipmentData,
        pendingInstallationData,
        abnormalCondition,
        voltageData,
      },
    });
  };

  return (
    <div className="">
      <div className="w-full">
        {/* Header Section */}
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
          <h2 className="text-xl font-bold">Equipment Details</h2>
        </div>

        <div className="mb-4 px-4">
          {/* Search Section */}
          <div className="mb-4">
            <label htmlFor="serialNumber" className="block text-sm font-medium">
              Search & Select Serial Number
            </label>
            {loadingSerialNumbers ? (
              <p>Loading serial numbers...</p>
            ) : (
              <Autocomplete
                id="serialNumber"
                options={serialNumbers}
                getOptionLabel={(option) => option}
                onChange={(event, newValue) => setSelectedSerialNumber(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className="mt-1 block w-full"
                    label="Serial Number"
                  />
                )}
              />
            )}
            <button className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2">
              Scan Barcode
            </button>
          </div>

          {/* Equipment & Pending Installation Details */}
          <div className="mb-4 space-y-2 border border-gray-200 p-3 rounded">
            <p>
              <strong>Serial Number:</strong>{" "}
              {equipmentData?.serialnumber ||
                pendingInstallationData?.serialnumber ||
                "N/A"}
            </p>
            <p>
              <strong>Equipment Name:</strong> {equipmentData?.name || "N/A"}
            </p>
            <p>
              <strong>Equipment ID:</strong> {equipmentData?.equipmentid || "N/A"}
            </p>
            <p>
              <strong>PAL Number (Equip.):</strong> {equipmentData?.palnumber || "N/A"}
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
              <strong>Invoice Date:</strong>{" "}
              {pendingInstallationData?.invoicedate || "N/A"}
            </p>
            <p>
              <strong>Description (Install):</strong>{" "}
              {pendingInstallationData?.description || "N/A"}
            </p>
            <p>
              <strong>Status (Pending):</strong>{" "}
              {pendingInstallationData?.status || "N/A"}
            </p>
          </div>

          {/* Abnormal Site Condition */}
          <div className="mb-4">
            <label className="block font-medium">Abnormal Site Condition:</label>
            <input
              type="text"
              placeholder="Enter abnormal condition details..."
              value={abnormalCondition}
              onChange={(e) => setAbnormalCondition(e.target.value)}
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 
                border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Voltage Section */}
          <div className="mb-4">
            <p className="font-medium">Enter Voltage:</p>
            <input
              type="text"
              placeholder="L-N / R-Y"
              value={voltageData.lnry}
              onChange={(e) =>
                setVoltageData({ ...voltageData, lnry: e.target.value })
              }
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 
                border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="L-G / Y-B"
              value={voltageData.lgyb}
              onChange={(e) =>
                setVoltageData({ ...voltageData, lgyb: e.target.value })
              }
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 
                border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="N-G / B-R"
              value={voltageData.ngbr}
              onChange={(e) =>
                setVoltageData({ ...voltageData, ngbr: e.target.value })
              }
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 
                border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              className="flex-1 px-4 py-2 text-white bg-primary rounded-lg 
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleProceedForInstallation}
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Installation;
