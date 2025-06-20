import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PendingComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [problemTypeFilter, setProblemTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/allpendingcomplaints`)
      .then((response) => response.json())
      .then((data) => {
        setComplaints(data.pendingComplaints);
        setFilteredComplaints(data.pendingComplaints);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching complaints:", error);
        setIsLoading(false);
      });
  }, []);

  // Handle Search & Filter
  useEffect(() => {
    let filtered = complaints.filter((complaint) => {
      return (
        complaint?.notification_complaintid
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint?.serialnumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint?.customercode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

    if (problemTypeFilter) {
      filtered = filtered.filter(
        (complaint) => complaint?.problemtype === problemTypeFilter
      );
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, problemTypeFilter, complaints]);

  const handleDetailsClick = (complaintId) => {
    navigate(`/pendingcomplaints/${complaintId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center bg-primary p-3 py-5 text-white">
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
        <h2 className="text-xl font-bold">Pending Complaints</h2>
      </div>

      {/* Search & Filter */}
      <div className="p-2 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by Complaint No, Serial No, Customer Code"
          className="p-2 border rounded-md w-full md:w-2/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 border rounded-md w-full md:w-1/3"
          value={problemTypeFilter}
          onChange={(e) => setProblemTypeFilter(e.target.value)}
        >
          <option value="">All Problem Types</option>
          {[...new Set(complaints.map((c) => c.problemtype))].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Complaint List or Loader */}
      <div className="p-2 space-y-4">
        {isLoading ? (
          // Loader Animation
          <div className="flex mt-20 items-center justify-center">
            <span className="loader"></span>
          </div>
        ) : filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-bold">
                  Complaint No: {complaint?.notification_complaintid}
                </div>
                <div className="text-sm">
                  Problem Type: {complaint?.problemtype}
                </div>
                <div className="text-sm">
                  Serial No: {complaint?.serialnumber}
                </div>
                <div className="text-sm">
                  Customer Code: {complaint?.customercode}
                </div>
              </div>

              <button
                className="bg-orange-500 text-white p-1 px-2 pt-1.5 text-md rounded-md hover:bg-orange-600"
                onClick={() => handleDetailsClick(complaint._id)}
              >
                DETAILS
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No complaints found.</div>
        )}
      </div>
    </div>
  );
};

export default PendingComplaintsPage;
