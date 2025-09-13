import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PmList from "./PmList";
import ShortcutFooter from "../Home/ShortcutFooter";

function PmsPage() {
  const navigate = useNavigate();
  const { region, city, customerCode } = useParams();
  const decodedRegion = decodeURIComponent(region);
  const decodedCity = decodeURIComponent(city);
  const decodedCustomerCode = decodeURIComponent(customerCode);

  const [allPms, setAllPms] = useState([]);
  const [pms, setPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPms, setSelectedPms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  // Set currentMonth in MM/YYYY format
  const now = new Date();
  const currentMonth = `${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${now.getFullYear()}`;

  useEffect(() => {
    const storedPms = localStorage.getItem("allPmsData");
    const storedUser = localStorage.getItem("userInfo");

    if (storedPms) {
      setAllPms(JSON.parse(storedPms));
    } else {
      navigate("/preventive-maintenance");
    }

    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Filter customer PMs from localStorage data (no search)
  useEffect(() => {
    if (allPms.length > 0 && !searchQuery.trim()) {
      const customerPmsData = allPms.filter(
        (pm) =>
          pm.customerCode === decodedCustomerCode &&
          pm.region === decodedRegion &&
          pm.city === decodedCity &&
          (pm.pmStatus === "Due" || pm.pmStatus === "Overdue")
      );
      setPms(customerPmsData);
      setTotalPages(1);
      setCurrentPage(1);
    }
  }, [allPms, decodedCustomerCode, decodedRegion, decodedCity, searchQuery]);

  // Fetch PMs with search using pagination API
  // In PmsPage.jsx, update the fetchPmsWithSearch function:

  const fetchPmsWithSearch = async (query = "", page = 1) => {
    if (!userInfo.employeeId || !query.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("search", query);
      params.set("page", String(page));
      params.set("limit", "10");
      params.set("pageMode", "offset");
      params.set(
        "searchFields",
        "customerCode,serialNumber,materialDescription,pmType,customername,hospitalname"
      );

      // Use the dedicated search API
      const url = `${process.env.REACT_APP_BASE_URL}/upload/search/pms/${
        userInfo.employeeId
      }?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setPms(data.pms || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } else {
        console.error("Search API Error:", data.message);
        setPms([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching search results", err);
      setPms([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        fetchPmsWithSearch(searchQuery, 1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, userInfo.employeeId]);

  const handleBackToCustomers = () => {
    navigate(
      `/pm-customers/${encodeURIComponent(decodedRegion)}/${encodeURIComponent(
        decodedCity
      )}`
    );
  };

  const handleRemoveAll = () => setSelectedPms([]);

  const handleProceed = () => {
    if (selectedPms.length === 0) {
      alert("Please select at least one PM.");
      return;
    }
    navigate("/pm-details", { state: { selectedPms } });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && searchQuery.trim()) {
      setCurrentPage(newPage);
      fetchPmsWithSearch(searchQuery, newPage);
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
    const {
      AlertTriangle,
      XCircle,
      CheckCircle,
      Calendar,
    } = require("lucide-react");
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
    <div className="min-h-screen bg-gray-200">
      {/* Fixed Header */}
      <div className="fixed  left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={handleBackToCustomers}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl text-nowrap font-bold text-white tracking-wide">
              PMs - {decodedCustomerCode}
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-20 pb-24">
        <div className="p-1">
          <PmList
            pms={pms}
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
        </div>
      </div>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}

export default PmsPage;
