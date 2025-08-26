import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

function SelectCustomer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive data from the previous page
  const {
    installItems = [],
    abnormalCondition = "",
    voltageData = {},
  } = location.state || {};

  // States for fetching and filtering customers
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
    }, 500);

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
        url = `${
          process.env.REACT_APP_BASE_URL
        }/collections/searchcustomer?page=${page}&limit=${PAGE_SIZE}&q=${encodeURIComponent(
          query.trim()
        )}`;
      } else {
        url = `${process.env.REACT_APP_BASE_URL}/collections/customer?page=${page}&limit=${PAGE_SIZE}`;
      }

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 1);
      setTotalCustomers(data.totalCustomers || 0);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
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

  // Handle selecting a customer
  const handleSelectCustomer = (customer) => {
    navigate("/installation-summary", {
      state: {
        installItems,
        customer,
        abnormalCondition,
        voltageData,
      },
    });
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 py-3 shadow-lg">
        <div className="flex justify-between items-center">
          <button
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-40`}
                onClick={() => setCurrentPage(page)}
                disabled={loading}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>

        <div className="text-center mt-2 text-xs text-gray-500">
          Page {currentPage} of {totalPages} • {totalCustomers} customers
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg sticky top-0 z-50">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/installation")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Search Customer</h1>
        </div>
      </div>

      {/* Main Content with top margin for fixed header */}
      <main className="flex-1  ">
        {/* Search Section */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-3 py-3 shadow-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Search by name, phone, email, or city..."
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {searchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <svg
                    className="w-5 h-5"
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
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400"
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
              )}
            </div>
          </div>

          {/* Results info */}
          {(debouncedSearchQuery || totalCustomers > 0) && !loading && (
            <div className="mt-2 text-xs text-gray-600">
              {totalCustomers} customer{totalCustomers !== 1 ? "s" : ""}{" "}
              {debouncedSearchQuery
                ? `found for "${debouncedSearchQuery}"`
                : ""}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Customer Cards */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 180px)" }}
        >
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600 text-sm">
                {debouncedSearchQuery
                  ? "Searching customers..."
                  : "Loading customers..."}
              </span>
            </div>
          )}

          {!loading && (
            <div className="px-3 py-2 space-y-2">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <div
                    key={customer?._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 text-base mb-2">
                        {customer?.customername || "Unknown Customer"}
                      </h4>

                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {customer?.telephone && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
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
                            <span className="text-gray-600">
                              {customer.telephone}
                            </span>
                          </div>
                        )}

                        {customer?.city && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
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
                            <span className="text-gray-600">
                              {customer.city}
                            </span>
                          </div>
                        )}

                        {customer?.customercodeid && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span className="text-gray-600">
                              Code: {customer.customercodeid}
                            </span>
                          </div>
                        )}

                        {customer?.email && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-gray-600 truncate">
                              {customer.email.length > 25
                                ? `${customer.email.slice(0, 25)}...`
                                : customer.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      onClick={() => handleSelectCustomer(customer)}
                      disabled={loading}
                    >
                      SELECT
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No customers found
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm px-4">
                    {debouncedSearchQuery
                      ? `No customers match your search for "${debouncedSearchQuery}"`
                      : "No customers available at the moment"}
                  </p>
                  {debouncedSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm"
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
      </main>

      {/* Fixed Bottom Pagination */}
      <Pagination />
    </div>
  );
}

export default SelectCustomer;
