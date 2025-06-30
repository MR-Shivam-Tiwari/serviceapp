// PreventiveMaintenance.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [pms, setPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPms, setSelectedPms] = useState([]);
  const [viewMode, setViewMode] = useState("customers"); // 'customers' or 'pms'
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
  });

  // Load user info on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
        email: storedUser.email,
        dealerEmail: storedUser.dealerInfo?.dealerEmail,
      });
    }
  }, []);
  useEffect(() => {
    if (!userInfo.employeeId) return;
    fetch(
      `${process.env.REACT_APP_BASE_URL}/upload/allpms/${userInfo.employeeId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPms(data.pms);
      })
      .catch((err) => console.error("Error fetching PM data", err));
  }, [userInfo.employeeId]);

  // Get unique regions
  const uniqueRegions = [...new Set(pms.map((pm) => pm.region))];

  // Get cities based on selected region
  const uniqueCities = regionFilter
    ? [
        ...new Set(
          pms.filter((pm) => pm.region === regionFilter).map((pm) => pm.city)
        ),
      ]
    : [];

  // Get customers based on selected region and city
  const customers =
    regionFilter && cityFilter
      ? [
          ...new Set(
            pms
              .filter(
                (pm) => pm.region === regionFilter && pm.city === cityFilter
              )
              .map((pm) => pm.customerCode)
          ),
        ]
      : [];

  // Filter PMs for the selected customer
  const customerPms = selectedCustomer
    ? pms.filter(
        (pm) =>
          pm.customerCode === selectedCustomer &&
          (pm.pmStatus === "Due" || pm.pmStatus === "Overdue")
      )
    : [];

  // Filter for search functionality in PM view
  const filteredPms = customerPms.filter((pm) => {
    const query = searchQuery.toLowerCase();
    return (
      pm.customerCode.toLowerCase().includes(query) ||
      pm.serialNumber.toLowerCase().includes(query) ||
      pm.materialDescription.toLowerCase().includes(query)
    );
  });

  // Toggle selection for a PM card. Limit selections to 10.
  const toggleSelection = (pm) => {
    if (selectedPms.some((sel) => sel._id === pm._id)) {
      setSelectedPms(selectedPms.filter((sel) => sel._id !== pm._id));
    } else {
      if (selectedPms.length < 10) {
        setSelectedPms([...selectedPms, pm]);
      } else {
        alert("You can select a maximum of 10 PMs.");
      }
    }
  };

  const handleRemoveAll = () => {
    setSelectedPms([]);
  };

  const handleProceed = () => {
    if (selectedPms.length === 0) {
      alert("Please select at least one PM.");
      return;
    }
    navigate("/pm-details", { state: { selectedPms } });
  };

  const handleCustomerSelect = (customerCode) => {
    setSelectedCustomer(customerCode);
    setViewMode("pms");
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setViewMode("customers");
    setSelectedPms([]);
  };

  const handleBackToCities = () => {
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("customers");
  };

  const handleBackToRegions = () => {
    setRegionFilter("");
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("customers");
  };

  return (
    <div className=" ">
      {/* Header - Fixed Top */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => {
            if (viewMode === "pms") {
              handleBackToCustomers();
            } else if (cityFilter) {
              handleBackToCities();
            } else if (regionFilter) {
              handleBackToRegions();
            } else {
              navigate("/");
            }
          }}
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
        <h2 className="text-xl font-bold">Preventive Maintenance</h2>
      </div>

      <div className="">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center pb-0 px-3  ">
          {viewMode === "pms" ? (
            <input
              type="text"
              placeholder="Search by Customer Code, Serial No, or Description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-full md:mr-4 mb-2 md:mb-0"
            />
          ) : null}

          <div className="flex gap-3 w-full">
            {viewMode === "customers" && !regionFilter && (
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Region</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            )}

            {viewMode === "customers" && regionFilter && !cityFilter && (
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">Select City</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}

            {viewMode === "pms" && selectedPms.length > 0 && (
              <button
                onClick={handleRemoveAll}
                className="border p-2 rounded bg-red-500 text-white w-full md:w-1/2"
              >
                Remove All
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mb-[70px] p-3">
          {viewMode === "customers" && regionFilter && cityFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((customerCode) => {
                const customerPms = pms.filter(
                  (pm) => pm.customerCode === customerCode
                );
                const firstPm = customerPms[0];
                const duePms = customerPms.filter(
                  (pm) => pm.pmStatus === "Due" || pm.pmStatus === "Overdue"
                ).length;

                return (
                  <div
                    key={customerCode}
                    onClick={() => handleCustomerSelect(customerCode)}
                    className="border rounded p-4 shadow hover:shadow-lg cursor-pointer"
                  >
                    <p>
                      <strong>Customer Code:</strong> {customerCode}
                    </p>
                    {firstPm && (
                      <>
                        <p>
                          <strong>Region:</strong> {firstPm.region}
                        </p>
                        <p>
                          <strong>City:</strong> {firstPm.city}
                        </p>
                      </>
                    )}
                    <p>
                      <strong>Due PMs:</strong> {duePms}
                    </p>
                    <p className="text-blue-500 mt-2">View PMs →</p>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "pms" && (
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
          )}

          {viewMode === "customers" && !regionFilter && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Please select a region to begin</p>
            </div>
          )}

          {viewMode === "customers" && regionFilter && !cityFilter && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Please select a city</p>
            </div>
          )}
        </div>
        <footer className="bg-white fixed bottom-0 w-full z-10 p-4 pb-10 border-t shadow-sm">
          {viewMode === "pms" && selectedPms.length > 0 && (
            <button
              onClick={handleProceed}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
            >
              Proceed with {selectedPms.length} PM
              {selectedPms.length > 1 && "s"}
            </button>
          )}
        </footer>

        {/* Proceed Button - Fixed Bottom */}
      </div>
    </div>
  );
}

export default PreventiveMaintenance;
