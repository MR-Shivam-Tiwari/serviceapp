import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [equipmentData, setEquipmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [view, setView] = useState("customers"); // 'customers' or 'equipment'

  useEffect(() => {
    fetch("http://localhost:5000/upload/contract/contract-proposals")
      .then((res) => res.json())
      .then((data) => setEquipmentData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // Group equipment by customer
  const customersWithEquipment = equipmentData.reduce((acc, item) => {
    const customerCode = item.customer?.customercodeid || "unknown";
    if (!acc[customerCode]) {
      acc[customerCode] = {
        customer: item.customer,
        equipment: []
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
  const filteredCustomers = Object.values(customersWithEquipment).filter(({ customer, equipment }) => {
    const matchesSearch = 
      customer?.customername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.customercodeid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.some(eq => 
        eq.serialnumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.materialdescription.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCity = cityFilter === "" || customer?.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  // Filter equipment for selected customer
  const filteredEquipment = selectedCustomer 
    ? equipmentData.filter(item => 
        item.customer?.customercodeid === selectedCustomer.customer?.customercodeid
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
        {view === "equipment" ? (
          <button className="mr-2 text-white" onClick={handleBackToCustomers}>
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
            className="mr-2 text-white"
            onClick={() => navigate("/contract-proposal")}
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
        <h2 className="text-xl font-bold">
          {view === "customers" ? "Select Customer" : "Select Equipment"}
        </h2>
      </div>
      <main className="mt-20 px-4">
        {/* Search input */}
        <input
          type="text"
          placeholder={
            view === "customers" 
              ? "Search by customer name or ID" 
              : "Search by serial or material"
          }
          className="w-full mt-2 p-2 border rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* City filter dropdown (only show in customers view) */}
        {view === "customers" && (
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full p-2 border rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary mt-4"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}

        {view === "customers" ? (
          /* Customers list */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-4">
            {filteredCustomers.map(({ customer, equipment }) => (
              <div
                key={customer?.customercodeid || "unknown"}
                className="flex flex-col justify-between p-4 bg-white border rounded-lg shadow"
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
                  onClick={() => handleSelectCustomer({ customer, equipment })}
                  className="mt-4 w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Equipment list for selected customer */
          <div className="py-4">
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold text-lg">
                {selectedCustomer.customer?.customername || "Unknown Customer"}
              </h3>
              <p className="text-gray-600">
                {selectedCustomer.customer?.city || "N/A"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((item) => {
                const { equipment } = item;
                const selected = selectedItems.some(
                  (i) => i.equipment._id === equipment._id
                );
                return (
                  <div
                    key={equipment._id}
                    className={`flex flex-col justify-between p-4 bg-white border rounded-lg shadow ${
                      selected ? "border-primary ring-2 ring-primary" : ""
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{equipment.name}</h3>
                      <p className="text-gray-500 text-xs">
                        Serial: {equipment.serialnumber}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Code: {equipment.materialcode}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {equipment.materialdescription}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectEquipment(item)}
                      className={`mt-4 w-full py-2 rounded-lg font-medium ${
                        selected
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-primary text-white hover:bg-primary-dark"
                      } transition`}
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

      {/* Next button (only show in equipment view) */}
      {view === "equipment" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
          <button
            onClick={handleNext}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Next ({selectedItems.length} selected)
          </button>
        </div>
      )}
    </div>
  );
}