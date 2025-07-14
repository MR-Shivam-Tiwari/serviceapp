// PreventiveMaintenance.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MapPin,
  Building2,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
} from "lucide-react";

function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [pms, setPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPms, setSelectedPms] = useState([]);
  const [viewMode, setViewMode] = useState("regions"); // 'regions', 'cities', 'customers', or 'pms'
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
    manageremail: [],
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
        manageremail: Array.isArray(storedUser.manageremail)
          ? storedUser.manageremail
          : storedUser.manageremail
          ? [storedUser.manageremail]
          : [],
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
  const uniqueRegions = [...new Set(pms.map((pm) => pm.region))].filter(
    Boolean
  );

  // Get unique cities based on selected region
  const uniqueCities = regionFilter
    ? [
        ...new Set(
          pms.filter((pm) => pm.region === regionFilter).map((pm) => pm.city)
        ),
      ].filter(Boolean)
    : [];

  // Get unique customers based on selected region and city
  const uniqueCustomers =
    regionFilter && cityFilter
      ? [
          ...new Set(
            pms
              .filter(
                (pm) => pm.region === regionFilter && pm.city === cityFilter
              )
              .map((pm) => pm.customerCode)
          ),
        ].filter(Boolean)
      : [];

  // Filter PMs for the selected customer (only Due and Overdue)
  const customerPms = selectedCustomer
    ? pms.filter(
        (pm) =>
          pm.customerCode === selectedCustomer &&
          pm.region === regionFilter &&
          pm.city === cityFilter &&
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

  const handleRegionSelect = (region) => {
    setRegionFilter(region);
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("cities");
  };

  const handleCitySelect = (city) => {
    setCityFilter(city);
    setSelectedCustomer(null);
    setViewMode("customers");
  };

  const handleCustomerSelect = (customerCode) => {
    setSelectedCustomer(customerCode);
    setViewMode("pms");
  };

  const handleBackToRegions = () => {
    setRegionFilter("");
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("regions");
  };

  const handleBackToCities = () => {
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("cities");
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setViewMode("customers");
    setSelectedPms([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Due":
        return "from-yellow-500 to-orange-600";
      case "Overdue":
        return "from-red-500 to-pink-600";
      case "Completed":
        return "from-green-500 to-emerald-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Due":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Due":
        return <AlertTriangle className="w-4 h-4" />;
      case "Overdue":
        return <XCircle className="w-4 h-4" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Header with Glassmorphism Effect */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => {
              if (viewMode === "pms") {
                handleBackToCustomers();
              } else if (viewMode === "customers") {
                handleBackToCities();
              } else if (viewMode === "cities") {
                handleBackToRegions();
              } else {
                navigate("/");
              }
            }}
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
              Preventive Maintenance
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto pb-24">
        {/* Enhanced Search and Filters */}
        <div className="mb-4">
          <div className=" ">
            <div className="flex flex-col md:flex-row gap-2">
              {/* Search Input - Only show in PMS view */}
              {viewMode === "pms" && (
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Customer Code, Serial No, or Description"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-500"
                  />
                </div>
              )}

              {/* Filter Controls */}
              <div className="flex gap-3 w-full md:w-auto">
                {/* Remove All Button */}
                {viewMode === "pms" && selectedPms.length > 0 && (
                  <button
                    onClick={handleRemoveAll}
                    className="px-6 py-3 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
                  >
                    Remove All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Regions View */}
          {viewMode === "regions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueRegions.map((region) => (
                <div
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-1">
                    <div className="bg-white/90 backdrop-blur-sm mx-1 my-1 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <MapPin className="w-6 h-6 text-blue-500" />
                        <h3 className="font-bold text-lg text-gray-800">
                          {region}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {pms.filter((pm) => pm.region === region).length} PMs
                        </div>
                        <div className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                          View Cities →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cities View */}
          {viewMode === "cities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueCities.map((city) => (
                <div
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-1">
                    <div className="bg-white/90 backdrop-blur-sm mx-1 my-1 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        <h3 className="font-bold text-lg text-gray-800">
                          {city}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {
                            pms.filter(
                              (pm) =>
                                pm.region === regionFilter && pm.city === city
                            ).length
                          }{" "}
                          PMs
                        </div>
                        <div className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                          View Customers →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Cards View */}
          {viewMode === "customers" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueCustomers.map((customerCode) => {
                const customerPms = pms.filter(
                  (pm) =>
                    pm.customerCode === customerCode &&
                    pm.region === regionFilter &&
                    pm.city === cityFilter
                );
                const firstPm = customerPms[0];
                const duePms = customerPms.filter(
                  (pm) => pm.pmStatus === "Due" || pm.pmStatus === "Overdue"
                ).length;

                return (
                  <div
                    key={customerCode}
                    onClick={() => handleCustomerSelect(customerCode)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="p-1">
                      <div className="bg-white/90 backdrop-blur-sm mx-1 my-1 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="font-bold text-lg text-gray-800">
                            Customer Code: {customerCode}
                          </h3>
                        </div>

                        {firstPm && (
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Region:
                              </span>
                              <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                                {firstPm.region}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                City:
                              </span>
                              <span className="text-sm font-medium text-gray-800 bg-blue-100 px-2 py-1 rounded-lg">
                                {firstPm.city}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-600">
                              Due PMs:
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                duePms > 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {duePms}
                            </span>
                          </div>
                          <div className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                            View PMs →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PMS Cards View */}
          {viewMode === "pms" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPms.map((pm) => (
                <div
                  key={pm._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div>
                    <div className="bg-white/90 backdrop-blur-sm mx-1 my-1 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="font-bold text-gray-800">
                              {pm.customerCode}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                              pm.pmStatus
                            )}`}
                          >
                            {getStatusIcon(pm.pmStatus)}
                            <span>{pm.pmStatus}</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">
                              PM Type:
                            </span>
                            <p className="font-medium text-gray-800">
                              {pm.pmType}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Description:
                            </span>
                            <p className="font-medium text-gray-800 text-sm">
                              {pm.materialDescription}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Serial Number:
                            </span>
                            <p className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg text-sm inline-block">
                              {pm.serialNumber}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">Due:</span>
                            <span className="text-sm font-medium text-gray-800">
                              {pm.pmDueMonth}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSelection(pm)}
                          disabled={
                            !selectedPms.some((sel) => sel._id === pm._id) &&
                            selectedPms.length === 10
                          }
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                            selectedPms.some((sel) => sel._id === pm._id)
                              ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {viewMode === "regions" && uniqueRegions.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Regions Found
              </h3>
              <p className="text-gray-500">
                There are no regions with PM data available.
              </p>
            </div>
          )}

          {viewMode === "cities" && uniqueCities.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Cities Found
              </h3>
              <p className="text-gray-500">
                There are no cities with PM data available for {regionFilter}.
              </p>
            </div>
          )}

          {viewMode === "customers" && uniqueCustomers.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Customers Found
              </h3>
              <p className="text-gray-500">
                There are no customers with PM data available in {cityFilter}.
              </p>
            </div>
          )}

          {viewMode === "pms" && filteredPms.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No PMs Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "No matching PMs found for your search."
                  : "There are no Due or Overdue PMs for this customer."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Fixed Footer */}
      {viewMode === "pms" && selectedPms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/20 shadow-2xl p-6 z-50">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleProceed}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
            >
              <span className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>
                  Proceed with {selectedPms.length} PM
                  {selectedPms.length > 1 && "s"}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreventiveMaintenance;
