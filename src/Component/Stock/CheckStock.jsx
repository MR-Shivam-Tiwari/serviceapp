import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
import { ArrowLeft, Package, MapPin, Building2, Search } from "lucide-react";

function CheckStock() {
  // Material list (for Autocomplete)
  const [materialOptions, setMaterialOptions] = useState([]);
  // Track which material is selected (for display in the text field)
  const [selectedMaterial, setSelectedMaterial] = useState("");

  // Store HubStock & DealerStock data
  const [hubStockData, setHubStockData] = useState([]);
  const [dealerStockData, setDealerStockData] = useState([]);

  // Loading states
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  const navigate = useNavigate();

  // ----------------------------------
  // Fetch the material list on mount
  // ----------------------------------
  useEffect(() => {
    const fetchMaterialList = async () => {
      setIsLoadingMaterials(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/hubstocks/material-list`
        );
        const data = await response.json();
        // data example:
        // [
        //   { materialcode: "ABC123", materialdescription: "Description 1" },
        //   { materialcode: "XYZ789", materialdescription: "Description 2" }
        // ]
        setMaterialOptions(data);
      } catch (error) {
        console.error("Error fetching material list:", error);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterialList();
  }, []);

  // ----------------------------------
  // Handle selection in Autocomplete
  // ----------------------------------
  const handleMaterialSelect = async (event, value) => {
    if (!value) {
      // Reset if nothing is selected
      setSelectedMaterial("");
      setHubStockData([]);
      setDealerStockData([]);
      return;
    }

    // Display "CODE (DESCRIPTION)" in text field
    setSelectedMaterial(`${value.materialcode} (${value.materialdescription})`);

    // Only pass code to the backend
    const codeToSend = value.materialcode;

    setIsLoadingStock(true);
    try {
      // Fetch combined stock data (Hub + Dealer)
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/hubstocks/check-material/${codeToSend}`
      );
      const data = await response.json();
      // data should look like { hubStockData: [...], dealerStockData: [...] }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header with Glassmorphism Effect */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-wide">
            Check Stock 
            </h1>
          </div>
        </div>
      </div>

      <div className="p-3 max-w-4xl mx-auto">
        {/* Search Section with Enhanced Design */}
        <div className="mb-5">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Search className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-semibold text-gray-800">
                Search & Select Material Code
              </label>
            </div>

            {isLoadingMaterials ? (
              <div className="flex justify-center py-8">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="">
                  {isLoadingMaterials ? (
                    <div className="flex justify-center mt-4">
                      <span className="loader"></span>
                    </div>
                  ) : (
                    <Autocomplete
                      // Provide array of objects
                      placeholder="Search Material Code"
                      options={materialOptions}
                      // Show "CODE (DESCRIPTION)" in the text field after selection
                      getOptionLabel={(option) =>
                        `${option.materialcode} (${option.materialdescription})`
                      }
                      // Render the dropdown items with a bit of styling
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          style={{ padding: "8px 12px", cursor: "pointer" }}
                        >
                          {option.materialcode} - {option.materialdescription}
                        </li>
                      )}
                      // The 'value' for the text field
                      value={
                        selectedMaterial
                          ? {
                              materialcode: selectedMaterial,
                              materialdescription: "",
                            }
                          : null
                      }
                      // We'll manage the displayed text ourselves
                      isOptionEqualToValue={(option, val) =>
                        // Since val might be a string "CODE (DESC)", we can do a contains check
                        `${option.materialcode} (${option.materialdescription})` ===
                        val.materialcode
                      }
                      onChange={handleMaterialSelect}
                      // Text field styling
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search & Select Material Code"
                          variant="outlined"
                          size="md"
                          sx={{
                            backgroundColor: "#f3f3f3",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-root": {
                              padding: "8px 12px",
                            },
                          }}
                        />
                      )}
                      sx={{
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State for Stock Data */}
        {isLoadingStock ? (
          <div className="flex justify-center py-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hub Stock Section */}
            {hubStockData && hubStockData.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Hub Stock Data
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-emerald-50">
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-emerald-100">
                          Storage Location
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-emerald-100">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hubStockData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200"
                        >
                          <td className="px-6 py-4 border-b border-gray-100 text-gray-700 font-medium">
                            {item.storagelocation}
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedMaterial ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  No Hub Stock data available for this material.
                </p>
              </div>
            ) : null}

            {/* Dealer Stock Section */}
            {dealerStockData && dealerStockData.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Dealer Stock Data
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-blue-100">
                          Dealer City
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-blue-100">
                          Unrestricted Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerStockData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                        >
                          <td className="px-6 py-4 border-b border-gray-100 text-gray-700 font-medium">
                            {item.dealercity}
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {item.unrestrictedquantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedMaterial ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  No Dealer Stock data available for this material.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Enhanced OK Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-8 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <span className="text-lg tracking-wide">Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckStock;
