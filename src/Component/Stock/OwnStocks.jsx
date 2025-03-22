import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OwnStocks = () => {
  const navigate = useNavigate();

  // Store user info from localStorage
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
  });

  // State for the DealerStock data we get back
  const [stockData, setStockData] = useState([]);
  // Loader state
  const [loading, setLoading] = useState(true);

  // 1) Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored User Data:", storedUser);
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid, // We'll use this as 'dealercodeid'
        userid: storedUser.id,
      });
    }
  }, []);

  // 2) Fetch DealerStock data using employeeId as dealercodeid
  useEffect(() => {
    const fetchStockData = async () => {
      // If we have no employeeId, skip
      if (!userInfo.employeeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/collections/dealerstocks/materials/${userInfo.employeeId}`
        );
        const data = await response.json();
        // data should be an array of objects like:
        // [ { materialcode, materialdescription, unrestrictedquantity }, ... ]
        setStockData(data || []);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [userInfo.employeeId]);

  // (Optional) Function to determine any status text color if needed
  // const getStatusClass = (status) => {
  //   switch (status) {
  //     case "Active":
  //       return "text-green-600";
  //     case "Inactive":
  //       return "text-red-600";
  //     case "Pending":
  //       return "text-yellow-600";
  //     default:
  //       return "text-gray-600";
  //   }
  // };

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
        <h2 className="text-xl font-bold">Own Stocks</h2>
      </div>

      <div className="px-4">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex mt-20 items-center justify-center">
            {/* Example spinner (replace with your own if needed) */}
            <span className="loader"></span>
          </div>
        ) : (
          <>
            {/* Stock Table */}
            <div className="mb-4">
              <table className="w-full border rounded border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left border-b border-gray-300">
                      Material Code
                    </th>
                    <th className="px-4 py-2 text-left border-b border-gray-300">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left border-b border-gray-300">
                      Unrestricted Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.length > 0 ? (
                    stockData.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{item.materialcode}</td>
                        <td className="px-4 py-2">{item.materialdescription}</td>
                        <td className="px-4 py-2">
                          {item.unrestrictedquantity}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
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
