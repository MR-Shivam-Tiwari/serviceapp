import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";

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
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button className="mr-2 text-white" onClick={() => navigate("/")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="currentColor"
            className="bi bi-arrow-left-short"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
              0 0 1-.708.708l-3-3a.5.5 
              0 0 1 0-.708l3-3a.5.5 
              0 1 1 .708.708L5.707 7.5H11.5a.5.5 
              0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Check Stock</h2>
      </div>

      <div className="px-4">
        {/* Autocomplete Section */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Search & Select Material Code
          </label>
          {isLoadingMaterials ? (
            <div className="flex justify-center mt-4">
              <span className="loader"></span>
            </div>
          ) : (
            <Autocomplete
              // Provide array of objects
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
                  ? { materialcode: selectedMaterial, materialdescription: "" }
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

        {/* Loader for Stock Data */}
        {isLoadingStock ? (
          <div className="flex justify-center mt-4">
            <span className="loader"></span>
          </div>
        ) : (
          <>
            {/* HUB STOCK TABLE */}
            {hubStockData && hubStockData.length > 0 ? (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Hub Stock Data
                </h2>
                <table className="w-full mt-2 border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left border-b border-gray-300">
                        Storage Location
                      </th>
                      <th className="px-4 py-2 text-left border-b border-gray-300">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hubStockData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border-b border-gray-300">
                          {item.storagelocation}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-300">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedMaterial ? (
              <p className="text-gray-500 mb-4">
                No HubStock data available for this material.
              </p>
            ) : null}

            {/* DEALER STOCK TABLE */}
            {dealerStockData && dealerStockData.length > 0 ? (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Dealer Stock Data
                </h2>
                <table className="w-full mt-2 border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left border-b border-gray-300">
                        Dealer City
                      </th>
                      <th className="px-4 py-2 text-left border-b border-gray-300">
                        Unrestricted Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealerStockData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border-b border-gray-300">
                          {item.dealercity}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-300">
                          {item.unrestrictedquantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedMaterial ? (
              <p className="text-gray-500">
                No DealerStock data available for this material.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default CheckStock;
