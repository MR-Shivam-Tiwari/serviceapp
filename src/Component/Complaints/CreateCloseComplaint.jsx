import React from "react";
import { useNavigate } from "react-router-dom";

const CreateCloseComplaint = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/complaints")}
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
        <h2 className="text-xl font-bold">Create & CLose Complaint</h2>
      </div>

      {/* Form */}
      <div className="px-4 space-y-4">
        <div>
          <label
            htmlFor="serialNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Search & Select Serial Number
          </label>
          <select
            id="serialNumber"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
          >
            <option value="">Select...</option>
          </select>
        </div>

        <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-purple-700">
          Scan Barcode
        </button>

        <div>
          <label
            htmlFor="complaintType"
            className="block text-sm font-medium text-gray-700"
          >
            Choose Complaint Type
          </label>
          <select
            id="complaintType"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
          >
            <option value="">Please select...</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="productGroup"
            className="block text-sm font-medium text-gray-700"
          >
            Product Group
          </label>
          <select
            id="productGroup"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
          >
            <option value="">Please select...</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="problemType"
            className="block text-sm font-medium text-gray-700"
          >
            Problem Type
          </label>
          <select
            id="problemType"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
          >
            <option value="">Please select...</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="problemName"
            className="block text-sm font-medium text-gray-700"
          >
            Problem Name
          </label>
          <select
            id="problemName"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
          >
            <option value="">Please select...</option>
          </select>
        </div>

        <div>
          <label htmlFor="actionTaken" className="block text-sm font-medium">
            Action Taken
          </label>
          <textarea
            id="actionTaken"
            rows="3"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
            placeholder="Enter details..."
          ></textarea>
          
        </div>

        <div>
          <label className="block text-sm font-medium">Enter Voltage</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-1/3 text-sm">L-N/R-Y:</span>
              <input
                type="text"
                className="flex-1 rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
              />
            </div>
            <div className="flex items-center">
              <span className="w-1/3 text-sm">L-G/Y-B:</span>
              <input
                type="text"
                className="flex-1 rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
              />
            </div>
            <div className="flex items-center">
              <span className="w-1/3 text-sm">N-G/B-R:</span>
              <input
                type="text"
                className="flex-1 rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="breakDown"
            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label
            htmlFor="breakDown"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Break Down
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Abnormal Site Condition
          </label>
          <div className="flex items-center space-x-4 mt-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="siteCondition"
                value="yes"
                className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="siteCondition"
                value="no"
                className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm">No</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Feedback to Customer
          </label>
          <textarea
            rows="2"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
            placeholder="Enter feedback..."
          ></textarea>
        </div>

        <div className="space-y-2">
          {/* <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-purple-700">
            ADD INJURY DETAILS
          </button>
          <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-purple-700">
            ADD SPARE PARTS
          </button> */}
          <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-purple-700">
            CREATE & CLOSE COMPLAINT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCloseComplaint;
