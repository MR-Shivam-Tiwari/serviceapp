import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, Wrench, Phone } from "lucide-react";
import toast from "react-hot-toast";

const shortcutButtons = [
  {
    id: 1,
    name: "Home",
    path: "/",
    icon: <Home className="w-5 h-5" />,
    activeColor: "text-blue-600",
  },
  {
    id: 3,
    name: "Installation",
    path: "/installation",
    icon: <Wrench className="w-5 h-5" />,
    activeColor: "text-orange-600",
  },
  {
    id: 4,
    name: "Complaints",
    path: "/complaints",
    icon: <Phone className="w-5 h-5" />,
    activeColor: "text-red-600",
  },
  {
    id: 2,
    name: "Profile",
    path: "/user-profile",
    icon: <User className="w-5 h-5" />,
    activeColor: "text-green-600",
  },
];

const ShortcutFooter = ({ safeAreaInsets }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (button) => {
    const loadingToast = toast.loading(`Opening ${button.name}...`);

    setTimeout(() => {
      toast.dismiss(loadingToast);

      if (location.pathname === button.path) {
        window.location.reload();
        // toast.success(`${button.name} refreshed!`);
      } else {
        navigate(button.path);
        // toast.success(`Welcome to ${button.name}!`);
      }
    }, 300);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100"
      style={{
        paddingBottom: `${safeAreaInsets?.bottom || 20}px`,
      }}
    >
      <div className="flex items-center justify-around px-4 py-3">
        {shortcutButtons.map((button) => {
          const isActive = location.pathname === button.path;

          return (
            <button
              key={button.id}
              onClick={() => handleNavigation(button)}
              className="flex flex-col items-center space-y-1 py-1 px-2 transition-all duration-200 ease-out transform active:scale-95"
            >
              <div
                className={`transition-colors duration-200 ${
                  isActive ? button.activeColor : "text-gray-400"
                }`}
              >
                {button.icon}
              </div>

              <span
                className={`text-xs transition-colors duration-200 ${
                  isActive
                    ? `${button.activeColor} font-medium`
                    : "text-gray-400 font-normal"
                }`}
              >
                {button.name}
              </span>

              {/* Simple bottom line indicator */}
              <div
                className={`h-0.5 w-6 rounded-full transition-all duration-200 ${
                  isActive
                    ? `${button.activeColor.replace(
                        "text-",
                        "bg-"
                      )} opacity-100`
                    : "bg-transparent opacity-0"
                }`}
              ></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShortcutFooter;
