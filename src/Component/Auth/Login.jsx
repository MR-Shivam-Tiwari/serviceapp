"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId");
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = "device_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("deviceId", newDeviceId);
      setDeviceId(newDeviceId);
    }
  }, []);

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
    }
    if (!password.trim()) {
      errors.password = "Password is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/login`,
        {
          employeeid: employeeId,
          password: password,
          deviceid: deviceId,
        }
      );

      // Store token, user data, and expiry time
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("deviceId", deviceId);
      localStorage.setItem("sessionExpiry", response.data.expiryTime); // Store expiry time

      toast.success("Login Successful!");

      // Clear form
      setEmployeeId("");
      setPassword("");
      setFormErrors({});
      navigate("/");
    } catch (error) {
      const errorCode = error?.response?.data?.errorCode;
      const errorMessage = error?.response?.data?.message;

      if (errorCode === "DEVICE_MISMATCH") {
        toast.error("User already logged in on another device");
      } else if (errorCode === "ACCOUNT_DEACTIVATED") {
        toast.error(
          "Your account has been deactivated. Please contact administrator."
        );
      } else if (errorCode === "MOBILE_ACCESS_DENIED") {
        toast.error(
          errorMessage || "Access denied to mobile app. Contact admin."
        );
      } else if (errorCode === "NO_LOGIN_EXPIRY") {
        toast.error(
          errorMessage ||
            "You do not have a login expiry date. You cannot login."
        );
      } else if (errorCode === "LOGIN_EXPIRED") {
        toast.error(
          errorMessage || "Your login date has expired. Please contact admin."
        );
      } else {
        toast.error(errorMessage || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      <span>Signing In...</span>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden h-fit max-h-[95vh]">
        {/* Compact Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex flex-col items-center text-white">
            <div className="bg-white rounded-full p-2 mb-2 shadow-lg">
              <img
                src="/Skanray-logo.png"
                alt="Skanray Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h2 className="text-sm font-bold tracking-wide">
              SKANRAY SERVICE PORTAL
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 py-6">
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              Welcome Back
            </h3>
            <p className="text-gray-600 text-xs">Please sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee ID */}
            <div className="space-y-1">
              <label
                htmlFor="employeeId"
                className="text-xs font-medium text-gray-700 block"
              >
                Employee ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    if (formErrors.employeeId) {
                      setFormErrors((prev) => ({ ...prev, employeeId: "" }));
                    }
                  }}
                  placeholder="Enter your Employee ID"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white text-sm ${
                    formErrors.employeeId
                      ? "border-red-300 focus:border-red-500"
                      : "border-transparent focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              {formErrors.employeeId && (
                <p className="text-red-500 text-xs">{formErrors.employeeId}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-xs font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) {
                      setFormErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white pr-12 text-sm ${
                    formErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-transparent focus:border-blue-500"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                      <path d="m2.854 2.146a.5.5 0 1 0-.708.708l10.5 10.5a.5.5 0 0 0 .708-.708l-10.5-10.5z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs">{formErrors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform text-sm ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              }`}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : "Sign In"}
            </button>
          </form>

          {/* Enhanced Password Action Buttons */}
          <div className="mt-6 space-y-3">
            {/* Reset Password Button */}
            <button
              onClick={() => navigate("/reset-password")}
              className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md border border-gray-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm">Reset Password</span>
            </button>

            {/* Forgot Password Button */}
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md border border-blue-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">Forgot Password?</span>
            </button>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">© 2024 Skanray Technologies</p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center space-y-3 shadow-2xl mx-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-700 font-medium text-sm">
              Authenticating...
            </p>
            <p className="text-gray-500 text-xs text-center">
              Please wait while we verify your credentials
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
