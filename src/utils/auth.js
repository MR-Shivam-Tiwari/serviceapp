// utils/auth.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Function to logout user
export const logoutUser = (navigate, showToast = true) => {
  // Clear all auth data from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("sessionExpiry");
  
  if (showToast) {
    toast.error("Session expired. Please login again.");
  }
  
  // Redirect to login
  if (navigate) {
    navigate("/login");
  } else {
    // Fallback if navigate is not available
    window.location.href = "/login";
  }
};

// Function to check if session is expired
export const isSessionExpired = () => {
  const expiryTime = localStorage.getItem("sessionExpiry");
  if (!expiryTime) return true;
  
  return new Date() >= new Date(expiryTime);
};

// Function to get time until 4 PM logout
export const getTimeUntilLogout = () => {
  const expiryTime = localStorage.getItem("sessionExpiry");
  if (!expiryTime) return 0;
  
  const now = new Date();
  const expiry = new Date(expiryTime);
  return Math.max(0, expiry - now);
};

// Setup axios interceptor for handling expired tokens
export const setupAxiosInterceptors = (navigate) => {
  // Clear any existing interceptors to avoid duplicates
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();
  
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle expired tokens
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const errorCode = error.response?.data?.errorCode;
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'SESSION_EXPIRED' || errorCode === 'NO_TOKEN') {
          logoutUser(navigate, true);
        }
      }
      return Promise.reject(error);
    }
  );
};
