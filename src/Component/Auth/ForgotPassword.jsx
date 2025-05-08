import React from "react";
import { useNavigate } from "react-router-dom";
const ForgotPassword = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center    ">
      <div className="w-full ">
        {/* Header Section */}
        <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
          <button
            onClick={() => navigate("/login")}
            className="mr-2 text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="currentColor"
              class="bi bi-arrow-left-short"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold  ">Forgot Password</h2>
        </div>
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-14">
          <img
            src="/Skanray-logo.png"  
            alt="Skanray Logo"
            className="w-20 mb-2"
          />

          <h2 className="text-sm rubik-semibold text-gray-500 font-bold text-center ">
            SKANRAY SERVICE PORTAL
          </h2>
        </div>
        {/* Form Section */}
        <div className="mt-6 px-8">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            Forgot Password
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            We will send you an email with a link to reset your password, please
            enter the Employee associated with your account below.
          </p>
          <form>
            <div className="mb-4">
              <label
                htmlFor="employeeId"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Your Employee ID...
              </label>
              <input
                type="text"
                id="employeeId"
                className="w-full mt-1 p-3   rounded-lg bg-[#F1F4F8] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Employee ID"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
