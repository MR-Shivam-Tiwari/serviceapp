import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShortcutFooter from "../Home/ShortcutFooter";

const OwnStocks = () => {
  const navigate = useNavigate();

  // Store user info from localStorage
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    dealerCode: "",
  });

  // DealerStock data
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  // 1) Load user info from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const storedUser = raw ? JSON.parse(raw) : null;
      console.log("Stored User Data:", storedUser);
      if (storedUser) {
        setUserInfo({
          firstName: storedUser.firstname || "",
          lastName: storedUser.lastname || "",
          employeeId: storedUser.employeeid || "",
          userid: storedUser.id || "",
          // prefer top-level dealerCode if present, else nested dealerInfo.dealerCode
          dealerCode:
            storedUser.dealerCode || storedUser?.dealerInfo?.dealerCode || "",
        });
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      setUserInfo((prev) => ({ ...prev, dealerCode: "" }));
    }
  }, []); // mount only [9]

  // 2) Fetch DealerStock data using dealerCode
  useEffect(() => {
    const fetchStockData = async () => {
      if (!userInfo?.dealerCode) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/dealerstocks/materials/${userInfo.dealerCode}`
        );
        const data = await response.json();
        setStockData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setStockData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [userInfo?.dealerCode]); // depend exactly on dealerCode [21][22]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* HEADER: UNCHANGED */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Own Stock</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 py-20">
        {loading ? (
          // Compact Loader
          <div className="flex flex-col items-center justify-center py-14">
            <div className="relative">
              <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-10 h-10 border-[3px] border-transparent border-t-purple-500 rounded-full animate-spin [animation-direction:reverse]"></div>
            </div>
            <p className="mt-4 text-gray-600 text-sm font-medium">
              Loading your stock inventory...
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Please wait while we fetch the latest data
            </p>
          </div>
        ) : (
          <>
            {/* Stock Inventory Card */}
            <div className="bg-white rounded-xl mb-20 shadow-md border border-gray-100 overflow-hidden animate-fade-in-up animation-delay-200">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-white mr-2"
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
                    <h3 className="text-base md:text-lg font-semibold text-white">
                      Stock Inventory
                    </h3>
                  </div>
                  <div className="bg-white/20 px-2.5 py-0.5 rounded-full">
                    <span className="text-white text-xs md:text-sm font-medium">
                      {stockData.length} Items
                    </span>
                  </div>
                </div>
              </div>

              {stockData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-3 md:px-4 py-2 text-left text-[11px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1.5 text-gray-500"
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
                            Code
                          </div>
                        </th>
                        <th className="px-3 md:px-4 py-2 text-left text-[11px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1.5 text-gray-500"
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
                        <th className="px-3 md:px-4 py-2 text-left text-[11px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1.5 text-gray-500"
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
                            Qty
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {stockData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-[13px] font-semibold text-gray-900">
                                {item.materialcode}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-2 hidden sm:table-cell">
                            <div className="text-[13px] text-gray-900 font-medium">
                              {item.materialdescription}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.unrestrictedquantity > 50
                                  ? "bg-green-100 text-green-800"
                                  : item.unrestrictedquantity > 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.unrestrictedquantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // No Data State (compact)
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-7 h-7 text-gray-400"
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
                  <h3 className="text-base font-semibold text-gray-700 mb-1">
                    No Stock Found
                  </h3>
                  <p className="text-sm text-gray-500">
                    No stock details are available at the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Action Button compact */}
            {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30">
              <div className="max-w-6xl mx-auto">
                <button
                  onClick={() => navigate("/")}
                  className="px-8 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Continue</span>
                  </div>
                </button>
              </div>
            </div> */}
            <ShortcutFooter safeAreaInsets={safeAreaInsets} />
          </>
        )}
      </div>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(26px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        tbody tr {
          animation: fadeInUp 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OwnStocks;
