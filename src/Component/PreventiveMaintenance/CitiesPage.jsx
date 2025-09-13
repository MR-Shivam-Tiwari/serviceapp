"use client";

// CitiesPage.js
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Search } from "lucide-react";
import ShortcutFooter from "../Home/ShortcutFooter";

function CitiesPage() {
  const navigate = useNavigate();
  const { region } = useParams();
  const decodedRegion = decodeURIComponent(region);
  const [allPms, setAllPms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const uniqueCities = [
    ...new Set(
      allPms.filter((pm) => pm.region === decodedRegion).map((pm) => pm.city)
    ),
  ].filter(Boolean);

  // Filter cities based on search query
  const filteredCities = uniqueCities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city) => {
    navigate(
      `/pm-customers/${encodeURIComponent(decodedRegion)}/${encodeURIComponent(
        city
      )}`
    );
  };

  const handleBackToRegions = () => {
    navigate("/pm-regions");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="fixed  left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="flex items-center justify-between p-4 py-5 text-white">
          <div className="flex items-center  ">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={handleBackToRegions}
              aria-label="Back to regions"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center  ">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Cities in
                   <span className="text-md">  {decodedRegion}</span>
                </h1>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-blue-200 text-sm">
            <span>Regions</span>
            <span>→</span>
            <span className="text-white font-medium">{decodedRegion}</span>
          </div>
        </div>
        <div className="mx-3 pb-3 ">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-2xl blur-xl"></div>
            <div className="relative px-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-slate-200/60 rounded-lg leading-5 bg-white/90 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-[160px] pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.length ? (
              filteredCities.map((city, index) => (
                <div
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCitySelect(city)
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-indigo-100/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-blue-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                          <Building2 className="w-6 h-6 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                          {city}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                          <span className="text-sm text-gray-600 font-medium">
                            {
                              allPms.filter(
                                (pm) =>
                                  pm.region === decodedRegion &&
                                  pm.city === city
                              ).length
                            }{" "}
                            PMs
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-600 font-semibold group-hover:text-indigo-600 transition-all duration-300 group-hover:translate-x-1">
                          <span className="text-sm">View Customers</span>
                          <div className="w-5 h-5 rounded-full bg-blue-100 group-hover:bg-indigo-100 flex items-center justify-center transition-all duration-300">
                            <span className="text-xs">→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="relative max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Building2 className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {searchQuery
                        ? "No Cities Match Your Search"
                        : "No Cities Found"}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {searchQuery
                        ? `No cities found matching "${searchQuery}" in ${decodedRegion}.`
                        : `There are no cities with PM data available for ${decodedRegion}.`}
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

export default CitiesPage;
