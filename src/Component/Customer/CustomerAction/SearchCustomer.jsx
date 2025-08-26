import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const SearchCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [error, setError] = useState("");
  
  // Ref to prevent unnecessary API calls
  const abortControllerRef = useRef(null);

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery]);

  // Fetch data function
  const fetchData = useCallback(async (query, page) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError("");

    try {
      let url = "";
      if (query && query.trim() !== "") {
        url = `${process.env.REACT_APP_BASE_URL}/collections/searchcustomer?page=${page}&limit=${PAGE_SIZE}&q=${encodeURIComponent(query.trim())}`;
      } else {
        url = `${process.env.REACT_APP_BASE_URL}/collections/customer?page=${page}&limit=${PAGE_SIZE}`;
      }

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 1);
      setTotalCustomers(data.totalCustomers || 0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
        setError("Failed to fetch customers. Please try again.");
        setCustomers([]);
        setTotalPages(1);
        setTotalCustomers(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch data when debounced search query or current page changes
  useEffect(() => {
    fetchData(debouncedSearchQuery, currentPage);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearchQuery, currentPage, fetchData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getDisplayHospitalName = (customer) =>
    customer?.hospitalname || customer?.customername || "";

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`px-3 py-1 border rounded ${
            i === currentPage
              ? "bg-blue-600 text-white font-bold"
              : "hover:bg-blue-100 text-gray-700"
          } mx-1 transition-colors duration-200`}
          disabled={i === currentPage || loading}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-1">
        <button
          className="px-3 py-1 border rounded hover:bg-blue-100 text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
          disabled={currentPage === 1 || loading}
        >
          Prev
        </button>
        {pageButtons}
        <button
          className="px-3 py-1 border rounded bg-blue-600 hover:bg-blue-800 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
          disabled={currentPage === totalPages || loading}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg flex-shrink-0">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            onClick={() => navigate("/customer")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Search Customers</h1>
          </div>
        </div>
      </div>

      {/* Fixed Search Section */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto p-3">
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 "
                placeholder="Search by hospital name, email, phone, or city..."
                disabled={loading}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={loading}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Results count */}
            {(debouncedSearchQuery || totalCustomers > 0) && !loading && (
              <p className="mt-2 text-sm text-gray-600">
                {totalCustomers} result
                {totalCustomers !== 1 ? "s" : ""}{" "}
                {debouncedSearchQuery ? `found for "${debouncedSearchQuery}"` : ""}
              </p>
            )}

            {/* Error message */}
            {error && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-3">
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">
                {debouncedSearchQuery ? "Searching customers..." : "Loading customers..."}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Please wait while we fetch the latest data
              </p>
            </div>
          ) : (
            <div>
              {/* Customer Cards */}
              {customers.length > 0 ? (
                <div className="space-y-4 pb-6">
                  {customers.map((customer, index) => {
                    const displayHospitalName = getDisplayHospitalName(customer);
                    const displayEmail = customer?.email || "";
                    return (
                      <div
                        key={customer?._id}
                        className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Hospital Name */}
                              <div className="flex items-center mb-3">
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                  {displayHospitalName.length > 35
                                    ? displayHospitalName.slice(0, 35) + "..."
                                    : displayHospitalName}
                                </h3>
                              </div>

                              {/* Customer Details Grid */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  {/* Customer Name */}
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-400 mr-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Customer Code
                                      </p>
                                      <p className="text-sm font-semibold text-gray-700">
                                        {customer?.customercodeid || "N/A"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Phone */}
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-400 mr-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      />
                                    </svg>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Phone
                                      </p>
                                      <p className="text-sm font-semibold text-gray-700">
                                        {customer?.telephone || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Email */}
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-400 mr-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Email
                                      </p>
                                      <p className="text-sm font-semibold text-gray-700">
                                        {displayEmail.length > 25
                                          ? displayEmail.slice(0, 25) + "..."
                                          : displayEmail || "N/A"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* City */}
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-400 mr-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        City
                                      </p>
                                      <p className="text-sm font-semibold text-gray-700">
                                        {customer?.city || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Select Button */}
                          <div className="mt-4 w-full flex-shrink-0">
                            <button
                              className="px-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                navigate(`/customer-details/${customer?._id}`)
                              }
                              disabled={loading}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <span>SELECT</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No customers found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {debouncedSearchQuery
                      ? `No customers match your search for "${debouncedSearchQuery}"`
                      : "No customers available at the moment"}
                  </p>
                  {debouncedSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                      disabled={loading}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Pagination */}
      <div className="bg-white shadow-lg border-t flex-shrink-0">
        <div className="max-w-4xl mx-auto  p-3">
          <Pagination />
        </div>
      </div>

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .group {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SearchCustomer;
