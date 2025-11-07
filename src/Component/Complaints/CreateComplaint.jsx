import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Autocomplete, Checkbox, TextField } from "@mui/joy";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const CreateComplaint = () => {
  const navigate = useNavigate();

  // State hooks to manage select options
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  const [problemNames, setProblemNames] = useState([]);

  // Additional state for selected values
  const [selectedSerialNumber, setSelectedSerialNumber] = useState("");
  const [selectedComplaintType, setSelectedComplaintType] = useState("");
  const [selectedProductGroup, setSelectedProductGroup] = useState("");
  const [selectedProblemType, setSelectedProblemType] = useState("");
  const [selectedProblemName, setSelectedProblemName] = useState("");
  const [breakDown, setBreakDown] = useState(false);
  const [remarks, setRemarks] = useState("");

  // New states for spare parts autocomplete and equipment details
  const [spareOptions, setSpareOptions] = useState([]);
  const [selectedSpare, setSelectedSpare] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [AmcDateDetails, setAmcDateDetails] = useState(null);
  const [CustomerDetails, setCustomerDetails] = useState(null);
  const [otherSpareText, setOtherSpareText] = useState("");

  // Loading states
  const [loadingSerialNumbers, setLoadingSerialNumbers] = useState(false);
  const [loadingComplaintTypes, setLoadingComplaintTypes] = useState(true);
  const [loadingProductGroups, setLoadingProductGroups] = useState(true);
  const [loadingProblemTypes, setLoadingProblemTypes] = useState(true);
  const [loadingProblemNames, setLoadingProblemNames] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Search functionality states
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Validation states
  const [errors, setErrors] = useState({
    serialNumber: false,
    complaintType: false,
    productGroup: false,
    problemType: false,
    problemName: false,
  });

  // Modal state
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  // Keyboard and viewport handling
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Safe area insets for mobile devices
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 20, // Default bottom padding for navigation
  });

  const [userInfo, setUserInfo] = useState({});

  // Handle keyboard visibility and viewport changes
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const originalHeight = window.screen.height;

      // If height reduced significantly, keyboard is likely open
      if (currentHeight < originalHeight * 0.75) {
        setKeyboardVisible(true);
      } else {
        setKeyboardVisible(false);
      }
      setViewportHeight(currentHeight);
    };

    // Detect safe area insets for mobile
    const detectSafeArea = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isIOS) {
        // iOS safe area
        setSafeAreaInsets({
          top: 44, // Status bar
          bottom: 34, // Home indicator
        });
      } else if (isAndroid) {
        // Android navigation bar
        setSafeAreaInsets({
          top: 24, // Status bar
          bottom: 48, // Navigation bar
        });
      } else {
        // Desktop/Web
        setSafeAreaInsets({
          top: 0,
          bottom: 20,
        });
      }
    };

    detectSafeArea();

    // Listen for viewport changes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // For mobile browsers, also listen to visual viewport API if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserInfo({
          id: userData.id || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          mobilenumber: userData.mobilenumber || "",
          status: userData.status || "",
          branch: userData.branch || "",
          loginexpirydate: userData.loginexpirydate || "",
          employeeid: userData.employeeid || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          department: userData.department || "",
          profileimage: userData.profileimage || "",
          deviceid: userData.deviceid || "",
          deviceregistereddate: userData.deviceregistereddate || "",
          usertype: userData.usertype || "",
          manageremail: userData.manageremail || "",
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerId || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  console.log("manageremail", userInfo.manageremail);

  // Enhanced fetch serial numbers with search and pagination
  const fetchSerialNumbers = async (search = "") => {
    setLoadingSerialNumbers(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) {
        queryParams.append("search", search.trim());
      }
      queryParams.append("limit", "100");

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/allequipment/serialnumbers?${queryParams}`
      );

      const data = response.data;
      const rawSerials = data.serialNumbers || data || [];
      const serialNumbers = rawSerials.filter((sn) => sn && sn.trim() !== "");

      setSerialNumbers(serialNumbers);
    } catch (err) {
      setError(err.message || "Failed to fetch equipment serial numbers");
      setSerialNumbers([]);
    } finally {
      setLoadingSerialNumbers(false);
    }
  };

  // Initial load - fetch all serial numbers
  useEffect(() => {
    fetchSerialNumbers();
  }, []);

  // Debounced search effect - Only trigger after 5 characters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 5 && searchTerm !== selectedSerialNumber) {
        fetchSerialNumbers(searchTerm);
      } else if (searchTerm.length === 0) {
        // Reset to initial load when search is cleared
        fetchSerialNumbers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSerialNumber]);

  const fetchComplaintTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/complainttype`
      );
      if (Array.isArray(response.data.complaints)) {
        setComplaintTypes(response.data.complaints);
      } else {
        console.error("Error: complaintTypes is not an array", response.data);
      }
    } catch (error) {
      console.error("Error fetching complaint types:", error);
    } finally {
      setLoadingComplaintTypes(false);
    }
  };

  const fetchProductGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/productgroupall`
      );
      if (Array.isArray(response.data.productGroups)) {
        setProductGroups(response.data.productGroups);
      } else {
        console.error("Error: productGroups is not an array", response.data);
      }
    } catch (error) {
      console.error("Error fetching product groups:", error);
    } finally {
      setLoadingProductGroups(false);
    }
  };

  const fetchProblemTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/problemtype`
      );
      if (Array.isArray(response.data.problemtypes)) {
        setProblemTypes(response.data.problemtypes);
      } else {
        console.error("Error: problemTypes is not an array", response.data);
        setProblemTypes([]);
      }
    } catch (error) {
      console.error("Error fetching problem types:", error);
      setProblemTypes([]);
    } finally {
      setLoadingProblemTypes(false);
    }
  };

  const fetchProblemNames = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/problemname`
      );
      if (Array.isArray(response.data.problemnames)) {
        setProblemNames(response.data.problemnames);
      } else {
        console.error("Error: problemNames is not an array", response.data);
        setProblemNames([]);
      }
    } catch (error) {
      console.error("Error fetching problem names:", error);
      setProblemNames([]);
    } finally {
      setLoadingProblemNames(false);
    }
  };

  // Fetch equipment details when a serial number is selected
  useEffect(() => {
    if (selectedSerialNumber) {
      axios
        .get(
          `${process.env.REACT_APP_BASE_URL}/collections/equipment-details/${selectedSerialNumber}`
        )
        .then((response) => {
          // Updated to handle the new API response structure with nested data object
          setEquipmentDetails(response.data?.data?.equipment || null);
          setAmcDateDetails(response.data?.data?.amcContract || null);
          setCustomerDetails(response.data?.data?.customer || null);
        })
        .catch((error) => {
          console.error("Error fetching equipment details:", error);
          setEquipmentDetails(null);
          setAmcDateDetails(null);
          setCustomerDetails(null);
        });
    }
  }, [selectedSerialNumber]);

  // Fetch spare parts using the material code from equipment details
  useEffect(() => {
    if (equipmentDetails && equipmentDetails.materialcode) {
      axios
        .get(
          `${process.env.REACT_APP_BASE_URL}/collections/search/${equipmentDetails.materialcode}`
        )
        .then((response) => {
          setSpareOptions(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching spare parts:", error);
          setSpareOptions([]);
        });
    } else {
      setSpareOptions([]);
    }
  }, [equipmentDetails]);

  // useEffect to fetch all data on component mount
  useEffect(() => {
    fetchComplaintTypes();
    fetchProductGroups();
    fetchProblemTypes();
    fetchProblemNames();
  }, []);

  // Handle equipment selection
  const handleEquipmentChange = (event, newValue) => {
    if (newValue) {
      setSelectedSerialNumber(newValue);
      setSearchTerm(newValue);
      setEquipmentDetails(null);
      setSpareOptions([]);
      setAmcDateDetails(null);
      setCustomerDetails(null);
      setErrors({ ...errors, serialNumber: false });
    } else {
      setSelectedSerialNumber("");
      setSearchTerm("");
      setEquipmentDetails(null);
      setSpareOptions([]);
      setAmcDateDetails(null);
      setCustomerDetails(null);
    }
  };

  // Handle input change for search
  const handleInputChange = (event, newInputValue) => {
    setSearchTerm(newInputValue);
  };

  const validateForm = () => {
    const newErrors = {
      serialNumber: !selectedSerialNumber,
      complaintType: !selectedComplaintType,
      productGroup: !selectedProductGroup,
      problemType: !selectedProblemType,
      problemName: !selectedProblemName,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoadingSubmit(true);

    const complaintData = {
      serialnumber: selectedSerialNumber,
      notificationtype: selectedComplaintType,
      productgroup: selectedProductGroup,
      problemtype: selectedProblemType,
      problemname: selectedProblemName,
     sparesrequested: selectedSpare
  ? selectedSpare.PartNumber === "Others"
    ? otherSpareText
    : `${selectedSpare.PartNumber} - ${selectedSpare.Description}`
  : "",
      breakdown: breakDown,
      remark: remarks,
      user: {
        firstName: userInfo.firstname || "",
        lastName: userInfo.lastname || "",
        email: userInfo.email || "",
        usertype: userInfo.usertype || "",
        mobilenumber: userInfo.mobilenumber || "",
        dealerEmail: userInfo?.dealerEmail || "",
        branch: userInfo.branch || [],
        manageremail: userInfo.manageremail || [],
      },
    };

    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/sendComplaintEmail`,
        complaintData
      )
      .then((response) => {
        setOpenSuccessModal(true);
        setLoadingSubmit(false);
      })
      .catch((error) => {
        console.error("Error creating complaint:", error);
        setLoadingSubmit(false);
      });
  };

  const handleCloseModal = () => {
    setOpenSuccessModal(false);
    // Clear form after modal close
    setSelectedSerialNumber("");
    setSearchTerm("");
    setSelectedComplaintType("");
    setSelectedProductGroup("");
    setSelectedProblemType("");
    setSelectedProblemName("");
    setSelectedSpare(null);
    setBreakDown(false);
    setRemarks("");
    setOtherSpareText("");
    setEquipmentDetails(null);
    setSpareOptions([]);
    setAmcDateDetails(null);
    setCustomerDetails(null);
    // Reset errors
    setErrors({
      serialNumber: false,
      complaintType: false,
      productGroup: false,
      problemType: false,
      problemName: false,
    });
  };

  return (
    <div
      className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50"
      style={{
        height: keyboardVisible ? `${viewportHeight}px` : "100vh",
        maxHeight: keyboardVisible ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* Enhanced Header - Keep original styling */}
      <div
        className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg"
      // style={{ paddingTop: `${safeAreaInsets.top}px` }}
      >
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/complaints")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              Create New Complaint
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: keyboardVisible
            ? "10px"
            : `${120 + safeAreaInsets.bottom}px`,
        }}
      >
        <div className="max-w-4xl mx-auto p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Enhanced Serial Number Selection Card with Search */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-fade-in-up">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Search Equipment
                </h3>
              </div>

              <div className="relative">
                <Autocomplete
                  options={serialNumbers}
                  getOptionLabel={(option) => option}
                  value={selectedSerialNumber || ""}
                  inputValue={searchTerm}
                  loading={loadingSerialNumbers}
                  onChange={handleEquipmentChange}
                  onInputChange={handleInputChange}
                  placeholder="Type at least 5 characters to search..."
                  noOptionsText={
                    loadingSerialNumbers
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
                      error={errors.serialNumber}
                      helperText={
                        errors.serialNumber
                          ? "This field is required"
                          : searchTerm.length < 5 && searchTerm.length > 0
                            ? `Type ${5 - searchTerm.length
                            } more character(s) to search`
                            : serialNumbers.length === 100
                              ? "Showing first 100 results. Type to search for specific serial numbers."
                              : `Found ${serialNumbers.length} equipment(s)`
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

            {/* Equipment Details Card */}
            {(equipmentDetails ||
              (AmcDateDetails && Object.keys(AmcDateDetails).length > 0) ||
              (CustomerDetails && Object.keys(CustomerDetails).length > 0)) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <h3 className="text-xs font-semibold text-gray-600 mb-3">
                    Equipment Information
                  </h3>

                  <div className="space-y-3">
                    {/* Equipment Details */}
                    {equipmentDetails && (
                      <div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400 text-[10px] mb-0.5">Serial Number</p>
                            <p className="text-gray-800 font-medium">{equipmentDetails.serialnumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] mb-0.5">Part No</p>
                            <p className="text-gray-800 font-medium">{equipmentDetails.materialcode}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-400 text-[10px] mb-0.5">Description</p>
                            <p className="text-gray-800 font-medium">{equipmentDetails.materialdescription}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] mb-0.5">Customer ID</p>
                            <p className="text-gray-800 font-medium">{equipmentDetails.currentcustomer}</p>
                          </div>
                          {equipmentDetails.custWarrantystartdate && equipmentDetails.custWarrantyenddate && (
                            <div>
                              <p className="text-gray-400 text-[10px] mb-0.5">Warranty Period</p>
                              <p className="text-gray-800 font-medium">
                                {new Date(equipmentDetails.custWarrantystartdate).toLocaleDateString("en-GB")} - {new Date(equipmentDetails.custWarrantyenddate).toLocaleDateString("en-GB")}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* AMC & Customer inline */}
                        {((AmcDateDetails && Object.keys(AmcDateDetails).length > 0) || (CustomerDetails && Object.keys(CustomerDetails).length > 0)) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {/* AMC Details */}
                              {AmcDateDetails && Object.keys(AmcDateDetails).length > 0 && AmcDateDetails.startdate && AmcDateDetails.enddate && (
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">AMC Period</p>
                                  <p className="text-gray-800 font-medium">
                                    {new Date(AmcDateDetails.startdate).toLocaleDateString("en-GB")} - {new Date(AmcDateDetails.enddate).toLocaleDateString("en-GB")}
                                  </p>
                                </div>
                              )}

                              {/* Customer Name */}
                              {CustomerDetails && CustomerDetails.customername && (
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">Customer</p>
                                  <p className="text-gray-800 font-medium">{CustomerDetails.customername}</p>
                                </div>
                              )}

                              {/* City */}
                              {CustomerDetails && CustomerDetails.city && (
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">City</p>
                                  <p className="text-gray-800 font-medium">{CustomerDetails.city}</p>
                                </div>
                              )}

                              {/* Phone */}
                              {CustomerDetails && CustomerDetails.telephone && (
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">Phone</p>
                                  <p className="text-gray-800 font-medium">{CustomerDetails.telephone}</p>
                                </div>
                              )}

                              {/* Email */}
                              {CustomerDetails && CustomerDetails.email && (
                                <div className="col-span-2">
                                  <p className="text-gray-400 text-[10px] mb-0.5">Email</p>
                                  <p className="text-gray-800 font-medium truncate" title={CustomerDetails.email}>
                                    {CustomerDetails.email}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Complaint Details Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Complaint Details
                </h3>
              </div>
              <div className="p-3 space-y-6">
                {/* Complaint Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Choose Complaint Type
                  </label>
                  {loadingComplaintTypes ? (
                    <div className="flex items-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-600">
                        Loading complaint types...
                      </span>
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${errors.complaintType
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                        }`}
                      onChange={(e) => {
                        setSelectedComplaintType(e.target.value);
                        setErrors({ ...errors, complaintType: false });
                      }}
                      value={selectedComplaintType}
                    >
                      <option value="">Please select...</option>
                      {complaintTypes.map((type, index) => (
                        <option key={index} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.complaintType && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                {/* Product Group */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Group
                  </label>
                  {loadingProductGroups ? (
                    <div className="flex items-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-600">
                        Loading product groups...
                      </span>
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${errors.productGroup
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                        }`}
                      onChange={(e) => {
                        setSelectedProductGroup(e.target.value);
                        setErrors({ ...errors, productGroup: false });
                      }}
                      value={selectedProductGroup}
                    >
                      <option value="">Please select...</option>
                      {Array.isArray(productGroups) &&
                        productGroups.map((group) => (
                          <option key={group._id} value={group.name}>
                            {group.name}
                          </option>
                        ))}
                    </select>
                  )}
                  {errors.productGroup && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                {/* Problem Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Problem Type
                  </label>
                  {loadingProblemTypes ? (
                    <div className="flex items-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-600">
                        Loading problem types...
                      </span>
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${errors.problemType
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                        }`}
                      onChange={(e) => {
                        setSelectedProblemType(e.target.value);
                        setErrors({ ...errors, problemType: false });
                      }}
                      value={selectedProblemType}
                    >
                      <option value="">Please select...</option>
                      {problemTypes.map((type) => (
                        <option key={type._id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.problemType && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                {/* Problem Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Problem Name
                  </label>
                  {loadingProblemNames ? (
                    <div className="flex items-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-600">
                        Loading problem names...
                      </span>
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${errors.problemName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                        }`}
                      onChange={(e) => {
                        setSelectedProblemName(e.target.value);
                        setErrors({ ...errors, problemName: false });
                      }}
                      value={selectedProblemName}
                    >
                      <option value="">Please select...</option>
                      {problemNames.map((name) => (
                        <option key={name._id} value={name.name}>
                          {name.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.problemName && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Spares Requested
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Search and select required spare parts or choose "Others" to enter manually
                  </p>
                  <Autocomplete
                    id="spareRequested"
                    options={[...spareOptions, { PartNumber: 'Others', Description: 'Enter custom spare part' }]}
                    getOptionLabel={(option) => {
                      if (option.PartNumber === 'Others') return 'Others';
                      return `${option.PartNumber} - ${option.Description}` || "";
                    }}
                    onChange={(event, newValue) => {
                      setSelectedSpare(newValue);
                      if (newValue?.PartNumber !== 'Others') {
                        setOtherSpareText("");
                      }
                    }}
                    value={selectedSpare}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        className="mt-1 block w-full"
                        label="Select Spare Part"
                      />
                    )}
                  />

                  {/* Show text input when "Others" is selected */}
                  {selectedSpare?.PartNumber === 'Others' && (
                    <div className="mt-3 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Enter Spare Part Details
                      </label>
                      <input
                        type="text"
                        value={otherSpareText}
                        onChange={(e) => setOtherSpareText(e.target.value)}
                        placeholder="Enter spare part number and description"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500">
                        Enter the spare part details (e.g., "ABC123 - Motor Assembly")
                      </p>
                    </div>
                  )}
                </div>

                {/* Breakdown Checkbox */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Checkbox
                    checked={breakDown}
                    onChange={() => setBreakDown(!breakDown)}
                  />
                  <div>
                    <label className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Equipment Breakdown
                    </label>
                    <p className="text-xs text-gray-500">
                      Check if this is a breakdown situation
                    </p>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Additional Remarks
                  </label>
                  <textarea
                    value={remarks}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => setRemarks(e.target.value)}
                    maxLength={400}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Provide additional details about the complaint..."
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Provide any additional information that might help resolve
                      the issue
                    </p>
                    <p
                      className={`text-xs font-medium ${remarks.length > 350 ? "text-red-500" : "text-gray-500"
                        }`}
                    >
                      {remarks.length}/400
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Fixed Footer with Submit Button - Above navigation bar */}
      {!keyboardVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
          style={{
            paddingBottom: `${safeAreaInsets.bottom + 0}px`, // Add extra padding above navigation
          }}
        >
          <div className="p-3 pb-0">
            <button
              type="submit"
              onClick={handleSubmit}
              className={`px-8 py-4 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-center font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${loadingSubmit ? "cursor-wait opacity-75 transform-none" : ""
                }`}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <div className="flex items-center space-x-3 justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Complaint...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle size={20} />
                  <span>Submit Complaint</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Success Modal */}
      {/* Success Modal */}
      {openSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Success!</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Your complaint request has been created successfully. You will receive complaint number through email.
              </p>
              <button
                className="w-full bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={handleCloseModal}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
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

export default CreateComplaint;
