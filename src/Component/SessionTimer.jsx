// components/SessionTimer.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const SessionTimer = ({ showCountdown = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Don't run timer on public routes
    const publicRoutes = [
      "/login",
      "/reset-password",
      "/forgot-password",
      "/verify-otp",
      "/reset-password-otp",
    ];
    const isPublicRoute = publicRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (isPublicRoute) {
      return;
    }

    const updateTimer = () => {
      const expiryTime = localStorage.getItem("sessionExpiry");
      if (!expiryTime) {
        return;
      }

      const now = new Date();
      const expiry = new Date(expiryTime);
      const remaining = expiry - now;

      if (remaining <= 0) {
        // Session expired - logout user
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sessionExpiry");
        toast.error("Session expired at 10 PM. Please login again.");
        navigate("/login");
        return;
      }

      setTimeLeft(remaining);

      // Show warning 5 minutes before expiry
      if (remaining <= 5 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
        toast.error("Your session will expire in 5 minutes at 10 PM", {
          duration: 10000,
        });
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [navigate, location.pathname, showWarning]);

  // Format time for display
  const formatTimeLeft = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Don't render countdown on public routes
  const publicRoutes = [
    "/login",
    "/reset-password",
    "/forgot-password",
    "/verify-otp",
    "/reset-password-otp",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (!showCountdown || isPublicRoute || timeLeft <= 0) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 m-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs z-50">
      Session ends: {formatTimeLeft(timeLeft)}
    </div>
  );
};

export default SessionTimer;
