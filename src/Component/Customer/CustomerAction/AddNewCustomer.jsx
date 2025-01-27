import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // 1) Import from react-hot-toast

function AddNewCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customercodeid: "",
    customername: "",
    hospitalname: "",
    street: "",
    city: "",
    postalcode: "",
    district: "",
    region: "",
    country: "",
    telephone: "",
    taxnumber1: "",
    taxnumber2: "",
    email: "",
    status: "",
    customertype: "",
  });

  // NEW STATE: Controls visibility of success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (required fields can be modified as needed)
    if (!formData.customername || !formData.customertype) {
      toast.error(
        "Please fill in required fields (e.g., Customer Name, Customer Type)."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/collections/customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Convert formData to JSON string
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Customer added successfully!");
        // Show success modal
        setShowSuccessModal(true);

        // Reset form
        setFormData({
          customercodeid: "",
          customername: "",
          hospitalname: "",
          street: "",
          city: "",
          postalcode: "",
          district: "",
          region: "",
          country: "",
          telephone: "",
          taxnumber1: "",
          taxnumber2: "",
          email: "",
          status: "",
          customertype: "",
        });
      } else {
        // Server responded with an error status
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add customer.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 
              0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 
              0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Add New Customer</h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white px-4 py-4 shadow rounded"
      >
        {/* Customer Code */}
        <input
          type="text"
          name="customercodeid"
          placeholder="Enter Customer Code ID"
          value={formData.customercodeid}
          onChange={handleInputChange}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
        />

        {/* Customer Type */}
        <select
          name="customertype"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.customertype}
          onChange={handleInputChange}
        >
          <option value="">Select Customer Type*</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Corporate">Corporate</option>
        </select>

        {/* Customer Name */}
        <input
          type="text"
          name="customername"
          placeholder="Enter Customer Name*"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.customername}
          onChange={handleInputChange}
        />

        {/* Hospital Name */}
        <input
          type="text"
          name="hospitalname"
          placeholder="Enter Hospital Name"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.hospitalname}
          onChange={handleInputChange}
        />

        {/* Street */}
        <input
          type="text"
          name="street"
          placeholder="Enter Street"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.street}
          onChange={handleInputChange}
        />

        {/* City */}
        <input
          type="text"
          name="city"
          placeholder="Enter City"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.city}
          onChange={handleInputChange}
        />

        {/* Postal Code */}
        <input
          type="text"
          name="postalcode"
          placeholder="Enter Postal Code"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.postalcode}
          onChange={handleInputChange}
        />

        {/* District */}
        <input
          type="text"
          name="district"
          placeholder="Enter District"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.district}
          onChange={handleInputChange}
        />

        {/* Region (State) */}
        <input
          type="text"
          name="region"
          placeholder="Enter State/Region"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.region}
          onChange={handleInputChange}
        />

        {/* Country */}
        <input
          type="text"
          name="country"
          placeholder="Enter Country"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.country}
          onChange={handleInputChange}
        />

        {/* Telephone */}
        <input
          type="text"
          name="telephone"
          placeholder="Enter Telephone"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.telephone}
          onChange={handleInputChange}
        />

        {/* TaxNumber1 */}
        <input
          type="text"
          name="taxnumber1"
          placeholder="Enter Tax Number 1"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.taxnumber1}
          onChange={handleInputChange}
        />

        {/* TaxNumber2 */}
        <input
          type="text"
          name="taxnumber2"
          placeholder="Enter Tax Number 2"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.taxnumber2}
          onChange={handleInputChange}
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.email}
          onChange={handleInputChange}
        />

        {/* Status */}
        <select
          name="status"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="deactive">Deactive</option>
        </select>

        <button
          type="submit"
          className="w-full px-4 py-2 mb-4 text-white bg-primary rounded hover:bg-blue-700 focus:outline-none"
        >
          Add Customer
        </button>
      </form>

      {/* SUCCESS MODAL (shown after we get a successful response) */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-5 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <p className="mb-4">Customer has been added successfully.</p>
            <div className="flex justify-end">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Optionally navigate somewhere else if desired
                  // navigate('/customer');
                }}
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
