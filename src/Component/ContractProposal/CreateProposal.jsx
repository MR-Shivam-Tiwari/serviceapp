import { Autocomplete, TextField } from "@mui/joy";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [equipmentData, setEquipmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [view, setView] = useState("customers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter options from API
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});

  const itemsPerPage = 50;

  // Debounced search
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch filter options (cities and regions)
  const fetchFilterOptions = async () => {
    setFiltersLoading(true);
    try {
      const [citiesResponse, regionsResponse] = await Promise.all([
        fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/contract/contract-proposals/filters/cities`
        ),
        fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/contract/contract-proposals/filters/regions`
        ),
      ]);

      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json();
        setCities(citiesData.cities || []);
      }

      if (regionsResponse.ok) {
        const regionsData = await regionsResponse.json();
        setRegions(regionsData.regions || []);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setFiltersLoading(false);
    }
  };

  // Fetch data with pagination
  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });

        if (searchTerm.trim()) queryParams.append("search", searchTerm.trim());
        if (cityFilter) queryParams.append("city", cityFilter);
        if (regionFilter) queryParams.append("region", regionFilter);

        const apiUrl =
          searchTerm.trim() || cityFilter || regionFilter
            ? `${process.env.REACT_APP_BASE_URL}/upload/contract/contract-proposals/search?${queryParams}`
            : `${process.env.REACT_APP_BASE_URL}/upload/contract/contract-proposals?${queryParams}`;

        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        setEquipmentData(result.data || []);
        setPagination(result.pagination || {});
        setCurrentPage(page);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err.message}`);
        setEquipmentData([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, cityFilter, regionFilter, itemsPerPage]
  );

  const debouncedFetch = useMemo(
    () => debounce((page = 1) => fetchData(page), 500),
    [fetchData]
  );

  // Initial load - fetch filter options and data
  useEffect(() => {
    fetchFilterOptions();
    fetchData(1);
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    setCurrentPage(1);
    debouncedFetch(1);
  }, [searchTerm, cityFilter, regionFilter, debouncedFetch]);

  // Group equipment by customer - FIXED VERSION
  const customersWithEquipment = useMemo(() => {
    const customerGroups = equipmentData.reduce((acc, item) => {
      const customerCode = item.customer?.customercodeid || "unknown";
      if (!acc[customerCode]) {
        acc[customerCode] = {
          customer: item.customer,
          equipment: [],
          amcContracts: [],
          equipmentItems: [], // Add full item data
        };
      }
      acc[customerCode].equipment.push(item.equipment);
      acc[customerCode].equipmentItems.push(item); // Store full item for reference
      if (item.amcContract) {
        acc[customerCode].amcContracts.push(item.amcContract);
      }
      return acc;
    }, {});

    return customerGroups;
  }, [equipmentData]);

  const filteredEquipment = useMemo(() => {
    return selectedCustomer
      ? equipmentData.filter(
          (item) =>
            item.customer?.customercodeid ===
            selectedCustomer.customer?.customercodeid
        )
      : [];
  }, [selectedCustomer, equipmentData]);

  const handleSelectCustomer = (customerData) => {
    setSelectedCustomer(customerData);
    setView("equipment");
    setSelectedItems([]);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one equipment.");
      return;
    }
    navigate("/proposal-details", { state: { items: selectedItems } });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setRegionFilter("");
  };

  // Helper function to get matched equipment for display
  const getMatchedEquipmentInfo = (equipmentItems, searchTerm) => {
    if (!searchTerm.trim()) return null;

    const searchLower = searchTerm.toLowerCase();
    const matchedEquipment = equipmentItems.find(
      (item) =>
        item.equipment.serialnumber?.toLowerCase().includes(searchLower) ||
        item.equipment.materialcode?.toLowerCase().includes(searchLower) ||
        item.equipment.materialdescription
          ?.toLowerCase()
          .includes(searchLower) ||
        item.equipment.equipmentid?.toLowerCase().includes(searchLower)
    );

    return matchedEquipment?.equipment || null;
  };

  // Enhanced Pagination component - only shows when needed
  const Pagination = () => {
    // Only show pagination if there's more than one page OR there are more items than shown per page
    if (
      !pagination ||
      pagination.totalPages <= 1 ||
      pagination.totalItems <= itemsPerPage
    ) {
      return null;
    }

    const getPageNumbers = () => {
      const delta = 1; // Reduced for mobile
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="fixed bottom-0 pb-12 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="max-w-md mx-auto px-3 pb-3">
          {/* Page info at top */}
          <div className="text-center mb-2">
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages} • {pagination.totalItems} total
              items
            </span>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between">
            {/* Previous button - Larger */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
            >
              Prev
            </button>

            {/* Page numbers - mobile optimized */}
            <div className="flex items-center space-x-1">
              {getPageNumbers()
                .slice(0, 5)
                .map((page, index) => (
                  <button
                    key={index}
                    onClick={() => page !== "..." && handlePageChange(page)}
                    disabled={page === "..."}
                    className={`min-w-[32px] h-8 px-2 text-sm font-medium rounded-md transition-colors ${
                      page === currentPage
                        ? "bg-blue-700 text-white shadow-sm"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
            </div>

            {/* Next button - Larger */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            {/* Back Button */}
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              onClick={
                view === "equipment"
                  ? handleBackToCustomers
                  : () => navigate("/contract-proposal")
              }
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Title + Subtext */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {view === "customers" ? "Select Customer" : "Select Equipment"}
              </h1>
              {view === "equipment" && selectedItems.length > 0 && (
                <p className="text-blue-200 text-xs">
                  {selectedItems.length} selected
                </p>
              )}
            </div>
          </div>
        </div>
      <div className="mb-20">
        {/* Header */}

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm m-2 mt-20">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4  ">
          <div className="space-y-3 mt-16">
            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder={
                  view === "customers"
                    ? "Search customers, serial numbers, equipment..."
                    : "Search equipment..."
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 gap-2 ">
              <Autocomplete
                placeholder="All Cities"
                options={cities}
                value={cityFilter || null}
                onChange={(event, newValue) => setCityFilter(newValue || "")}
                disabled={filtersLoading}
                size="sm"
                sx={{
                  fontSize: "14px",
                  "& .MuiAutocomplete-input": {
                    fontSize: "14px",
                    padding: "8px",
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="All Cities"
                    size="sm"
                    variant="outlined"
                    sx={{ fontSize: "14px" }}
                  />
                )}
                renderOption={(props, option) => (
                  <div {...props} style={{ fontSize: "14px", padding: "8px" }}>
                    {option === "" ? "All Cities" : option}
                  </div>
                )}
                isOptionEqualToValue={(option, value) => option === value}
                freeSolo={false}
                clearOnBlur
                selectOnFocus
                clearIcon={null}
                // Custom filtering for better search experience
                filterOptions={(options, { inputValue }) => {
                  if (!inputValue) return ["", ...options];
                  return options.filter((option) =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
              />

              {/* Region Autocomplete */}
              <Autocomplete
                placeholder="All Regions"
                options={regions}
                value={regionFilter || null}
                onChange={(event, newValue) => setRegionFilter(newValue || "")}
                disabled={filtersLoading}
                size="sm"
                sx={{
                  fontSize: "14px",
                  "& .MuiAutocomplete-input": {
                    fontSize: "14px",
                    padding: "8px",
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="All Regions"
                    size="sm"
                    variant="outlined"
                    sx={{ fontSize: "14px" }}
                  />
                )}
                renderOption={(props, option) => (
                  <div {...props} style={{ fontSize: "14px", padding: "8px" }}>
                    {option === "" ? "All Regions" : option}
                  </div>
                )}
                isOptionEqualToValue={(option, value) => option === value}
                freeSolo={false}
                clearOnBlur
                selectOnFocus
                clearIcon={null}
                // Custom filtering for better search experience
                filterOptions={(options, { inputValue }) => {
                  if (!inputValue) return ["", ...options];
                  return options.filter((option) =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
              />
            </div>

            {/* Clear Filters & Results Info */}
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>
                {pagination.itemsOnCurrentPage || 0} of{" "}
                {pagination.totalItems || 0} results
                {filtersLoading && " (Loading filters...)"}
              </span>
              {(searchTerm || cityFilter || regionFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Content - with proper padding for fixed pagination */}
        <div className={`${pagination.totalPages > 1 ? "pb-20" : "pb-4"}`}>
          {!loading && (
            <>
              {view === "customers" ? (
                // Customers List - ENHANCED VERSION
                <div className="space-y-3">
                  {Object.values(customersWithEquipment).map(
                    ({ customer, equipment, amcContracts, equipmentItems }) => {
                      const matchedEquipment = getMatchedEquipmentInfo(
                        equipmentItems,
                        searchTerm
                      );

                      return (
                        <div
                          key={customer?.customercodeid || "unknown"}
                          className="bg-white rounded-lg shadow p-3    border border-gray-200 m-2 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() =>
                            handleSelectCustomer({ customer, equipment })
                          }
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                                {customer?.customername || "Unknown Customer"}
                              </h3>
                              <p className="text-xs text-blue-600 mt-1">
                                Customer Code ID:{" "}
                                {customer?.customercodeid || "N/A"}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-500">
                                Equipment
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {equipment.length}
                              </div>
                            </div>
                          </div>

                          {/* Show matched equipment info when searching */}
                          {matchedEquipment && searchTerm.trim() && (
                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="text-xs text-yellow-800 font-medium mb-1">
                                Matched Equipment:
                              </div>
                              <div className="text-xs text-yellow-700">
                                <div className="font-mono">
                                  {matchedEquipment.serialnumber}
                                </div>
                                <div className="text-xs text-yellow-600 line-clamp-1">
                                  {matchedEquipment.materialdescription}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-1 mb-3">
                            {customer?.hospitalname && (
                              <div className="flex items-center text-xs text-gray-600">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <span className="line-clamp-1">
                                  {customer.hospitalname}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center text-xs text-gray-600">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span>{customer?.city || "N/A"}</span>
                              {customer?.region && (
                                <span className="ml-1 px-1 py-0.5 bg-gray-100 text-xs rounded">
                                  {customer.region}
                                </span>
                              )}
                            </div>

                            {customer?.telephone && (
                              <div className="flex items-center text-xs text-gray-600">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                <span>{customer.telephone}</span>
                              </div>
                            )}
                          </div>

                          <button className="w-full py-2 bg-blue-600 text-white text-sm rounded-md font-medium hover:bg-blue-700 transition-colors">
                            Select Customer
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                // Equipment List
                <div className="m-2 ">
                  {/* Selected Customer Info */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-sm text-gray-900">
                      {selectedCustomer?.customer?.customername || "Unknown"}
                    </h3>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <span>
                        📍 {selectedCustomer?.customer?.city || "N/A"}
                      </span>
                      <span className="ml-3">
                        📞 {selectedCustomer?.customer?.telephone || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Equipment Items */}
                  <div className="space-y-3 ">
                    {filteredEquipment.map((item) => {
                      const { equipment, amcContract } = item;
                      const selected = selectedItems.some(
                        (i) => i.equipment._id === equipment._id
                      );
                      const warrantyEnd = new Date(
                        equipment.custWarrantyenddate
                      );
                      const isWarrantyExpired = warrantyEnd < new Date();

                      return (
                        <div
                          key={equipment._id}
                          className={`bg-white rounded-lg  shadow p-3 border-2 cursor-pointer hover:shadow-md transition-all ${
                            selected
                              ? "border-blue-500 shadow-md"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleSelectEquipment(item)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                                {equipment.materialdescription ||
                                  "Unknown Equipment"}
                              </h3>
                              <p className="text-xs text-blue-600 mt-1">
                                Serial: {equipment.serialnumber}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                selected ? "bg-blue-500" : "bg-gray-300"
                              }`}
                            >
                              {selected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                Material Code:
                              </span>
                              <span className="font-mono text-gray-700">
                                {equipment.materialcode}
                              </span>
                            </div>

                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Status:</span>
                              <span
                                className={`px-1 py-0.5 rounded text-xs ${
                                  equipment.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {equipment.status || "Unknown"}
                              </span>
                            </div>

                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                Customer Warranty End:
                              </span>
                              <span
                                className={`px-1 py-0.5 rounded text-xs ${
                                  isWarrantyExpired
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {warrantyEnd.toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                            {amcContract ? (
                              <div>
                                <span className="font-medium text-green-700">
                                  AMC Active
                                </span>
                                <div className="text-gray-600">
                                  Ends:{" "}
                                  {new Date(
                                    amcContract.enddate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-orange-700">
                                  No AMC
                                </span>
                                <div className="text-gray-600">
                                  Eligible for contract
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            className={`w-full py-2 text-sm rounded-md font-medium transition-colors ${
                              selected
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {selected ? "Remove" : "Select"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results */}
              {equipmentData.length === 0 && (
                <div className="text-center py-8 m-2">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467.881-6.127 2.325M12 3c2.485 0 4.751.848 6.523 2.27"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    No Results
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Try different search terms
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Conditional Pagination - Only shows when needed */}
        <Pagination />

        {/* Fixed Bottom Button for Equipment Selection */}
        {view === "equipment" && (
          <div
            className={`fixed ${
              pagination.totalPages > 1 ? "bottom-16" : "bottom-0"
            } left-0 right-0 mb-12 bg-white border-t p-3 z-30`}
          >
            <div className="max-w-md mx-auto ">
              <button
                onClick={handleNext}
                disabled={selectedItems.length === 0}
                className="w-full py-3 mb-2 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Proposal ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
