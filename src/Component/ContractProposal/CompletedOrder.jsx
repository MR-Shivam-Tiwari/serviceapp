import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CompletedOrder() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/phone/cnote`
        );
        const data = await response.json();
        setProposals(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCardClick = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleBackToList = () => {
    setSelectedProposal(null);
  };

  if (loading) {
    return (
      <div className="flex mt-64 items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  if (selectedProposal) {
    return (
      <div className="">
        <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
          <button className="mr-2 text-white" onClick={handleBackToList}>
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
          <h2 className="text-xl font-bold">Proposal Details</h2>
        </div>

        <div className="px-4 mb-16">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
            <p>
              <span className="font-medium">Name:</span>{" "}
              {selectedProposal.customer.customername}
            </p>
            <p>
              <span className="font-medium">City:</span>{" "}
              {selectedProposal.customer.city}
            </p>
            <p>
              <span className="font-medium">Postal Code:</span>{" "}
              {selectedProposal.customer.postalcode}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {selectedProposal.customer.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {selectedProposal.customer.telephone}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Proposal Information</h3>
            <p>
              <span className="font-medium">Proposal Number:</span>{" "}
              {selectedProposal.proposalNumber}
            </p>
            <p>
              <span className="font-medium">CNote Number:</span>{" "}
              {selectedProposal.cnoteNumber}
            </p>
            <p>
              <span className="font-medium">Created At:</span>{" "}
              {formatDate(selectedProposal.createdAt)}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className="capitalize">{selectedProposal.status}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Items</h3>
            {selectedProposal.items.map((item, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <p>
                  <span className="font-medium">Equipment:</span>{" "}
                  {item.equipment.name}
                </p>
                <p>
                  <span className="font-medium">Material Code:</span>{" "}
                  {item.equipment.materialcode}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {item.equipment.materialdescription}
                </p>
                <p>
                  <span className="font-medium">Dealer:</span>{" "}
                  {item.equipment.dealer}
                </p>
                <p>
                  <span className="font-medium">Warranty Type:</span>{" "}
                  {item.warrantyType}
                </p>
                <p>
                  <span className="font-medium">Years:</span> {item.years}
                </p>
                <p>
                  <span className="font-medium">Price per Year:</span> ₹
                  {item.pricePerYear.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Subtotal:</span> ₹
                  {item.subtotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Financial Summary</h3>
            <p>
              <span className="font-medium">Grand Subtotal:</span> ₹
              {selectedProposal.grandSubTotal.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">
                Discount ({selectedProposal.discountPercentage}%):
              </span>{" "}
              -₹{selectedProposal.discountAmount.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">After Discount:</span> ₹
              {selectedProposal.afterDiscount.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">
                TDS ({selectedProposal.tdsPercentage}%):
              </span>{" "}
              -₹{selectedProposal.tdsAmount.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">After TDS:</span> ₹
              {selectedProposal.afterTds.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">
                GST ({selectedProposal.gstPercentage}%):
              </span>{" "}
              +₹{selectedProposal.gstAmount.toLocaleString()}
            </p>
            <p className="font-bold text-lg">
              <span className="font-medium">Final Amount:</span> ₹
              {selectedProposal.finalAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">Approval History</h3>
            {selectedProposal.revisions.map((revision, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <p>
                  <span className="font-medium">
                    Revision {revision.revisionNumber}:
                  </span>{" "}
                  {revision.status}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(revision.revisionDate)}
                </p>
                <p>
                  <span className="font-medium">Remark:</span>{" "}
                  {revision.changes.remark || "No remark"}
                </p>

                {revision.approvalHistory.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium">Approvals:</h4>
                    {revision.approvalHistory.map((approval, idx) => (
                      <p key={idx} className="text-sm">
                        {approval.approvalType}: {approval.status} -{" "}
                        {approval.remark || "No remark"}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center bg-primary p-3 py-5 text-white mb-4">
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
        <h2 className="text-xl font-bold">Completed Proposals</h2>
      </div>

      <div className="px-4 mb-16">
        {proposals.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No proposals found</p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal._id}
              className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleCardClick(proposal)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {proposal.customer.customername}
                  </h3>
                  <p className="text-gray-600">{proposal.customer.city}</p>
                  <p className="text-sm text-gray-500">
                    {proposal.proposalNumber}
                  </p>
                </div>
              </div>

              <div className="mt-2 border-t pt-2">
                <p className="font-medium">
                  ₹{proposal.finalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {formatDate(proposal.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CompletedOrder;
