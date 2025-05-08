 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
export default function CreateProposal() {
  const navigate = useNavigate();
  const [equipmentData, setEquipmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/upload/contract/contract-proposals")
      .then((res) => res.json())
      .then((data) => setEquipmentData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // derive unique list of customer cities
  const cities = Array.from(
    new Set(
      equipmentData.map((item) => item.customer?.city).filter((city) => city)
    )
  );

  const filteredData = equipmentData.filter(({ equipment, customer }) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.serialnumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.currentcustomer
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      equipment.materialdescription
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      equipment.materialcode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = cityFilter === "" || customer?.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  const handleSelect = (item) => {
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
      window.alert("Please select at least one proposal.");
      return;
    }
    const custIds = Array.from(
      new Set(selectedItems.map((i) => i.customer?.customercodeid))
    );
    if (custIds.length > 1) {
      toast.error("All selected proposals must belong to the same customer.");
      return;
    }
    navigate("/proposal-details", { state: { items: selectedItems } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
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
        <h2 className="text-xl font-bold">Create CMC/NCMC Proposal</h2>
      </div>
      <main className="mt-20 px-4">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by customer, serial or material"
          className="w-full mt-2 p-2 border rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* City filter dropdown */}
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

        {/* Items grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-4">
          {filteredData.map((item) => {
            const { equipment, customer } = item;
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
                  <p className="text-gray-500 text-xs">
                    Cust: {customer?.customercodeid || "N/A"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    City: {customer?.city || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {equipment.materialdescription}
                  </p>
                </div>
                <button
                  onClick={() => handleSelect(item)}
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
      </main>

      {/* Next button fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

