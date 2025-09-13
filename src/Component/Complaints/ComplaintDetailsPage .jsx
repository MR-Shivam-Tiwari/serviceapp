import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

const ComplaintDetailsPage = () => {
  const { complaintId } = useParams(); // Get complaintId from URL
  const navigate = useNavigate();
  const [onCallStatus, setOnCallStatus] = useState(null);

  const [complaint, setComplaint] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [onCallExists, setOnCallExists] = useState(false);
  // Local state for form fields:
  const [problemDetails, setProblemDetails] = useState("");
  const [sparesRequired, setSparesRequired] = useState("");
  const [remarks, setRemarks] = useState("");

  // State for spare parts options from the backend API
  const [spareOptions, setSpareOptions] = useState([]);

  // NEW: State to control close button visibility
  const [showCloseButton, setShowCloseButton] = useState(true);

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserInfo({
          id: userData.id || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          mobilenumber: userData.mobilenumber || "",
          status: userData.status || "",
          branch: userData.branch || "",
          loginexpirydate: userData.loginexpirydate || "",
          employeeid: userData.employeeid || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          department: userData.department || "",
          profileimage: userData.profileimage || "",
          deviceid: userData.deviceid || "",
          deviceregistereddate: userData.deviceregistereddate || "",
          usertype: userData.usertype || "",
          manageremail: userData.manageremail || "",
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerId || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // NEW: Track loading state when sending email
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkOnCall = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall/check-by-complaint/${complaint.notification_complaintid}`
        );
        const data = await response.json();
        if (data.success && data.exists) {
          setOnCallExists(true);
        } else {
          setOnCallExists(false);
        }

        // Force re-render के लिए
        setTimeout(() => {
          setOnCallExists((prev) => prev);
        }, 100);
      } catch (error) {
        console.error("Failed to check on-call status:", error);
        setOnCallExists(false);
      }
    };

    if (complaint?.notification_complaintid) {
      checkOnCall();
    }
  }, [complaint?.notification_complaintid]);

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

  useEffect(() => {
    if (complaint && complaint.notificationtype) {
      if (
        complaint.notificationtype === "NW" ||
        complaint.notificationtype === "NC"
      ) {
        // For NW and NC, check oncall status via API
        fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/oncall/by-complaint/${complaint.notification_complaintid}`
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("OnCall API Response:", data); // Debug log

            if (data.success === true && data.data) {
              // OnCall exists - show status, hide button
              setOnCallStatus(data.data.status); // "completed", "submitted", "in-progress", etc.
              setOnCallExists(true);

              if (data.data.status === "completed") {
                setShowCloseButton(true);
              } else {
                setShowCloseButton(false);
              }
            } else {
              // OnCall doesn't exist (success: false) - show button, hide status
              setOnCallStatus(null);
              setOnCallExists(false);
              setShowCloseButton(false);
            }
          })
          .catch((error) => {
            console.error("Error fetching oncall status:", error);
            setOnCallStatus(null);
            setOnCallExists(false);
            setShowCloseButton(false);
          });
      } else {
        // For other complaint types
        setShowCloseButton(true);
        setOnCallStatus(null);
        setOnCallExists(false);
      }
    }
  }, [complaint?.notification_complaintid]);

  // Fetch spare parts based on complaint number (acting as part number)
  useEffect(() => {
    if (complaint && complaint.materialcode) {
      fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/search/${complaint.materialcode}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            toast.dismiss(); // Dismiss existing toasts
            toast.error(data.message, { id: "spare-fetch-error" });
          } else {
            setSpareOptions(data);
          }
        })
        .catch((error) => {
          toast.dismiss(); // Avoid duplicate error toasts
          console.error("Error fetching spare parts:", error);
          toast.error("Failed to fetch spare parts.", {
            id: "spare-fetch-error",
          });
        });
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
          customer: complaint.customercode,
          name: "",
          city: "",
          serviceEngineer: userInfo.firstname + " " + userInfo.lastname,
          spareRequested: sparesRequired,
          remarks: remarks,
          serviceEngineerMobile: userInfo.mobilenumber,
          serviceEngineerEmail: userInfo.email,
          branchName: userInfo.branch,

          // Complete user object with all details
          user: {
            firstName: userInfo.firstname || "",
            lastName: userInfo.lastname || "",
            email: userInfo.email || "",
            usertype: userInfo.usertype || "",
            mobilenumber: userInfo.mobilenumber || "",
            branch: userInfo.branch || [],
            manageremail: userInfo.manageremail || [],
            dealerEmail: userInfo.dealerEmail || "",

            // Additional user details
            id: userInfo.id || "",
            status: userInfo.status || "",
            loginexpirydate: userInfo.loginexpirydate || "",
            employeeid: userInfo.employeeid || "",
            country: userInfo.country || "",
            state: userInfo.state || "",
            city: userInfo.city || "",
            department: userInfo.department || "",
            profileimage: userInfo.profileimage || "",
            deviceid: userInfo.deviceid || "",
            deviceregistereddate: userInfo.deviceregistereddate || "",
            roleName: userInfo.roleName || "",
            roleId: userInfo.roleId || "",
            dealerName: userInfo.dealerName || "",
            dealerId: userInfo.dealerId || "",
            location: userInfo.location || [],
            skills: userInfo.skills || "",
          },
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
        setIsLoading(false);
        setShowSuccessModal(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
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

  const handleCreateEstimation = () => {
    navigate("/create-oncall-estimation", { state: { complaint, customer } });
  };

  const handleCloseComplaint = () => {
    // Navigate to CloseComplaintPage and pass both complaint and customer data as "state"
    navigate("/closecomplaint", { state: { complaint, customer } });
  };

  console.log(complaint, "he;lo");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===================
        VIEW #1: DETAILS
    =================== */}
      {!showUpdateForm ? (
        <>
          {/* Header */}
          <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
            <div className="flex items-center p-4 py-4 text-white">
              <button
                className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
                onClick={handleBackClick}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                Complaint Detailss
              </h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-3 py-20 max-w-4xl mx-auto">
            {/* Complaint Information Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-800">
                  Complaint Information
                </h2>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Complaint Number:
                  </span>
                  <span className="text-gray-800 font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs">
                    {complaint?.notification_complaintid}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Serial Number:
                  </span>
                  <span className="text-gray-800 text-xs">
                    {complaint.serialnumber}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Part Number:
                  </span>
                  <span className="text-gray-800 text-xs">
                    {complaint?.materialcode || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Description:
                  </span>
                  <span className="text-gray-800 text-right max-w-xs text-xs leading-tight">
                    {complaint?.materialdescription || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Customer Code:
                  </span>
                  <span className="text-gray-800 text-xs">
                    {complaint?.customercode || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Complaint Type:
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    {complaint.notificationtype || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    Complaint Status:
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    {complaint?.userstatus || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1.5">
                  <span className="font-medium text-gray-600 text-xs">
                    Problem Reported:
                  </span>
                  <span className="text-gray-800 text-right max-w-xs text-xs leading-tight">
                    {complaint?.reportedproblem || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            {customer ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Customer Information
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-gray-600 text-xs">
                      Customer Name:
                    </span>
                    <span className="text-gray-800 font-semibold text-xs">
                      {customer?.customername || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-gray-600 text-xs">
                      City:
                    </span>
                    <span className="text-gray-800 text-xs">
                      {customer.city || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-gray-600 text-xs">
                      Customer No:
                    </span>
                    <span className="text-gray-800 text-xs">
                      {customer.telephone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="font-medium text-gray-600 text-xs">
                      Email:
                    </span>
                    <span className="text-gray-800 text-xs text-right max-w-xs break-words">
                      {customer.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <div className="flex items-center justify-center">
                  <span className="loader"></span>
                  <span className="ml-2 text-gray-600 text-xs">
                    Loading customer information...
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
                onClick={handleShowUpdateForm}
              >
                Update Complaint
              </button>
              {showCloseButton && (
                <button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
                  onClick={handleCloseComplaint}
                >
                  Close Complaint
                </button>
              )}
            </div>

            {/* Complaint Information Card में यह add करें Problem Reported के बाद */}
            {/* On Call Estimation Button - Show when API returns success: false */}
            {/* On-Call Status - Show only when OnCall exists (success: true) */}
            {(complaint.notificationtype === "NW" ||
              complaint.notificationtype === "NC") &&
              onCallStatus && ( // Show when status exists
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-medium text-gray-600 text-xs">
                    On-Call Status:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      onCallStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : onCallStatus === "submitted"
                        ? "bg-blue-100 text-blue-800"
                        : onCallStatus === "in-progress"
                        ? "bg-orange-100 text-orange-800"
                        : onCallStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {onCallStatus.charAt(0).toUpperCase() +
                      onCallStatus.slice(1)}
                  </span>
                </div>
              )}
            {/* On Call Estimation Button - Show only when no OnCall exists (success: false) */}
            {(complaint.notificationtype === "NW" ||
              complaint.notificationtype === "NC") &&
              !onCallExists && ( // Show when OnCall doesn't exist
                <div className="w-full mb-3">
                  <button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
                    onClick={handleCreateEstimation}
                  >
                    Create On-Call Estimation
                  </button>
                </div>
              )}
          </div>
        </>
      ) : (
        /* =========================
         VIEW #2: UPDATE FORM
       ========================= */
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
            <div className="flex items-center p-4 py-4 text-white">
              <button
                className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
                onClick={() => setShowUpdateForm(false)}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                Update Complaint
              </h1>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-3 max-w-4xl mx-auto py-20">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">
                  Complaint Update Form
                </h3>
              </div>

              <div className="p-3 space-y-3">
                {/* Display existing complaint info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Complaint Number
                    </label>
                    <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 font-medium text-xs">
                      {complaint.notification_complaintid}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Complaint Type
                    </label>
                    <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {complaint.notificationtype}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Problem Details field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Problem Details
                  </label>
                  <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 text-xs leading-tight min-h-[60px]">
                    {complaint.reportedproblem}
                  </div>
                </div>

                {/* Spares Required field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Spares Required
                  </label>
                  {Array.isArray(spareOptions) && spareOptions.length > 0 ? (
                    <select
                      className="w-full px-2 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800 text-xs"
                      value={sparesRequired}
                      onChange={(e) => setSparesRequired(e.target.value)}
                    >
                      <option value="">Select a Spare</option>
                      {spareOptions.map((option) => (
                        <option
                          key={option.PartNumber}
                          value={option.PartNumber}
                        >
                          {option.PartNumber} - {option.Description}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
                      <p className="text-red-600 font-medium text-xs">
                        Spare not found with given part number
                      </p>
                    </div>
                  )}
                </div>

                {/* Remarks field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description/Remarks
                  </label>
                  <textarea
                    maxLength={400}
                    className="w-full px-2 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none text-gray-800 text-xs"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your remarks here..."
                  />
                  <p
                    className={`text-xs font-medium text-right mt-1 ${
                      remarks.length > 380
                        ? "text-red-600"
                        : remarks.length > 350
                        ? "text-orange-500"
                        : "text-gray-500"
                    }`}
                  >
                    {remarks.length}/400 characters used
                  </p>
                </div>

                {/* Submit button */}
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  onClick={handleUpdateComplaint}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending Email...
                    </>
                  ) : (
                    "UPDATE COMPLAINT"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 px-3 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm w-full transform transition-all">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Success!</h3>
              <p className="text-gray-600 text-sm">
                Complaint update email sent to CIC successfully.
              </p>
            </div>
            <button
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
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
