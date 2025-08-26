"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MapPin,
  Building2,
  AlertTriangle,
  Search,
  ChevronRight,
} from "lucide-react";

function CustomersPage() {
  const navigate = useNavigate();
  const { region, city } = useParams();
  const decodedRegion = decodeURIComponent(region);
  const decodedCity = decodeURIComponent(city);
  const [allPms, setAllPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedPms = localStorage.getItem("allPmsData");
    if (storedPms) {
      setAllPms(JSON.parse(storedPms));
    } else {
      navigate("/preventive-maintenance");
    }
  }, [navigate]);

  const uniqueCustomers = [
    ...new Set(
      allPms
        .filter((pm) => pm.region === decodedRegion && pm.city === decodedCity)
        .map((pm) => pm.customerCode)
    ),
  ].filter(Boolean);

  // Filter customers based on search query
  const filteredCustomers = uniqueCustomers.filter((customerCode) =>
    customerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomerSelect = (customerCode) => {
    navigate(
      `/pm-list/${encodeURIComponent(decodedRegion)}/${encodeURIComponent(
        decodedCity
      )}/${encodeURIComponent(customerCode)}`
    );
  };

  const handleBackToCities = () => {
    navigate(`/pm-cities/${encodeURIComponent(decodedRegion)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-5 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={handleBackToCities}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
              Customers - {decodedCity}
            </h1>
          </div>
        </div>
        <div className="pb-3">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative px-4">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-[160px] pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCustomers.length ? (
              filteredCustomers.map((customerCode) => {
                const customerPmsData = allPms.filter(
                  (pm) =>
                    pm.customerCode === customerCode &&
                    pm.region === decodedRegion &&
                    pm.city === decodedCity
                );
                const firstPm = customerPmsData[0];
                const duePms = customerPmsData.filter(
                  (pm) => pm.pmStatus === "Due" || pm.pmStatus === "Overdue"
                ).length;

                return (
                  <div
                    key={customerCode}
                    onClick={() => handleCustomerSelect(customerCode)}
                    className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCustomerSelect(customerCode)
                    }
                  >
                    <div className="relative">
                      {/* Card glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:bg-white/90">
                        {/* Customer header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">
                                {customerCode}
                              </h3>
                              <p className="text-sm text-slate-500">
                                Customer Code
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
                        </div>

                        {/* Location info */}
                        {firstPm && (
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-slate-600" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm text-slate-500">
                                  Region
                                </span>
                                <div className="font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg inline-block">
                                  {firstPm.region}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm text-slate-500">
                                  City
                                </span>
                                <div className="font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-lg inline-block">
                                  {firstPm.city}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Due PMs status */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                duePms > 0 ? "bg-red-100" : "bg-green-100"
                              }`}
                            >
                              <AlertTriangle
                                className={`w-4 h-4 ${
                                  duePms > 0 ? "text-red-600" : "text-green-600"
                                }`}
                              />
                            </div>
                            <div>
                              <span className="text-sm text-slate-500">
                                Due PMs
                              </span>
                              <div
                                className={`font-bold text-lg ${
                                  duePms > 0 ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {duePms}
                              </div>
                            </div>
                          </div>

                          <div className="text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors">
                            View Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Enhanced empty state with better visual design */
              <div className="col-span-full">
                <div className="relative max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 to-indigo-200/50 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-12 text-center shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-3">
                      {searchQuery
                        ? "No Customers Match Your Search"
                        : "No Customers Found"}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      {searchQuery
                        ? `No customers found matching "${searchQuery}" in ${decodedCity}.`
                        : `There are no customers with PM data available in ${decodedCity}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomersPage;
