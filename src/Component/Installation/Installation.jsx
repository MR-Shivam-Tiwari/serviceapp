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

  // Fetch all serial numbers
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

  // Fetch detailed data whenever a new serial number is selected
  useEffect(() => {
    const fetchEquipmentDetails = async (serial) => {
      try {
        // Adjust this URL if needed to match your backend route
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
            <div className="mb-4">
              <label
                htmlFor="serialNumber"
                className="block text-sm font-medium"
              >
                Search & Select Serial Number
              </label>
              {loadingSerialNumbers ? (
                <p>Loading serial numbers...</p>
              ) : (
                <Autocomplete
                  id="serialNumber"
                  options={serialNumbers}
                  getOptionLabel={(option) => option}
                  onChange={(event, newValue) =>
                    setSelectedSerialNumber(newValue)
                  }
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
            </div>
            <button className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Scan Barcode
            </button>
          </div>

          {/* Equipment & Pending Installation Details */}
          <div className="mb-4 space-y-2">
            {/* Show either equipmentData or pendingInstallationData fields (or both) */}
            <p>
              <strong>Serial Number:</strong>{" "}
              {equipmentData?.serialnumber ||
                pendingInstallationData?.serialnumber ||
                "serialnumber"}
            </p>

            {/* Fields from equipmentData */}
            <p>
              <strong>Equipment Name:</strong> {equipmentData?.name || "N/A"}
            </p>

            <p>
              <strong>Equipment ID:</strong>{" "}
              {equipmentData?.equipmentid || "N/A"}
            </p>

            <p>
              <strong>PAL Number (Equipment):</strong>{" "}
              {equipmentData?.palnumber || "N/A"}
            </p>

            <p>
              <strong>Material Description:</strong>{" "}
              {equipmentData?.materialdescription || "N/A"}
            </p>
            {/* Fields from pendingInstallationData */}
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

          {/* Voltage Section */}
          <div className="mb-4">
            <p>Abnormal Site Condition:</p>
            <p>Enter Voltage:</p>
            <input
              type="text"
              placeholder="L-N/R-Y"
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="L-G/Y-B"
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="N-G/B-R"
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Proceed for Installation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Installation;
