import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function AddNewCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customername: "",
    hospitalname: "",
    street: "",
    city: "",
    postalcode: "",
    district: "",
    state: "",
    country: "",
    telephone: "",
    taxnumber1: "",
    taxnumber2: "",
    email: "",
    status: true,
    customertype: "",
  });

  // State to control visibility of success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // State to control loader on the submit button
  const [isLoading, setIsLoading] = useState(false);
  // State to hold inline error messages for each field
  const [errors, setErrors] = useState({});
  // State to hold user information
  const [userInfo, setUserInfo] = useState({});

  // Keyboard and viewport handling
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Safe area insets for mobile devices
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 20, // Default bottom padding for navigation
  });

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
          dealerCode: userData.dealerInfo?.dealerCode || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle input changes and clear error for that field
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For email, perform real-time validation
    if (name === "email") {
      if (value && !isValidEmail(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "Please enter a valid email.",
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
      }
    } else {
      // Clear any error for the changed field
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate required fields (all except country)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.customertype)
      newErrors.customertype = "Customer Type is required.";
    if (!formData.customername)
      newErrors.customername = "Customer Name is required.";
    if (!formData.hospitalname)
      newErrors.hospitalname = "Hospital Name is required.";
    if (!formData.street) newErrors.street = "Street is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.postalcode) newErrors.postalcode = "Postal Code is required.";
    if (!formData.district) newErrors.district = "District is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.telephone) newErrors.telephone = "Telephone is required.";
    if (!formData.taxnumber1) newErrors.taxnumber1 = "PAN Number is required.";
    if (!formData.taxnumber2) newErrors.taxnumber2 = "GST Number is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      // Create payload with customer data and service engineer information
      const payload = {
        ...formData,
        serviceEngineer: {
          id: userInfo.id || "",
          firstname: userInfo.firstname || "",
          lastname: userInfo.lastname || "",
          email: userInfo.email || "",
          mobilenumber: userInfo.mobilenumber || "",
          status: userInfo.status || "",
          branch: userInfo.branch || "",
          loginexpirydate: userInfo.loginexpirydate || "",
          employeeid: userInfo.employeeid || "",
          country: userInfo.country || "",
          state: userInfo.state || "",
          city: userInfo.city || "",
          department: userInfo.department || "",
          profileimage: userInfo.profileimage || "",
          deviceid: userInfo.deviceid || "",
          deviceregistereddate: userInfo.deviceregistereddate || "",
          usertype: userInfo.usertype || "",
          manageremail: userInfo.manageremail || "",
          roleName: userInfo.roleName || "",
          roleId: userInfo.roleId || "",
          dealerName: userInfo.dealerName || "",
          dealerId: userInfo.dealerId || "",
          dealerCode: userInfo.dealerCode || "",
          dealerEmail: userInfo.dealerEmail || "",
          location: userInfo.location || [],
          skills: userInfo.skills || "",
        },
      };

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("Customer creation email has been sent to CIC successfully!");
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          customername: "",
          hospitalname: "",
          street: "",
          city: "",
          postalcode: "",
          district: "",
          state: "",
          country: "",
          telephone: "",
          taxnumber1: "",
          taxnumber2: "",
          email: "",
          status: true,
          customertype: "",
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send email to CIC.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50"
      style={{
        height: keyboardVisible ? `${viewportHeight}px` : "100vh",
        maxHeight: keyboardVisible ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* Enhanced Header */}
      <header className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/customer")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Add New Customer</h1>
          </div>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <div
        className="flex-1 overflow-y-auto mt-16"
        style={{
          paddingBottom: keyboardVisible
            ? "10px"
            : `${80 + safeAreaInsets.bottom}px`,
        }}
      >
        <div className="max-w-4xl mx-auto p-3">
          <form id="customerForm" onSubmit={handleSubmit} className="space-y-4">
            {/* Compact Customer Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <User className="mr-2" size={16} />
                  Customer Information
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  {/* Customer Type */}
                  <div className="col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Customer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="customertype"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 ${errors.customertype
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      value={formData.customertype}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Customer Type</option>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                    </select>
                    {errors.customertype && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.customertype}
                      </p>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customername"
                      placeholder="Enter Customer Name"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 ${errors.customername
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      value={formData.customername}
                      onChange={handleInputChange}
                    />
                    {errors.customername && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.customername}
                      </p>
                    )}
                  </div>

                  {/* Hospital Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="hospitalname"
                      placeholder="Enter Hospital Name"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 ${errors.hospitalname
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      value={formData.hospitalname}
                      onChange={handleInputChange}
                    />
                    {errors.hospitalname && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.hospitalname}
                      </p>
                    )}
                  </div>

                  {/* Street */}
                  <div className="col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      placeholder="Enter Street Address"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 ${errors.street ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.street}
                      onChange={handleInputChange}
                    />
                    {errors.street && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.street}
                      </p>
                    )}
                  </div>

                  {/* City and Postal Code */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter City"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 ${errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="postalcode"
                      placeholder="Enter Postal Code"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 ${errors.postalcode ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.postalcode}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          handleInputChange(e);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value.length < 5) {
                          setErrors((prevErrors) => ({
                            ...prevErrors,
                            postalcode: "Postal Code must be at least 5 digits",
                          }));
                        } else {
                          setErrors((prevErrors) => ({
                            ...prevErrors,
                            postalcode: "",
                          }));
                        }
                      }}
                    />
                    {errors.postalcode && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.postalcode}
                      </p>
                    )}
                  </div>

                  {/* District and State */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      placeholder="Enter District"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 ${errors.district ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                    {errors.district && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.district}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter State"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 ${errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Enter Country (Optional)"
                      className="w-full px-2 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Telephone and Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Telephone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="telephone"
                      placeholder="Enter Telephone Number"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${errors.telephone ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.telephone}
                      onChange={handleInputChange}
                    />
                    {errors.telephone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.telephone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Email Address"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* PAN and GST */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taxnumber1"
                      placeholder="Enter PAN Number"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 ${errors.taxnumber1 ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.taxnumber1}
                      onChange={handleInputChange}
                    />
                    {errors.taxnumber1 && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.taxnumber1}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taxnumber2"
                      placeholder="Enter GST Number"
                      className={`w-full px-2 py-2 text-sm bg-white border rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 ${errors.taxnumber2 ? "border-red-500" : "border-gray-300"
                        }`}
                      value={formData.taxnumber2}
                      onChange={handleInputChange}
                    />
                    {errors.taxnumber2 && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.taxnumber2}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Fixed Footer - Above navigation bar */}
      {!keyboardVisible && (
        <footer
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-30"
          style={{
            paddingBottom: `${safeAreaInsets.bottom + 0}px`, // Add extra padding above navigation
          }}
        >
          <div className="max-w-4xl  p-3 mx-2">
            <button
              type="submit"
              form="customerForm"
              className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${isLoading ? "cursor-wait opacity-75 transform-none" : ""
                }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Customer...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <User size={20} />
                  <span>Add Customer</span>
                </div>
              )}
            </button>
          </div>
        </footer>
      )}

      {/* Enhanced Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-5 relative animate-bounce-in">
            {/* Close button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Success icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Message */}
            <h3 className="text-base font-semibold text-gray-800 text-center mb-2">
              Email Sent!
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Customer creation email has been sent to CIC successfully
            </p>

            {/* Action button */}
            <button
              className="w-full bg-green-500 text-white font-medium py-2.5 rounded-lg hover:bg-green-600 active:scale-95 transition-all duration-150"
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}


    </div>
  );
}

export default AddNewCustomer;
