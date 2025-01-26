import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/collections/customer/${id}`)
      .then((response) => response.json())
      .then((data) => setCustomer(data))
      .catch((error) =>
        console.error("Error fetching customer details:", error)
      );
  }, [id]);

  if (!customer) {
    return <p>Loading...</p>;
  }

  return (
    <div className="  ">
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button className="mr-2 text-white" onClick={() => navigate("/searchcustomer")}>
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
      <div className=" m-6">
        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
        <div className="space-y-2">
          <p>
            <strong>Customer Code:</strong> {customer.code || "N/A"}
          </p>
          <p>
            <strong>Customer Name:</strong> {customer.customername || "N/A"}
          </p>
          <p>
            <strong>Street:</strong> {customer.street || "N/A"}
          </p>
          <p>
            <strong>City:</strong> {customer.city || "N/A"}
          </p>
          <p>
            <strong>District:</strong> {customer.district || "[Text Widget]"}
          </p>
          <p>
            <strong>Postal Code:</strong> {customer.postalcode || "N/A"}
          </p>
          <p>
            <strong>Region:</strong> {customer.region || "N/A"}
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
        </div>
        <button
          className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-800 transition"
          onClick={() => navigate(`/check-equipment/${customer.code}`)}
        >
          CHECK EQUIPMENTS
        </button>
      </div>
    </div>
  );
};

export default CustomerDetails;
