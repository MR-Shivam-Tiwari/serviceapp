import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Calendar, Building2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { componentConfig } from "./componentConfig";
import ShortcutFooter from "./ShortcutFooter";

function Homes() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // Added to prevent multiple clicks
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  const [headerHeight, setHeaderHeight] = useState(85);

  useEffect(() => {
    // Safe area detect करें
    const detectSafeArea = () => {
      if (Capacitor.isNativePlatform()) {
        const topInset =
          parseInt(
            getComputedStyle(document.documentElement)
              .getPropertyValue("--safe-area-inset-top")
              .replace("px", "")
          ) || 0;
        const bottomInset =
          parseInt(
            getComputedStyle(document.documentElement)
              .getPropertyValue("--safe-area-inset-bottom")
              .replace("px", "")
          ) || 0;

        setSafeAreaInsets({
          top: Math.max(topInset, 30),
          bottom: Math.max(bottomInset, 30),
        });

        // Header height with safe area (reduced)
        setHeaderHeight(70 + Math.max(topInset, 10));
      } else {
        setSafeAreaInsets({ top: 20, bottom: 10 });
        setHeaderHeight(65);
      }
    };

    detectSafeArea();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserData(storedUser);
      if (storedUser?.role?.roleId) {
        fetchRoleData(storedUser?.role?.roleId);
      }
    }
  }, []);

  const fetchRoleData = async (roleId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/roles/by-roleid/${roleId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch role data");
      }
      const data = await response.json();
      setRoleData(data);
    } catch (error) {
      console.error("Error fetching role data:", error);
      toast.error("Failed to load role permissions");
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed navigation handler
  const handleComponentClick = (component, config) => {
    // Prevent multiple rapid clicks
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      // Direct navigation without setTimeout to prevent race conditions
      navigate(config.path);
      // toast.success(`Opening ${component.name}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to open component");
    } finally {
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // Fixed profile click handler
  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isNavigating) return;

    setIsNavigating(true);
    navigate("/user-profile");
    setTimeout(() => setIsNavigating(false), 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiry");
    navigate("/login");
    toast.success("Logout Successful");
  };

  if (!userData || !roleData || isLoading) {
    return (
      <div
        className="min-h-screen bg-white/80 flex items-center justify-center"
        style={{
          paddingTop: `${safeAreaInsets.top}px`,
          paddingBottom: `${safeAreaInsets.bottom}px`,
          minHeight: "100vh",
        }}
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Loading Dashboard
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we set up your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/80 relative">
      {/* Header - Fixed */}
      <div
        className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm"
        style={{
          paddingTop: `${safeAreaInsets.top}px`,
        }}
      >
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-wide">
                  Skanray Service
                </h2>
                <p className="text-blue-100 text-sm">
                  Professional Service Management
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content starts here */}
      <div
        className="flex flex-col min-h-screen"
        style={{
          paddingTop: `${headerHeight}px`,
          paddingBottom: `${safeAreaInsets.bottom + 90}px`,
        }}
      >
        <div className="flex-1 overflow-y-auto pb-3">
          {/* User info and quick actions header */}
          <div className="p-3 bg-white/80">
            {/* User Profile Card - FIXED */}
            <div
              className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-md border border-blue-100 p-2 cursor-pointer transition-all duration-300 mb-4 active:bg-blue-100"
              onClick={handleProfileClick}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={
                      userData.profileimage
                        ? `${process.env.REACT_APP_BASE_URL || ""}${
                            userData.profileimage
                          }`
                        : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=740"
                    }
                    alt="User Profile"
                    className="w-12 h-12 min-w-[3rem] min-h-[3rem] rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="absolute -bottom-1 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1 space-x-1">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="text-md font-semibold text-gray-800 truncate max-w-[180px]">
                      Hello,{" "}
                      {`${userData.firstname} ${userData.lastname}`.length > 20
                        ? `${userData.firstname} ${userData.lastname}`.slice(
                            0,
                            20
                          ) + "..."
                        : `${userData.firstname} ${userData.lastname}`}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-500" />
                    <p className="text-gray-600 text-sm font-medium truncate max-w-[140px]">
                      {userData.department}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <p className="text-gray-500 text-sm truncate max-w-[160px]">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-blue-600">
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Actions Header */}
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
              Quick Actions
            </h4>
          </div>

          {/* Quick Actions Grid - FIXED */}
          <div className="px-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {roleData.mobileComponents.map((component) => {
                if (component.read && componentConfig[component.name]) {
                  const config = componentConfig[component.name];
                  return (
                    <button
                      key={component.componentId}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleComponentClick(component, config);
                      }}
                      disabled={isNavigating}
                      className={`
                        bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 p-6 
                        transition-all duration-300 transform active:scale-95 active:bg-blue-50
                        ${
                          isNavigating
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl transition-all duration-300">
                          {config.icon}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800 text-sm leading-tight">
                            {component.name.length > 23
                              ? component.name.slice(0, 23) + "..."
                              : component.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Shortcut Footer */}
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />

      {/* Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to logout from your account?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 active:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 active:from-red-600 active:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homes;
