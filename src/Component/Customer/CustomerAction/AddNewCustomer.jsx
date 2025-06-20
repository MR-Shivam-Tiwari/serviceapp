import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="bg-primary p-3 py-5 flex items-center text-white">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/customer")}
        >
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
        <h2 className="text-xl font-bold">Add New Customer</h2>
      </header>

      {/* Scrollable Form Area */}
      <main className="flex-1 overflow-y-auto px-3 py-4 mb-20">
        <form id="customerForm" onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Type */}
          <div>
            <label className="block text-gray-700 mb-1">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <select
              name="customertype"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.customertype}
              onChange={handleInputChange}
            >
              <option value="">Select Customer Type*</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
            {errors.customertype && (
              <p className="text-red-500 text-sm mt-1">{errors.customertype}</p>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customername"
              placeholder="Enter Customer Name*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.customername}
              onChange={handleInputChange}
            />
            {errors.customername && (
              <p className="text-red-500 text-sm mt-1">{errors.customername}</p>
            )}
          </div>

          {/* Hospital Name */}
          <div>
            <label className="block text-gray-700 mb-1">
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hospitalname"
              placeholder="Enter Hospital Name*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.hospitalname}
              onChange={handleInputChange}
            />
            {errors.hospitalname && (
              <p className="text-red-500 text-sm mt-1">{errors.hospitalname}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <label className="block text-gray-700 mb-1">
              Street <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="street"
              placeholder="Enter Street*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.street}
              onChange={handleInputChange}
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">{errors.street}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              placeholder="Enter City*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.city}
              onChange={handleInputChange}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="postalcode"
              placeholder="Enter Postal Code*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
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
              <p className="text-red-500 text-sm mt-1">{errors.postalcode}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-gray-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              placeholder="Enter District*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.district}
              onChange={handleInputChange}
            />
            {errors.district && (
              <p className="text-red-500 text-sm mt-1">{errors.district}</p>
            )}
          </div>

          {/* state (State) */}
          <div>
            <label className="block text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              placeholder="Enter State*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.state}
              onChange={handleInputChange}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          {/* Country (Not Mandatory) */}
          <div>
            <label className="block text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="country"
              placeholder="Enter Country"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="block text-gray-700 mb-1">
              Telephone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="telephone"
              placeholder="Enter Telephone*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.telephone}
              onChange={handleInputChange}
            />
            {errors.telephone && (
              <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
            )}
          </div>

          {/* PAN Number */}
          <div>
            <label className="block text-gray-700 mb-1">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxnumber1"
              placeholder="Enter PAN Number*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.taxnumber1}
              onChange={handleInputChange}
            />
            {errors.taxnumber1 && (
              <p className="text-red-500 text-sm mt-1">{errors.taxnumber1}</p>
            )}
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-gray-700 mb-1">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxnumber2"
              placeholder="Enter GST Number*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.taxnumber2}
              onChange={handleInputChange}
            />
            {errors.taxnumber2 && (
              <p className="text-red-500 text-sm mt-1">{errors.taxnumber2}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email*"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </form>
      </main>
      <footer className="bg-white fixed bottom-0 w-full z-10 p-4 pb-10 border-t shadow-sm">
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            form="customerForm"
            className="w-full px-4 py-2 text-white bg-primary rounded hover:bg-blue-700 focus:outline-none flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                className="animate-spin mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {isLoading ? "Sending..." : "Add Customer"}
          </button>
        </div>
      </footer>
     

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-5 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <p className="mb-4">Email has been sent to CIC successfully.</p>
            <div className="flex justify-end">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddNewCustomer;
