// AddSparePartsModal.js
import React, { useState } from "react";

const AddSparePartsModal = ({ spareOptions, onSave, onCancel }) => {
  const [selectedSpare, setSelectedSpare] = useState("");
  const [remark, setRemark] = useState("");
  const [addedSpares, setAddedSpares] = useState([]);

  const handleAddSpare = () => {
    if (selectedSpare) {
      // Find the selected spare details
      const spareDetails = spareOptions.find(
        (option) => option.PartNumber === selectedSpare
      );
      if (spareDetails) {
        setAddedSpares([
          ...addedSpares,
          { ...spareDetails, remark: remark.trim() },
        ]);
        setSelectedSpare("");
        setRemark("");
      }
    }
  };

  const handleRemoveSpare = (index) => {
    setAddedSpares(addedSpares.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Pass the array of added spares back to the parent component
    onSave(addedSpares);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md w-full max-w-2xl mx-2 overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold">Add Spare Parts</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
            &times;
          </button>
        </div>

        <hr className="mb-4" />

        {/* Spare Part Selector */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Spare Part:</label>
          {Array.isArray(spareOptions) && spareOptions.length > 0 ? (
            <select
              className="border p-2 rounded w-full"
              value={selectedSpare}
              onChange={(e) => setSelectedSpare(e.target.value)}
            >
              <option value="">Select a Spare</option>
              {spareOptions.map((option) => (
                <option key={option.PartNumber} value={option.PartNumber}>
                  {option.PartNumber} - {option.Description}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-red-500">No spare parts available</p>
          )}
        </div>

        {/* Remark Input */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Remark:</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter remark for the spare part"
          />
        </div>

        {/* Add Spare Button */}
        <button
          type="button"
          onClick={handleAddSpare}
          className="bg-primary text-white py-2 px-4 rounded-md w-full hover:bg-blue-700 mb-4"
        >
          Add Spare
        </button>

        {/* List of Added Spare Parts */}
        {addedSpares.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Spares Added:</h4>
            <ul>
              {addedSpares.map((spare, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border p-2 rounded mb-2"
                >
                  <span>
                    <strong>{spare.PartNumber}</strong> - {spare.Description}
                    {spare.remark && <span> (Remark: {spare.remark})</span>}
                  </span>
                  <button
                    onClick={() => handleRemoveSpare(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Spares
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSparePartsModal;
