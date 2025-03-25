// PreventiveMaintenance.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [pms, setPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/upload/pms`)
      .then((res) => res.json())
      .then((data) => {
        setPms(data.pms);
      })
      .catch((err) => console.error("Error fetching PM data", err));
  }, []);

  const filteredPms = pms
    .filter((pm) => pm.pmStatus === "Due") // Only show PMs with status 'Due'
    .filter((pm) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        pm.customerCode.toLowerCase().includes(query) ||
        pm.serialNumber.toLowerCase().includes(query) ||
        pm.materialDescription.toLowerCase().includes(query);
      const matchesRegion = regionFilter
        ? pm.regionBranch === regionFilter
        : true;
      return matchesSearch && matchesRegion;
    });

  const uniqueRegions = [...new Set(pms.map((pm) => pm.regionBranch))];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white">
        <button className="mr-2 text-white" onClick={() => navigate("/")}>
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
        <h2 className="text-xl font-bold">Preventive Maintenance</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center pb-0 p-4">
        <input
          type="text"
          placeholder="Search by Customer Code, Serial No, or Description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:mr-4 mb-2 md:mb-0"
        />
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Filter by Region</option>
          {uniqueRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* PM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredPms.map((pm) => (
          <div
            key={pm._id}
            className="border rounded p-4 shadow hover:shadow-lg"
          >
            <p>
              <strong>Customer Code:</strong> {pm.customerCode}
            </p>
            <p>
              <strong>Description:</strong> {pm.materialDescription}
            </p>
            <p>
              <strong>Serial Number:</strong> {pm.serialNumber}
            </p>
            <p>
              <strong>Status:</strong> {pm.pmStatus}
            </p>
            <button
              onClick={() => navigate("/pm-details", { state: { pm } })}
              className="mt-2 w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreventiveMaintenance;
