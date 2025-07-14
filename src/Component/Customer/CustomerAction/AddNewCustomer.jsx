import React, { useState } from "react";
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

  // Helper function to validate email format
  const isValidEmail = (email) => {
    // Simple regex for email validation
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
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Email to CIC has been sent successfully!");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg shadow-lg sticky top-0 z-40">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/customer")}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Customer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-3 pb-32">
        <form id="customerForm" onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Type Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="mr-2" size={20} />
                Customer Information
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-6">
                {/* Customer Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Customer Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="customertype"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    value={formData.customertype}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Customer Type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                  {errors.customertype && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.customertype}
                    </p>
                  )}
                </div>

                {/* Customer Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customername"
                    placeholder="Enter Customer Name"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    value={formData.customername}
                    onChange={handleInputChange}
                  />
                  {errors.customername && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.customername}
                    </p>
                  )}
                </div>

                {/* Hospital Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="hospitalname"
                    placeholder="Enter Hospital Name"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    value={formData.hospitalname}
                    onChange={handleInputChange}
                  />
                  {errors.hospitalname && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.hospitalname}
                    </p>
                  )}
                </div>

                {/* Street */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    placeholder="Enter Street Address"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.street}
                    </p>
                  )}
                </div>

                {/* City and Postal Code Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter City"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalcode"
                      placeholder="Enter Postal Code"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
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
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.postalcode}
                      </p>
                    )}
                  </div>
                </div>

                {/* District and State Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      placeholder="Enter District"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.district}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter State"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Enter Country (Optional)"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Telephone and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Telephone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Enter Telephone Number"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      value={formData.telephone}
                      onChange={handleInputChange}
                    />
                    {errors.telephone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.telephone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Email Address"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* PAN and GST Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taxnumber1"
                      placeholder="Enter PAN Number"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                      value={formData.taxnumber1}
                      onChange={handleInputChange}
                    />
                    {errors.taxnumber1 && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.taxnumber1}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taxnumber2"
                      placeholder="Enter GST Number"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                      value={formData.taxnumber2}
                      onChange={handleInputChange}
                    />
                    {errors.taxnumber2 && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.taxnumber2}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Enhanced Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto p-6">
          <button
            type="submit"
            form="customerForm"
            className={`w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
              isLoading ? "cursor-wait opacity-75 transform-none" : ""
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

      {/* Enhanced Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
              <p className="text-green-100">
                Customer has been created successfully
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                Email has been sent to CIC successfully. The customer profile
                has been created and is now available in the system.
              </p>
              <button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                onClick={() => setShowSuccessModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddNewCustomer;
