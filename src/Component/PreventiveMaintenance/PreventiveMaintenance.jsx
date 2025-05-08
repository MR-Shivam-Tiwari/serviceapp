// PreventiveMaintenance.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [pms, setPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  // State to track selected PM items
  const [selectedPms, setSelectedPms] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/upload/allpms`)
      .then((res) => res.json())
      .then((data) => {
        setPms(data.pms);
      })
      .catch((err) => console.error("Error fetching PM data", err));
  }, []);

  // Filter to show only "Due" or "Overdue"
  const filteredPms = pms
    .filter((pm) => pm.pmStatus === "Due" || pm.pmStatus === "Overdue")
    .filter((pm) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        pm.customerCode.toLowerCase().includes(query) ||
        pm.serialNumber.toLowerCase().includes(query) ||
        pm.materialDescription.toLowerCase().includes(query);
      const matchesRegion = regionFilter ? pm.region === regionFilter : true;
      return matchesSearch && matchesRegion;
    });

  const uniqueRegions = [...new Set(pms.map((pm) => pm.region))];

  // Toggle selection for a PM card. Limit selections to 10.
  const toggleSelection = (pm) => {
    if (selectedPms.some((sel) => sel._id === pm._id)) {
      // Deselect if already selected
      setSelectedPms(selectedPms.filter((sel) => sel._id !== pm._id));
    } else {
      if (selectedPms.length < 10) {
        setSelectedPms([...selectedPms, pm]);
      } else {
        alert("You can select a maximum of 10 PMs.");
      }
    }
  };

  // Remove all selected PMs
  const handleRemoveAll = () => {
    setSelectedPms([]);
  };

  // Proceed button action navigates with the selected PMs
  const handleProceed = () => {
    if (selectedPms.length === 0) {
      alert("Please select at least one PM.");
      return;
    }
    navigate("/pm-details", { state: { selectedPms } });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Fixed Top */}
      <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
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

      {/* Search, Filter, and Remove All Button */}
      <div className="flex flex-col md:flex-row md:items-center pb-0 p-3 mt-[80px]">
        <input
          type="text"
          placeholder="Search by Customer Code, Serial No, or Description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:mr-4 mb-2 md:mb-0"
        />
        <div className="flex gap-3">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className={`border p-2 h-10 rounded mb-2 md:mb-0 
      ${selectedPms.length > 0 ? "w-full md:w-1/2" : "w-full"}`}
          >
            <option value="">Filter by Region</option>
            {uniqueRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {selectedPms.length > 0 && (
            <button
              onClick={handleRemoveAll}
              className="border p-2 rounded h-10 bg-red-500 text-white w-full md:w-1/2"
            >
              Remove All
            </button>
          )}
        </div>
      </div>

      {/* PM Cards List */}
      <div className="flex-1 overflow-y-auto mb-[70px] p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPms.map((pm) => (
            <div
              key={pm._id}
              className="border rounded p-2 shadow hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p>
                    <strong>Customer Code:</strong> {pm.customerCode}
                  </p>
                  <p>
                    <strong>PM Type:</strong> {pm.pmType}
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
                  <p>
                    <strong>PM Due Month:</strong> {pm.pmDueMonth}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => toggleSelection(pm)}
                  disabled={
                    !selectedPms.some((sel) => sel._id === pm._id) &&
                    selectedPms.length === 10
                  }
                  className={`px-3 py-2 rounded w-full font-semibold transition ${
                    selectedPms.some((sel) => sel._id === pm._id)
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } ${
                    !selectedPms.some((sel) => sel._id === pm._id) &&
                    selectedPms.length === 10
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {selectedPms.some((sel) => sel._id === pm._id)
                    ? "Remove"
                    : "Select"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proceed Button - Fixed Bottom */}
      {selectedPms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-md z-10">
          <button
            onClick={handleProceed}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
          >
            Proceed with {selectedPms.length} PM
            {selectedPms.length > 1 && "s"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PreventiveMaintenance;
