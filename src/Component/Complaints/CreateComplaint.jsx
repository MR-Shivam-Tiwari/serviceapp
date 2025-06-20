import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Autocomplete, Checkbox, TextField } from "@mui/joy";

const CreateComplaint = () => {
  const navigate = useNavigate();

  // State hooks to manage select options
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  const [problemNames, setProblemNames] = useState([]);

  // Additional state for selected values
  const [selectedSerialNumber, setSelectedSerialNumber] = useState("");
  const [selectedComplaintType, setSelectedComplaintType] = useState("");
  const [selectedProductGroup, setSelectedProductGroup] = useState("");
  const [selectedProblemType, setSelectedProblemType] = useState("");
  const [selectedProblemName, setSelectedProblemName] = useState("");
  const [breakDown, setBreakDown] = useState(false);
  const [remarks, setRemarks] = useState("");

  // New states for spare parts autocomplete and equipment details
  const [spareOptions, setSpareOptions] = useState([]);
  const [selectedSpare, setSelectedSpare] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [AmcDateDetails, setAmcDateDetails] = useState(null);
  const [CustomerDetails, setCustomerDetails] = useState(null);

  // Loading states
  const [loadingSerialNumbers, setLoadingSerialNumbers] = useState(true);
  const [loadingComplaintTypes, setLoadingComplaintTypes] = useState(true);
  const [loadingProductGroups, setLoadingProductGroups] = useState(true);
  const [loadingProblemTypes, setLoadingProblemTypes] = useState(true);
  const [loadingProblemNames, setLoadingProblemNames] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Modal state
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);

        // Extract all individual fields into variables
        const id = userData.id;
        const firstname = userData.firstname;
        const lastname = userData.lastname;
        const email = userData.email;
        const mobilenumber = userData.mobilenumber;
        const status = userData.status;
        const branch = userData.branch;
        const loginexpirydate = userData.loginexpirydate;
        const employeeid = userData.employeeid;
        const country = userData.country;
        const state = userData.state;
        const city = userData.city;
        const department = userData.department;
        const profileimage = userData.profileimage;
        const deviceid = userData.deviceid;
        const deviceregistereddate = userData.deviceregistereddate;
        const usertype = userData.usertype;

        // Optional/nested fields
        const roleName = userData.role?.roleName || "";
        const roleId = userData.role?.roleId || "";
        const dealerName = userData.dealerInfo?.dealerName || "";
        const dealerId = userData.dealerInfo?.dealerId || "";
        const location = userData.location || [];
        const skills = userData.skills || "";

        // Set all in a state object if needed
        setUserInfo({
          id,
          firstname,
          lastname,
          email,
          mobilenumber,
          status,
          branch,
          loginexpirydate,
          employeeid,
          country,
          state,
          city,
          department,
          profileimage,
          deviceid,
          deviceregistereddate,
          usertype,
          roleName,
          roleId,
          dealerName,
          dealerId,
          location,
          skills,
        });

        // Or just console log variables
        console.log("First Name:", firstname);
        console.log("Role:", roleName);
        console.log("Dealer ID:", dealerId);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch API data functions
  const fetchSerialNumbers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/allequipment/serialnumbers`
      );
      setSerialNumbers(response.data);
    } catch (error) {
      console.error("Error fetching serial numbers:", error);
    } finally {
      setLoadingSerialNumbers(false);
    }
  };

  const fetchComplaintTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/complaint`
      );
      if (Array.isArray(response.data.complaints)) {
        setComplaintTypes(response.data.complaints);
      } else {
        console.error("Error: complaintTypes is not an array", response.data);
      }
    } catch (error) {
      console.error("Error fetching complaint types:", error);
    } finally {
      setLoadingComplaintTypes(false);
    }
  };

  const fetchProductGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/productgroup`
      );
      if (Array.isArray(response.data.productGroups)) {
        setProductGroups(response.data.productGroups);
      } else {
        console.error("Error: productGroups is not an array", response.data);
      }
    } catch (error) {
      console.error("Error fetching product groups:", error);
    } finally {
      setLoadingProductGroups(false);
    }
  };

  const fetchProblemTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/problemtype`
      );
      if (Array.isArray(response.data.problemtype)) {
        setProblemTypes(response.data.problemtype);
      } else {
        console.error("Error: problemTypes is not an array", response.data);
        setProblemTypes([]);
      }
    } catch (error) {
      console.error("Error fetching problem types:", error);
      setProblemTypes([]);
    } finally {
      setLoadingProblemTypes(false);
    }
  };

  const fetchProblemNames = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/complaints/problemname`
      );
      if (Array.isArray(response.data.problemname)) {
        setProblemNames(response.data.problemname);
      } else {
        console.error("Error: problemNames is not an array", response.data);
        setProblemNames([]);
      }
    } catch (error) {
      console.error("Error fetching problem names:", error);
      setProblemNames([]);
    } finally {
      setLoadingProblemNames(false);
    }
  };

  // Fetch equipment details when a serial number is selected
  useEffect(() => {
    if (selectedSerialNumber) {
      axios
        .get(
          `${process.env.REACT_APP_BASE_URL}/collections/equipment-details/${selectedSerialNumber}`
        )
        .then((response) => {
          setEquipmentDetails(response.data.equipment || null);
          setAmcDateDetails(response.data.amcContract || null);
          setCustomerDetails(response.data.customer || null);
        })
        .catch((error) => {
          console.error("Error fetching equipment details:", error);
          setEquipmentDetails(null);
          setAmcDateDetails(null);
          setCustomerDetails(null);
        });
    }
  }, [selectedSerialNumber]);

  // Fetch spare parts using the material code from equipment details
  useEffect(() => {
    if (equipmentDetails && equipmentDetails.materialcode) {
      axios
        .get(
          `${process.env.REACT_APP_BASE_URL}/collections/search/${equipmentDetails.materialcode}`
        )
        .then((response) => {
          setSpareOptions(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching spare parts:", error);
          setSpareOptions([]);
        });
    } else {
      setSpareOptions([]);
    }
  }, [equipmentDetails]);

  // useEffect to fetch all data on component mount
  useEffect(() => {
    fetchSerialNumbers();
    fetchComplaintTypes();
    fetchProductGroups();
    fetchProblemTypes();
    fetchProblemNames();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const complaintData = {
      serialnumber: selectedSerialNumber,
      notificationtype: selectedComplaintType,
      productgroup: selectedProductGroup,
      problemtype: selectedProblemType,
      problemname: selectedProblemName,
      sparesrequested: selectedSpare
        ? `${selectedSpare.PartNumber} - ${selectedSpare.Description}`
        : "",
      breakdown: breakDown,
      remark: remarks,
      // Include service engineer details from localStorage
      user: {
        firstName: userInfo.firstname || "", // make sure it exists
        lastName: userInfo.lastname || "",
        email: userInfo.email || "",
        mobilenumber: userInfo.mobilenumber || "",
        branch: userInfo.branch || [],
      },
    };

    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/sendComplaintEmail`,
        complaintData
      )
      .then((response) => {
        setOpenSuccessModal(true);
        setLoadingSubmit(false);
      })
      .catch((error) => {
        console.error("Error creating complaint:", error);
        setLoadingSubmit(false);
      });
  };

  const handleCloseModal = () => {
    setOpenSuccessModal(false);
    // Clear form after modal close
    setSelectedSerialNumber("");
    setSelectedComplaintType("");
    setSelectedProductGroup("");
    setSelectedProblemType("");
    setSelectedProblemName("");
    setSelectedSpare(null);
    setBreakDown(false);
    setRemarks("");
    setEquipmentDetails(null);
    setSpareOptions([]);
    setAmcDateDetails(null);
    setCustomerDetails(null);
  };

  return (
    <div>
      <div>
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
          <h2 className="text-xl font-bold">Create Complaint</h2>
        </div>

        <div className="px-4">
          <form onSubmit={handleSubmit}>
            {/* Serial Number Selection with Autocomplete */}
            <div className="mb-4">
              <label
                htmlFor="serialNumber"
                className="block text-sm font-medium"
              >
                Search & Select Serial Number
              </label>
              {loadingSerialNumbers ? (
                <p>Loading serial numbers...</p>
              ) : (
                <Autocomplete
                  id="serialNumber"
                  options={serialNumbers}
                  getOptionLabel={(option) => option}
                  onChange={(event, newValue) => {
                    setSelectedSerialNumber(newValue);
                    setEquipmentDetails(null);
                    setSpareOptions([]);
                    setAmcDateDetails(null);
                    setCustomerDetails(null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      className="mt-1 block w-full"
                      label="Serial Number"
                    />
                  )}
                />
              )}
            </div>

            {/* Equipment Details Render */}
            {equipmentDetails && (
              <div className="mb-4 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-bold mb-2">Equipment Details:</h3>
                <p>
                  <strong>Serial Number:</strong>{" "}
                  {equipmentDetails.serialnumber}
                </p>
                <p>
                  <strong>Part No:</strong> {equipmentDetails.materialcode}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {equipmentDetails.materialdescription}
                </p>
                <p>
                  <strong>Current Customer:</strong>{" "}
                  {equipmentDetails.currentcustomer}
                </p>
                {equipmentDetails.custWarrantystartdate && (
                  <p>
                    <strong>Warranty Start:</strong>{" "}
                    {new Date(
                      equipmentDetails.custWarrantystartdate
                    ).toLocaleDateString()}
                  </p>
                )}
                {equipmentDetails.custWarrantyenddate && (
                  <p>
                    <strong>Warranty End:</strong>{" "}
                    {new Date(
                      equipmentDetails.custWarrantyenddate
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {AmcDateDetails && Object.keys(AmcDateDetails).length > 0 && (
              <div className="mb-4 p-4 border rounded-md bg-gray-50">
                {AmcDateDetails.startdate && (
                  <p>
                    <strong>Amc Start Date:</strong>{" "}
                    {new Date(AmcDateDetails.startdate).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                )}
                {AmcDateDetails.enddate && (
                  <p>
                    <strong>Amc End Date:</strong>{" "}
                    {new Date(AmcDateDetails.enddate).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                )}
              </div>
            )}

            {CustomerDetails && Object.keys(CustomerDetails).length > 0 && (
              <div className="mb-4 p-4 border rounded-md bg-gray-50">
                {CustomerDetails.hospitalname && (
                  <p>
                    <strong>Hospital Name:</strong>{" "}
                    {CustomerDetails.hospitalname}
                  </p>
                )}
                {CustomerDetails.city && (
                  <p>
                    <strong>City:</strong> {CustomerDetails.city}
                  </p>
                )}
                {CustomerDetails.email && (
                  <p>
                    <strong>Email:</strong>{" "}
                    {CustomerDetails.email.length > 25
                      ? CustomerDetails.email.slice(0, 25) + "..."
                      : CustomerDetails.email}
                  </p>
                )}
                {CustomerDetails.telephone && (
                  <p>
                    <strong>Phone:</strong> {CustomerDetails.telephone}
                  </p>
                )}
              </div>
            )}

            {/* Complaint Type Selection */}
            <div className="mb-4">
              <label
                htmlFor="complaintType"
                className="block text-sm font-medium"
              >
                Choose Complaint Type
              </label>
              {loadingComplaintTypes ? (
                <p>Loading complaint types...</p>
              ) : (
                <select
                  id="complaintType"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
                  onChange={(e) => setSelectedComplaintType(e.target.value)}
                  value={selectedComplaintType}
                >
                  <option value="">Please select...</option>
                  {complaintTypes.map((type, index) => (
                    <option key={index} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Product Group Selection */}
            <div className="mb-4">
              <label
                htmlFor="productGroup"
                className="block text-sm font-medium"
              >
                Product Group
              </label>
              {loadingProductGroups ? (
                <p>Loading product groups...</p>
              ) : (
                <select
                  id="productGroup"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
                  onChange={(e) => setSelectedProductGroup(e.target.value)}
                  value={selectedProductGroup}
                >
                  <option value="">Please select...</option>
                  {Array.isArray(productGroups) &&
                    productGroups.map((group) => (
                      <option key={group._id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* Problem Type Selection */}
            <div className="mb-4">
              <label
                htmlFor="problemType"
                className="block text-sm font-medium"
              >
                Problem Type
              </label>
              {loadingProblemTypes ? (
                <p>Loading problem types...</p>
              ) : (
                <select
                  id="problemType"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
                  onChange={(e) => setSelectedProblemType(e.target.value)}
                  value={selectedProblemType}
                >
                  <option value="">Please select...</option>
                  {problemTypes.map((type) => (
                    <option key={type._id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Problem Name Selection */}
            <div className="mb-4">
              <label
                htmlFor="problemName"
                className="block text-sm font-medium"
              >
                Problem Name
              </label>
              {loadingProblemNames ? (
                <p>Loading problem names...</p>
              ) : (
                <select
                  id="problemName"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200"
                  onChange={(e) => setSelectedProblemName(e.target.value)}
                  value={selectedProblemName}
                >
                  <option value="">Please select...</option>
                  {problemNames.map((name) => (
                    <option key={name._id} value={name.name}>
                      {name.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Spare Parts Autocomplete for Spares Requested */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Spares Requested
              </label>
              <Autocomplete
                id="spareRequested"
                options={spareOptions}
                getOptionLabel={(option) =>
                  `${option.PartNumber} - ${option.Description}` || ""
                }
                onChange={(event, newValue) => setSelectedSpare(newValue)}
                value={selectedSpare}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    className="mt-1 block w-full"
                    label="Select Spare Part"
                  />
                )}
              />
            </div>

            {/* Breakdown Checkbox */}
            <div className="mb-4">
              <label className="block text-sm font-medium">
                Breakdown:{" "}
                <Checkbox
                  checked={breakDown}
                  onChange={() => setBreakDown(!breakDown)}
                />
              </label>
            </div>

            {/* Remarks Field */}
            <div className="mb-4">
              <label htmlFor="remarks" className="block text-sm font-medium">
                Remarks
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => setRemarks(e.target.value)}
                maxLength={400}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                rows="4"
                wrap="soft"
              ></textarea>
              <p className="mt-2 text-red-600 text-sm">
                400 character limit. Typed {remarks.length} out of 400.
              </p>
            </div>

            <button
              type="submit"
              className={`w-full h-10 mb-5 text-white rounded-md bg-primary ${
                loadingSubmit ? "cursor-wait opacity-50" : ""
              }`}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-4 h-4 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {openSuccessModal && (
        <div className="fixed inset-0 px-5 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Complaint Created Successfully!
            </h2>
            <p className="mb-4">
              Your complaint has been created successfully, and an email has
              been sent to CIC. Thank you!
            </p>
            <div className="flex justify-end">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={handleCloseModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateComplaint;
