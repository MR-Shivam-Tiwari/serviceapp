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
  voltageData,
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

  // Initialize values when checklist items change
  useEffect(() => {
    if (checklistItems.length > 0 && checklistItems[0].equipmentUsedSerial) {
      setEquipmentUsedSerial(checklistItems[0].equipmentUsedSerial);
    }
    if (checklistItems.length > 0 && checklistItems[0].calibrationDueDate) {
      setCalibrationDueDate(checklistItems[0].calibrationDueDate);
    }
  }, [checklistItems]);

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
      handleNumericEntry(currentItem);
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

  const handleNumericEntry = (currentItem) => {
    const { startVoltage, endVoltage } = currentItem;
    if (!startVoltage || !endVoltage) {
      toast.error("Voltage range missing.");
      return;
    }

    const start = Number.parseFloat(startVoltage);
    const end = Number.parseFloat(endVoltage);
    let currentVoltage;

    const label = currentItem.checkpoint.toLowerCase();
    if (label.includes("l-n") || label.includes("r-y")) {
      currentVoltage = Number.parseFloat(voltageData.lnry);
    } else if (label.includes("l-g") || label.includes("y-b")) {
      currentVoltage = Number.parseFloat(voltageData.lgyb);
    } else if (label.includes("n-g") || label.includes("b-r")) {
      currentVoltage = Number.parseFloat(voltageData.ngbr);
    } else {
      currentVoltage = Number.parseFloat(voltageData.lnry);
    }

    if (isNaN(start) || isNaN(end) || isNaN(currentVoltage)) {
      toast.error("Invalid or missing voltage readings.");
      return;
    }

    currentItem.result =
      currentVoltage >= start && currentVoltage <= end ? "Pass" : "Failed";
    currentItem.remark = `Measured: ${currentVoltage}V (Range: ${start}V - ${end}V)`;
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

  const renderQuestionUI = () => {
    if (showEquipmentForm) return null;

    const currentItem = tempChecklistResults[currentQuestionIndex];

    if (currentItem.resulttype === "OK/NOT OK") {
      return (
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 rounded-lg transition-all hover:bg-green-50 hover:border-green-300 has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
              <input
                type="radio"
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                checked={currentItem.result === "OK"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "OK")
                }
              />
              <span className="font-medium text-green-700">OK</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 rounded-lg transition-all hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
              <input
                type="radio"
                className="w-4 h-4 text-red-600 focus:ring-red-500"
                checked={currentItem.result === "NOT OK"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "NOT OK")
                }
              />
              <span className="font-medium text-red-700">NOT OK</span>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </label>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
              />
            </div>
          )}
        </div>
      );
    }

    if (currentItem.resulttype === "Yes / No") {
      return (
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 rounded-lg transition-all hover:bg-green-50 hover:border-green-300 has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
              <input
                type="radio"
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                checked={currentItem.result === "Yes"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "Yes")
                }
              />
              <span className="font-medium text-green-700">Yes</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 rounded-lg transition-all hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
              <input
                type="radio"
                className="w-4 h-4 text-red-600 focus:ring-red-500"
                checked={currentItem.result === "No"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "No")
                }
              />
              <span className="font-medium text-red-700">No</span>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </label>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
              />
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Voltage Reading</h4>
            <p className="text-sm text-blue-700">
              Expected Range:{" "}
              <span className="font-semibold">
                {start}V - {end}V
              </span>
            </p>
            {currentItem.remark && (
              <p className="text-sm text-blue-700 mt-1">{currentItem.remark}</p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 px-4 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
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
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        {!showEquipmentForm && (
          <div className="px-2 py-3 bg-gray-50">
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
        <div className="flex-1 overflow-auto py-3 px-2">
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
                <p className="text-gray-600">
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
                    placeholder="Enter serial number of equipment used"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Checklist Questions */}
          {!showEquipmentForm &&
            currentQuestionIndex < tempChecklistResults.length && (
              <div className="space-y-6 flex justify-center">
                <div className="bg-white     rounded-lg p-2 px-3 ">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  <p className="text-gray-600">
                    Add any final remarks and complete the checklist
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Global Checklist Remark
                  </label>
                  <textarea
                    placeholder="Enter any overall remarks about this installation..."
                    value={globalChecklistRemark}
                    onChange={(e) => setGlobalChecklistRemark(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="4"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Equipment Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Equipment Used
                      </label>
                      <p className="font-medium text-gray-900 mt-1">
                        {equipmentUsedSerial}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Calibration Due
                      </label>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(calibrationDueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              {(!showEquipmentForm && currentQuestionIndex > 0) ||
              (!showEquipmentForm &&
                currentQuestionIndex >= tempChecklistResults.length) ? (
                <button
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
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
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                  onClick={handleFinish}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Checklist</span>
                </button>
              ) : (
                <button
                  className="flex items-center text-nowrap space-x-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextQuestion}
                  disabled={
                    showEquipmentForm &&
                    (!equipmentUsedSerial || !calibrationDueDate)
                  }
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
