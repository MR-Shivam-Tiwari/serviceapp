import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ComplaintDetailsPage = () => {
  const { complaintId } = useParams(); // Get complaintId from URL
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Local state for form fields:
  const [problemDetails, setProblemDetails] = useState("");
  const [sparesRequired, setSparesRequired] = useState("");
  const [remarks, setRemarks] = useState("");

  // State for spare parts options from the backend API
  const [spareOptions, setSpareOptions] = useState([]);

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobilenumber: "",
    branch: "",
    email: "",
  });

  // NEW: Track loading state when sending email
  const [isLoading, setIsLoading] = useState(false);

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored User Data:", storedUser); // Logging the data
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        email: storedUser.email,
        mobilenumber: storedUser.mobilenumber,
        branch: storedUser.branch,
        email: storedUser.email,
      });
    }
  }, []);

  useEffect(() => {
    // Fetch the existing complaint details
    fetch(
      `${process.env.REACT_APP_BASE_URL}/collections/pendingcomplaints/${complaintId}`
    )
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

  // Once the complaint is fetched, use the customer code to get customer details
  useEffect(() => {
    if (complaint && complaint.customercode) {
      fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/by-code/${complaint.customercode}`
      )
        .then((response) => response.json())
        .then((data) => setCustomer(data))
        .catch((error) =>
          console.error("Error fetching customer details:", error)
        );
    }
  }, [complaint]);

  // Fetch spare parts based on complaint number (acting as part number)
  useEffect(() => {
    if (complaint && complaint.materialcode) {
      fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/search/${complaint.materialcode}`
      )
        .then((response) => response.json())
        .then((data) => setSpareOptions(data))
        .catch((error) => console.error("Error fetching spare parts:", error));
    }
  }, [complaint]);

  // Navigate back to the main complaints list
  const handleBackClick = () => {
    navigate("/pendingcomplaints");
  };

  // Show the "Update Form" instead of the details
  const handleShowUpdateForm = () => {
    setShowUpdateForm(true);
  };

  // Send the updated data via POST request (for sending email)
  const handleUpdateComplaint = () => {
    setIsLoading(true);
    fetch(
      `${process.env.REACT_APP_BASE_URL}/collections/sendUpdatedComplaintEmail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_no: complaint.notification_complaintid,
          serial_no: complaint.serialnumber,
          description: complaint.materialdescription,
          part_no: complaint.materialcode,
          // 'customer' is the code we use to look up hospital & city in the DB
          customer: complaint.customercode,

          // If you have a "name" field in the UI, pass it here or just leave it blank:
          name: "",

          // If you have a city from the UI, pass it, or leave it blank:
          city: "",

          serviceEngineer: userInfo.firstName + " " + userInfo.lastName,
          spareRequested: sparesRequired,
          remarks: remarks,
          serviceEngineerMobile: userInfo.mobilenumber,
          serviceEngineerEmail: userInfo.email,
          branchName: userInfo.branch,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send updated complaint email");
        }
        return response.json();
      })
      .then(() => {
        setIsLoading(false); // Stop loader
        setShowSuccessModal(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false); // Stop loader if error
      });
  };

  // If complaint data is not loaded yet, show a loading indicator
  if (!complaint) {
    return (
      <div>
        <div className="flex mt-20 items-center justify-center">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  const handleCloseComplaint = () => {
    // Navigate to CloseComplaintPage and pass both complaint and customer data as "state"
    navigate("/closecomplaint", { state: { complaint, customer } });
  };
  console.log(complaint, "he;lo");
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
                <span>{complaint?.notification_complaintid}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Serial Number:</span>
                <span>{complaint.serialnumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Part Number:</span>
                <span>{complaint?.materialcode || "[Text Widget]"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span>{complaint?.materialdescription || "[Text Widget]"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Customer Code:</span>
                <span>{complaint?.customercode || "[Text Widget]"}</span>
              </div>
              {customer ? (
                <div className="bg-gray-200 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">Customer Name:</span>
                    <span>{customer?.hospitalname || "[Text Widget]"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">City:</span>
                    <span>{customer.city || "[Text Widget]"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer No:</span>
                    <span>{customer.telephone || "[Text Widget]"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{customer.email || "[Text Widget]"}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="loader"></span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Complaint Type:</span>
                <span>{complaint.notificationtype || "[Text Widget]"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Complaint Status:</span>
                <span>{complaint?.userstatus || "[Text Widget]"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Problem Reported:</span>
                <span>{complaint?.reportedproblem || "[Text Widget]"}</span>
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
                onClick={handleCloseComplaint}
              >
                Close Complaint
              </button>
            </div>
            <div className=" w-full mt-3">
              <button className="bg-primary w-full text-white py-2 px-4 rounded-md hover:bg-blue-700">
                On Call Estimation
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
              <label className="block font-medium mb-1">
                Complaint Number:
              </label>
              <div className="border p-2 rounded">
                {complaint.notification_complaintid}
              </div>
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
              <div className="border p-2 rounded">
                {complaint.reportedproblem}
              </div>
            </div>

            {/* Spares Required field replaced with a select dropdown */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Spares Required:</label>

              {Array.isArray(spareOptions) && spareOptions.length > 0 ? (
                <select
                  className="border p-2 rounded w-full"
                  value={sparesRequired}
                  onChange={(e) => setSparesRequired(e.target.value)}
                >
                  <option value="">Select a Spare</option>
                  {spareOptions.map((option) => (
                    <option key={option.PartNumber} value={option.PartNumber}>
                      {option.PartNumber} - {option.Description}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-red-500">
                  Spare not found with given part number
                </p>
              )}
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

            {/* Submit button with loader */}
            <button
              className="bg-primary w-full text-white py-2 px-4 rounded-md hover:bg-blue-700 flex justify-center items-center"
              onClick={handleUpdateComplaint}
              disabled={isLoading}
            >
              {isLoading ? <>Sending Email...</> : "UPDATE COMPLAINT"}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-3 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <h3 className="text-lg font-bold mb-4">Success!</h3>
            <p>Complaint update email sent to CIC successfully.</p>
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
