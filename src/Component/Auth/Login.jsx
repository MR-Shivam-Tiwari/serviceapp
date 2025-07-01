import React, { useEffect, useState } from "react";
import axios from "axios"; // To make API requests
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Import the toast function from react-hot-toast

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
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
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // If login is successful, store the token and user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("deviceId", deviceId);
      toast.success("Login Successful!");

      // Clear form
      setEmployeeId("");
      setPassword("");

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
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg w-full">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-14">
          <img
            src="/Skanray-logo.png"
            alt="Skanray Logo"
            className="w-20 mb-2"
          />
          <h2 className="text-sm rubik-semibold text-gray-500 font-bold text-center">
            SKANRAY SERVICE PORTAL
          </h2>
        </div>

        {/* Welcome Text */}
        <h3 className="text-3xl font-semibold text-start mb-2">Welcome Back</h3>
        <p className="text-gray-500 text-start mb-6">
          Let’s get started by filling out the form below.
        </p>

        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          {/* Employee ID */}
          <div className="mb-4">
            <label htmlFor="employeeId" className="sr-only">
              Employee ID
            </label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter Employee ID"
              className="w-full mt-1 p-3 rounded-lg bg-[#F1F4F8] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full mt-1 p-3 rounded-lg bg-[#F1F4F8] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-4 text-gray-600"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  fill="currentColor"
                  className="bi bi-eye-slash"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                  <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  fill="currentColor"
                  className="bi bi-eye"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                </svg>
              )}
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-4 text-center">
          <a
            href="/reset-password"
            className="text-blue-600 hover:underline text-sm"
          >
            Reset Password
          </a>
        </div>
        <div className="mt-2 text-center">
          <a
            href="/forgot-password"
            className="text-gray-500 font-semibold hover:underline text-sm"
          >
            Forgot Password?
          </a>
        </div>
      </div>

      {/* Toast Container */}
    </div>
  );
};

export default Login;
