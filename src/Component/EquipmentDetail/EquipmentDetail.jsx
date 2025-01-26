import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";

const EquipmentDetail = () => {
  const navigate = useNavigate();
  const [equipmentIds, setEquipmentIds] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch equipment IDs from the API
  useEffect(() => {
    const fetchEquipmentIds = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5000/installations/equipment-ids"
        );
        if (!response.ok) throw new Error("Failed to fetch equipment IDs");
        const data = await response.json();
        setEquipmentIds(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentIds();
  }, []);

  // Fetch details for the selected equipment
  const fetchEquipmentDetails = async (equipmentId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/installations/${equipmentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch equipment details");
      const data = await response.json();
      setEquipmentDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentChange = (event, newValue) => {
    if (newValue) {
      setSelectedEquipment(newValue);
      fetchEquipmentDetails(newValue.equipmentId);
    } else {
      setSelectedEquipment(null);
      setEquipmentDetails(null);
    }
  };

  return (
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
        <h2 className="text-xl font-bold">Equipment Detail</h2>
      </div>

      <div className="px-4">
        {/* Search Section */}
        <Autocomplete
          options={equipmentIds}
          getOptionLabel={(option) => option.equipmentId}
          loading={loading}
          onChange={handleEquipmentChange}
          noOptionsText={loading ? "Loading..." : "No Equipment Found"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search & Select Equipment ID"
              variant="outlined"
            />
          )}
        />

        {/* Equipment Details */}
        {error && <p className="text-red-500">{error}</p>}
        {equipmentDetails ? (
          <div className="my-4 space-y-2 text-sm text-gray-800">
            <p>Serial No: {equipmentDetails.serialNumber || "N/A"}</p>
            <p>Part No: {equipmentDetails.partNumber || "N/A"}</p>
            <p>Description: {equipmentDetails.description || "N/A"}</p>
            <p>Warranty Start: {equipmentDetails.warrantyStart || "N/A"}</p>
            <p>Warranty End: {equipmentDetails.warrantyEnd || "N/A"}</p>
            <p>Ext Warranty: {equipmentDetails.extWarranty || "N/A"}</p>
            <p>Ext Warranty End: {equipmentDetails.extWarrantyEnd || "N/A"}</p>
            <p>AMC Start: {equipmentDetails.amcStart || "N/A"}</p>
            <p>AMC End: {equipmentDetails.amcEnd || "N/A"}</p>
            <p>Customer: {equipmentDetails.customer?.customerName || "N/A"}</p>
            <p>Name: {equipmentDetails.name || "N/A"}</p>
            <p>City: {equipmentDetails.city || "N/A"}</p>
            <p>PinCode: {equipmentDetails.pinCode || "N/A"}</p>
            <p>Customer No: {equipmentDetails.customer?.telephone || "N/A"}</p>
            <p>Email: {equipmentDetails.customer?.email || "N/A"}</p>
            {/* Render enterVoltage object */}
            <p>Enter Voltage:</p>
            <ul>
              {Object.entries(equipmentDetails.enterVoltage || {}).map(
                ([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                )
              )}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 my-2">
            Select an equipment ID to see details.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6 px-4">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default EquipmentDetail;
