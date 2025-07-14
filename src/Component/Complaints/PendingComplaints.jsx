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
} from "lucide-react";
const PendingComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [problemTypeFilter, setProblemTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
  useEffect(() => {
    if (!userInfo.employeeId) return; // Don't fetch if employeeId is missing

    fetch(
      `${process.env.REACT_APP_BASE_URL}/collections/allpendingcomplaints/${userInfo.employeeId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setComplaints(data.pendingComplaints || []);
        setFilteredComplaints(data.pendingComplaints || []);
      })
      .catch((error) => {
        console.error("Error fetching complaints:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userInfo.employeeId]);

  // Handle Search & Filter
  useEffect(() => {
    let filtered = complaints.filter((complaint) => {
      return (
        complaint?.notification_complaintid
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint?.serialnumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint?.customercode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

    if (problemTypeFilter) {
      filtered = filtered.filter(
        (complaint) => complaint?.notificationtype === problemTypeFilter
      );
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, problemTypeFilter, complaints]);

  const handleDetailsClick = (complaintId) => {
    navigate(`/pendingcomplaints/${complaintId}`);
  };
  const getProblemTypeColor = (type) => {
    switch (type) {
      case "Hardware Issue":
        return "from-red-500 to-pink-600";
      case "Software Bug":
        return "from-blue-500 to-indigo-600";
      case "Network Issue":
        return "from-green-500 to-emerald-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  const getProblemTypeBadgeColor = (type) => {
    switch (type) {
      case "Hardware Issue":
        return "bg-red-100 text-red-800 border-red-200";
      case "Software Bug":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Network Issue":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen  ">
      {/* Header with Glassmorphism Effect */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/complaints")}
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Pending Complaints
            </h1>
          </div>
        </div>
      </div>

      <div className="p-3 max-w-6xl mx-auto">
        {/* Enhanced Search & Filter Section */}
        <div className="mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Complaint No, Serial No, Customer Code"
                  className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-red-50 border-2 border-red-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-300 text-gray-700 appearance-none cursor-pointer"
                  value={problemTypeFilter}
                  onChange={(e) => setProblemTypeFilter(e.target.value)}
                >
                  <option value="">All Problem Types</option>
                  {[...new Set(complaints.map((c) => c.notificationtype))].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-400 rounded-full animate-spin animate-reverse"></div>
              </div>
            </div>
          ) : filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint, index) => (
              <div
                key={complaint._id}
                className="bg-white/80  rounded-2xl shadow-xl border   overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Complaint Header with Gradient */}
                <div>
                  <div className="bg-white/90 backdrop-blur-sm mx-1 my-1 rounded-xl p-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left Side - Complaint Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-5 h-5 text-gray-600" />
                          <span className="font-bold text-lg text-gray-800">
                           Complaint No : {complaint.notification_complaintid}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center space-x-2">
                            <Wrench className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Problem Type:{" "}
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getProblemTypeBadgeColor(
                                  complaint.notificationtype
                                )}`}
                              >
                                {complaint.notificationtype}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Serial No:{" "}
                              <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                                {complaint.serialnumber}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Customer:{" "}
                              <span className="text-sm font-medium text-gray-800 bg-blue-100 px-2 py-1 rounded-lg">
                                {complaint.customercode}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Action Button */}
                      <div className="flex flex-col items-center space-y-2">
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 group-hover:animate-pulse"
                          onClick={() => handleDetailsClick(complaint._id)}
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>VIEW DETAILS</span>
                          </span>
                        </button>
                        {complaint.date && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{complaint.date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Complaints Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingComplaintsPage;
