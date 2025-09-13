import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ShortcutFooter from "../Home/ShortcutFooter";

function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [allPms, setAllPms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
    manageremail: [],
  });

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

    const fetchAllPms = async () => {
      setIsLoading(true);
      try {
        // Call without pagination parameters to get ALL data (original behavior)
        const url = `${process.env.REACT_APP_BASE_URL}/upload/allpms/${userInfo.employeeId}`;
        const res = await fetch(url);
        const data = await res.json();
        const pmsData = Array.isArray(data.pms) ? data.pms : [];

        console.log(`Loaded ${pmsData.length} PM records`);
        setAllPms(pmsData);
        localStorage.setItem("allPmsData", JSON.stringify(pmsData));
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } catch (e) {
        console.error("Error fetching PM data", e);
        setAllPms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPms();
  }, [userInfo.employeeId]);

  useEffect(() => {
    if (allPms.length > 0) {
      navigate("/pm-regions");
    }
  }, [allPms, navigate]);

  return (
    <div className="min-h-screen bg-gray-200">
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center py-14">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-white">Loading PM data...</p>
          </div>
        </div>
      )}

      <div className="fixed  left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
              Preventive Maintenance
            </h1>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-24">
        <div className="p-4 text-center">
          <p className="text-gray-600">
            Loading preventive maintenance data...
          </p>
        </div>
      </div>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}

export default PreventiveMaintenance;
