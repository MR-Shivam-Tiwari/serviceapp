import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/customer/${id}`)
      .then((response) => response.json())
      .then((data) => setCustomer(data))
      .catch((error) =>
        console.error("Error fetching customer details:", error)
      );
  }, [id]);

  const fetchEquipment = () => {
    if (!customer?.customercodeid) {
      console.error("Customer Code ID is missing!");
      return;
    }

    setLoading(true);
    setShowEquipment(true);

    console.log(
      "Fetching equipments for customerCode:",
      customer?.customercodeid
    );

    fetch(
      `${process.env.REACT_APP_BASE_URL}/collections/checkequipments/${customer?.customercodeid}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched equipments:", data);
        setEquipment(data.equipments || []); // Extracting the correct field
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching equipment:", error);
        setLoading(false);
      });
  };

  if (!customer) {
    return (
      <div className="flex mt-20 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/searchcustomer")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Customer Details</h2>
        </div>
      </div>

      {/* Customer Information */}
      <div className="max-w-4xl mx-auto p-4 py-20">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Customer Code:</strong>{" "}
                {customer?.customercodeid || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Customer Name:</strong>{" "}
                {customer?.customername || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Hospital Name:</strong>{" "}
                {customer?.hospitalname || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Street:</strong>{" "}
                {customer?.street || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">City:</strong>{" "}
                {customer?.city || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">District:</strong>{" "}
                {customer?.district || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Postal Code:</strong>{" "}
                {customer?.postalcode || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Region:</strong>{" "}
                {customer?.region || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Country:</strong>{" "}
                {customer?.country || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">PAN Number:</strong>{" "}
                {customer?.pannumber || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">GST Number:</strong>{" "}
                {customer?.gstnumber || "N/A"}
              </p>
            </div>

            <div className="flex items-center pb-2 border-b border-gray-200">
              <div className="w-3 h-3 bg-violet-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Telephone:</strong>{" "}
                {customer?.telephone || "N/A"}
              </p>
            </div>

            <div className="flex items-center">
              <div className="w-3 h-3 bg-rose-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Email:</strong>{" "}
                {customer?.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Check Equipment Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={fetchEquipment}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>CHECK EQUIPMENTS</span>
              </div>
            </button>
          </div>
        </div>

        {/* Equipment Section */}
        {showEquipment && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-teal-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Equipment List
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                  <span className="text-gray-600">Loading equipment...</span>
                </div>
              </div>
            ) : equipment.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Serial No
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Part No
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 border-b">
                        Product
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`border-b hover:bg-gray-50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="py-3 px-6">
                          <button
                            onClick={() =>
                              navigate("/equipmentdetail", {
                                state: { serialNumber: item.serialnumber },
                              })
                            }
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                          >
                            {item.serialnumber}
                          </button>
                        </td>
                        <td className="py-3 px-6 text-gray-700">
                          {item.materialcode}
                        </td>
                        <td className="py-3 px-6 text-gray-700">
                          {item.materialdescription}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">
                  No equipment found for this customer?.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
