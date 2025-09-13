import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
import CircularProgress from "@mui/joy/CircularProgress";
import { ArrowLeft } from "lucide-react";
import ShortcutFooter from "../Home/ShortcutFooter";

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
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
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
      // Handle both old and new API response formats
      const processedData = data.data ? data.data : data;
      setEquipmentDetails(processedData);

      // Fetch spares if materialcode exists
      if (processedData?.equipment?.materialcode) {
        try {
          const sparesResponse = await fetch(
            `${process.env.REACT_APP_BASE_URL}/collections/search/${processedData.equipment.materialcode}`
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

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
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
      <div className="flex-1 overflow-y-auto py-16">
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
                        ? `Type ${
                            5 - searchTerm.length
                          } more character(s) to search`
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
                          Serial Number
                        </p>
                        <p className="font-semibold text-gray-800">
                          {equipmentDetails.equipment?.serialnumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Material Code
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
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Equipment Name
                        </p>
                        <p className="font-semibold text-gray-800">
                          {equipmentDetails.equipment?.name || "N/A"}
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
                        Warranty & AMC Details
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                          <div>
                            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">
                              Customer Warranty Start
                            </p>
                            <p className="font-bold text-orange-800">
                              {formatDate(
                                equipmentDetails.equipment
                                  ?.custWarrantystartdate
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                          <div>
                            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">
                              Customer Warranty End
                            </p>
                            <p className="font-bold text-orange-800">
                              {formatDate(
                                equipmentDetails.equipment?.custWarrantyenddate
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                              Dealer Warranty Start
                            </p>
                            <p className="font-bold text-purple-800">
                              {formatDate(
                                equipmentDetails.equipment
                                  ?.dealerwarrantystartdate
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                              Dealer Warranty End
                            </p>
                            <p className="font-bold text-purple-800">
                              {formatDate(
                                equipmentDetails.equipment
                                  ?.dealerwarrantyenddate
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              AMC Start Date
                            </p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(
                                equipmentDetails.amcContract?.startdate
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              AMC End Date
                            </p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(
                                equipmentDetails.amcContract?.enddate
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Customer Information Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up animation-delay-200">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Customer Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid md:grid-cols-1 gap-4">
                      {/* Customer Code */}
                      <div className="flex items-center p-3 bg-teal-50 rounded-xl border border-teal-200">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">
                            Customer Code
                          </p>
                          <p className="font-bold text-teal-800">
                            {equipmentDetails.customer?.customercodeid ||
                              equipmentDetails.equipment?.currentcustomer ||
                              "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Customer Name
                          </p>
                          <p className="font-semibold text-gray-800">
                            {equipmentDetails.customer?.customername || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Hospital Name */}
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Hospital Name
                          </p>
                          <p className="font-semibold text-gray-800">
                            {equipmentDetails.customer?.hospitalname || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
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
                              Postal Code
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.postalcode || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Street Address */}
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Street Address
                          </p>
                          <p className="font-semibold text-gray-800">
                            {equipmentDetails.customer?.street || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* District and State */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              District
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.district || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              State
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.state || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Region and Country */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Region
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.region || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Country
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.country || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                            Telephone
                          </p>
                          <p className="font-bold text-blue-800">
                            {equipmentDetails.customer?.telephone || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Email Address
                          </p>
                          <p className="font-semibold text-gray-800 break-all">
                            {equipmentDetails.customer?.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Tax Information */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                          <div className="flex-1">
                            <p className="text-xs text-yellow-600 uppercase tracking-wide font-medium">
                              PAN Number
                            </p>
                            <p className="font-bold text-yellow-800 font-mono">
                              {equipmentDetails.customer?.taxnumber1 || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div className="flex-1">
                            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">
                              GST Number
                            </p>
                            <p className="font-bold text-green-800 font-mono">
                              {equipmentDetails.customer?.taxnumber2 || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Customer Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Customer Type
                            </p>
                            <p className="font-semibold text-gray-800">
                              {equipmentDetails.customer?.customertype || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Status
                            </p>
                            <p
                              className={`font-semibold ${
                                equipmentDetails.customer?.status === "Active"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {equipmentDetails.customer?.status || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Creation and Modification Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Created At
                            </p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(equipmentDetails.customer?.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Modified At
                            </p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(
                                equipmentDetails.customer?.modifiedAt
                              )}
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
                              Installation Base Equipment (
                              {equipmentDetails.customerEquipments.length})
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
                                    Material Code
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Equipment Name
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product Description
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {equipmentDetails.customerEquipments.map(
                                  (equip, index) => (
                                    <tr
                                      key={equip.serialnumber || index}
                                      className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                        {equip.serialnumber || "N/A"}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                        {equip.materialcode || "N/A"}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {equip.name || "N/A"}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        {equip.materialdescription || "N/A"}
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
                          <p className="text-gray-500 font-medium">
                            No Installation Base Data Found
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            This customer has no other equipment in the
                            installation base.
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
                              Available Spare Parts ({sparesData.length})
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
                                    Part Number
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Description
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Image
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
                                      <span className="text-blue-600 font-semibold">
                                        {selectedSerial}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                      {spare.PartNumber || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                      {spare.Description || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {spare.Image ? (
                                        <button
                                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
                                          onClick={() => {
                                            setModalImage(spare.Image);
                                            setIsImageLoading(true);
                                            setShowModal(true);
                                          }}
                                        >
                                          View Image
                                        </button>
                                      ) : (
                                        <span className="text-gray-400 text-sm">
                                          No Image
                                        </span>
                                      )}
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
                          <p className="text-gray-500 font-medium">
                            No Spare Parts Data Found
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            No spare parts are available for this equipment
                            model.
                          </p>
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
                Select Equipment to View Details
              </h3>
              <p className="text-gray-500">
                Type at least 5 characters or select a serial number from the
                dropdown to view comprehensive equipment information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30">
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
      </div> */}
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
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
