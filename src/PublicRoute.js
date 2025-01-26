import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem("token");

  // If there's a token (user is logged in), redirect to homepage
  if (token) {
    return <Navigate to="/" />;
  }

  // If no token, render the login page
  return <Component {...rest} />;
};

export default PublicRoute;
