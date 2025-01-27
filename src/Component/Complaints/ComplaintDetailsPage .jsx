import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ComplaintDetailsPage = () => {
  const { complaintId } = useParams(); // Get complaintId from URL
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Local state for form fields:
  const [problemDetails, setProblemDetails] = useState("");
  const [sparesRequired, setSparesRequired] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    // Fetch the existing complaint details
    fetch(`http://localhost:5000/collections/pendingcomplaints/${complaintId}`)
      .then((response) => response.json())
      .then((data) => {
        setComplaint(data);

        // Optionally populate the form fields with existing data from the server
        setProblemDetails(data.reportedproblem || "");
        setSparesRequired(data.sparerequest || "");
        setRemarks(data.remark || "");
      })
      .catch((error) =>
        console.error("Error fetching complaint details:", error)
      );
  }, [complaintId]);

  // Navigate back to the main complaints list
  const handleBackClick = () => {
    navigate("/pendingcomplaints");
  };

  // Show the "Update Form" instead of the details
  const handleShowUpdateForm = () => {
    setShowUpdateForm(true);
  };

  // Send the updated data via PUT request
  const handleUpdateComplaint = () => {
    fetch(`http://localhost:5000/collections/pendingcomplaints/${complaintId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requesteupdate: true,          // If you want to set requesteupdate true
        reportedproblem: problemDetails,
        sparerequest: sparesRequired,
        remark: remarks,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update the complaint");
        }
        return response.json();
      })
      .then(() => {
        setShowSuccessModal(true);
      })
      .catch((error) => console.error("Error updating complaint:", error));
  };

  // If complaint data is not loaded yet, show a loading indicator
  if (!complaint) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* ===================
          VIEW #1: DETAILS
      =================== */}
      {!showUpdateForm ? (
        <>
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
                onClick={handleShowUpdateForm}
              >
                Update Complaint
              </button>
              <button
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={() => alert("Close Complaint functionality")}
              >
                Close Complaint
              </button>
            </div>
          </div>
        </>
      ) : (
        /* =========================
           VIEW #2: UPDATE FORM
         ========================= */
        <div>
          <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
            <button
              className="mr-2 text-white"
              onClick={() => setShowUpdateForm(false)}
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
            <h2 className="text-xl font-bold">Update Complaint</h2>
          </div>

          <div className="px-3">
            {/* Display existing complaint info */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Complaint Number:</label>
              <div className="border p-2 rounded">{complaint._id}</div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Complaint Type:</label>
              <div className="border p-2 rounded">
                {complaint.notificationtype}
              </div>
            </div>

            {/* Problem Details field */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Problem Details:</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="unit not working"
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
              />
            </div>

            {/* Spares Required field */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Spares Required:</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={sparesRequired}
                onChange={(e) => setSparesRequired(e.target.value)}
              />
            </div>

            {/* Remarks field */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Description/Remarks:
              </label>
              <textarea
                className="border p-2 rounded w-full"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            {/* Submit button */}
            <button
              className="bg-primary w-full text-white py-2 px-4 rounded-md hover:bg-blue-700"
              onClick={handleUpdateComplaint}
            >
              UPDATE COMPLAINT
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-3 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <h3 className="text-lg font-bold mb-4">Success!</h3>
            <p>Your complaint has been updated successfully.</p>
            <button
              className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-green-700"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/pendingcomplaints");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailsPage;
