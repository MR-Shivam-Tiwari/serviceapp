"use client";

import { useState } from "react";

const ProgressModal = ({ progressData, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const startTime = progressData.messages[0]?.timestamp;
  const currentTime = new Date().toLocaleTimeString();
  const timeElapsed = startTime
    ? `${Math.floor((new Date(currentTime) - new Date(startTime)) / 1000)}s`
    : "0s";

  const getEnhancedStatusIcon = (status) => {
    const baseClasses = "w-5 h-5 rounded-full flex items-center justify-center";

    switch (status) {
      case "completed":
      case "success":
        return (
          <div className={`${baseClasses} bg-green-100 text-green-600`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "processing":
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
            <svg
              className="w-3 h-3 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className={`${baseClasses} bg-red-100 text-red-600`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-500`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 px-1 bg-black bg-opacity-50 flex justify-center items-center z-50 
      transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`bg-white p-3 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col
        transform transition-all duration-300 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
      >
        {/* Header with report number and timer */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-800">
              Installation Progress
            </h2>
            {!progressData.isComplete && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {timeElapsed}
              </span>
            )}
          </div>
          {progressData.reportNumber && (
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
              Report #: {progressData.reportNumber}
            </span>
          )}
        </div>

        {/* Progress Summary Card */}
        <div className="mb-4 p-2 bg-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">
              Overall Progress
            </span>
            <span className="text-lg font-bold text-primary">
              {progressData.processedRecords}/{progressData.totalRecords}
              <span className="text-sm font-normal text-gray-500 ml-1">
                ({progressData.completionPercentage}%)
              </span>
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressData.completionPercentage}%`,
                background: progressData.isComplete
                  ? "linear-gradient(90deg, #4f46e5, #10b981)"
                  : "#4f46e5",
              }}
            ></div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Phase:</span>
              <span className="font-medium">
                {progressData.currentPhase || "Initializing"}
              </span>
            </div>

            {progressData.currentEquipment && !progressData.isComplete && (
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Equipment:</span>
                <span className="font-medium truncate">
                  {progressData.currentEquipment}
                </span>
              </div>
            )}
          </div>

          {/* Completion Badge */}
          {progressData.isComplete && (
            <div className="mt-3 flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-2 px-3 rounded-md">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-semibold">
                Installation Completed Successfully!
              </span>
            </div>
          )}
        </div>

        {/* Status Messages with virtual scrolling */}
        <div className="flex-1 flex flex-col mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Activity Log</h3>
            <span className="text-xs text-gray-500">
              {progressData.messages.length} events
            </span>
          </div>

          <div className="flex-1 max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
            {progressData.messages.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {progressData.messages.map((message, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-white transition-colors duration-150"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        {getEnhancedStatusIcon(message.status)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {message.message || message.currentPhase}
                        </p>
                        {message.serialNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Equipment:</span>{" "}
                            {message.serialNumber}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {message.timestamp}
                          </span>
                          {message.processedRecords !== undefined && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {message.processedRecords}/
                              {message.totalRecords}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full mb-3"></div>
                <p className="text-gray-600">
                  Initializing installation process...
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Preparing to process {progressData.totalRecords} machines
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Close Button with smooth transition */}
        {progressData.isComplete && (
          <div className="flex justify-end border-gray-200">
            <button
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200
                flex items-center justify-center min-w-[120px]"
              onClick={handleClose}
            >
              Continue
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;