import { ArrowLeft, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Autocomplete, Divider, IconButton, TextField } from "@mui/joy";
import { EndOfSupportError } from "./EndOfSupportError";

// --- Service Charge Component ---
const ServiceChargeExtra = ({ materialCode, selectedTds }) => {
  const [serviceChargeData, setServiceChargeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState("withinCity");
  const [inputCharge, setInputCharge] = useState("");
  const [maxCharge, setMaxCharge] = useState(null);

  const gstPercent = 18;

  useEffect(() => {
    if (!materialCode) return;
    async function fetchServiceCharge() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/admin/service-charge/${materialCode}`
        );
        if (res.data.success && res.data.serviceCharge) {
          setServiceChargeData(res.data.serviceCharge);
          setMaxCharge(res.data.serviceCharge.onCallVisitCharge.withinCity);
          setInputCharge("");
        } else {
          setServiceChargeData(null);
          setMaxCharge(null);
          setInputCharge("");
        }
      } catch (err) {
        setServiceChargeData(null);
        setMaxCharge(null);
        setInputCharge("");
      } finally {
        setLoading(false);
      }
    }
    fetchServiceCharge();
  }, [materialCode]);

  useEffect(() => {
    if (!serviceChargeData) return;
    const maxVal =
      serviceType === "withinCity"
        ? serviceChargeData?.onCallVisitCharge.withinCity
        : serviceChargeData?.onCallVisitCharge.outsideCity;
    setMaxCharge(maxVal);
    if (inputCharge && Number(inputCharge) > maxVal) setInputCharge("");
  }, [serviceType, serviceChargeData]);

  const handleChargeInputChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+(\.\d{0,2})?$/.test(val) && Number(val) >= 0)) {
      if (maxCharge !== null && Number(val) > maxCharge) {
        toast.error(
          `Charge cannot exceed maximum allowed value of ₹${maxCharge}`
        );
        return;
      }
      setInputCharge(val);
    }
  };

  const chargeNum = Number(inputCharge) || 0;
  const gstAmount = (chargeNum * gstPercent) / 100;
  const tdsPercent = selectedTds?.tds ? Number(selectedTds.tds) : 0;
  const tdsAmount = ((chargeNum + gstAmount) * tdsPercent) / 100;
  const finalTotal = chargeNum + gstAmount + tdsAmount;

  // Return values for parent use in summary/submission
  return {
    render: (
      <div className="bg-white p-4 rounded shadow-md max-w-md mx-auto mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Additional Service Charge
        </h3>
        {loading && <p>Loading service charge data...</p>}
        {!loading && !serviceChargeData && (
          <p className="text-red-600">No service charge data available</p>
        )}
        {!loading && serviceChargeData && (
          <>
            <div className="mb-4">
              <p>
                <strong>Part Number:</strong> {serviceChargeData?.partNumber}
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2">
                Select Service Location:
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="withinCity"
                    checked={serviceType === "withinCity"}
                    onChange={() => setServiceType("withinCity")}
                    className="mr-2"
                  />
                  Within City (Max ₹
                  {serviceChargeData?.onCallVisitCharge.withinCity.toLocaleString(
                    "en-IN"
                  )}
                  )
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="outsideCity"
                    checked={serviceType === "outsideCity"}
                    onChange={() => setServiceType("outsideCity")}
                    className="mr-2"
                  />
                  Outside City (Max ₹
                  {serviceChargeData?.onCallVisitCharge.outsideCity.toLocaleString(
                    "en-IN"
                  )}
                  )
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="serviceChargeInput"
                className="block font-medium mb-2"
              >
                Enter Service Charge (Max ₹{maxCharge?.toLocaleString("en-IN")})
              </label>
              <input
                id="serviceChargeInput"
                type="number"
                min="0"
                max={maxCharge}
                step="0.01"
                value={inputCharge}
                onChange={handleChargeInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={`Enter amount up to ₹${maxCharge}`}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p>
                <strong>GST (18%):</strong> ₹
                {gstAmount.toFixed(2).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>TDS ({tdsPercent}%):</strong> ₹
                {tdsAmount.toFixed(2).toLocaleString("en-IN")}
              </p>
              <Divider className="my-2" />
              <p className="font-semibold">
                <strong>Final Total:</strong> ₹
                {finalTotal.toFixed(2).toLocaleString("en-IN")}
              </p>
            </div>
          </>
        )}
      </div>
    ),
    chargeNum,
    gstAmount,
    tdsAmount,
    finalTotal,
    valid: !!(inputCharge && !loading && serviceChargeData),
    info: {
      serviceType,
    },
  };
};

// --- Main Page Component ---
const CreateOnCallEstimationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer: {},
    complaint: {},
    productGroups: [],
    tdsPercentage: 0,
    discountPercentage: 0,
    gstPercentage: 0,
    remark: "",
    grandSubTotal: 0,
    discountAmount: 0,
    afterDiscount: 0,
    tdsAmount: 0,
    afterTds: 0,
    gstAmount: 0,
    finalAmount: 0,
    status: "draft",
    createdBy: "currentUserId", // Replace with actual user ID
    updatedBy: "currentUserId", // Replace with actual user ID
  });

  const [spares, setSpares] = useState([]);
  const [allSpares, setAllSpares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedSpares, setSelectedSpares] = useState([]);
  const [endOfSupportError, setEndOfSupportError] = useState(null);
  const [tdsOptions, setTdsOptions] = useState([]);
  const [gstOptions, setGstOptions] = useState([]);
  const [selectedTds, setSelectedTds] = useState(undefined);
  const [selectedGst, setSelectedGst] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const complaint = state?.complaint;
  const customer = state?.customer;
  const [existingSpare, setExistingSpare] = useState(
    complaint?.sparerequest
      ? {
          PartNumber: complaint?.sparerequest,
          Description: "requested spare in Complaint",
        }
      : null
  );
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    userid: "",
    email: "",
    dealerEmail: "",
    manageremail: [],
  });
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo({
        firstName: storedUser.firstname,
        lastName: storedUser.lastname,
        employeeId: storedUser.employeeid,
        userid: storedUser.id,
        email: storedUser.email,
        dealerEmail: storedUser.dealerInfo?.dealerEmail,
        manageremail: Array.isArray(storedUser.manageremail)
          ? storedUser.manageremail
          : storedUser.manageremail
          ? [storedUser.manageremail]
          : [],
      });
    }
  }, []);
  const existingSpareRequests = complaint?.sparerequest
    ? complaint?.sparerequest
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part)
    : [];

  useEffect(() => {
    if (complaint && customer) {
      setFormData((prev) => ({
        ...prev,
        customer: {
          customercodeid: customer.customercodeid,
          customername: customer.customername,
          city: customer.city,
          postalcode: customer.postalcode,
          taxnumber1: customer.taxnumber1,
          taxnumber2: customer.taxnumber2,
          telephone: customer.telephone,
          email: customer.email,
        },
        complaint: {
          notificationtype: complaint?.notificationtype,
          notification_complaintid: complaint?.notification_complaintid,
          notificationdate: complaint?.notificationdate,
          userstatus: complaint?.userstatus,
          materialdescription: complaint?.materialdescription,
          serialnumber: complaint?.serialnumber,
          devicedata: complaint?.devicedata,
          salesoffice: complaint?.salesoffice,
          materialcode: complaint?.materialcode,
          reportedproblem: complaint?.reportedproblem,
          dealercode: complaint?.dealercode,
          customercode: complaint?.customercode,
          partnerresp: complaint?.partnerresp,
          breakdown: complaint?.breakdown,
          requesteupdate: complaint?.requesteupdate,
          rev: complaint?.rev,
          remark: complaint?.remark,
          sparerequest: complaint?.sparerequest,
        },
      }));
    }
  }, [complaint, customer]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tdsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/admin/cmc-ncmc-tds`
        );
        setTdsOptions(tdsResponse.data.records || []);
        const gstResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/admin/gst`
        );
        setGstOptions(gstResponse.data.records || []);
      } catch (error) {
        // Ignore for now
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSpares = async () => {
      try {
        if (!complaint?.materialcode) return;
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/spare-by-partno/${complaint?.materialcode}`
        );
        setAllSpares(response.data.spares);
        if (existingSpareRequests.length > 0) {
          const existingSpares = response.data.spares.filter((spare) =>
            existingSpareRequests.includes(spare?.PartNumber)
          );
          setSelectedSpares(existingSpares);
        }
      } catch (err) {
        if (err.response?.data?.endofsupport) {
          setEndOfSupportError(err.response.data);
        } else {
          setError("Failed to fetch spares");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSpares();
  }, [complaint?.materialcode]);

  const handleAddSpare = (spare) => {
    if (!selectedSpares.some((s) => s.PartNumber === spare?.PartNumber)) {
      setSelectedSpares([...selectedSpares, spare]);
      setSearchInput("");
    }
  };

  const handleRemoveSpare = (partNumber) => {
    setSelectedSpares(
      selectedSpares.filter((spare) => spare?.PartNumber !== partNumber)
    );
  };

  // --- Service Charge Logic
  const serviceCharge = ServiceChargeExtra({
    materialCode: complaint?.materialcode,
    selectedTds,
  });
  // ---

  const handleGenerateEstimate = async () => {
    try {
      setIsSubmitting(true);
      if (selectedSpares.length === 0 && !serviceCharge.valid) {
        toast.error(
          "Please select at least one spare part or enter service charge"
        );
        return;
      }
      if (!selectedTds) {
        toast.error("Please select TDS percentage");
        return;
      }
      if (!selectedGst) {
        toast.error("Please select GST percentage");
        return;
      }
      // Prepare product groups for the OnCall
      const productGroups = [
        {
          productPartNo: complaint?.materialcode,
          subgroup: "OnCall Spares",
          totalSpares: selectedSpares.length,
          spares: selectedSpares,
          existingSpares: existingSpare ? [existingSpare] : [],
        },
      ];
      const totals = calculateTotals();

      // ---- NEW: Prepare additionalServiceCharge with only the required fields
      let additionalServiceCharge = undefined;
      if (serviceCharge.valid && serviceCharge.chargeNum > 0) {
        additionalServiceCharge = {
          enteredCharge: serviceCharge.chargeNum,
          location: serviceCharge.info.serviceType,
          gstAmount: serviceCharge.gstAmount,
          totalAmount: serviceCharge.finalTotal,
        };
      }

      const onCallData = {
        customer: {
          customercodeid: customer.customercodeid,
          customername: customer.customername,
          city: customer.city,
          postalcode: customer.postalcode,
          taxnumber1: customer.taxnumber1,
          taxnumber2: customer.taxnumber2,
          telephone: customer.telephone,
          email: customer.email,
        },
        complaint: {
          notificationtype: complaint?.notificationtype,
          notification_complaintid: complaint?.notification_complaintid,
          notificationdate: complaint?.notificationdate,
          userstatus: complaint?.userstatus,
          materialdescription: complaint?.materialdescription,
          serialnumber: complaint?.serialnumber,
          devicedata: complaint?.devicedata,
          salesoffice: complaint?.salesoffice,
          materialcode: complaint?.materialcode,
          reportedproblem: complaint?.reportedproblem,
          dealercode: complaint?.dealercode,
          customercode: complaint?.customercode,
          partnerresp: complaint?.partnerresp,
          breakdown: complaint?.breakdown,
          requesteupdate: complaint?.requesteupdate,
          rev: complaint?.rev,
          remark: complaint?.remark,
          sparerequest: complaint?.sparerequest,
        },
        productGroups,
        tdsPercentage: parseFloat(selectedTds.tds),
        discountPercentage: 0,
        gstPercentage: parseFloat(selectedGst.gst),
        grandSubTotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        afterDiscount: totals.afterDiscount,
        tdsAmount: totals.tdsAmount,
        afterTds: totals.afterTds,
        gstAmount: totals.gstAmount,
        finalAmount: totals.total,
        status: "submitted",
        createdBy: userInfo?.employeeId,
        // Only include 'additionalServiceCharge' if set
        ...(additionalServiceCharge && { additionalServiceCharge }),
      };

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/phone/oncall`,
        onCallData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("OnCall estimate created successfully!");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(
            "Validation error: " +
              (error.response.data.error || "Please check your input")
          );
        } else if (error.response.status === 401) {
          toast.error("Unauthorized - Please login again");
        } else {
          toast.error(
            error.response.data.message || "Failed to create OnCall estimate"
          );
        }
      } else if (error.request) {
        toast.error("Network error - Please check your connection");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSpares = allSpares.filter(
    (spare) =>
      (spare?.PartNumber.toLowerCase().includes(searchInput.toLowerCase()) ||
        spare?.Description.toLowerCase().includes(searchInput.toLowerCase())) &&
      !selectedSpares.some((s) => s.PartNumber === spare?.PartNumber)
  );

  const calculateTotals = () => {
    const subtotal = selectedSpares.reduce(
      (sum, spare) => sum + (spare?.Rate || 0),
      0
    );
    const tdsValue = selectedTds ? parseFloat(selectedTds.tds) : 0;
    const gstValue = selectedGst ? parseFloat(selectedGst.gst) : 0;
    const discountValue = 0;
    const discountAmount = (subtotal * discountValue) / 100;
    const afterDiscount = subtotal - discountAmount;
    const tdsAmount = (afterDiscount * tdsValue) / 100;
    const afterTds = afterDiscount + tdsAmount; // note: add tds!
    const gstAmount = (afterTds * gstValue) / 100;
    const total = afterTds + gstAmount;
    return {
      subtotal,
      discountAmount,
      afterDiscount,
      tdsAmount,
      afterTds,
      gstAmount,
      total,
    };
  };

  const { subtotal, tdsAmount, gstAmount, total } = calculateTotals();

  if (endOfSupportError) {
    return (
      <EndOfSupportError endDate={endOfSupportError.message.split("on ")[1]} />
    );
  }
  return (
    <div className="">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-6 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl text-nowrap font-bold text-white tracking-wide">
              Create On Call Estimate
            </h1>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Complaint Details Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Complaint Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-gray-600">Complaint Number:</span>
              <span className="ml-2 font-medium">
                {complaint?.notification_complaintid}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Revision No:</span>
              <span className="ml-2 font-medium">{complaint?.rev}</span>
            </div>
            <div>
              <span className="text-gray-600">Serial Number:</span>
              <span className="ml-2 font-medium">{complaint?.serialnumber}</span>
            </div>
            <div>
              <span className="text-gray-600">Part Number:</span>
              <span className="ml-2 font-medium">{complaint?.materialcode}</span>
            </div>
            <div>
              <span className="text-gray-600">Customer Code:</span>
              <span className="ml-2 font-medium">{complaint?.customercode}</span>
            </div>
            <div>
              <span className="text-gray-600">Customer Email:</span>
              <span className="ml-2 font-medium">{customer.email}</span>
            </div>
          </div>
        </div>
        {/* Spare Search Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Add Spares
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Autocomplete
              freeSolo
              options={filteredSpares}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : `${option?.PartNumber} - ${option?.Description}`
              }
              inputValue={searchInput}
              onInputChange={(_, newValue) => setSearchInput(newValue)}
              onChange={(_, newValue) => {
                if (newValue && typeof newValue !== "string") {
                  handleAddSpare(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by part number or description"
                  className="pl-10"
                  fullWidth
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <li
                  {...props}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{option?.PartNumber}</div>
                  <div className="text-sm text-gray-600">
                    {option?.Description}
                  </div>
                  <div className="text-sm text-gray-500">
                    ₹{option?.Rate ?? "N/A"}
                  </div>
                </li>
              )}
            />
          </div>
        </div>
        {/* Tax Selection Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Tax Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TDS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TDS
              </label>
              <select
                value={selectedTds?.tds ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const selected = tdsOptions.find(
                    (opt) => opt.tds.toString() === value
                  );
                  setSelectedTds(selected || null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              >
                <option value="">Select TDS</option>
                {tdsOptions.map((option, index) => (
                  <option key={`tds-${index}`} value={option?.tds.toString()}>
                    {option?.tds}%
                  </option>
                ))}
              </select>
            </div>
            {/* GST */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST
              </label>
              <select
                value={selectedGst?.gst ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const selected = gstOptions.find(
                    (opt) => opt.gst.toString() === value
                  );
                  setSelectedGst(selected || null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              >
                <option value="">Select GST</option>
                {gstOptions.map((option, index) => (
                  <option key={`gst-${index}`} value={option?.gst.toString()}>
                    {option?.gst}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Selected Spares Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Selected Spares
            </h2>
            <span className="text-sm text-gray-500">
              {selectedSpares.length + (existingSpare ? 1 : 0)} item
              {selectedSpares.length + (existingSpare ? 1 : 0) !== 1
                ? "s"
                : ""}{" "}
              selected
            </span>
          </div>
          {existingSpare && (
            <div className="border rounded-md p-3 flex justify-between items-center bg-blue-50 border-blue-200">
              <div>
                <div className="font-medium flex items-center">
                  {existingSpare?.PartNumber}
                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Existing
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {existingSpare?.Description}
                </div>
              </div>
              <IconButton
                onClick={() => setExistingSpare(null)}
                className="text-blue-500 hover:text-blue-700"
              >
                <X size={18} />
              </IconButton>
            </div>
          )}
          {selectedSpares.length === 0 && !existingSpare ? (
            <div className="text-center py-6 text-gray-500">
              No spares selected. Search below to add spares.
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {selectedSpares.map((spare, index) => (
                <div
                  key={index}
                  className="border rounded-md p-3 flex justify-between items-center bg-white"
                >
                  <div>
                    <div className="font-medium flex items-center">
                      {spare?.PartNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {spare?.Description}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Rate:</span> ₹
                      {spare?.Rate?.toLocaleString("en-IN") ?? "N/A"}
                    </div>
                  </div>
                  <IconButton
                    onClick={() => handleRemoveSpare(spare?.PartNumber)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Service Charge NEW SECTION */}
        {serviceCharge.render}
        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Estimate Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                TDS {selectedTds ? `(${selectedTds.tds}%)` : ""}:
              </span>
              <span className="font-medium text-red-600">
                {selectedTds
                  ? `+₹${tdsAmount.toLocaleString("en-IN")}`
                  : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                GST {selectedGst ? `(${selectedGst.gst}%)` : ""}:
              </span>
              <span className="font-medium text-green-600">
                {selectedGst
                  ? `+₹${gstAmount.toLocaleString("en-IN")}`
                  : "Not selected"}
              </span>
            </div>
            <Divider />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount (Spares):</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            {serviceCharge.valid && (
              <>
                <Divider />
                <div className="flex justify-between text-lg font-semibold text-blue-800">
                  <span>Total incl. Service Charge:</span>
                  <span>
                    ₹
                    {(total + serviceCharge.finalTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Action Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleGenerateEstimate}
            disabled={
              (selectedSpares.length === 0 && !serviceCharge.valid) ||
              isSubmitting
            }
            className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
              (selectedSpares.length === 0 && !serviceCharge.valid) ||
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Creating..." : "Generate On Call Estimate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOnCallEstimationPage;
