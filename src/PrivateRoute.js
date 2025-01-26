import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem("token");

  // If there is no token, navigate to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists, render the component
  return <Component {...rest} />;
};

export default PrivateRoute;
