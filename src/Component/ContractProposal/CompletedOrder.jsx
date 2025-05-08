import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

function CompletedOrder() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center bg-primary p-3 py-5 text-white fixed top-0 left-0 right-0 z-10">
        <button
          className="mr-2 text-white"
          onClick={() => navigate("/contract-proposal")}
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
              d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 
      0 0 1-.708.708l-3-3a.5.5 
      0 0 1 0-.708l3-3a.5.5 
      0 1 1 .708.708L5.707 7.5H11.5a.5.5 
      0 0 1 .5.5"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Completed Proposal</h2>
      </div>
    </div>
  );
}

export default CompletedOrder;
