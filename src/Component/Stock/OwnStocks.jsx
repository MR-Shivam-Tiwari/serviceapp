import { ArrowLeft, Package, Search, TrendingUp, Minus, TrendingDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OwnStocks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeid: "",
    userid: "",
    dealerCode: "",
    usertype: "",
  });

  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const raw = localStorage.getItem("user");
        const storedUser = raw ? JSON.parse(raw) : null;

        if (!storedUser) {
          setLoading(false);
          return;
        }

        const extractedUserInfo = {
          firstName: storedUser.firstname || "",
          lastName: storedUser.lastname || "",
          employeeid: storedUser.employeeid || "",
          userid: storedUser.id || "",
          dealerCode: storedUser.dealerCode || storedUser?.dealerInfo?.dealerCode || "",
          usertype: storedUser.usertype || "",
        };

        setUserInfo(extractedUserInfo);

        let identifier;
        if (extractedUserInfo.usertype === "skanray") {
          identifier = extractedUserInfo.employeeid;
        } else {
          identifier = extractedUserInfo.dealerCode;
        }

        if (!identifier) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/dealerstocks/materials/${identifier}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStockData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setStockData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStock = stockData.filter(item => 
    item.materialcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.materialdescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = stockData.length;
  const totalQuantity = stockData.reduce((sum, item) => sum + item.unrestrictedquantity, 0);

  const getStockStatus = (qty) => {
    if (qty > 50) return { label: 'High', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: TrendingUp };
    if (qty > 20) return { label: 'Medium', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: Minus };
    return { label: 'Low', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', icon: TrendingDown };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg backdrop-blur-sm">
        <div className="max-w-md mx-auto flex items-center px-4 py-3">
          <button
            className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 active:scale-95 transition-all mr-3"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Stock Inventory</h1>
            <p className="text-xs text-blue-100 font-medium">Real-time tracking</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin [animation-direction:reverse]"></div>
            </div>
            <p className="mt-4 text-gray-600 text-sm font-semibold">Loading inventory...</p>
            <p className="mt-1 text-xs text-gray-500">Fetching your stock data</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-in">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-200/50">
                <div className="text-3xl font-black text-blue-600 mb-1">{totalItems}</div>
                <div className="text-sm font-semibold text-blue-600">Total Items</div>
                <div className="text-xs text-blue-500 mt-2 font-medium">In inventory</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-200/50">
                <div className="text-3xl font-black text-green-600 mb-1">{totalQuantity}</div>
                <div className="text-sm font-semibold text-green-600">Total Qty</div>
                <div className="text-xs text-green-500 mt-2 font-medium">Units available</div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-5 animate-fade-in" style={{animationDelay: '100ms'}}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Stock Items */}
            {filteredStock.length > 0 ? (
              <div className="space-y-3">
                {filteredStock.map((item, index) => {
                  const status = getStockStatus(item.unrestrictedquantity);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all active:scale-[0.98] animate-slide-up"
                      style={{animationDelay: `${index * 50}ms`}}
                    >
                      {/* Header with Code and Quantity */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse"></div>
                            <span className="text-sm font-black text-gray-900 truncate">
                              {item.materialcode}
                            </span>
                          </div>
                        </div>
                        
                        {/* Quantity Badge with Animation */}
                        <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r ${status.color} shadow-lg shadow-current/30 transform transition-all hover:scale-110`}>
                          <div className="flex items-center gap-1">
                            <StatusIcon className="w-3.5 h-3.5 text-white animate-bounce" style={{animationDuration: '2s'}} />
                            <span className="text-sm font-black text-white">
                              QTY {item.unrestrictedquantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description Box */}
                      <div className={`${status.bgColor} rounded-xl p-3 border border-current border-opacity-20`}>
                        <div className="flex items-start gap-2">
                          <Package className={`w-4 h-4 ${status.textColor} flex-shrink-0 mt-0.5`} />
                          <p className={`text-xs leading-relaxed font-medium ${status.textColor}`}>
                            {item.materialdescription}
                          </p>
                        </div>
                      </div>

                      
                       
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce" style={{animationDuration: '3s'}}>
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">
                  {searchQuery ? 'No Results' : 'No Stock'}
                </h3>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try different keywords' : 'Stock inventory is empty'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default OwnStocks;
