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

  // Loading states
  const [loadingSerialNumbers, setLoadingSerialNumbers] = useState(true);
  const [loadingComplaintTypes, setLoadingComplaintTypes] = useState(true);
  const [loadingProductGroups, setLoadingProductGroups] = useState(true);
  const [loadingProblemTypes, setLoadingProblemTypes] = useState(true);
  const [loadingProblemNames, setLoadingProblemNames] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

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

  const [userInfo, setUserInfo] = useState({});

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
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerId || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch API data functions
  const fetchSerialNumbers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/allequipment/serialnumbers`
      );
      setSerialNumbers(response.data);
    } catch (error) {
      console.error("Error fetching serial numbers:", error);
    } finally {
      setLoadingSerialNumbers(false);
    }
  };

  const fetchComplaintTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/complaint`
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
        `${process.env.REACT_APP_BASE_URL}/collections/productgroup`
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
      if (Array.isArray(response.data.problemtype)) {
        setProblemTypes(response.data.problemtype);
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
      if (Array.isArray(response.data.problemname)) {
        setProblemNames(response.data.problemname);
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
          setEquipmentDetails(response.data.equipment || null);
          setAmcDateDetails(response.data.amcContract || null);
          setCustomerDetails(response.data.customer || null);
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
    fetchSerialNumbers();
    fetchComplaintTypes();
    fetchProductGroups();
    fetchProblemTypes();
    fetchProblemNames();
  }, []);

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
        ? `${selectedSpare.PartNumber} - ${selectedSpare.Description}`
        : "",
      breakdown: breakDown,
      remark: remarks,
      user: {
        firstName: userInfo.firstname || "",
        lastName: userInfo.lastname || "",
        email: userInfo.email || "",
        mobilenumber: userInfo.mobilenumber || "",
        branch: userInfo.branch || [],
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
    setSelectedComplaintType("");
    setSelectedProductGroup("");
    setSelectedProblemType("");
    setSelectedProblemName("");
    setSelectedSpare(null);
    setBreakDown(false);
    setRemarks("");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/complaints")}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Create New Complaint
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Serial Number Selection Card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Search & Select Serial Number
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Start typing to search for equipment serial numbers
                </p>
                {loadingSerialNumbers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">
                      Loading serial numbers...
                    </span>
                  </div>
                ) : (
                  <Autocomplete
                    id="serialNumber"
                    options={serialNumbers}
                    getOptionLabel={(option) => option}
                    onChange={(event, newValue) => {
                      setSelectedSerialNumber(newValue);
                      setEquipmentDetails(null);
                      setSpareOptions([]);
                      setAmcDateDetails(null);
                      setCustomerDetails(null);
                      setErrors({ ...errors, serialNumber: false });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        className="mt-1 block w-full"
                        label="Serial Number"
                        error={errors.serialNumber}
                        helperText={
                          errors.serialNumber ? "This field is required" : ""
                        }
                      />
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Equipment Details Card */}
          {(equipmentDetails || AmcDateDetails || CustomerDetails) && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Equipment Summary
                </h3>
              </div>

              <div className="p-4 grid md:grid-cols-3 gap-4 text-sm text-gray-800">
                {/* Equipment Details */}
                {equipmentDetails && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-600 mb-1">
                      Equipment
                    </h4>
                    <div>
                      <p className="text-gray-500 text-xs">Serial Number</p>
                      <p>{equipmentDetails.serialnumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Part No</p>
                      <p>{equipmentDetails.materialcode}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Description</p>
                      <p>{equipmentDetails.materialdescription}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Current Customer</p>
                      <p>{equipmentDetails.currentcustomer}</p>
                    </div>
                    {equipmentDetails.custWarrantystartdate && (
                      <div>
                        <p className="text-gray-500 text-xs">Warranty Start</p>
                        <p>
                          {new Date(
                            equipmentDetails.custWarrantystartdate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {equipmentDetails.custWarrantyenddate && (
                      <div>
                        <p className="text-gray-500 text-xs">Warranty End</p>
                        <p>
                          {new Date(
                            equipmentDetails.custWarrantyenddate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* AMC Details */}
                {AmcDateDetails && Object.keys(AmcDateDetails).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-600 mb-1">AMC</h4>
                    {AmcDateDetails.startdate && (
                      <div>
                        <p className="text-gray-500 text-xs">Start Date</p>
                        <p>
                          {new Date(
                            AmcDateDetails.startdate
                          ).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    )}
                    {AmcDateDetails.enddate && (
                      <div>
                        <p className="text-gray-500 text-xs">End Date</p>
                        <p>
                          {new Date(AmcDateDetails.enddate).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Details */}
                {CustomerDetails && Object.keys(CustomerDetails).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-600 mb-1">
                      Customer
                    </h4>
                    {CustomerDetails.hospitalname && (
                      <div>
                        <p className="text-gray-500 text-xs">Hospital</p>
                        <p>{CustomerDetails.hospitalname}</p>
                      </div>
                    )}
                    {CustomerDetails.city && (
                      <div>
                        <p className="text-gray-500 text-xs">City</p>
                        <p>{CustomerDetails.city}</p>
                      </div>
                    )}
                    {CustomerDetails.email && (
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p>
                          {CustomerDetails.email.length > 25
                            ? CustomerDetails.email.slice(0, 25) + "..."
                            : CustomerDetails.email}
                        </p>
                      </div>
                    )}
                    {CustomerDetails.telephone && (
                      <div>
                        <p className="text-gray-500 text-xs">Phone</p>
                        <p>{CustomerDetails.telephone}</p>
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${
                      errors.complaintType
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${
                      errors.productGroup
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${
                      errors.problemType
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 ${
                      errors.problemName
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

              {/* Spare Parts */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Spares Requested
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Search and select required spare parts
                </p>
                <Autocomplete
                  id="spareRequested"
                  options={spareOptions}
                  getOptionLabel={(option) =>
                    `${option.PartNumber} - ${option.Description}` || ""
                  }
                  onChange={(event, newValue) => setSelectedSpare(newValue)}
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
                    className={`text-xs font-medium ${
                      remarks.length > 350 ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {remarks.length}/400
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center w-full">
            <button
              type="submit"
              className={`px-8 py-4 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-center font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                loadingSubmit ? "cursor-wait opacity-75 transform-none" : ""
              }`}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <div className="flex items-center space-x-3">
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
        </form>
      </div>

      {/* Enhanced Success Modal */}
      {openSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
              <p className="text-green-100">
                Your complaint has been submitted
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                Your complaint has been created successfully, and an email has
                been sent to CIC. You will receive updates on the progress.
                Thank you!
              </p>
              <button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                onClick={handleCloseModal}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateComplaint;
