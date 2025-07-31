// PmDetails.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Helper function to format a date as DD/MM/YYYY
function formatDate(date) {
  const d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1; // Months are zero indexed
  const year = d.getFullYear();
  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;
  return `${day}/${month}/${year}`;
}

//////////////////////////////////////////////
// MachineChecklist Component (Modal UI)
//////////////////////////////////////////////
const MachineChecklist = ({ pm, onComplete }) => {
  // Modal and checklist state variables
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [tempChecklistResults, setTempChecklistResults] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalChecklistRemark, setGlobalChecklistRemark] = useState("");
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [errorChecklist, setErrorChecklist] = useState("");

  // Open modal and fetch checklist data (only once)
  const openChecklistModal = () => {
    setIsChecklistModalOpen(true);
    if (tempChecklistResults.length === 0) {
      setLoadingChecklist(true);
      fetch(
        `${process.env.REACT_APP_BASE_URL}/upload/checklist/by-part/${pm.partNumber}`
      )
        .then((res) => res.json())
        .then((data) => {
          // Filter checklists where checklisttype is "PM"
          const pmChecklists = data.checklists.filter(
            (item) => item.checklisttype === "PM"
          );
          setTempChecklistResults(pmChecklists);
          setLoadingChecklist(false);
        })
        .catch((err) => {
          setErrorChecklist(err.message);
          setLoadingChecklist(false);
        });
    }
  };

  // Update answer (result) for a checklist item by its _id
  const handleChecklistResultChange = (id, value) => {
    setTempChecklistResults((prev) =>
      prev.map((item) => (item._id === id ? { ...item, result: value } : item))
    );
  };

  // Update remark for a checklist item by its _id
  const handleChecklistRemarkChange = (id, value) => {
    setTempChecklistResults((prev) =>
      prev.map((item) => (item._id === id ? { ...item, remark: value } : item))
    );
  };

  // Validation and go to next question
  const handleNextQuestion = () => {
    const currentItem = tempChecklistResults[currentQuestionIndex];
    if (!currentItem.result) {
      alert("Please select an answer for this item.");
      return;
    }
    // For "Yes / No" or "OK/NOT OK", if the negative answer is selected then a remark is required.
    if (
      (currentItem.resulttype === "Yes / No" && currentItem.result === "No") ||
      (currentItem.resulttype === "OK/NOT OK" &&
        currentItem.result === "NOT OK")
    ) {
      if (!currentItem.remark || currentItem.remark.trim() === "") {
        alert("Please provide a remark for this item.");
        return;
      }
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // When finishing checklist, pass back the data
  const handleFinishChecklist = () => {
    setIsChecklistModalOpen(false);
    setChecklistCompleted(true);
    if (onComplete) {
      onComplete(pm._id, {
        items: tempChecklistResults,
        globalRemark: globalChecklistRemark,
      });
    }
  };

  return (
    <div className="mb-8 border p-2 rounded shadow">
      {/* PM Details Card */}
      <div className="bg-white p-3 rounded shadow mb-4">
        <h2 className="text-2xl font-bold mb-4">
          PM Details - {pm.partNumber}
        </h2>
        <p>
          <strong>PM Type:</strong> {pm.pmType}
        </p>
        <p>
          <strong>Description:</strong> {pm.materialDescription}
        </p>
        <p>
          <strong>Serial Number:</strong> {pm.serialNumber}
        </p>
        <p>
          <strong>Customer Code:</strong> {pm.customerCode}
        </p>
        <p>
          <strong>Customer Region:</strong> {pm.region}
        </p>
        <p>
          <strong>Customer City:</strong> {pm.city}
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
        {!checklistCompleted && (
          <div className="mt-2">
            <button
              onClick={openChecklistModal}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
            >
              Show Checklist
            </button>
          </div>
        )}
        {checklistCompleted && (
          <div className="mt-2 text-green-600 font-bold">
            Checklist completed.
          </div>
        )}
      </div>

      {/* Checklist Modal */}
      {isChecklistModalOpen && (
        <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Checklist</h2>
            {loadingChecklist ? (
              <p>Loading checklist...</p>
            ) : errorChecklist ? (
              <p>Error: {errorChecklist}</p>
            ) : (
              <>
                {currentQuestionIndex < tempChecklistResults.length ? (
                  // Render current checklist item
                  (() => {
                    const currentItem =
                      tempChecklistResults[currentQuestionIndex];
                    return (
                      <div key={currentItem._id} className="mb-4">
                        <p className="text-sm mb-2 font-semibold">
                          {currentItem.checkpoint}
                        </p>

                        {/* Numeric Entry */}
                        {currentItem.resulttype === "Numeric Entry" && (
                          <input
                            type="number"
                            value={currentItem.result || ""}
                            onChange={(e) =>
                              handleChecklistResultChange(
                                currentItem._id,
                                e.target.value
                              )
                            }
                            className="border rounded p-1 w-full"
                          />
                        )}

                        {/* OK/NOT OK */}
                        {currentItem.resulttype === "OK/NOT OK" && (
                          <div className="space-x-3">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                className="mr-1"
                                checked={currentItem.result === "OK"}
                                onChange={() =>
                                  handleChecklistResultChange(
                                    currentItem._id,
                                    "OK"
                                  )
                                }
                              />
                              OK
                            </label>
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                className="mr-1"
                                checked={currentItem.result === "NOT OK"}
                                onChange={() =>
                                  handleChecklistResultChange(
                                    currentItem._id,
                                    "NOT OK"
                                  )
                                }
                              />
                              NOT OK
                            </label>
                          </div>
                        )}
                        {currentItem.resulttype === "OK/NOT OK" &&
                          currentItem.result === "NOT OK" && (
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Enter remark for this item"
                                value={currentItem.remark || ""}
                                onChange={(e) =>
                                  handleChecklistRemarkChange(
                                    currentItem._id,
                                    e.target.value
                                  )
                                }
                                className="border rounded p-1 w-full"
                              />
                            </div>
                          )}

                        {/* Yes / No */}
                        {currentItem.resulttype === "Yes / No" && (
                          <div className="space-x-3">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                className="mr-1"
                                checked={currentItem.result === "Yes"}
                                onChange={() =>
                                  handleChecklistResultChange(
                                    currentItem._id,
                                    "Yes"
                                  )
                                }
                              />
                              Yes
                            </label>
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                className="mr-1"
                                checked={currentItem.result === "No"}
                                onChange={() =>
                                  handleChecklistResultChange(
                                    currentItem._id,
                                    "No"
                                  )
                                }
                              />
                              No
                            </label>
                          </div>
                        )}
                        {currentItem.resulttype === "Yes / No" &&
                          currentItem.result === "No" && (
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Enter remark for this item"
                                value={currentItem.remark || ""}
                                onChange={(e) =>
                                  handleChecklistRemarkChange(
                                    currentItem._id,
                                    e.target.value
                                  )
                                }
                                className="border rounded p-1 w-full"
                              />
                            </div>
                          )}

                        {/* Navigation buttons */}
                        <div className="flex justify-end mt-4 space-x-2">
                          {currentQuestionIndex > 0 && (
                            <button
                              className="bg-gray-300 text-black px-4 py-2 rounded-md"
                              onClick={handlePrevQuestion}
                            >
                              Back
                            </button>
                          )}
                          <button
                            className="bg-primary text-white px-4 py-2 rounded-md"
                            onClick={handleNextQuestion}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Global Checklist Remark step
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Global Checklist Remark
                    </h3>
                    <input
                      type="text"
                      placeholder="Enter global checklist remark"
                      value={globalChecklistRemark}
                      onChange={(e) => setGlobalChecklistRemark(e.target.value)}
                      className="border rounded p-1 w-full"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                        onClick={() => {
                          setIsChecklistModalOpen(false);
                          setCurrentQuestionIndex(0);
                          setTempChecklistResults([]);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-primary text-white px-4 py-2 rounded-md"
                        onClick={handleFinishChecklist}
                      >
                        Finish
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

//////////////////////////////////////////////
// Main Component: PmDetails
//////////////////////////////////////////////
function PmDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPms } = location.state || {};

  // State for storing checklist responses for each PM
  const [checklistData, setChecklistData] = useState({});
  // OTP and progress state variables
  const [globalOtp, setGlobalOtp] = useState("");
  const [globalOtpError, setGlobalOtpError] = useState("");
  const [loadingGlobalOtp, setLoadingGlobalOtp] = useState(false);
  const [showGlobalOtpModal, setShowGlobalOtpModal] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [progressStatus, setProgressStatus] = useState({
    current: 0,
    total: selectedPms ? selectedPms.length : 0,
    details: [],
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
    manageremail: [],
  });

  // Load user info on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
        email: storedUser.email,
        dealerEmail: storedUser.dealerInfo?.dealerEmail,
        manageremail: Array.isArray(storedUser.manageremail)
          ? storedUser.manageremail
          : storedUser.manageremail
          ? [storedUser.manageremail]
          : [],
      });
    }
  }, []);

  if (!selectedPms || !selectedPms.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p>No PM data available. Please go back and select PM(s).</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // All selected PMs must belong to the same customer.
  const allSameCustomer = selectedPms.every(
    (pm) => pm.customerCode === selectedPms[0].customerCode
  );

  // When a PM’s checklist is completed, store its responses.
  const handleChecklistComplete = (pmId, data) => {
    setChecklistData((prev) => ({ ...prev, [pmId]: data }));
  };

  const allCompleted = Object.keys(checklistData).length === selectedPms.length;

  // Process each PM one by one.
  const processPmsOneByOne = async () => {
    setProgressModalVisible(true);
    const details = [];
    let processedCount = 0;

    for (let i = 0; i < selectedPms.length; i++) {
      const pm = { ...selectedPms[i] }; // This already contains the original partNumber
      // Remove the auto-generated partNumber and use the existing one
      pm.pmDoneDate = formatDate(new Date());
      pm.pmEngineerCode = userInfo.employeeid || "UNKNOWN";
      pm.pmStatus = "Completed";

      // ✅ Fetch documents and formats from /upload/docs/by-part/:partNumber
      let documentChlNo = "";
      let documentRevNo = "";
      let formatChlNo = "";
      let formatRevNo = "";

      try {
        const docsRes = await fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/docs/by-part/${pm.partNumber}`
        );
        const docsData = await docsRes.json();
        console.log("pm.partNumber", pm.partNumber);

        // Get document data (from PMDocMaster)
        if (docsData.documents && docsData.documents.length > 0) {
          documentChlNo = docsData.documents[0].chlNo;
          documentRevNo = docsData.documents[0].revNo;
        } else {
          details.push(`⚠️ No Document found for part number ${pm.partNumber}`);
        }

        // Get format data (from FormatMaster)
        if (docsData.formats && docsData.formats.length > 0) {
          formatChlNo = docsData.formats[0].chlNo;
          formatRevNo = docsData.formats[0].revNo;
        } else {
          details.push(`⚠️ No Format found for part number ${pm.partNumber}`);
        }
      } catch (err) {
        details.push(
          `❌ Error fetching Docs for ${pm.partNumber}: ${err.message}`
        );
      }

      // ✅ Add both document and format data to pm object
      pm.documentChlNo = documentChlNo;
      pm.documentRevNo = documentRevNo;
      pm.formatChlNo = formatChlNo;
      pm.formatRevNo = formatRevNo;

      // Prepare checklist data
      const pmChecklist = checklistData[pm._id];
      const responses = pmChecklist?.items || [];
      const globalRemark = pmChecklist?.globalRemark || "N/A";

      // ✅ Final payload
      const payload = {
        pmData: pm,
        checklistData: responses,
        customerCode: pm.customerCode,
        globalRemark,
        userInfo,
      };

      // ✅ Send to /upload/reportAndUpdate
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BASE_URL}/upload/reportAndUpdate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (data.message && data.message.includes("successfully")) {
          details.push(`✔️ Created PDF for ${pm.partNumber}`);
        } else {
          details.push(`❌ Failed for ${pm.partNumber}: ${data.message}`);
        }
      } catch (err) {
        details.push(`❌ Error for ${pm.partNumber}: ${err.message}`);
      }

      processedCount++;
      setProgressStatus({
        current: processedCount,
        total: selectedPms.length,
        details: [...details],
      });
    }

    // Rest of the function remains the same...
    // ✅ Send Combined Email
    setSendingEmail(true);
    try {
      const sendRes = await fetch(
        `${process.env.REACT_APP_BASE_URL}/upload/sendAllPdfs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerCode: selectedPms[0].customerCode,
            ...userInfo,
          }),
        }
      );

      const sendData = await sendRes.json();
      if (
        sendData.message &&
        sendData.message.includes("All PDF attachments sent successfully")
      ) {
        details.push("✔️ All PDFs emailed successfully.");
        toast.success("Combined email sent successfully!");
      } else {
        details.push("❌ Emailing PDFs failed: " + sendData.message);
        toast.error("Combined email failed: " + sendData.message);
      }

      setProgressStatus({
        current: processedCount,
        total: selectedPms.length,
        details: [...details],
      });
    } catch (err) {
      details.push(`❌ Error emailing PDFs: ${err.message}`);
      setProgressStatus({
        current: processedCount,
        total: selectedPms.length,
        details: [...details],
      });
      toast.error("Error in sending combined email: " + err.message);
    }

    setSendingEmail(false);
    setProgressModalVisible(false);
    toast.success("All PMs processed & email sent. Redirecting...");
    setTimeout(() => {
      navigate("/preventive-maintenance");
    }, 2000);
  };

  const handleGlobalOtpSubmit = () => {
    if (!globalOtp) {
      setGlobalOtpError("Please enter the OTP.");
      return;
    }
    setLoadingGlobalOtp(true);
    const customerCode = selectedPms[0].customerCode;
    fetch(`${process.env.REACT_APP_BASE_URL}/upload/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerCode, otp: globalOtp }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "OTP verified successfully") {
          toast.success("OTP verified successfully!");
          setShowGlobalOtpModal(false);
          processPmsOneByOne();
        } else {
          setGlobalOtpError(data.message || "OTP verification failed");
        }
        setLoadingGlobalOtp(false);
      })
      .catch((err) => {
        setLoadingGlobalOtp(false);
        setGlobalOtpError("An error occurred. Please try again.");
      });
  };

  const handleGlobalSubmit = () => {
    if (!allCompleted) {
      alert("Please complete all checklists before submitting.");
      return;
    }
    setShowGlobalOtpModal(true);
    sendGlobalOtp();
  };

  const sendGlobalOtp = () => {
    const customerCode = selectedPms[0].customerCode;
    fetch(`${process.env.REACT_APP_BASE_URL}/upload/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Global OTP sent:", data.message);
      })
      .catch((err) => {
        console.error("Error sending global OTP:", err);
      });
  };

  return (
    <div className=" ">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white">
        <button
          onClick={() => navigate("/preventive-maintenance")}
          className="mr-2 text-white"
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
        <h2 className="text-xl font-bold">Preventive Details</h2>
      </div>

      {/* Render each PM with its MachineChecklist */}
      {selectedPms.map((pm) => (
        <MachineChecklist
          key={pm._id}
          pm={pm}
          onComplete={handleChecklistComplete}
        />
      ))}

      {/* Global submission section */}
      <div className="mt-4 text-center">
        {!allSameCustomer && (
          <p className="text-red-600 pb-4 font-bold">
            All selected PMs must have the same customer.
          </p>
        )}
        {allSameCustomer && (
          <button
            onClick={handleGlobalSubmit}
            disabled={!allCompleted}
            className="my-2 mb-4 px-4 w-[90%] py-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Submit All
          </button>
        )}
      </div>

      {/* OTP Modal */}
      {showGlobalOtpModal && (
        <div className="fixed inset-0 px-3 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-2xl font-bold mb-3">
              Enter OTP for Submission
            </h3>

            {/* Info Text */}
            <p className="text-sm text-gray-600 mb-4">
              An OTP has been sent to the customer’s registered email address.
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              value={globalOtp}
              onChange={(e) => {
                setGlobalOtp(e.target.value);
                setGlobalOtpError("");
              }}
              className="border p-2 rounded w-full mb-4"
            />
            {globalOtpError && (
              <p className="text-red-600 mb-2">{globalOtpError}</p>
            )}
            <button
              onClick={handleGlobalOtpSubmit}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
            >
              Submit OTP
            </button>
            {loadingGlobalOtp && <p className="mt-2">Verifying...</p>}
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {progressModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-2xl font-bold">Processing PMs</h2>
            </div>
            <p className="mb-2">
              {progressStatus.current} / {progressStatus.total} done (
              {Math.round(
                (progressStatus.current / progressStatus.total) * 100
              )}
              %)
            </p>
            <div className="w-full bg-gray-300 rounded h-3 mb-4">
              <div
                className="bg-green-500 h-3 rounded"
                style={{
                  width: `${
                    (progressStatus.current / progressStatus.total) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="max-h-48 overflow-y-auto text-sm border p-2 rounded mb-2">
              <ul>
                {progressStatus.details.map((line, idx) => (
                  <li key={idx} className="mb-1">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            {sendingEmail && (
              <div className="text-center text-blue-600 font-medium">
                Sending email, please wait...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PmDetails;
