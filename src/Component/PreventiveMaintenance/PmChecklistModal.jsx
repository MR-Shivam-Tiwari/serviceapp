"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Settings,
  AlertTriangle,
} from "lucide-react";

const PmChecklistModal = ({ isOpen, onClose, pm, onComplete }) => {
  const [tempChecklistResults, setTempChecklistResults] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalChecklistRemark, setGlobalChecklistRemark] = useState("");
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [errorChecklist, setErrorChecklist] = useState("");
  const [manualVoltageInput, setManualVoltageInput] = useState("");

  // Failure modal states
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [failedItems, setFailedItems] = useState([]);
  const [editingFailedItem, setEditingFailedItem] = useState(null);
  const [tempVoltageInput, setTempVoltageInput] = useState("");

  // Fetch checklist data when modal opens
  useEffect(() => {
    if (isOpen && tempChecklistResults.length === 0) {
      setLoadingChecklist(true);
      fetch(
        `${process.env.REACT_APP_BASE_URL}/upload/checklist/by-part/${pm.partNumber}`
      )
        .then((res) => res.json())
        .then((data) => {
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
  }, [isOpen, pm.partNumber, tempChecklistResults.length]);

  useEffect(() => {
    setManualVoltageInput("");
  }, [currentQuestionIndex]);

  const handleChecklistResultChange = (checkId, newVal) => {
    setTempChecklistResults((prev) =>
      prev.map((ch) => (ch._id === checkId ? { ...ch, result: newVal } : ch))
    );
  };

  const handleChecklistRemarkChange = (checkId, value) => {
    setTempChecklistResults((prev) =>
      prev.map((ch) => (ch._id === checkId ? { ...ch, remark: value } : ch))
    );
  };

  const handleNextQuestion = () => {
    const currentItem = tempChecklistResults[currentQuestionIndex];

    // Validation for different result types
    if (currentItem.resulttype === "Yes / No" && currentItem.result === "No") {
      if (!currentItem.remark?.trim()) {
        toast.error("Please enter a remark for 'No' before proceeding.");
        return;
      }
    }

    if (
      currentItem.resulttype === "OK/NOT OK" &&
      currentItem.result === "NOT OK"
    ) {
      if (!currentItem.remark?.trim()) {
        toast.error("Please enter a remark for 'NOT OK' before proceeding.");
        return;
      }
    }

    if (currentItem.resulttype === "Numeric Entry") {
      if (!manualVoltageInput.trim()) {
        toast.error("Please enter the voltage reading before proceeding.");
        return;
      }

      const voltageValue = Number.parseFloat(manualVoltageInput);
      if (isNaN(voltageValue)) {
        toast.error("Please enter a valid voltage reading.");
        return;
      }

      handleNumericEntry(currentItem, voltageValue);
    }

    if (currentQuestionIndex < tempChecklistResults.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentQuestionIndex(tempChecklistResults.length);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNumericEntry = (currentItem, manualVoltage) => {
    const { startVoltage, endVoltage } = currentItem;
    if (!startVoltage || !endVoltage) {
      toast.error("Voltage range missing.");
      return;
    }

    const start = Number.parseFloat(startVoltage);
    const end = Number.parseFloat(endVoltage);

    if (isNaN(start) || isNaN(end)) {
      toast.error("Invalid voltage range.");
      return;
    }

    const updatedResults = [...tempChecklistResults];
    const itemIndex = updatedResults.findIndex(
      (item) => item._id === currentItem._id
    );

    if (itemIndex !== -1) {
      updatedResults[itemIndex].result =
        manualVoltage >= start && manualVoltage <= end ? "Pass" : "Failed";
      updatedResults[
        itemIndex
      ].remark = `Measured: ${manualVoltage}V (Range: ${start}V - ${end}V)`;

      setTempChecklistResults(updatedResults);
    }
  };

  const handleFinish = () => {
    // Find failed checklist items
    const failures = tempChecklistResults.filter((item) => {
      if (!item.result) return false;
      const failKeywords = ["No", "NOT OK", "Failed"];
      return failKeywords.includes(item.result);
    });

    if (failures.length > 0) {
      // Show failure popup
      setFailedItems(failures);
      setShowFailurePopup(true);
    } else {
      // No failures, proceed with completion
      proceedWithCompletion();
    }
  };

  const proceedWithCompletion = () => {
    const completionData = {
      items: tempChecklistResults,
      globalRemark: globalChecklistRemark,
      summary: {
        totalChecks: tempChecklistResults.length,
        passedChecks: tempChecklistResults.filter(item => 
          item.result && !["No", "NOT OK", "Failed"].includes(item.result)
        ).length,
        failedChecks: tempChecklistResults.filter(item => 
          item.result && ["No", "NOT OK", "Failed"].includes(item.result)
        ).length,
        completedAt: new Date().toISOString(),
        partNumber: pm.partNumber,
        pmId: pm._id
      }
    };
    
    onComplete(pm._id, completionData);
    onClose();
  };

  const handleFailurePopupClose = () => {
    setShowFailurePopup(false);
    setEditingFailedItem(null);
    setTempVoltageInput("");
  };

  const handleEditFailedItem = (item) => {
    if (item.resulttype === "Numeric Entry") {
      setEditingFailedItem(item);
      setTempVoltageInput("");
    }
  };

  const handleUpdateFailedVoltage = () => {
    if (!editingFailedItem || !tempVoltageInput.trim()) return;

    const voltageValue = parseFloat(tempVoltageInput);
    if (isNaN(voltageValue)) {
      toast.error("Please enter a valid voltage reading.");
      return;
    }

    const { startVoltage, endVoltage } = editingFailedItem;
    const start = parseFloat(startVoltage);
    const end = parseFloat(endVoltage);

    // Update the item in tempChecklistResults
    const updatedResults = tempChecklistResults.map((item) => {
      if (item._id === editingFailedItem._id) {
        return {
          ...item,
          result:
            voltageValue >= start && voltageValue <= end ? "Pass" : "Failed",
          remark: `Measured: ${voltageValue}V (Range: ${start}V - ${end}V)`,
        };
      }
      return item;
    });

    setTempChecklistResults(updatedResults);

    // Update failed items list
    const updatedFailures = failedItems.map((item) => {
      if (item._id === editingFailedItem._id) {
        return {
          ...item,
          result:
            voltageValue >= start && voltageValue <= end ? "Pass" : "Failed",
          remark: `Measured: ${voltageValue}V (Range: ${start}V - ${end}V)`,
        };
      }
      return item;
    });

    setFailedItems(updatedFailures);
    setEditingFailedItem(null);
    setTempVoltageInput("");
    toast.success("Voltage reading updated successfully!");
  };

  const proceedWithFailures = () => {
    proceedWithCompletion();
  };

  const getProgressPercentage = () => {
    if (currentQuestionIndex >= tempChecklistResults.length) return 100;
    return ((currentQuestionIndex + 1) / tempChecklistResults.length) * 100;
  };

  // Determine whether the "Next" button is enabled
  const isNextDisabled = () => {
    if (!tempChecklistResults[currentQuestionIndex]) return true;
    const currentItem = tempChecklistResults[currentQuestionIndex];
    
    // Yes/No selection
    if (
      currentItem.resulttype === "Yes / No" ||
      currentItem.resulttype === "OK/NOT OK"
    ) {
      // Not selected
      if (!currentItem.result) return true;
      // If "No" or "NOT OK", require a remark
      if (
        (currentItem.resulttype === "Yes / No" &&
          currentItem.result === "No" &&
          !currentItem.remark?.trim()) ||
        (currentItem.resulttype === "OK/NOT OK" &&
          currentItem.result === "NOT OK" &&
          !currentItem.remark?.trim())
      ) {
        return true;
      }
    }
    
    // Numeric: must enter a value
    if (currentItem.resulttype === "Numeric Entry") {
      if (
        !manualVoltageInput?.trim() ||
        isNaN(Number.parseFloat(manualVoltageInput))
      )
        return true;
    }
    
    return false;
  };

  const renderQuestionUI = () => {
    const currentItem = tempChecklistResults[currentQuestionIndex];

    if (currentItem.resulttype === "OK/NOT OK") {
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex gap-6">
              <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all hover:bg-green-50 hover:border-green-300 has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
                <input
                  type="radio"
                  className="w-5 h-5 text-green-600 focus:ring-green-500"
                  checked={currentItem.result === "OK"}
                  onChange={() =>
                    handleChecklistResultChange(currentItem._id, "OK")
                  }
                />
                <span className="font-semibold text-base text-green-700">
                  OK
                </span>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
                <input
                  type="radio"
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                  checked={currentItem.result === "NOT OK"}
                  onChange={() =>
                    handleChecklistResultChange(currentItem._id, "NOT OK")
                  }
                />
                <span className="font-semibold text-base text-red-700">
                  NOT OK
                </span>
                <AlertCircle className="w-6 h-6 text-red-600" />
              </label>
            </div>
          </div>
          {currentItem.result === "NOT OK" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark Required *
              </label>
              <textarea
                placeholder="Please explain why this item is not OK..."
                value={currentItem.remark || ""}
                onChange={(e) =>
                  handleChecklistRemarkChange(currentItem._id, e.target.value)
                }
                maxLength={400}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                rows={4}
              />
              <p
                className={`text-xs font-medium text-right mt-1 ${
                  (currentItem.remark?.length || 0) > 380
                    ? "text-red-600"
                    : (currentItem.remark?.length || 0) > 350
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {currentItem.remark?.length || 0}/400 characters used
              </p>
            </div>
          )}
        </div>
      );
    }

    if (currentItem.resulttype === "Yes / No") {
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex gap-6">
              <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all hover:bg-green-50 hover:border-green-300 has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
                <input
                  type="radio"
                  className="w-5 h-5 text-green-600 focus:ring-green-500"
                  checked={currentItem.result === "Yes"}
                  onChange={() =>
                    handleChecklistResultChange(currentItem._id, "Yes")
                  }
                />
                <span className="font-semibold text-base text-green-700">
                  Yes
                </span>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
                <input
                  type="radio"
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                  checked={currentItem.result === "No"}
                  onChange={() =>
                    handleChecklistResultChange(currentItem._id, "No")
                  }
                />
                <span className="font-semibold text-base text-red-700">No</span>
                <AlertCircle className="w-6 h-6 text-red-600" />
              </label>
            </div>
          </div>
          {currentItem.result === "No" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark Required *
              </label>
              <textarea
                placeholder="Please explain why the answer is No..."
                value={currentItem.remark || ""}
                onChange={(e) =>
                  handleChecklistRemarkChange(currentItem._id, e.target.value)
                }
                maxLength={400}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                rows={4}
              />
              <p
                className={`text-xs font-medium text-right mt-1 ${
                  (currentItem.remark?.length || 0) > 380
                    ? "text-red-600"
                    : (currentItem.remark?.length || 0) > 350
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {currentItem.remark?.length || 0}/400 characters used
              </p>
            </div>
          )}
        </div>
      );
    }

    if (currentItem.resulttype === "Numeric Entry") {
      const { startVoltage, endVoltage } = currentItem;
      const start = Number.parseFloat(startVoltage);
      const end = Number.parseFloat(endVoltage);

      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter Voltage Reading (V) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter voltage value"
                value={manualVoltageInput}
                onChange={(e) => setManualVoltageInput(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-base font-medium"
                required
              />
              <p className="text-xs hidden text-gray-500 mt-2 text-center">
                Range: {start}V - {end}V
              </p>
            </div>
          </div>

          {/* Show result preview if voltage is entered */}
          {manualVoltageInput &&
            !isNaN(Number.parseFloat(manualVoltageInput)) && (
              <div className="p-3 bg-gray-50 border hidden border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Result Preview:
                  <span
                    className={`ml-2 font-semibold ${
                      Number.parseFloat(manualVoltageInput) >= start &&
                      Number.parseFloat(manualVoltageInput) <= end
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number.parseFloat(manualVoltageInput) >= start &&
                    Number.parseFloat(manualVoltageInput) <= end
                      ? "Pass"
                      : "Failed"}
                  </span>
                </p>
              </div>
            )}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 px-3 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-lg font-bold text-white">PM Checklist</h2>
            <p className="text-blue-100 text-sm mt-1">
              {currentQuestionIndex >= tempChecklistResults.length
                ? "Final Review"
                : `Question ${currentQuestionIndex + 1} of ${
                    tempChecklistResults.length
                  }`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto py-4 px-4">
          {loadingChecklist ? (
            <div className="text-center py-8">
              <p>Loading checklist...</p>
            </div>
          ) : errorChecklist ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {errorChecklist}</p>
            </div>
          ) : (
            <>
              {/* Checklist Questions */}
              {currentQuestionIndex < tempChecklistResults.length && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                      {tempChecklistResults[currentQuestionIndex].checkpoint}
                    </h3>
                    {renderQuestionUI()}
                  </div>
                </div>
              )}

              {/* Final Review Screen */}
              {currentQuestionIndex >= tempChecklistResults.length && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      PM Checklist Complete
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add any final remarks and complete the checklist
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Global Checklist Remark
                    </label>
                    <textarea
                      placeholder="Enter any overall remarks about this PM..."
                      value={globalChecklistRemark}
                      onChange={(e) => setGlobalChecklistRemark(e.target.value)}
                      maxLength={400}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-none"
                      rows={4}
                    />
                    <p
                      className={`text-xs font-medium text-right mt-1 ${
                        globalChecklistRemark.length > 380
                          ? "text-red-600"
                          : globalChecklistRemark.length > 350
                          ? "text-orange-500"
                          : "text-gray-500"
                      }`}
                    >
                      {globalChecklistRemark.length}/400 characters used
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Failure Popup Modal */}
        {showFailurePopup && (
          <div className="fixed inset-0 flex justify-center items-center z-[60] backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-md font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      PM Checklist Failures Detected
                    </h2>
                    <p className="text-red-100 text-xs">
                      {failedItems.length} item(s) failed. Review and fix if
                      possible.
                    </p>
                  </div>
                  <button
                    onClick={handleFailurePopupClose}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {failedItems.map((item, index) => (
                    <div
                      key={item._id}
                      className="border border-red-200 rounded-lg p-4 bg-red-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-900 mb-1">
                            {item.checkpoint}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Result: {item.result}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {item.resulttype}
                            </span>
                          </div>
                        </div>

                        {/* Edit button only for voltage failures */}
                        {item.resulttype === "Numeric Entry" && (
                          <button
                            onClick={() => handleEditFailedItem(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Settings className="w-3 h-3" />
                            Re-test
                          </button>
                        )}
                      </div>

                      {/* Voltage editing form */}
                      {editingFailedItem &&
                        editingFailedItem._id === item._id && (
                          <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
                            <h4 className="font-medium text-blue-900 mb-2">
                              Re-enter Voltage Reading
                            </h4>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Enter new voltage value"
                                  value={tempVoltageInput}
                                  onChange={(e) =>
                                    setTempVoltageInput(e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs hidden text-gray-500 mt-1">
                                  Expected Range: {item.startVoltage}V -{" "}
                                  {item.endVoltage}V
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateFailedVoltage}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                                  disabled={!tempVoltageInput.trim()}
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => setEditingFailedItem(null)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">
                        Important Notice
                      </h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Only voltage readings can be re-tested. Other failures
                        require manual correction during PM maintenance. You can
                        proceed with the PM completion, but these failures will
                        be recorded in the final report.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-2 justify-between items-center">
                  <button
                    onClick={handleFailurePopupClose}
                    className="py-2 w-full text-gray-600 bg-gray-300 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Go Back to Review
                  </button>
                  <div className="flex w-full gap-3">
                    <button
                      onClick={proceedWithFailures}
                      className="bg-orange-600 w-full hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Proceed with Failures
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              {currentQuestionIndex > 0 && (
                <button
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  onClick={handlePrevQuestion}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              {currentQuestionIndex >= tempChecklistResults.length ? (
                <button
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-sm"
                  onClick={handleFinish}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete PM Checklist</span>
                </button>
              ) : (
                <button
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  onClick={handleNextQuestion}
                  disabled={isNextDisabled()}
                >
                  <span>
                    {currentQuestionIndex < tempChecklistResults.length - 1
                      ? "Next Question"
                      : "Review"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PmChecklistModal;
