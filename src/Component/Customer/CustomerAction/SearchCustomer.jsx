import { ModalClose } from "@mui/joy";
import { ArrowLeft, Search } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const SearchCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [error, setError] = useState("");

  const [lastSearchQuery, setLastSearchQuery] = useState("");

  // Keyboard and viewport handling
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Safe area insets for mobile devices
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 20, // Default bottom padding for navigation
  });

  // Ref to prevent unnecessary API calls
  const abortControllerRef = useRef(null);

  // Handle keyboard visibility and viewport changes
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const originalHeight = window.screen.height;

      // If height reduced significantly, keyboard is likely open
      if (currentHeight < originalHeight * 0.75) {
        setKeyboardVisible(true);
      } else {
        setKeyboardVisible(false);
      }
      setViewportHeight(currentHeight);
    };

    // Detect safe area insets for mobile
    const detectSafeArea = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isIOS) {
        // iOS safe area
        setSafeAreaInsets({
          top: 44, // Status bar
          bottom: 34, // Home indicator
        });
      } else if (isAndroid) {
        // Android navigation bar
        setSafeAreaInsets({
          top: 24, // Status bar
          bottom: 48, // Navigation bar
        });
      } else {
        // Desktop/Web
        setSafeAreaInsets({
          top: 0,
          bottom: 20,
        });
      }
    };

    detectSafeArea();

    // Listen for viewport changes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // For mobile browsers, also listen to visual viewport API if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Reset page to 1 when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "" && lastSearchQuery !== "") {
      setLastSearchQuery("");
      setCurrentPage(1);
    }
  }, [searchQuery, lastSearchQuery]);

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
        url = `${process.env.REACT_APP_BASE_URL
          }/collections/searchcustomerphone?page=${page}&limit=${PAGE_SIZE}&q=${encodeURIComponent(
            query.trim()
          )}`;
      } else {
        url = `${process.env.REACT_APP_BASE_URL}/collections/customerphone?page=${page}&limit=${PAGE_SIZE}`;
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
    fetchData(lastSearchQuery, currentPage);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [lastSearchQuery, currentPage, fetchData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchClick = () => {
    setLastSearchQuery(searchQuery);
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
          className={`px-3 py-1 border rounded ${i === currentPage
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
    <div
      className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50"
      style={{
        height: keyboardVisible ? `${viewportHeight}px` : "100vh",
        maxHeight: keyboardVisible ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
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
            <div className="relative flex items-center space-x-2 ">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3  h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Search by hospital name, email, phone, or city..."
                disabled={loading}
              />
              {/* {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400  hover:text-gray-600  transition-colors p-2"
                  disabled={loading}
                >
                  <ModalClose className="w-5 h-5" />
                </button>
              )} */}
              <button
                onClick={handleSearchClick}
                className="bg-primary px-3 py-1 h-10 rounded-md text-white text-sm hover:bg-blue-700"
                disabled={loading}
              >
                <Search className="w-6 h-6" />

              </button>
            </div>

            {/* Results count */}
            {(lastSearchQuery || totalCustomers > 0) && !loading && (
              <p className="mt-2 text-sm text-gray-600">
                {totalCustomers} result
                {totalCustomers !== 1 ? "s" : ""}{" "}
                {lastSearchQuery
                  ? `found for "${lastSearchQuery}"`
                  : ""}
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
      <div
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: keyboardVisible
            ? "10px"
            : totalPages > 1
              ? `${120 + safeAreaInsets.bottom}px`
              : `${20 + safeAreaInsets.bottom}px`,
        }}
      >
        <div className="max-w-4xl mx-auto p-3">
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">
                {lastSearchQuery
                  ? "Searching customers..."
                  : "Loading customers..."}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Please wait while we fetch the latest data
              </p>
            </div>
          ) : (
            <div>
              {/* Customer Cards */}
              {customers.length > 0 ? (
                <div className="space-y-2 pb-4">
                  {customers.map((customer, index) => {
                    const displayHospitalName = getDisplayHospitalName(customer);
                    const displayEmail = customer?.email || "";
                    return (
                      <div
                        key={customer?._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="p-3">
                          {/* Hospital Name */}
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                            <h3 className="text-sm font-bold text-gray-800 truncate">
                              {displayHospitalName}
                            </h3>
                          </div>

                          {/* Customer Details Compact Grid */}
                          <div className="space-y-1.5 mb-2">
                            {/* Customer Code & Phone */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center flex-1 min-w-0">
                                <svg className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-gray-500 mr-1">Code:</span>
                                <span className="font-semibold text-gray-700 truncate">{customer?.customercodeid || "N/A"}</span>
                              </div>
                              <div className="flex items-center flex-1 min-w-0 ml-2">
                                <svg className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="font-semibold text-gray-700 truncate">{customer?.telephone || "N/A"}</span>
                              </div>
                            </div>

                            {/* Email & City */}
                            <div className="flex items-center justify-between text-xs mt-2">
                              <div className="flex items-center flex-1 min-w-0">
                                <svg className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium text-gray-700 truncate">{displayEmail || "N/A"}</span>
                              </div>
                              <div className="flex items-center flex-1 min-w-0 ml-2">
                                <svg className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium text-gray-700 truncate">{customer?.city || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Compact Select Button */}
                          <button
                            className="w-full py-2 mt-2 flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg text-white text-xs font-semibold rounded-lg hover:shadow-md active:scale-98 transform transition-all duration-150 focus:outline-none disabled:opacity-50"
                            onClick={() => navigate(`/customer-details/${customer?._id}`)}
                            disabled={loading}
                          >
                            SELECT
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">No customers found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {lastSearchQuery ? `No match for "${lastSearchQuery}"` : "No customers available"}
                  </p>
                  {lastSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all duration-150"
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

      {/* Fixed Pagination - Above navigation bar */}
      {totalPages > 1 && !keyboardVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40"
          style={{
            paddingBottom: `${safeAreaInsets.bottom + 0}px`, // Add extra padding above navigation
          }}
        >
          <div className="max-w-4xl mx-auto p-3">
            <Pagination />
          </div>
        </div>
      )}

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

