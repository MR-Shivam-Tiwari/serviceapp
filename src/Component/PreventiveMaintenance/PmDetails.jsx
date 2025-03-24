// PmDetails.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PmDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pm } = location.state || {};

  // State for toggling checklist display
  const [showChecklist, setShowChecklist] = useState(false);
  // Checklist wizard states
  const [checklistItems, setChecklistItems] = useState([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [errorChecklist, setErrorChecklist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]); // { checklistId, answer, comment }

  // OTP-related states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);

  // Fetch checklist items only after "Checklist" button is clicked
  useEffect(() => {
    if (showChecklist && pm && pm.partNumber) {
      setLoadingChecklist(true);
      fetch(`http://localhost:5000/upload/checklist/by-part/${pm.partNumber}`)
        .then((res) => res.json())
        .then((data) => {
          // Assuming API returns { checklists: [...] }
          setChecklistItems(data.checklists);
          setLoadingChecklist(false);
        })
        .catch((err) => {
          setErrorChecklist(err.message);
          setLoadingChecklist(false);
        });
    }
  }, [showChecklist, pm]);

  if (!pm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p>No PM data available. Please go back and select a PM.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Handlers for checklist wizard
  const handleAnswerChange = (answer) => {
    const updatedResponses = [...responses];
    updatedResponses[currentIndex] = {
      checklistId: checklistItems[currentIndex]._id,
      answer,
      comment: updatedResponses[currentIndex]?.comment || "",
    };
    setResponses(updatedResponses);
  };

  const handleCommentChange = (e) => {
    const updatedResponses = [...responses];
    updatedResponses[currentIndex] = {
      ...updatedResponses[currentIndex],
      comment: e.target.value,
    };
    setResponses(updatedResponses);
  };

  const handleNext = () => {
    const currentResponse = responses[currentIndex];
    if (!currentResponse || !currentResponse.answer) {
      alert("Please select Yes or No");
      return;
    }
    if (currentResponse.answer === "no" && !currentResponse.comment) {
      alert("Please provide a comment for a 'No' answer");
      return;
    }
    if (currentIndex < checklistItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // When all checklist items are answered, open the OTP modal and send OTP.
      setShowOTPModal(true);
      sendOtp();
    }
  };

  // Function to send OTP based on customerCode
  const sendOtp = () => {
    if (!pm.customerCode) {
      alert("Customer code is missing");
      return;
    }
    fetch("http://localhost:5000/upload/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerCode: pm.customerCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
      });
  };

  // Function to handle OTP submission/verification and then send the report payload
  const handleOtpSubmit = () => {
    if (!otp) {
      setOtpError("Please enter the OTP.");
      return;
    }
    setLoadingOtp(true);
    // First, verify the OTP.
    fetch("http://localhost:5000/upload/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerCode: pm.customerCode, otp }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "OTP verified successfully") {
          // Build the payload to send to the report endpoint.
          const payload = {
            pmData: pm, // PM details
            checklistData: responses, // Checklist responses
            customerCode: pm.customerCode,
          };

          // Call the report endpoint to generate PDF and email it.
          fetch("http://localhost:5000/upload/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then((reportData) => {
              setLoadingOtp(false);
              if (
                reportData.message === "Report generated and emailed successfully"
              ) {
                alert("Report sent successfully!");
                setShowOTPModal(false);
                // Optionally clear state or navigate elsewhere.
              } else {
                setOtpError(reportData.message || "Report generation failed");
              }
            })
            .catch((err) => {
              setLoadingOtp(false);
              setOtpError("An error occurred while sending the report.");
            });
        } else {
          setLoadingOtp(false);
          setOtpError(data.message || "OTP verification failed");
        }
      })
      .catch((err) => {
        setLoadingOtp(false);
        setOtpError("An error occurred. Please try again.");
      });
  };

  // Render the checklist wizard for the current item
  const renderChecklistWizard = () => {
    if (loadingChecklist) return <p>Loading checklist...</p>;
    if (errorChecklist) return <p>Error: {errorChecklist}</p>;
    if (!checklistItems.length)
      return <p>No checklist items available for this product group.</p>;

    const currentChecklist = checklistItems[currentIndex];
    return (
      <div>
        <div className="p-6 border rounded shadow bg-white mt-6">
          <h3 className="text-2xl font-bold mb-4">
            Checklist Item {currentIndex + 1} of {checklistItems.length}
          </h3>
          <p className="mb-2">
            <strong>Checklist Type:</strong> {currentChecklist.checklisttype}
          </p>
          <p className="mb-2">
            <strong>Checkpoint Type:</strong> {currentChecklist.checkpointtype}
          </p>
          <p className="mb-2">
            <strong>Checkpoint:</strong> {currentChecklist.checkpoint}
          </p>
          <p className="mb-2">
            <strong>Product Group:</strong> {currentChecklist.prodGroup}
          </p>

          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => handleAnswerChange("yes")}
              className={`px-4 py-2 rounded ${
                responses[currentIndex]?.answer === "yes"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswerChange("no")}
              className={`px-4 py-2 rounded ${
                responses[currentIndex]?.answer === "no"
                  ? "bg-red-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              No
            </button>
          </div>
          {responses[currentIndex]?.answer === "no" && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter comment"
                value={responses[currentIndex]?.comment || ""}
                onChange={handleCommentChange}
                className="border p-2 rounded w-full"
              />
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
          >
            {currentIndex < checklistItems.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="flex items-center bg-primary p-3 py-5 text-white">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/preventive-maintenance")}
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
              0 0 1-.708.708l-3-3a.5.5 
              0 0 1 0-.708l3-3a.5.5 
              0 1 1 .708.708L5.707 7.5H11.5a.5.5 
              0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Preventive Details</h2>
      </div>
      {/* PM Details Section */}
      <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">PM Details</h2>
        <p>
          <strong>PM Number:</strong> {pm.partNumber}
        </p>
        <p>
          <strong>Description:</strong> {pm.materialDescription}
        </p>
        <p>
          <strong>Customer Code:</strong> {pm.customerCode}
        </p>
        <p>
          <strong>Serial Number:</strong> {pm.serialNumber}
        </p>
        <p>
          <strong>Region:</strong> {pm.regionBranch}
        </p>
        <p>
          <strong>Due Month:</strong> {pm.pmDueMonth}
        </p>
        <p>
          <strong>Done Date:</strong> {pm.pmDoneDate}
        </p>
        <p>
          <strong>Vendor Code:</strong> {pm.pmVendorCode}
        </p>
        <p>
          <strong>Engineer Code:</strong> {pm.pmEngineerCode}
        </p>
        <p>
          <strong>Status:</strong> {pm.pmStatus}
        </p>
        <p>
          <strong>Part Number:</strong> {pm.partNumber}
        </p>
      </div>

      {/* Button to show checklist section */}
      {!showChecklist && (
        <div className="max-w-md mx-auto mt-6 px-3">
          <button
            onClick={() => setShowChecklist(true)}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
          >
            Checklist
          </button>
        </div>
      )}

      {/* Checklist Wizard Section */}
      {showChecklist && (
        <div className="max-w-md mx-auto">{renderChecklistWizard()}</div>
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Enter OTP</h3>
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              className="border p-2 rounded w-full mb-4"
            />
            {otpError && <p className="text-red-500 mb-2">{otpError}</p>}
            <button
              onClick={handleOtpSubmit}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
            >
              Submit OTP
            </button>
            {loadingOtp && <p className="mt-2">Verifying...</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default PmDetails;
