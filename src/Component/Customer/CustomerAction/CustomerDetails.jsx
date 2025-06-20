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
      customer.customercodeid
    );

    fetch(
      `${process.env.REACT_APP_BASE_URL}/collections/checkequipments/${customer.customercodeid}`
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
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/searchcustomer")}
        >
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
        <h2 className="text-xl font-bold">Customer Details</h2>
      </div>

      <div className="p-4 space-y-2">
        <p>
          <strong>Customer Code:</strong> {customer.customercodeid || "N/A"}
        </p>
        <p>
          <strong>Customer Name:</strong> {customer.customername || "N/A"}
        </p>
        <p>
          <strong>Hospital Name:</strong> {customer.hospitalname || "N/A"}
        </p>
        <p>
          <strong>Street:</strong> {customer.street || "N/A"}
        </p>
        <p>
          <strong>City:</strong> {customer.city || "N/A"}
        </p>
        <p>
          <strong>District:</strong> {customer.district || "N/A"}
        </p>
        <p>
          <strong>Postal Code:</strong> {customer.postalcode || "N/A"}
        </p>
        <p>
          <strong>Region:</strong> {customer.region || "N/A"}
        </p>
        <p>
          <strong>Country:</strong> {customer.country || "N/A"}
        </p>
        <p>
          <strong>PAN Number:</strong> {customer.pannumber || "N/A"}
        </p>
        <p>
          <strong>GST Number:</strong> {customer.gstnumber || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong> {customer.telephone || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {customer.email || "N/A"}
        </p>

        <button
          className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-800 transition"
          onClick={fetchEquipment}
        >
          CHECK EQUIPMENTS
        </button>
      </div>

      {/* Equipment List */}
      {showEquipment && (
        <div className="px-3 mb-7">
          {loading ? (
            <div className="flex justify-center mt-4">
              <span className="loader"></span>
            </div>
          ) : equipment.length > 0 ? (
            <div className="overflow-x-auto mt-4 rounded-sm">
              <table className="min-w-full bg-white border rounded border-gray-300 shadow-md">
                <thead className="rounded">
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-1 px-6 border text-center">
                      Serial No
                    </th>
                    <th className="py-1 px-6 border text-center">Part No</th>
                    <th className="py-1 px-6 border text-center">Product</th>
                  </tr>
                </thead>
                <tbody className="rounded">
                  {equipment.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`border ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="py-2 px-6 border text-center">
                        {/* Link to EquipmentDetail with serial number in state */}
                        <Link
                          to="/equipmentdetail"
                          state={{ serialNumber: item.serialnumber }}
                          className="text-blue-600 underline"
                        >
                          {item.serialnumber}
                        </Link>
                      </td>
                      <td className="py-2 px-6 border text-center">
                        {item.materialcode}
                      </td>
                      <td className="py-2 px-6 border text-center">
                        {item.materialdescription}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No equipment found for this customer.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
