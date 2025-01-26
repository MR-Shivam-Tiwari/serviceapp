import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ComplaintDetailsPage = () => {
  const { complaintId } = useParams(); // Get complaintId from URL
  const [complaint, setComplaint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch complaint details by ID
    fetch(`http://localhost:5000/collections/pendingcomplaints/${complaintId}`)
      .then((response) => response.json())
      .then((data) => {
        setComplaint(data);
      })
      .catch((error) =>
        console.error("Error fetching complaint details:", error)
      );
  }, [complaintId]);

  const handleBackClick = () => {
    navigate("/pendingcomplaints"); // Navigate back to the list of pending complaints
  };

  if (!complaint) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button className="mr-2 text-white" onClick={handleBackClick}>
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
        <h2 className="text-xl font-bold">Complaint Details</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between">
            <span className="font-medium">Complaint Number:</span>
            <span>{complaint._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Serial Number:</span>
            <span>{complaint.serialnumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Part Number:</span>
            <span>{complaint.partnumber || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            <span>{complaint.description || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Customer Name:</span>
            <span>{complaint.customername || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">City:</span>
            <span>{complaint.city || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Customer No:</span>
            <span>{complaint.customerno || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span>{complaint.email || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Complaint Type:</span>
            <span>{complaint.notificationtype || "[Text Widget]"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Complaint Status:</span>
            <span>{complaint.status || "[Text Widget]"}</span>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700"
            onClick={() => alert("Update Complaint functionality")}
          >
            Update Complaint
          </button>
          <button
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 "
            onClick={() => alert("Close Complaint functionality")}
          >
            Close Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailsPage;
