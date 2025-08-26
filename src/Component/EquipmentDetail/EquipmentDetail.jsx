import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
import CircularProgress from "@mui/joy/CircularProgress";
import { ArrowLeft } from "lucide-react";

const EquipmentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [equipmentSerials, setEquipmentSerials] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [sparesData, setSparesData] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch equipment serial numbers with search and pagination
  const fetchEquipmentSerials = async (search = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) {
        queryParams.append("search", search.trim());
      }
      queryParams.append("limit", "100");

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/allequipment/serialnumbers?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch equipment serial numbers");
      }

      const data = await response.json();
      const rawSerials = data.serialNumbers || data || [];
      const serialNumbers = rawSerials.filter((sn) => sn && sn.trim() !== "");

      setEquipmentSerials(serialNumbers);
    } catch (err) {
      setError(err.message);
      setEquipmentSerials([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch all serial numbers
  useEffect(() => {
    fetchEquipmentSerials();
  }, []);

  // Debounced search effect - Only trigger after 5 characters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 5 && searchTerm !== selectedSerial) {
        fetchEquipmentSerials(searchTerm);
      } else if (searchTerm.length === 0) {
        // Reset to initial load when search is cleared
        fetchEquipmentSerials();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSerial]);

  // Fetch combined details for the selected equipment using its serial number
  const fetchEquipmentDetails = async (serialNumber) => {
    setDetailsLoading(true);
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
      setDetailsLoading(false);
    }
  };

  // If a serial number is passed via location state, pre-select it and fetch details
  useEffect(() => {
    if (location.state && location.state.serialNumber) {
      setSelectedSerial(location.state.serialNumber);
      setSearchTerm(location.state.serialNumber);
      fetchEquipmentDetails(location.state.serialNumber);
    }
  }, [location.state]);

  const handleEquipmentChange = (event, newValue) => {
    if (newValue) {
      setSelectedSerial(newValue);
      setSearchTerm(newValue);
      setActiveTab(null);
      fetchEquipmentDetails(newValue);
    } else {
      setSelectedSerial(null);
      setSearchTerm("");
      setEquipmentDetails(null);
      setSparesData([]);
      setActiveTab(null);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setSearchTerm(newInputValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg sticky top-0 z-40">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Equipment Details</h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-3 pb-24">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-4 animate-fade-in-up">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Search Equipment
              </h3>
            </div>

            <div className="relative">
              <Autocomplete
                options={equipmentSerials}
                getOptionLabel={(option) => option}
                value={selectedSerial || ""}
                inputValue={searchTerm}
                loading={loading}
                onChange={handleEquipmentChange}
                onInputChange={handleInputChange}
                placeholder="Type at least 5 characters to search..."
                noOptionsText={
                  loading
                    ? "Searching..."
                    : searchTerm.length < 5
                    ? "Type at least 5 characters to search"
                    : "No equipment found"
                }
                filterOptions={(options) => options}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search & Select Serial No"
                    variant="outlined"
                    helperText={
                      searchTerm.length < 5 && searchTerm.length > 0
                        ? `Type ${5 - searchTerm.length} more character(s) to search`
                        : equipmentSerials.length === 100
                        ? "Showing first 100 results. Type to search for specific serial numbers."
                        : `Found ${equipmentSerials.length} equipment(s)`
                    }
                  />
                )}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
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
            )}
          </div>

          {/* Loading State */}
          {detailsLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading equipment details...
              </p>
            </div>
          )}

          {/* Equipment Details */}
          {equipmentDetails && !detailsLoading && (
            <div className="space-y-8">
              {/* Equipment Information Cards */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Equipment Details Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Equipment Details
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Part Number
                        </p>
                        <p className="font-semibold text-gray-800">
                          {equipmentDetails.equipment?.materialcode || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Description
                        </p>
                        <p className="font-semibold text-gray-800">
                          {equipmentDetails.equipment?.materialdescription ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warranty & AMC Section */}
                  <div className="">
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-black flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
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
                        Warranty & AMC
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                          <div>
                            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">
                              Warranty Start
                            </p>
                            <p className="font-bold text-orange-800">
                              {equipmentDetails.equipment?.custWarrantystartdate
                                ? new Date(
                                    equipmentDetails.equipment.custWarrantystartdate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                          <div>
                            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">
                              Warranty End
                            </p>
                            <p className="font-bold text-orange-800">
                              {equipmentDetails.equipment?.custWarrantyenddate
                                ? new Date(
                                    equipmentDetails.equipment.custWarrantyenddate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              AMC Start
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.amcContract?.startdate
                                ? new Date(
                                    equipmentDetails.amcContract.startdate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              AMC End
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.amcContract?.enddate
                                ? new Date(
                                    equipmentDetails.amcContract.enddate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                            Dealer Warranty Start Date
                          </p>
                          <p className="font-bold text-purple-800">
                            {equipmentDetails.equipment?.dealerwarrantystartdate
                              ? new Date(
                                  equipmentDetails.equipment.dealerwarrantystartdate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                            Dealer Warranty End Date
                          </p>
                          <p className="font-bold text-purple-800">
                            {equipmentDetails.equipment?.dealerwarrantyenddate
                              ? new Date(
                                  equipmentDetails.equipment.dealerwarrantyenddate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div className="">
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-black flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                          />
                        </svg>
                        Customer Information
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center p-3 bg-teal-50 rounded-xl border border-teal-200">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">
                              Customer Code
                            </p>
                            <p className="font-bold text-teal-800">
                              {equipmentDetails.equipment?.currentcustomer ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Hospital Name
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.hospitalname || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              City
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.city || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Pin Code
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.pincode || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Telephone
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.telephone || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Email
                            </p>
                            <p className="font-semibold text-gray-800 break-all">
                              {equipmentDetails.customer?.email || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up animation-delay-600">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("installation")}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === "installation"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-gray-200 border border-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                        />
                      </svg>
                      <span>Installation Base</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("spares")}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === "spares"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                        : "bg-gray-100 border border-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Spare Parts</span>
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-3">
                  {activeTab === "installation" && (
                    <>
                      {equipmentDetails.customerEquipments &&
                      equipmentDetails.customerEquipments.length > 0 ? (
                        <div>
                          <div className="flex items-center mb-4">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              Installation Base Equipment
                            </h4>
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Serial No
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Part No
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {equipmentDetails.customerEquipments.map(
                                  (equip, index) => (
                                    <tr
                                      key={equip.serialnumber}
                                      className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {equip.serialnumber}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {equip.materialcode}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        {equip.materialdescription}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500">
                            No Installation Base Data Found.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "spares" && (
                    <>
                      {sparesData && sparesData.length > 0 ? (
                        <div>
                          <div className="flex items-center mb-4">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              Spare Parts Base
                            </h4>
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Serial No
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Part No
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {sparesData.map((spare, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <button
                                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                                        onClick={() => {
                                          setModalImage(spare.Image);
                                          setIsImageLoading(true);
                                          setShowModal(true);
                                        }}
                                      >
                                        {selectedSerial}
                                      </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                      {spare.PartNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                      {spare.Description}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500">No Spare Data Found.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Selection State */}
          {!equipmentDetails && !detailsLoading && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select Equipment
              </h3>
              <p className="text-gray-500">
                Type at least 5 characters or select a serial number from the dropdown to view detailed information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="px-8 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Continue</span>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden relative">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">Spare Part Image</h3>
              <button
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                onClick={() => setShowModal(false)}
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
            <div className="p-6">
              {isImageLoading && (
                <div className="flex justify-center items-center h-96">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
                  </div>
                </div>
              )}
              <img
                src={modalImage || "/placeholder.svg"}
                alt="Spare Part"
                className={`max-w-full max-h-[70vh] object-contain mx-auto rounded-xl transition-opacity duration-300 ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsImageLoading(false)}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EquipmentDetail;
