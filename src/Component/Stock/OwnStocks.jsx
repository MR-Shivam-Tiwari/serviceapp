import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OwnStocks = () => {
  const navigate = useNavigate();

  // Store user info from localStorage
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
  });

  // State for the DealerStock data we get back
  const [stockData, setStockData] = useState([]);
  // Loader state
  const [loading, setLoading] = useState(true);

  // 1) Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored User Data:", storedUser);
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid, // We'll use this as 'dealercodeid'
        userid: storedUser.id,
      });
    }
  }, []);

  // 2) Fetch DealerStock data using employeeId as dealercodeid
  useEffect(() => {
    const fetchStockData = async () => {
      // If we have no employeeId, skip
      if (!userInfo.employeeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/dealerstocks/materials/${userInfo.employeeId}`
        );
        const data = await response.json();
        // data should be an array of objects like:
        // [ { materialcode, materialdescription, unrestrictedquantity }, ... ]
        setStockData(data || []);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [userInfo.employeeId]);

  // (Optional) Function to determine any status text color if needed
  // const getStatusClass = (status) => {
  //   switch (status) {
  //     case "Active":
  //       return "text-green-600";
  //     case "Inactive":
  //       return "text-red-600";
  //     case "Pending":
  //       return "text-yellow-600";
  //     default:
  //       return "text-gray-600";
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Own Stock</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3">
        {loading ? (
          /* Enhanced Loading State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">
              Loading your stock inventory...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we fetch the latest data
            </p>
          </div>
        ) : (
          <>
            {/* Stock Inventory Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up animation-delay-200">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-white mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-white">
                      Stock Inventory
                    </h3>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">
                      {stockData.length} Items
                    </span>
                  </div>
                </div>
              </div>

              {stockData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                              />
                            </svg>
                            Material Code
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Description
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                              />
                            </svg>
                            Quantity
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                              <span className="text-sm font-semibold text-gray-900">
                                {item.materialcode}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {item.materialdescription}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  item.unrestrictedquantity > 50
                                    ? "bg-green-100 text-green-800"
                                    : item.unrestrictedquantity > 20
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.unrestrictedquantity}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* No Data State */
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Stock Found
                  </h3>
                  <p className="text-gray-500">
                    No stock details are available at the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8 w-full flex justify-center animate-fade-in-up animation-delay-400">
              <button
                onClick={() => navigate("/")}
                className="px-8 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Continue</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        tbody tr {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OwnStocks;
