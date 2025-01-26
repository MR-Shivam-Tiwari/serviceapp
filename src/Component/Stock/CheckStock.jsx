import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/joy/Autocomplete";
import { TextField } from "@mui/joy";
function CheckStock() {
  const [serialOptions, setSerialOptions] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState("");
  const [stockData, setStockData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch serial numbers from the API on component mount
    const fetchSerialNumbers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/collections/dealerstocks/ids"
        );
        const data = await response.json();
        setSerialOptions(data); // Assuming the API returns an array of serial numbers
      } catch (error) {
        console.error("Error fetching serial numbers:", error);
      }
    };

    fetchSerialNumbers();
  }, []);

  const handleSerialSelect = async (event, value) => {
    if (!value) return;
    setSelectedSerial(value);

    try {
      const response = await fetch(
        `http://localhost:5000/collections/dealerstocks/count/${value}`
      );
      const data = await response.json();
      setStockData(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setStockData([]);
    }
  };

  return (
    <div className="w-full">
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Check Stock</h2>
      </div>
      <div className="px-4">
        {/* Autocomplete Section */}
        <div className="mb-4">
          <label>Search & Select Serial Number</label>
          <Autocomplete
            options={serialOptions}
            getOptionLabel={(option) => option}
            onChange={handleSerialSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search & Select Serial Number"
                variant="outlined"
              />
            )}
            sx={{ backgroundColor: "#f3f3f3" }}
          />
        </div>

        {/* Stock Data */}
        {stockData && stockData.length > 0 ? (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Hub Stock Data
            </h2>
            <table className="w-full mt-2 border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left border-b border-gray-300">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left border-b border-gray-300">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b border-gray-300">
                      {item.dealercity}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-300">
                      {item.stockCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No stock data available.</p>
        )}
      </div>
    </div>
  );
}

export default CheckStock;
