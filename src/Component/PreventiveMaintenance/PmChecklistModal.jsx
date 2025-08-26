import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const PmChecklistModal = ({ isOpen, onClose, pm, onComplete }) => {
  const [tempChecklistResults, setTempChecklistResults] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalChecklistRemark, setGlobalChecklistRemark] = useState("");
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [errorChecklist, setErrorChecklist] = useState("");
  const [manualVoltageInput, setManualVoltageInput] = useState("");

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
    onComplete(pm._id, {
      items: tempChecklistResults,
      globalRemark: globalChecklistRemark,
    });
    onClose();
  };

  const getProgressPercentage = () => {
    if (currentQuestionIndex >= tempChecklistResults.length) return 100;
    return ((currentQuestionIndex + 1) / tempChecklistResults.length) * 100;
  };

  const renderQuestionUI = () => {
    const currentItem = tempChecklistResults[currentQuestionIndex];

    if (currentItem.resulttype === "OK/NOT OK") {
      return (
        <div className="space-y-4">
          <div className="flex gap-3">
            <label className="flex items-center rounded-md space-x-2 cursor-pointer p-3 border border-gray-300 hover:border-green-500 hover:bg-green-50 has-[:checked]:bg-green-50 has-[:checked]:border-green-500 transition-colors">
              <input
                type="radio"
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                checked={currentItem.result === "OK"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "OK")
                }
              />
              <span className="font-medium text-green-700">OK</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </label>
            <label className="flex items-center space-x-2 rounded-md cursor-pointer p-3 border border-gray-300 hover:border-red-500 hover:bg-red-50 has-[:checked]:bg-red-50 has-[:checked]:border-red-500 transition-colors">
              <input
                type="radio"
                className="w-4 h-4 text-red-600 focus:ring-red-500"
                checked={currentItem.result === "NOT OK"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "NOT OK")
                }
              />
              <span className="font-medium text-red-700">NOT OK</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </label>
          </div>
          {currentItem.result === "NOT OK" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark Required *
              </label>
              <textarea
                placeholder="Please explain why this item is not OK..."
                value={currentItem.remark || ""}
                onChange={(e) =>
                  handleChecklistRemarkChange(currentItem._id, e.target.value)
                }
                maxLength={400}
                className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {(currentItem.remark || "").length}/400 characters
              </p>
            </div>
          )}
        </div>
      );
    }

    if (currentItem.resulttype === "Yes / No") {
      return (
        <div className="space-y-4">
          <div className="flex gap-3">
            <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded border-gray-300 hover:border-green-500 hover:bg-green-50 has-[:checked]:bg-green-50 has-[:checked]:border-green-500 transition-colors">
              <input
                type="radio"
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                checked={currentItem.result === "Yes"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "Yes")
                }
              />
              <span className="font-medium text-green-700">Yes</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </label>
            <label className="flex items-center space-x-2 rounded cursor-pointer p-3 border border-gray-300 hover:border-red-500 hover:bg-red-50 has-[:checked]:bg-red-50 has-[:checked]:border-red-500 transition-colors">
              <input
                type="radio"
                className="w-4 h-4 text-red-600 focus:ring-red-500"
                checked={currentItem.result === "No"}
                onChange={() =>
                  handleChecklistResultChange(currentItem._id, "No")
                }
              />
              <span className="font-medium text-red-700">No</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </label>
          </div>
          {currentItem.result === "No" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark Required *
              </label>
              <textarea
                placeholder="Please explain why the answer is No..."
                value={currentItem.remark || ""}
                onChange={(e) =>
                  handleChecklistRemarkChange(currentItem._id, e.target.value)
                }
                maxLength={400}
                className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {(currentItem.remark || "").length}/400 characters
              </p>
            </div>
          )}
        </div>
      );
    }

    if (currentItem.resulttype === "Numeric Entry") {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Voltage Reading (V) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter measured voltage value"
              value={manualVoltageInput}
              onChange={(e) => setManualVoltageInput(e.target.value)}
              className="w-full p-3 border rounded-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the voltage reading from your measurement equipment
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full rounded-lg max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center rounded-lg justify-between px-4 py-3 border-b border-gray-200 bg-blue-600">
          <div>
            <h2 className="text-xl font-semibold text-white">PM Checklist</h2>
            <p className="text-blue-100 text-sm">
              {currentQuestionIndex >= tempChecklistResults.length
                ? "Final Review"
                : `Question ${currentQuestionIndex + 1} of ${tempChecklistResults.length}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
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
              {currentQuestionIndex < tempChecklistResults.length && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {tempChecklistResults[currentQuestionIndex].checkpoint}
                    </h3>
                    {renderQuestionUI()}
                  </div>
                </div>
              )}

              {currentQuestionIndex >= tempChecklistResults.length && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      PM Checklist Complete
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add any final remarks and complete the checklist
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Global Checklist Remark
                    </label>
                    <textarea
                      placeholder="Enter any overall remarks about this PM..."
                      value={globalChecklistRemark}
                      onChange={(e) => setGlobalChecklistRemark(e.target.value)}
                      maxLength={400}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {globalChecklistRemark.length}/400 characters
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              {currentQuestionIndex > 0 && (
                <button
                  className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors"
                  onClick={handlePrevQuestion}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              {currentQuestionIndex >= tempChecklistResults.length ? (
                <button
                  className="flex items-center rounded-lg space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium transition-colors"
                  onClick={handleFinish}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete</span>
                </button>
              ) : (
                <button
                  className="flex items-center  rounded-md space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextQuestion}
                  disabled={
                    tempChecklistResults[currentQuestionIndex]?.resulttype ===
                      "Numeric Entry" && !manualVoltageInput.trim()
                  }
                >
                  <span>
                    {currentQuestionIndex < tempChecklistResults.length - 1
                      ? "Next"
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
