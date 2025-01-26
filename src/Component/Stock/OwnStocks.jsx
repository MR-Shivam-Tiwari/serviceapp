import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OwnStocks = () => {
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the API
    const fetchStockData = async () => {
      try {
        const response = await fetch("http://localhost:5000/collections/hubstocks");
        const data = await response.json();
        setStockData(data.hubStocks || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Function to determine status text color
  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Inactive":
        return "text-red-600";
      case "Pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Own Stocks</h2>
      </div>
      <div className="px-4">
        {/* Loading Spinner */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <>
            {/* Stock Table */}
            <div className="mb-4">
              <table className="w-full border rounded border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left border-b border-gray-300">Material Code</th>
                    <th className="px-4 py-2 text-left border-b border-gray-300">Description</th>
                    <th className="px-4 py-2 text-left border-b border-gray-300">Quantity</th>
                    {/* <th className="px-4 py-2 text-left border-b border-gray-300">Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {stockData.length > 0 ? (
                    stockData.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="px-4 py-2">{item.materialcode}</td>
                        <td className="px-4 py-2">{item.materialdescription}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        {/* <td className={`px-4 py-2 ${getStatusClass(item.status)}`}>
                          {item.status}
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-2 text-center text-red-600 border-b border-gray-300"
                      >
                        No Details Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer Button */}
            <button
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnStocks;
