import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
import CircularProgress from "@mui/joy/CircularProgress";

const EquipmentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [equipmentSerials, setEquipmentSerials] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [sparesData, setSparesData] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false); // New state for details loading
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Fetch equipment serial numbers from the API
  useEffect(() => {
    const fetchEquipmentSerials = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/allequipment/serialnumbers`
        );
        if (!response.ok)
          throw new Error("Failed to fetch equipment serial numbers");
        const data = await response.json();
        setEquipmentSerials(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentSerials();
  }, []);

  // Fetch combined details for the selected equipment using its serial number
  const fetchEquipmentDetails = async (serialNumber) => {
    setDetailsLoading(true); // Start details loading
    setError("");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/equipment-details/${serialNumber}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch equipment details: ${errorText}`);
      }

      const data = await response.json();
      setEquipmentDetails(data);

      // Fetch spares if materialcode exists
      if (data?.equipment?.materialcode) {
        try {
          const sparesResponse = await fetch(
            `${process.env.REACT_APP_BASE_URL}/collections/search/${data.equipment.materialcode}`
          );

          if (!sparesResponse.ok) {
            const errorText = await sparesResponse.text();
            throw new Error(`${errorText}`);
          }

          const spares = await sparesResponse.json();
          setSparesData(spares);
        } catch (sparesErr) {
          setError(sparesErr.message);
          setSparesData([]);
        }
      } else {
        setSparesData([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false); // End details loading
    }
  };

  // If a serial number is passed via location state, pre-select it and fetch details.
  useEffect(() => {
    if (location.state && location.state.serialNumber) {
      setSelectedSerial(location.state.serialNumber);
      fetchEquipmentDetails(location.state.serialNumber);
    }
  }, [location.state]);

  const handleEquipmentChange = (event, newValue) => {
    if (newValue) {
      setSelectedSerial(newValue);
      setActiveTab(null);
      fetchEquipmentDetails(newValue);
    } else {
      setSelectedSerial(null);
      setEquipmentDetails(null);
      setSparesData([]);
      setActiveTab(null);
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
          options={equipmentSerials}
          getOptionLabel={(option) => option}
          value={selectedSerial || ""}
          loading={loading}
          onChange={handleEquipmentChange}
          placeholder="Search and Select serial number"
          noOptionsText={loading ? "Loading..." : "No Equipment Found"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search & Select Serial No"
              variant="outlined"
            />
          )}
        />

        {/* Equipment Details */}
        {error && <p className="text-red-500 mt-1">{error}</p>}

        {detailsLoading ? (
          <div className="flex justify-center mt-4">
            <span className="loader"></span>
          </div>
        ) : equipmentDetails ? (
          <div className="my-4 space-y-6 text-sm text-gray-800">
            {/* Equipment Details */}
            <div>
              <h3 className="font-bold mb-2">Equipment Details</h3>
              <p>Name: {equipmentDetails.equipment?.name || "N/A"}</p>
              <p>
                Part No: {equipmentDetails.equipment?.materialcode || "N/A"}
              </p>
              <p>
                Description:{" "}
                {equipmentDetails.equipment?.materialdescription || "N/A"}
              </p>
              <p>
                Warranty Start:{" "}
                {equipmentDetails.equipment?.custWarrantystartdate
                  ? new Date(
                      equipmentDetails.equipment.custWarrantystartdate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                Warranty End:{" "}
                {equipmentDetails.equipment?.custWarrantyenddate
                  ? new Date(
                      equipmentDetails.equipment.custWarrantyenddate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* AMC Contract Details */}
            <div>
              <h3 className="font-bold mb-2">AMC Contract</h3>
              <p>
                AMC Start:{" "}
                {equipmentDetails.amcContract?.startdate
                  ? new Date(
                      equipmentDetails.amcContract.startdate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                AMC End:{" "}
                {equipmentDetails.amcContract?.enddate
                  ? new Date(
                      equipmentDetails.amcContract.enddate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="font-bold mb-2">Customer Details</h3>
              <p>
                Customer Code:{" "}
                {equipmentDetails.equipment?.currentcustomer || "N/A"}
              </p>
              <p>
                Hospital Name:{" "}
                {equipmentDetails.customer?.hospitalname || "N/A"}
              </p>
              <p>City: {equipmentDetails.customer?.city || "N/A"}</p>
              <p>PinCode: {equipmentDetails.customer?.pincode || "N/A"}</p>
              <p>Telephone: {equipmentDetails.customer?.telephone || "N/A"}</p>
              <p>Email: {equipmentDetails.customer?.email || "N/A"}</p>
            </div>

            {/* Toggle Buttons */}
            <div className="mt-4">
              <button
                onClick={() => setActiveTab("installation")}
                className={`px-4 py-2 my-3 rounded-lg w-full ${
                  activeTab === "installation"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Check Total Installation
              </button>
              <button
                onClick={() => setActiveTab("spares")}
                className={`px-4 py-2 rounded-lg w-full ${
                  activeTab === "spares"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Check Spare Part
              </button>
            </div>

            {/* Conditional Rendering Based on Active Tab */}
            {activeTab === "installation" && (
              <>
                {equipmentDetails.customerEquipments &&
                equipmentDetails.customerEquipments.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">
                      Equipments with Same Customer (Installation Base)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border">Serial No</th>
                            <th className="px-4 py-2 border">Part No</th>
                            <th className="px-4 py-2 border">Product</th>
                          </tr>
                        </thead>
                        <tbody>
                          {equipmentDetails.customerEquipments.map((equip) => (
                            <tr key={equip.serialnumber}>
                              <td className="px-4 py-2 border">
                                {equip.serialnumber}
                              </td>
                              <td className="px-4 py-2 border">
                                {equip.materialcode}
                              </td>
                              <td className="px-4 py-2 border">
                                {equip.materialdescription}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-gray-500">
                    No Installation Base Data Found.
                  </p>
                )}
              </>
            )}

            {activeTab === "spares" && (
              <>
                {sparesData && sparesData.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Spares Base</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border">Serial No</th>
                            <th className="px-4 py-2 border">Part No</th>
                            <th className="px-4 py-2 border">Product</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sparesData.map((spare, index) => (
                            <tr key={index}>
                              <td
                                className="px-4 py-2 border text-blue-600 underline cursor-pointer"
                                onClick={() => {
                                  setModalImage(spare.Image);
                                  setIsImageLoading(true);
                                  setShowModal(true);
                                }}
                              >
                                {selectedSerial}
                              </td>
                              <td className="px-4 py-2 border">
                                {spare.PartNumber}
                              </td>
                              <td className="px-4 py-2 border">
                                {spare.Description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded-lg max-w-full max-h-full overflow-auto relative">
                          <button
                            className="absolute top-1 right-2 text-black font-bold text-2xl"
                            onClick={() => setShowModal(false)}
                          >
                            &times;
                          </button>

                          {/* Loader */}
                          {isImageLoading && (
                            <div className="flex justify-center items-center h-[80vh] w-[90vw]">
                              <div className="flex justify-center mt-4">
                                <span className="loader"></span>
                              </div>
                            </div>
                          )}

                          {/* Image */}
                          <img
                            src={modalImage}
                            alt="Spare Part"
                            className={`max-w-[90vw] max-h-[80vh] object-contain transition-opacity duration-300 ${
                              isImageLoading ? "opacity-0" : "opacity-100"
                            }`}
                            onLoad={() => setIsImageLoading(false)}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-6 text-gray-500">No Spare Data Found.</p>
                )}
              </>
            )}
          </div>
        ) : (
          !detailsLoading && (
            <p className="text-gray-500 my-2">
              Select a serial number to see details.
            </p>
          )
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between my-6 px-4">
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
