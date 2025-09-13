import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
import { ArrowLeft, MapPin, Building2, Search } from "lucide-react";
import ShortcutFooter from "../Home/ShortcutFooter";

function CheckStock() {
  const [materialOptions, setMaterialOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [hubStockData, setHubStockData] = useState([]);
  const [dealerStockData, setDealerStockData] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* HEADER: UNCHANGED */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Check Stock
            </h1>
          </div>
        </div>
      </div>

      <div className="p-3 max-w-4xl mx-auto py-20">
        {/* Search Section compact */}
        <div className="mb-4">
          <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow border border-white/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-semibold text-gray-800">
                Search & Select Material Code
              </label>
            </div>

            {isLoadingMaterials ? (
              <div className="flex justify-center py-5">
                <div className="relative">
                  <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-8 h-8 border-[3px] border-transparent border-t-purple-400 rounded-full animate-spin [animation-direction:reverse]" />
                </div>
              </div>
            ) : (
              <Autocomplete
                size="sm"
                variant="soft"
                placeholder="Search Material Code"
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
                  <li
                    {...props}
                    className="px-3 py-2 text-[13px] text-gray-800"
                  >
                    <span className="font-medium">{option.materialcode}</span>{" "}
                    <span className="text-gray-500">
                      — {option.materialdescription}
                    </span>
                  </li>
                )}
                slotProps={{
                  listbox: { className: "py-1 max-h-64" },
                  popupIndicator: { className: "text-gray-600" },
                  clearIndicator: { className: "text-gray-600" },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="sm"
                    variant="soft"
                    label="Material Code"
                    sx={{
                      "--Input-minHeight": "36px",
                      "--Input-paddingInline": "10px",
                      "--Input-decoratorChildHeight": "28px",
                      "& .MuiInput-input": { fontSize: 13 },
                    }}
                  />
                )}
                sx={{ borderRadius: 1 }}
              />
            )}
          </div>
        </div>

        {/* Stock Loading */}
        {isLoadingStock ? (
          <div className="flex justify-center py-6">
            <div className="relative">
              <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 w-10 h-10 border-[3px] border-transparent border-t-purple-400 rounded-full animate-spin [animation-direction:reverse]" />
            </div>
          </div>
        ) : (
          <div className="space-y-5 mb-20">
            {/* Hub Stock */}
            {hubStockData?.length > 0 ? (
              <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow border border-white/30 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/25 rounded-full">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Hub Stock
                    </h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-emerald-50">
                        <th className="px-3 py-2 text-left text-[13px] font-semibold text-gray-800 border-b border-emerald-100">
                          Storage Location
                        </th>
                        <th className="px-3 py-2 text-left text-[13px] font-semibold text-gray-800 border-b border-emerald-100">
                          Qty
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hubStockData.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition"
                        >
                          <td className="px-3 py-2 border-b border-gray-100 text-[13px] text-gray-700">
                            {item.storagelocation}
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedOption ? (
              <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow border border-white/30 p-5 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No Hub Stock data found.
                </p>
              </div>
            ) : null}

            {/* Dealer Stock */}
            {dealerStockData?.length > 0 ? (
              <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow border border-white/30 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/25 rounded-full">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Dealer Stock
                    </h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <th className="px-3 py-2 text-left text-[13px] font-semibold text-gray-800 border-b border-blue-100">
                          Dealer City
                        </th>
                        <th className="px-3 py-2 text-left text-[13px] font-semibold text-gray-800 border-b border-blue-100">
                          Qty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px]">
                      {dealerStockData.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition"
                        >
                          <td className="px-3 py-2 border-b border-gray-100 text-gray-700">
                            {item.dealercity}
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.unrestrictedquantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedOption ? (
              <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow border border-white/30 p-5 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No Dealer Stock data found.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Continue button compact */}
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
      </div>
    </div>
  );
}

export default CheckStock;
