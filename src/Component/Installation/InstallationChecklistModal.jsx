"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

const ChecklistModal = ({
  isOpen,
  onClose,
  checklistItems,
  onFinish,
  initialGlobalRemark = "",
  voltageData,
}) => {
  const [tempChecklistResults, setTempChecklistResults] =
    useState(checklistItems);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalChecklistRemark, setGlobalChecklistRemark] =
    useState(initialGlobalRemark);

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
      if (!currentItem.remark.trim()) {
        toast.error("Please enter a remark for 'No' before proceeding.");
        return;
      }
    }

    if (
      currentItem.resulttype === "OK/NOT OK" &&
      currentItem.result === "NOT OK"
    ) {
      if (!currentItem.remark.trim()) {
        toast.error("Please enter a remark for 'NOT OK' before proceeding.");
        return;
      }
    }

    if (currentItem.resulttype === "Numeric Entry") {
      const { startVoltage, endVoltage } = currentItem;
      if (!startVoltage || !endVoltage) {
        toast.error("Voltage range missing.");
        return;
      }

      const start = parseFloat(startVoltage);
      const end = parseFloat(endVoltage);

      let currentVoltage;
      const label = currentItem.checkpoint.toLowerCase();
      if (label.includes("l-n") || label.includes("r-y")) {
        currentVoltage = parseFloat(voltageData.lnry);
      } else if (label.includes("l-g") || label.includes("y-b")) {
        currentVoltage = parseFloat(voltageData.lgyb);
      } else if (label.includes("n-g") || label.includes("b-r")) {
        currentVoltage = parseFloat(voltageData.ngbr);
      } else {
        currentVoltage = parseFloat(voltageData.lnry);
      }

      if (isNaN(start) || isNaN(end) || isNaN(currentVoltage)) {
        toast.error("Invalid or missing voltage readings.");
        return;
      }

      currentItem.result =
        currentVoltage >= start && currentVoltage <= end ? "Pass" : "Failed";

      currentItem.remark = `Measured: ${currentVoltage}V (Range: ${start}V - ${end}V)`;
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

  const handleFinish = () => {
    onFinish(tempChecklistResults, globalChecklistRemark);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Checklist</h2>
        {currentQuestionIndex < tempChecklistResults.length ? (
          (() => {
            const currentItem = tempChecklistResults[currentQuestionIndex];
            return (
              <div key={currentItem._id} className="mb-4">
                <p className="text-sm mb-2 font-semibold">
                  {currentItem.checkpoint}
                </p>
                {currentItem.resulttype === "Numeric Entry" && (
                  <div className="space-y-4 hidden">
                    {/* Numeric entry UI */}
                  </div>
                )}

                {currentItem.resulttype === "OK/NOT OK" && (
                  <div className="space-x-3">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        className="mr-1"
                        checked={currentItem.result === "OK"}
                        onChange={() =>
                          handleChecklistResultChange(currentItem._id, "OK")
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
                          handleChecklistResultChange(currentItem._id, "NOT OK")
                        }
                      />
                      NOT OK
                    </label>
                  </div>
                )}
                {currentItem.resulttype === "OK/NOT OK" &&
                  currentItem.result === "NOT OK" && (
                    <div className="mt-2">
                      <textarea
                        type="text"
                        placeholder="Enter remark for this Checklist"
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
                {currentItem.resulttype === "Yes / No" && (
                  <div className="space-x-3">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        className="mr-1"
                        checked={currentItem.result === "Yes"}
                        onChange={() =>
                          handleChecklistResultChange(currentItem._id, "Yes")
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
                          handleChecklistResultChange(currentItem._id, "No")
                        }
                      />
                      No
                    </label>
                  </div>
                )}
                {currentItem.resulttype === "Yes / No" &&
                  currentItem.result === "No" && (
                    <div className="mt-2">
                      <textarea
                        type="text"
                        placeholder="Enter remark for this Checklist"
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
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Global Checklist Remark
            </h3>
            <textarea
              type="text"
              placeholder="Enter global checklist remark"
              value={globalChecklistRemark}
              onChange={(e) => setGlobalChecklistRemark(e.target.value)}
              className="border rounded p-1 w-full"
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={handleFinish}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistModal;
