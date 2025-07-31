// PreventiveMaintenance.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Building2,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import PmList from "./PmList";

function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [pms, setPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPms, setSelectedPms] = useState([]);
  const [viewMode, setViewMode] = useState("regions");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
    manageremail: [],
  });

  // Set currentMonth in MM/YYYY format (ex: 07/2025)
  const now = new Date();
  const currentMonth = `${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${now.getFullYear()}`;

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

  // Fetch all PMs for filters and default list
  const [allPms, setAllPms] = useState([]);
  useEffect(() => {
    if (!userInfo.employeeId) return;
    const fetchAllPms = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/allpms/${userInfo.employeeId}`
        );
        const data = await res.json();
        setAllPms(data.pms || []);
      } catch (e) {
        console.error("Error fetching all PM data", e);
      }
      setIsLoading(false);
    };
    fetchAllPms();
  }, [userInfo.employeeId]);

  // Fetch PMs on search
  const fetchPmsWithSearch = async (query = "", page = 1) => {
    if (!userInfo.employeeId) return;
    setIsLoading(true);
    try {
      const url = query
        ? `${
            process.env.REACT_APP_BASE_URL
          }/upload/pmsearch?q=${encodeURIComponent(
            query
          )}&page=${page}&limit=10`
        : `${process.env.REACT_APP_BASE_URL}/upload/allpms/${userInfo.employeeId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (query) {
        setPms(data.pms || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } else {
        setPms(data.pms || []);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching PM data", err);
      setPms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load for search PMs
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Call search API only if query length > 2 or empty query
      if (searchQuery.trim().length > 2 || searchQuery.trim() === "") {
        fetchPmsWithSearch(searchQuery, 1);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, userInfo.employeeId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchPmsWithSearch("", 1);
    }
  }, [userInfo.employeeId]);
  const uniqueRegions = [...new Set(allPms.map((pm) => pm.region))].filter(
    Boolean
  );
  const uniqueCities = regionFilter
    ? [
        ...new Set(
          allPms.filter((pm) => pm.region === regionFilter).map((pm) => pm.city)
        ),
      ].filter(Boolean)
    : [];
  const uniqueCustomers =
    regionFilter && cityFilter
      ? [
          ...new Set(
            allPms
              .filter(
                (pm) => pm.region === regionFilter && pm.city === cityFilter
              )
              .map((pm) => pm.customerCode)
          ),
        ].filter(Boolean)
      : [];
  const customerPms =
    selectedCustomer && !searchQuery.trim()
      ? allPms.filter(
          (pm) =>
            pm.customerCode === selectedCustomer &&
            pm.region === regionFilter &&
            pm.city === cityFilter &&
            (pm.pmStatus === "Due" || pm.pmStatus === "Overdue")
        )
      : [];
  const displayPms = searchQuery.trim() ? pms : customerPms;

  // Hierarchy navigation
  const handleRegionSelect = (region) => {
    setRegionFilter(region);
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("cities");
    setSearchQuery("");
    setSelectedPms([]);
  };
  const handleCitySelect = (city) => {
    setCityFilter(city);
    setSelectedCustomer(null);
    setViewMode("customers");
    setSearchQuery("");
    setSelectedPms([]);
  };
  const handleCustomerSelect = (customerCode) => {
    setSelectedCustomer(customerCode);
    setViewMode("pms");
    setSearchQuery("");
    setCurrentPage(1);
    const customerPmsData = allPms.filter(
      (pm) =>
        pm.customerCode === customerCode &&
        pm.region === regionFilter &&
        pm.city === cityFilter &&
        (pm.pmStatus === "Due" || pm.pmStatus === "Overdue")
    );
    setPms(customerPmsData);
    setTotalPages(1);
    setSelectedPms([]);
  };
  const handleBackToRegions = () => {
    setRegionFilter("");
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("regions");
    setSearchQuery("");
    setSelectedPms([]);
  };
  const handleBackToCities = () => {
    setCityFilter("");
    setSelectedCustomer(null);
    setViewMode("cities");
    setSearchQuery("");
    setSelectedPms([]);
  };
  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setViewMode("customers");
    setSearchQuery("");
    setSelectedPms([]);
  };

  // Remove all selected PMs
  const handleRemoveAll = () => setSelectedPms([]);

  // Proceed to details page
  const handleProceed = () => {
    if (selectedPms.length === 0) {
      alert("Please select at least one PM.");
      return;
    }
    navigate("/pm-details", { state: { selectedPms } });
  };

  // Pagination for search results
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (searchQuery.trim()) {
        fetchPmsWithSearch(searchQuery, newPage);
      }
    }
  };

  // Status badge color utility
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

  // Status icon utility
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
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center py-14">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
          <style jsx>{`
            .loader {
              border-top-color: #6366f1; /* Indigo-500 */
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
      {/* Header */}
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
            aria-label="Back"
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
        {/* Regions, Cities, Customers (Hierarchy) */}
        {viewMode === "regions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueRegions.length ? (
              uniqueRegions.map((region) => (
                <div
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleRegionSelect(region)
                  }
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
                          {allPms.filter((pm) => pm.region === region).length}{" "}
                          PMs
                        </div>
                        <div className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                          View Cities →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
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
          </div>
        )}
        {viewMode === "cities" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueCities.length ? (
              uniqueCities.map((city) => (
                <div
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCitySelect(city)
                  }
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
                            allPms.filter(
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
              ))
            ) : (
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
          </div>
        )}
        {viewMode === "customers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueCustomers.length ? (
              uniqueCustomers.map((customerCode) => {
                const customerPmsData = allPms.filter(
                  (pm) =>
                    pm.customerCode === customerCode &&
                    pm.region === regionFilter &&
                    pm.city === cityFilter
                );
                const firstPm = customerPmsData[0];
                const duePms = customerPmsData.filter(
                  (pm) => pm.pmStatus === "Due" || pm.pmStatus === "Overdue"
                ).length;
                return (
                  <div
                    key={customerCode}
                    onClick={() => handleCustomerSelect(customerCode)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCustomerSelect(customerCode)
                    }
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
              })
            ) : (
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
          </div>
        )}
        {/* PM List with search, selection, and pagination */}
        {viewMode === "pms" && (
          <PmList
            pms={displayPms}
            selectedPms={selectedPms}
            toggleSelection={(pm) => {
              // Allow only current "MM/YYYY" Due PM to be selected
              if (pm.pmStatus === "Due" && pm.pmDueMonth !== currentMonth) {
                alert(
                  `Cannot select PM with Due month (${pm.pmDueMonth}) different from current month (${currentMonth}).`
                );
                return;
              }
              if (selectedPms.some((sel) => sel._id === pm._id)) {
                setSelectedPms(selectedPms.filter((sel) => sel._id !== pm._id));
              } else {
                if (selectedPms.length < 10) {
                  setSelectedPms([...selectedPms, pm]);
                } else {
                  alert("You can select a maximum of 10 PMs.");
                }
              }
            }}
            selectedPmsCount={selectedPms.length}
            handleRemoveAll={handleRemoveAll}
            handleProceed={handleProceed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            getStatusBadgeColor={getStatusBadgeColor}
            getStatusIcon={getStatusIcon}
            currentMonth={currentMonth}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default PreventiveMaintenance;
