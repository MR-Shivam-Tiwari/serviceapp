"use client";

import { useState, useEffect } from "react";

import { ArrowLeft, MapPin, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShortcutFooter from "../Home/ShortcutFooter";

function RegionsPage() {
  const navigate = useNavigate();
  const [allPms, setAllPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  useEffect(() => {
    const storedPms = localStorage.getItem("allPmsData");
    if (storedPms) {
      setAllPms(JSON.parse(storedPms));
    } else {
      navigate("/preventive-maintenance");
    }
  }, [navigate]);

  const uniqueRegions = [...new Set(allPms.map((pm) => pm.region))].filter(
    Boolean
  );

  // Filter regions based on search query
  const filteredRegions = uniqueRegions.filter((region) =>
    region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegionSelect = (region) => {
    navigate(`/pm-cities/${encodeURIComponent(region)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Fixed Header - यह हमेशा top पर रहेगा */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg fixed  left-0 right-0 z-50">
        <div className="relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>

          <div className="relative flex items-center p-4 py-5 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Select Region
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Search Input - Header के अंदर ही */}
        <div className="px-4 pb-4">
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-slate-200/60 rounded-lg leading-5 bg-white/90 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl text-slate-700 font-medium"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Sparkles className="w-4 h-4 text-slate-300 group-focus-within:text-blue-400 transition-colors duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area - Header के नीचे padding दिया गया है */}
      <div className="flex-1 pt-[160px] pb-8 mb-20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4">
          {/* Regions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegions.length ? (
              filteredRegions.map((region, index) => (
                <div
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleRegionSelect(region)
                  }
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-slate-50/50 border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-blue-300/60">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Subtle pattern overlay */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-700 transition-colors duration-300">
                            {region}
                          </h3>
                          <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 mt-1"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                            <span className="text-sm font-semibold text-blue-700">
                              {
                                allPms.filter((pm) => pm.region === region)
                                  .length
                              }{" "}
                              PMs
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-600 font-semibold group-hover:text-indigo-600 transition-colors duration-300">
                          <span className="text-sm">View Cities</span>
                          <div className="w-6 h-6 rounded-full bg-blue-100 group-hover:bg-indigo-100 flex items-center justify-center group-hover:translate-x-1 transition-all duration-300">
                            <ArrowLeft className="w-3 h-3 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/60 p-12 text-center relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full -translate-x-20 -translate-y-20"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-indigo-200/20 to-transparent rounded-full translate-x-16 translate-y-16"></div>

                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MapPin className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-3">
                      {searchQuery
                        ? "No Regions Match Your Search"
                        : "No Regions Found"}
                    </h3>
                    <p className="text-slate-500 text-lg leading-relaxed max-w-md mx-auto">
                      {searchQuery
                        ? `No regions found matching "${searchQuery}". Try adjusting your search terms.`
                        : "There are no regions with PM data available at the moment."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}

export default RegionsPage;
