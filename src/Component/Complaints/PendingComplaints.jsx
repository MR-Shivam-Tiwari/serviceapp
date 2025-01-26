import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PendingComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetching complaints data from the API
    fetch("http://localhost:5000/collections/pendingcomplaints")
      .then((response) => response.json())
      .then((data) => {
        setComplaints(data.pendingComplaints);
      })
      .catch((error) => console.error("Error fetching complaints:", error));
  }, []);

  const handleDetailsClick = (complaintId) => {
    navigate(`/pendingcomplaints/${complaintId}`); // Navigate to the complaint details page
  };

  return (
    <div>
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/complaints")}
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
        <h2 className="text-xl font-bold">Pending Complaints</h2>
      </div>

      <div className="p-4 space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint._id}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="text-lg font-semibold">
                {complaint.notificationtype.length > 10
                  ? complaint.notificationtype.slice(0, 10) + "..."
                  : complaint.notificationtype}
              </div>

              <div className="text-sm text-gray-700">
                {complaint.serialnumber}
              </div>
              <div className="text-sm text-gray-500">
                {complaint.problemtype} - {complaint.problemname}
              </div>
            </div>

            <button
              className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
              onClick={() => handleDetailsClick(complaint._id)}
            >
              DETAILS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingComplaintsPage;
