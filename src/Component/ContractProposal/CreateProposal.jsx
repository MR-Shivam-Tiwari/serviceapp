import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [equipmentData, setEquipmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [view, setView] = useState("customers"); // 'customers' or 'equipment'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/contract/contract-proposals`
        );
        const data = await res.json();
        setEquipmentData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group equipment by customer
  const customersWithEquipment = equipmentData.reduce((acc, item) => {
    const customerCode = item.customer?.customercodeid || "unknown";
    if (!acc[customerCode]) {
      acc[customerCode] = {
        customer: item.customer,
        equipment: [],
      };
    }
    acc[customerCode].equipment.push(item.equipment);
    return acc;
  }, {});

  // Get unique cities
  const cities = Array.from(
    new Set(
      equipmentData.map((item) => item.customer?.city).filter((city) => city)
    )
  );

  // Filter customers based on search and city
  const filteredCustomers = Object.values(customersWithEquipment).filter(
    ({ customer, equipment }) => {
      const matchesSearch =
        customer?.customername
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customer?.customercodeid
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        equipment.some(
          (eq) =>
            eq.serialnumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.materialdescription
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

      const matchesCity = cityFilter === "" || customer?.city === cityFilter;

      return matchesSearch && matchesCity;
    }
  );

  // Filter equipment for selected customer
  const filteredEquipment = selectedCustomer
    ? equipmentData.filter(
        (item) =>
          item.customer?.customercodeid ===
          selectedCustomer.customer?.customercodeid
      )
    : [];

  const handleSelectCustomer = (customerData) => {
    setSelectedCustomer(customerData);
    setView("equipment");
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setSelectedItems([]);
    setView("customers");
  };

  const handleSelectEquipment = (item) => {
    const exists = selectedItems.some(
      (i) => i.equipment._id === item.equipment._id
    );
    if (exists) {
      setSelectedItems((prev) =>
        prev.filter((i) => i.equipment._id !== item.equipment._id)
      );
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleNext = () => {
    if (selectedItems.length === 0) {
      window.alert("Please select at least one equipment.");
      return;
    }
    navigate("/proposal-details", { state: { items: selectedItems } });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-6 rounded-md shadow-md">
        {view === "equipment" ? (
          <button
            className="mr-2 text-white hover:opacity-80 transition"
            onClick={handleBackToCustomers}
            aria-label="Back to Customers"
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
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
                0 0 1-.708.708l-3-3a.5.5 
                0 0 1 0-.708l3-3a.5.5 
                0 1 1 .708.708L5.707 7.5H11.5a.5.5 
                0 0 1 .5.5"
              />
            </svg>
          </button>
        ) : (
          <button
            className="mr-2 text-white hover:opacity-80 transition"
            onClick={() => navigate("/contract-proposal")}
            aria-label="Back to Contract Proposal"
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
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
                0 0 1-.708.708l-3-3a.5.5 
                0 0 1 0-.708l3-3a.5.5 
                0 1 1 .708.708L5.707 7.5H11.5a.5.5 
                0 0 1 .5.5"
              />
            </svg>
          </button>
        )}
        <h2 className="text-2xl font-bold">
          {view === "customers" ? "Select Customer" : "Select Equipment"}
        </h2>
      </div>
      <div className="mb-6">
        <main>
          {/* Search input */}
          <input
            type="text"
            placeholder={
              view === "customers"
                ? "Search by customer name or ID"
                : "Search by serial or material"
            }
            className="w-full mt-2 p-3 border rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search input"
          />

          {/* City filter dropdown (only show in customers view) */}
          {view === "customers" && (
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full p-3 border rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary mt-4"
              aria-label="City filter"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}

          {loading && (
            <div className="flex justify-center my-6">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          )}

          {view === "customers" ? (
            // Customers list
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 py-4">
              {filteredCustomers.map(({ customer, equipment }) => (
                <div
                  key={customer?.customercodeid || "unknown"}
                  className="flex flex-col justify-between p-6 bg-white border rounded-lg shadow hover:shadow-lg transition"
                  tabIndex={0}
                  role="button"
                  onClick={() => handleSelectCustomer({ customer, equipment })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectCustomer({ customer, equipment });
                    }
                  }}
                  aria-label={`Select customer ${customer?.customername || "Unknown"}`}
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {customer?.customername || "Unknown Customer"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      ID: {customer?.customercodeid || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      City: {customer?.city || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Equipment: {equipment.length} items
                    </p>
                  </div>
                  <button
                    className="mt-4 w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCustomer({ customer, equipment });
                    }}
                    aria-label={`Select customer ${customer?.customername || "Unknown"}`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Equipment list for selected customer
            <div className="py-4">
              <div className="mb-6 p-6 bg-white rounded-lg shadow">
                <h3 className="font-bold text-lg">
                  {selectedCustomer.customer?.customername || "Unknown Customer"}
                </h3>
                <p className="text-gray-600">{selectedCustomer.customer?.city || "N/A"}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEquipment.map((item) => {
                  const { equipment } = item;
                  const selected = selectedItems.some(
                    (i) => i.equipment._id === equipment._id
                  );
                  return (
                    <div
                      key={equipment._id}
                      className={`flex flex-col justify-between p-6 bg-white border rounded-lg shadow cursor-pointer transition ${
                        selected ? "border-primary ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleSelectEquipment(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSelectEquipment(item);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selected}
                      aria-label={`Select equipment ${equipment.name} serial ${equipment.serialnumber}`}
                    >
                      <div>
                        <h3 className="font-semibold text-lg">{equipment.name}</h3>
                        <p className="text-gray-500 text-xs">Serial: {equipment.serialnumber}</p>
                        <p className="text-gray-500 text-xs">Code: {equipment.materialcode}</p>
                        <p className="text-gray-600 text-sm">{equipment.materialdescription}</p>
                      </div>
                      <button
                        className={`mt-4 w-full py-2 rounded-lg font-medium transition ${
                          selected
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-primary text-white hover:bg-primary-dark"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectEquipment(item);
                        }}
                        aria-label={`${selected ? "Remove" : "Select"} equipment ${equipment.name}`}
                      >
                        {selected ? "Remove" : "Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Next button */}
        <footer className="bg-white fixed bottom-0 left-0 right-0 z-20 p-4 pb-6 border-t shadow-md max-w-6xl mx-auto">
          {view === "equipment" && (
            <button
              onClick={handleNext}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ({selectedItems.length} selected)
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
