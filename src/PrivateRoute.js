import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isSessionExpired, logoutUser } from './utils/auth';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem("token");

  // Check if session is expired
  if (!token || isSessionExpired()) {
    // Clear expired session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiry");
    
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
