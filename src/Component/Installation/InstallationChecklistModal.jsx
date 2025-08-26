"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ChecklistModal = ({
  isOpen,
  onClose,
  checklistItems,
  onFinish,
  initialGlobalRemark = "",
  voltageData, // Ab ye use nahi hoga numeric entry ke liye
  initialEquipmentUsed = "",
  initialCalibrationDate = "",
}) => {
  const [tempChecklistResults, setTempChecklistResults] =
    useState(checklistItems);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalChecklistRemark, setGlobalChecklistRemark] =
    useState(initialGlobalRemark);
  const [equipmentUsedSerial, setEquipmentUsedSerial] =
    useState(initialEquipmentUsed);
  const [calibrationDueDate, setCalibrationDueDate] = useState(
    initialCalibrationDate
  );
  const [showEquipmentForm, setShowEquipmentForm] = useState(true);

  // New state for manual voltage input
  const [manualVoltageInput, setManualVoltageInput] = useState("");

  // Initialize values when checklist items change
  useEffect(() => {
    if (checklistItems.length > 0 && checklistItems[0].equipmentUsedSerial) {
      setEquipmentUsedSerial(checklistItems.equipmentUsedSerial); // Fixed
    }
    if (checklistItems.length > 0 && checklistItems.calibrationDueDate) {
      setCalibrationDueDate(checklistItems.calibrationDueDate); // Fixed
    }
  }, [checklistItems]);

  // Reset manual voltage input when question changes
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

  const handleStartChecklist = () => {
    if (!equipmentUsedSerial.trim() || !calibrationDueDate) {
      toast.error("Please fill in all required equipment information.");
      return;
    }
    setShowEquipmentForm(false);
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (showEquipmentForm) {
      handleStartChecklist();
      return;
    }

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
      // Validate manual voltage input
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
      // Move to final review
      setCurrentQuestionIndex(tempChecklistResults.length);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex === 0 && !showEquipmentForm) {
      setShowEquipmentForm(true);
    } else if (currentQuestionIndex > 0) {
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

    // Update the current item with manual voltage reading
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
    const updatedResults = [...tempChecklistResults];
    if (updatedResults.length > 0) {
      updatedResults[0] = {
        ...updatedResults[0],
        equipmentUsedSerial,
        calibrationDueDate,
      };
    }
    onFinish(updatedResults, globalChecklistRemark);
    onClose();
  };

  const getProgressPercentage = () => {
    if (showEquipmentForm) return 0;
    if (currentQuestionIndex >= tempChecklistResults.length) return 100;
    return ((currentQuestionIndex + 1) / tempChecklistResults.length) * 100;
  };

  // Determine whether the "Next" button is enabled based on question type and answer
  const isNextDisabled = () => {
    if (showEquipmentForm) {
      return !equipmentUsedSerial?.trim() || !calibrationDueDate?.trim();
    }
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
    if (showEquipmentForm) return null;

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
          <div className="p-4 bg-blue-50 border hidden border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Expected Voltage Range
            </h4>
            <p className="text-sm text-blue-700">
              Range:{" "}
              <span className="font-semibold">
                {start}V - {end}V
              </span>
            </p>
          </div>

          {/* Manual Voltage Input */}
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
              <p className="text-xs text-gray-500 mt-2 text-center">
                Range: {start}V - {end}V
              </p>
            </div>
          </div>

          {/* Show result preview if voltage is entered */}
          {manualVoltageInput &&
            !isNaN(Number.parseFloat(manualVoltageInput)) && (
              <div className="p-3 bg-gray-50 hidden border border-gray-200 rounded-lg">
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
            <h2 className="text-lg font-bold text-white">
              Equipment Checklist
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {showEquipmentForm
                ? "Equipment Information"
                : currentQuestionIndex >= tempChecklistResults.length
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
        {!showEquipmentForm && (
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
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto py-4 px-4">
          {/* Equipment Information Form */}
          {showEquipmentForm && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Machine Information
                </h3>
                <p className="text-gray-600 text-sm">
                  Please provide the equipment details before starting the
                  checklist
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Used Serial Number *
                  </label>
                  <input
                    type="text"
                    value={equipmentUsedSerial}
                    onChange={(e) => setEquipmentUsedSerial(e.target.value)}
                    placeholder="Enter equipment serial number"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calibration Due Date *
                  </label>
                  <input
                    type="date"
                    value={calibrationDueDate}
                    onChange={(e) => setCalibrationDueDate(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Checklist Questions */}
          {!showEquipmentForm &&
            currentQuestionIndex < tempChecklistResults.length && (
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
          {!showEquipmentForm &&
            currentQuestionIndex >= tempChecklistResults.length && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Checklist Complete
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
                    placeholder="Enter any overall remarks for this installation..."
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

                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">
                    Equipment Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Equipment Used
                      </label>
                      <p className="font-medium text-gray-900 text-sm bg-white p-2 rounded border">
                        {equipmentUsedSerial}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Calibration Due
                      </label>
                      <p className="font-medium text-gray-900 text-sm bg-white p-2 rounded border">
                        {new Date(calibrationDueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              {(!showEquipmentForm && currentQuestionIndex > 0) ||
              (!showEquipmentForm &&
                currentQuestionIndex >= tempChecklistResults.length) ? (
                <button
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  onClick={handlePrevQuestion}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex space-x-3">
              {currentQuestionIndex >= tempChecklistResults.length &&
              !showEquipmentForm ? (
                <button
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-sm"
                  onClick={handleFinish}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Checklist</span>
                </button>
              ) : (
                <button
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  onClick={handleNextQuestion}
                  disabled={isNextDisabled()}
                >
                  <span>
                    {showEquipmentForm
                      ? "Start Checklist"
                      : currentQuestionIndex < tempChecklistResults.length - 1
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

export default ChecklistModal;
