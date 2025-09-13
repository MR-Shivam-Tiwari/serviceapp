import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  AlertCircle,
  User,
  Hash,
  Wrench,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const PendingComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [complaintTypeFilter, setComplaintTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComplaints: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [allComplaintTypes, setAllComplaintTypes] = useState([]);
  const navigate = useNavigate();

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

  // Fetch all complaint types on component mount
  const fetchComplaintTypes = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/complaint-types`
      );
      const data = await response.json();

      if (data.success && data.complaintTypes) {
        setAllComplaintTypes(data.complaintTypes);
        console.log("Fetched complaint types:", data.complaintTypes);
      }
    } catch (error) {
      console.error("Error fetching complaint types:", error);
    }
  };

  // Fetch complaint types when component mounts
  useEffect(() => {
    fetchComplaintTypes();
  }, []);

  // Fetch complaints without filters (main API)
  const fetchAllComplaints = async (page = 1) => {
    if (!userInfo.employeeId) return;

    setIsLoading(true);

    try {
      const url = `${process.env.REACT_APP_BASE_URL}/collections/allpendingcomplaints/${userInfo.employeeId}?page=${page}&limit=10`;

      console.log("Fetching all complaints from URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("All complaints API Response:", data);

      if (data.success && data.pendingComplaints) {
        const complaintsData = Array.isArray(data.pendingComplaints)
          ? data.pendingComplaints
          : [];
        setComplaints(complaintsData);

        if (data.pagination) {
          setPagination(data.pagination);
        }

        console.log("Set complaints:", complaintsData);
      } else {
        console.error("No pendingComplaints in response:", data);
        setComplaints([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalComplaints: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search complaints (search API)
  const searchComplaints = async (page = 1, searchQuery = "") => {
    if (!userInfo.employeeId || !searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const url = `${
        process.env.REACT_APP_BASE_URL
      }/collections/searchpendingcomplaints/${
        userInfo.employeeId
      }?page=${page}&limit=10&search=${encodeURIComponent(searchQuery.trim())}`;

      console.log("Searching from URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("Search API Response:", data);

      if (data.success && data.pendingComplaints) {
        const complaintsData = Array.isArray(data.pendingComplaints)
          ? data.pendingComplaints
          : [];
        setComplaints(complaintsData);

        if (data.pagination) {
          setPagination(data.pagination);
        }

        console.log("Search results:", complaintsData);
      } else {
        console.error("Search failed:", data);
        setComplaints([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalComplaints: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error) {
      console.error("Error searching complaints:", error);
      setComplaints([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter complaints by type (complaint type API)
  const filterByComplaintType = async (page = 1, complaintType = "") => {
    if (!userInfo.employeeId || !complaintType.trim()) return;

    setIsLoading(true);

    try {
      const url = `${
        process.env.REACT_APP_BASE_URL
      }/collections/complaints/type/${encodeURIComponent(
        complaintType
      )}?page=${page}&limit=10&employeeid=${userInfo.employeeId}`;

      console.log("Filtering by complaint type from URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("Complaint type filter API Response:", data);

      if (data.success && data.pendingComplaints) {
        const complaintsData = Array.isArray(data.pendingComplaints)
          ? data.pendingComplaints
          : [];
        setComplaints(complaintsData);

        if (data.pagination) {
          setPagination(data.pagination);
        }

        console.log("Filtered complaints:", complaintsData);
      } else {
        console.error("Filter failed:", data);
        setComplaints([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalComplaints: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error) {
      console.error("Error filtering complaints:", error);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when employeeId is available
  useEffect(() => {
    if (userInfo.employeeId) {
      console.log("Initial fetch for employee:", userInfo.employeeId);
      fetchAllComplaints(1);
    }
  }, [userInfo.employeeId]);

  // Handle search and complaint type filter with debounce
  useEffect(() => {
    if (!userInfo.employeeId) return;

    const delayedAction = setTimeout(() => {
      if (searchTerm.trim()) {
        console.log("Searching with term:", searchTerm);
        searchComplaints(1, searchTerm);
      } else if (complaintTypeFilter) {
        console.log("Filtering by complaint type:", complaintTypeFilter);
        filterByComplaintType(1, complaintTypeFilter);
      } else {
        // If both are cleared, fetch normal data
        console.log("No filters, fetching all complaints");
        fetchAllComplaints(1);
      }
    }, 500);

    return () => clearTimeout(delayedAction);
  }, [searchTerm, complaintTypeFilter, userInfo.employeeId]);

  const handleDetailsClick = (complaintId) => {
    navigate(`/pendingcomplaints/${complaintId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      if (searchTerm.trim()) {
        // If searching, use search API
        searchComplaints(newPage, searchTerm);
      } else if (complaintTypeFilter) {
        // If filtering by complaint type, use complaint type API
        filterByComplaintType(newPage, complaintTypeFilter);
      } else {
        // If no filters, use normal fetch API
        fetchAllComplaints(newPage);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setComplaintTypeFilter(""); // Clear complaint type filter when searching
    }
  };

  const handleComplaintTypeFilter = (e) => {
    setComplaintTypeFilter(e.target.value);
    if (e.target.value) {
      setSearchTerm(""); // Clear search when filtering by complaint type
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearComplaintTypeFilter = () => {
    setComplaintTypeFilter("");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setComplaintTypeFilter("");
  };

  const getProblemTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "hardware issue":
        return "bg-red-100 text-red-800 border-red-200";
      case "software bug":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "network issue":
        return "bg-green-100 text-green-800 border-green-200";
      case "installation":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "maintenance":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return [];

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className={`px-2 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 text-sm ${
          pagination.hasPrevPage
            ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>
    );

    // Page numbers with ellipsis
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-lg font-medium transition-all duration-300 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm text-sm"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500 text-sm">
            ...
          </span>
        );
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500 text-sm">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-lg font-medium transition-all duration-300 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm text-sm"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 text-sm ${
          pagination.hasNextPage
            ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
        }`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    );

    return buttons;
  };

  const currentLoading = isLoading || isSearching;
  const hasActiveFilters = searchTerm || complaintTypeFilter;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center justify-between p-4 text-white">
          <div className="flex items-center">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate("/complaints")}
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl sm:text-2xl text-nowrap font-bold text-white tracking-wide">
                  Pending Complaints
                </h1>
                <p className="text-xs font-medium">
                  Total: {pagination.totalComplaints}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Search & Filter Section */}
        <div className="px-1 pb-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3">
            <div className="flex flex-col gap-3">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by complaint ID, serial number, customer code..."
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-500 text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-lg"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Complaint Type Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300 text-gray-700 appearance-none cursor-pointer text-sm"
                  value={complaintTypeFilter}
                  onChange={handleComplaintTypeFilter}
                >
                  <option value="">All Complaint Types</option>
                  {allComplaintTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-3 p-2 bg-white/20 rounded-lg border border-white/20">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
                    {searchTerm && (
                      <span className="inline-flex items-center bg-white/20 px-2 py-1 rounded-md">
                        <Search className="w-3 h-3 mr-1" />
                        Search: "<strong>{searchTerm}</strong>"
                        <button
                          onClick={clearSearch}
                          className="ml-2 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {complaintTypeFilter && (
                      <span className="inline-flex items-center bg-white/20 px-2 py-1 rounded-md">
                        <Filter className="w-3 h-3 mr-1" />
                        Type: <strong>{complaintTypeFilter}</strong>
                        <button
                          onClick={clearComplaintTypeFilter}
                          className="ml-2 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-medium text-white">
                      {complaints.length} result
                      {complaints.length !== 1 ? "s" : ""}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pt-[240px] pb-20">
        <div className="p-3 max-w-6xl mx-auto">
          {/* Complaints List */}
          <div className="space-y-4 mb-6">
            {currentLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-400 rounded-full animate-spin animate-reverse"></div>
                </div>
                <p className="mt-4 text-gray-600">
                  {isSearching
                    ? "Searching complaints..."
                    : "Loading complaints..."}
                </p>
              </div>
            ) : complaints.length > 0 ? (
              complaints.map((complaint, index) => (
                <div
                  key={complaint._id || index}
                  className="bg-white/90 rounded-xl shadow-lg border overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Side - Complaint Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-600" />
                          <span className="font-bold text-lg text-gray-800">
                            #{complaint.notification_complaintid || "N/A"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Wrench className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Type:{" "}
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getProblemTypeBadgeColor(
                                    complaint.notificationtype
                                  )}`}
                                >
                                  {complaint.notificationtype || "N/A"}
                                </span>
                              </span>
                            </div>

                            <div>
                              {complaint.notificationdate && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(
                                      complaint.notificationdate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Serial No:{" "}
                              <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                {complaint.serialnumber || "N/A"}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Customer:{" "}
                              <span className="text-sm font-medium text-gray-800 bg-blue-100 px-2 py-1 rounded">
                                {complaint.customercode || "N/A"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {complaint.materialdescription && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Material:</span>{" "}
                              {complaint.materialdescription}
                            </div>
                          )}
                          {complaint.reportedproblem && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Issue:</span>{" "}
                              {complaint.reportedproblem}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Action Button */}
                      <div className="flex flex-col items-center space-y-2 lg:w-44">
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                          onClick={() => handleDetailsClick(complaint._id)}
                        >
                          <span className="flex items-center justify-center space-x-1">
                            <span>VIEW DETAILS</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Complaints Found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || complaintTypeFilter
                    ? "Try adjusting your search criteria or filters."
                    : "You don't have any pending complaints at the moment."}
                </p>
                {!userInfo.employeeId && (
                  <p className="text-red-500 mt-2">
                    Employee ID not found. Please login again.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer with Pagination */}
      {pagination.totalPages > 1 && !currentLoading && (
        <div className="fixed bottom-0 pb-10   left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="max-w-6xl mx-auto p-2 pb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              {/* Page Info */}
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-600">
                <div>
                  Page{" "}
                  <span className="font-semibold">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">{pagination.totalPages}</span>
                </div>
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center space-x-1 overflow-x-auto">
                {renderPaginationButtons()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingComplaintsPage;
