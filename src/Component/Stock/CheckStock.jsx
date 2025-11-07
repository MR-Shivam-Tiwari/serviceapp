import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
import { ArrowLeft, MapPin, Building2, Search, TrendingUp } from "lucide-react";

function CheckStock() {
  const [materialOptions, setMaterialOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [hubStockData, setHubStockData] = useState([]);
  const [dealerStockData, setDealerStockData] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterialList = async () => {
      setIsLoadingMaterials(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/hubstocks/material-list`
        );
        const data = await response.json();
        setMaterialOptions(data || []);
      } catch (error) {
        console.error("Error fetching material list:", error);
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchMaterialList();
  }, []);

  const fetchStock = async (code) => {
    setIsLoadingStock(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/hubstocks/check-material/${code}`
      );
      const data = await response.json();
      setHubStockData(data.hubStockData || []);
      setDealerStockData(data.dealerStockData || []);
    } catch (error) {
      console.error("Error fetching combined stock data:", error);
      setHubStockData([]);
      setDealerStockData([]);
    } finally {
      setIsLoadingStock(false);
    }
  };

  const handleMaterialChange = (event, value) => {
    setSelectedOption(value);
    if (!value) {
      setHubStockData([]);
      setDealerStockData([]);
      return;
    }
    fetchStock(value.materialcode);
  };

  const hubTotal = hubStockData.reduce((sum, item) => sum + item.quantity, 0);
  const dealerTotal = dealerStockData.reduce((sum, item) => sum + item.unrestrictedquantity, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-md mx-auto flex items-center px-4 py-3">
          <button
            className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md active:scale-95 transition-all mr-3"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Check Stock</h1>
            <p className="text-xs text-blue-100 font-medium">Hub & Dealer inventory</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-6">
        {/* Search Section */}
        <div className="mb-5 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500">
                <Search className="w-4 h-4 text-white" />
              </div>
              <label className="text-sm font-black text-gray-900">
                Search Material Code
              </label>
            </div>

            {isLoadingMaterials ? (
              <div className="flex justify-center py-6">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 border-3 border-transparent border-r-indigo-500 rounded-full animate-spin [animation-direction:reverse]"></div>
                </div>
              </div>
            ) : (
              <Autocomplete
                size="sm"
                variant="soft"
                placeholder="Type material code..."
                options={materialOptions}
                value={selectedOption}
                inputValue={inputValue}
                onChange={handleMaterialChange}
                onInputChange={(_, val) => setInputValue(val)}
                getOptionLabel={(option) =>
                  option?.materialcode
                    ? `${option.materialcode} (${option.materialdescription})`
                    : ""
                }
                isOptionEqualToValue={(opt, val) =>
                  opt.materialcode === val.materialcode
                }
                renderOption={(props, option) => (
                  <li {...props} className="px-3 py-2 text-xs">
                    <span className="font-bold text-gray-900">{option.materialcode}</span>
                    <span className="text-gray-500 ml-2">— {option.materialdescription}</span>
                  </li>
                )}
                slotProps={{
                  listbox: { className: "py-1 max-h-48" },
                  popupIndicator: { className: "text-gray-400" },
                  clearIndicator: { className: "text-gray-400" },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="sm"
                    variant="soft"
                    sx={{
                      "--Input-minHeight": "40px",
                      "--Input-paddingInline": "12px",
                      "& .MuiInput-input": { fontSize: 13, fontWeight: 600 },
                    }}
                  />
                )}
              />
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingStock ? (
          <div className="flex justify-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-1 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin [animation-direction:reverse]"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-20">
            {/* Hub Stock */}
            {hubStockData?.length > 0 ? (
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-200 animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Hub Stock</h3>
                        <p className="text-xs text-emerald-100">{hubStockData.length} locations</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <span className="text-sm font-black text-white">{hubTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white divide-y">
                  {hubStockData.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 hover:bg-emerald-50 transition-all active:scale-95"
                      style={{animation: `slideUp 0.3s ease-out ${idx * 50}ms both`}}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.storagelocation}</p>
                          <p className="text-xs text-gray-500 mt-1">Storage Location</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                          <span className="text-sm font-black text-white">{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedOption ? (
              <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-6 text-center animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-emerald-700">No Hub Stock</p>
              </div>
            ) : null}

            {/* Dealer Stock */}
            {dealerStockData?.length > 0 ? (
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200 animate-slide-up" style={{animationDelay: '100ms'}}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Dealer Stock</h3>
                        <p className="text-xs text-blue-100">{dealerStockData.length} dealers</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <span className="text-sm font-black text-white">{dealerTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white divide-y">
                  {dealerStockData.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 hover:bg-blue-50 transition-all active:scale-95"
                      style={{animation: `slideUp 0.3s ease-out ${idx * 50}ms both`}}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-900">{item.dealername}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{item.dealercity}</span>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
                          <span className="text-sm font-black text-white">{item.unrestrictedquantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedOption ? (
              <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-6 text-center animate-fade-in">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-700">No Dealer Stock</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CheckStock;
