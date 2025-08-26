import React, { useState } from "react";
import PmChecklistModal from "./PmChecklistModal";
import { CheckCircle, FileText } from "lucide-react";

const MachineChecklist = ({ pm, onComplete }) => {
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);

  const handleChecklistComplete = (pmId, data) => {
    setChecklistCompleted(true);
    onComplete(pmId, data);
  };

  return (
    <div className="mb-4 border rounded border-gray-200 bg-white">
      {/* PM Details Card */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            {pm.partNumber}
          </h3>
          {checklistCompleted && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">PM Type:</span>
              <span className="font-medium">{pm.pmType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Serial Number:</span>
              <span className="font-medium">{pm.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Code:</span>
              <span className="font-medium">{pm.customerCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Region:</span>
              <span className="font-medium">{pm.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">City:</span>
              <span className="font-medium">{pm.city}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Due Month:</span>
              <span className="font-medium">{pm.pmDueMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Done Date:</span>
              <span className="font-medium">{pm.pmDoneDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendor Code:</span>
              <span className="font-medium">{pm.pmVendorCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engineer Code:</span>
              <span className="font-medium">{pm.pmEngineerCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium px-2 py-1 text-xs ${
                pm.pmStatus === 'Completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {pm.pmStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm">
            <span className="text-gray-600">Description:</span>
            <p className="font-medium mt-1">{pm.materialDescription}</p>
          </div>
        </div>

        {!checklistCompleted && (
          <div className="mt-4">
            <button
              onClick={() => setIsChecklistModalOpen(true)}
              className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Start Checklist
            </button>
          </div>
        )}
      </div>

      {/* PM Checklist Modal */}
      <PmChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        pm={pm}
        onComplete={handleChecklistComplete}
      />
    </div>
  );
};

export default MachineChecklist;
