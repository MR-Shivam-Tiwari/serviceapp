import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SelectCustomer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive data from the previous page
  const {
    installItems = [],
    abnormalCondition = "",
    voltageData = {},
  } = location.state || {};

  // States for fetching and filtering customers
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch customers from API (example uses fetch; you can also use axios)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/customer`)
      .then((response) => response.json())
      .then((data) => {
        // Suppose the API returns { customers: [...] }
        setCustomers(data.customers || []);
      })
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Handle selecting a customer
  // We pass the entire "installItems" array, the chosen "customer",
  // plus the abnormalCondition and voltageData.
  const handleSelectCustomer = (customer) => {
    navigate("/installation-summary", {
      state: {
        installItems, // array of machine data
        customer, // single chosen customer
        abnormalCondition, // pass it forward
        voltageData, // pass it forward
      },
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/installation")}
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
        <h2 className="text-xl font-bold">Search Customer</h2>
      </div>

      <div className="px-4">
        {/* If you want to display the global Abnormal Condition & Voltage, do it here */}
        {/* Example: 
        <div className="mb-4 p-3 border border-gray-200 rounded">
          <p><strong>Abnormal Condition:</strong> {abnormalCondition}</p>
          <p><strong>Voltage (L-N/R-Y):</strong> {voltageData.lnry || "N/A"}</p>
          <p><strong>Voltage (L-G/Y-B):</strong> {voltageData.lgyb || "N/A"}</p>
          <p><strong>Voltage (N-G/B-R):</strong> {voltageData.ngbr || "N/A"}</p>
        </div>
        */}

        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search Customers..."
          />
          <button className="absolute right-2 top-2.5 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
          </button>
        </div>

        {/* List of filtered customers */}
        {filteredCustomers.map((customer) => (
          <div
            key={customer._id}
            className="flex items-center justify-between p-4 mb-2 bg-gray-100 
                       rounded-lg shadow hover:bg-gray-200"
          >
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {customer.customername}
              </p>
              <p className="text-sm text-gray-500">{customer.telephone}</p>
              <p className="text-sm text-gray-500">City: {customer.city}</p>
              <p className="text-sm text-gray-500">
                Customer Code: {customer.customercodeid}
              </p>
              <p className="text-sm text-gray-500">
                {customer.email.length > 25
                  ? `${customer.email.slice(0, 25)}...`
                  : customer.email}
              </p>
            </div>
            <button
              className="px-4 py-2 text-white bg-primary rounded-lg 
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => handleSelectCustomer(customer)}
            >
              SELECT
            </button>
          </div>
        ))}

        {/* No results found */}
        {filteredCustomers.length === 0 && (
          <p className="text-center text-gray-500">No customers found.</p>
        )}
      </div>
    </div>
  );
}

export default SelectCustomer;
