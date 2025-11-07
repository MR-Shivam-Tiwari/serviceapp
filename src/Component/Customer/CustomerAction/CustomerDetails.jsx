import { ArrowLeft, Building2, MapPin, Phone, Mail, CreditCard, Search, FileText, Edit3, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    newMobile: "",
    newEmail: ""
  });

  const [userInfo, setUserInfo] = useState({
    id: "",
    firstname: "",
    lastname: "",
    email: "",
    mobilenumber: "",
    status: "",
    branch: "",
    loginexpirydate: "",
    employeeid: "",
    country: "",
    state: "",
    city: "",
    department: "",
    profileimage: "",
    deviceid: "",
    deviceregistereddate: "",
    usertype: "",
    manageremail: [],
    roleName: "",
    roleId: "",
    dealerName: "",
    dealerId: "",
    dealerCode: "",
    dealerEmail: "",
    location: [],
    skills: ""
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);

        // extract states from demographics
        const stateDemographics = Array.isArray(userData.demographics)
          ? userData.demographics.find((d) => d.type === "state")
          : null;

        const stateNames = stateDemographics?.values?.map((s) => s.name) || [];

        setUserInfo({
          id: userData.id || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          mobilenumber: userData.mobilenumber || "",
          status: userData.status || "",
          branch: userData.branch || [],
          loginexpirydate: userData.loginexpirydate || "",
          employeeid: userData.employeeid || "",
          country: userData.country || "",
          state: stateNames,
          city: userData.city || "",
          department: userData.department || "",
          profileimage: userData.profileimage || "",
          deviceid: userData.deviceid || "",
          deviceregistereddate: userData.deviceregistereddate || "",
          usertype: userData.usertype || "",
          manageremail: Array.isArray(userData.manageremail)
            ? userData.manageremail
            : userData.manageremail
              ? [userData.manageremail]
              : [],
          roleName: userData.role?.roleName || "",
          roleId: userData.role?.roleId || "",
          dealerName: userData.dealerInfo?.dealerName || "",
          dealerId: userData.dealerInfo?.dealerCode || "",
          dealerCode: userData.dealerInfo?.dealerCode || "",
          dealerEmail: userData.dealerInfo?.dealerEmail || "",
          location: userData.location || [],
          skills: userData.skills || ""
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/customer/${id}`)
      .then((response) => response.json())
      .then((data) => setCustomer(data))
      .catch((error) =>
        console.error("Error fetching customer details:", error)
      );
  }, [id]);

  const fetchEquipment = () => {
    if (!customer?.customercodeid) {
      console.error("Customer Code ID is missing!");
      return;
    }

    setLoading(true);
    setShowEquipment(true);

    fetch(
      `${process.env.REACT_APP_BASE_URL}/collections/checkequipments/${customer?.customercodeid}`
    )
      .then((response) => response.json())
      .then((data) => {
        setEquipment(data.equipments || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching equipment:", error);
        setLoading(false);
      });
  };

  const handleEditRequest = async (e) => {
    e.preventDefault();

    if (!editForm.newMobile && !editForm.newEmail) {
      toast.error("Please provide at least one field to update");
      return;
    }

    if (!userInfo.firstname || !userInfo.lastname || !userInfo.employeeid) {
      toast.error("Employee information is missing. Please log in again.");
      return;
    }

    setSubmitLoading(true);

    try {
      const employeeName = `${userInfo.firstname} ${userInfo.lastname}`.trim();

      const requestBody = {
        customercodeid: customer.customercodeid,
        customername: customer.customername,
        currentMobile: customer.telephone,
        currentEmail: customer.email,
        newMobile: editForm.newMobile,
        newEmail: editForm.newEmail,
        employeeName: employeeName,
        employeeId: userInfo.employeeid
      };

      console.log("Sending request:", requestBody);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/request-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Change request sent successfully to CIC team");
        setShowEditModal(false);
        setEditForm({ newMobile: "", newEmail: "" });
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      toast.error("Error sending request. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!customer) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
          <span className="text-gray-600 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/searchcustomer")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Customer Details</h2>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-3 pb-4">
        {/* Customer Header */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="ml-2 flex-1">
              <h3 className="text-sm font-semibold text-gray-800">
                {customer?.customername || "Customer Name"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">ID: {customer?.customercodeid}</p>
            </div>
          </div>

          {customer?.hospitalname && (
            <div className="bg-blue-50 rounded-lg p-2 mt-2">
              <div className="flex items-center text-blue-700">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs font-medium">{customer.hospitalname}</span>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h4 className="ml-2 text-xs font-semibold text-gray-800">Contact</h4>
            </div>

          </div>

          <div className="space-y-2">
            <div className="flex items-start">
              <Phone className="w-3 h-3 text-green-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-xs font-medium text-gray-800">{customer?.telephone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="w-3 h-3 text-blue-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-xs font-medium text-gray-800 break-all">{customer?.email || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <h4 className="ml-2 text-xs font-semibold text-gray-800">Business</h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-start">
              <CreditCard className="w-3 h-3 text-orange-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">PAN</p>
                <p className="text-xs font-medium text-gray-800">{customer?.taxnumber1 || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start">
              <FileText className="w-3 h-3 text-red-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">GST</p>
                <p className="text-xs font-medium text-gray-800">{customer?.taxnumber2 || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h4 className="ml-2 text-xs font-semibold text-gray-800">Address</h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Street", value: customer?.street },
              { label: "City", value: customer?.city },
              { label: "District", value: customer?.district },
              { label: "Region", value: customer?.region },
              { label: "Country", value: customer?.country },
              { label: "Postal Code", value: customer?.postalcode }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-xs font-medium text-gray-800">{item.value || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md mb-3"

        >
          Update Contact
        </button>
        <button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md mb-3"
          onClick={fetchEquipment}
        >
          <div className="flex items-center justify-center">
            <Search className="w-4 h-4 mr-2" />
            <span>View Equipment</span>
          </div>
        </button>
        {/* Equipment Section */}
        {showEquipment && (
          <div className="bg-white rounded-xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <h4 className="ml-2 text-xs font-semibold text-gray-800">Equipment</h4>
              </div>
              {equipment.length > 0 && (
                <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {equipment.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-2"></div>
                  <span className="text-gray-600 text-xs">Loading...</span>
                </div>
              </div>
            ) : equipment.length > 0 ? (
              <div className="space-y-2">
                {equipment.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <button
                          onClick={() =>
                            navigate("/equipmentdetail", {
                              state: { serialNumber: item.serialnumber },
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline mb-1 block"
                        >
                          {item.serialnumber}
                        </button>
                        <p className="text-xs text-gray-500 mb-0.5">Part: {item.materialcode}</p>
                        <p className="text-xs text-gray-700 line-clamp-2">{item.materialdescription}</p>
                      </div>
                      <div className="ml-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Search className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <h5 className="text-xs font-medium text-gray-600 mb-1">No Equipment</h5>
                <p className="text-xs text-gray-500">No equipment registered</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-base">Request Contact Update</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditRequest} className="p-4">
              {/* Customer Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Customer Details</p>
                <p className="text-sm font-semibold text-gray-800">{customer.customername}</p>
                <p className="text-xs text-gray-500">ID: {customer.customercodeid}</p>
              </div>

              {/* Current Contact */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">Current Contact</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Phone:</span> {customer.telephone || "Not set"}
                  </p>
                  <p className="text-xs text-gray-700 break-all">
                    <span className="font-medium">Email:</span> {customer.email || "Not set"}
                  </p>
                </div>
              </div>

              {/* Employee Info Display */}
              <div className="bg-green-50 hidden rounded-lg p-3 mb-4">
                <p className="text-xs text-green-600 font-medium mb-1">Your Information</p>
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Name:</span> {userInfo.firstname} {userInfo.lastname}
                </p>
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Employee ID:</span> {userInfo.employeeid}
                </p>
              </div>

              {/* New Contact Form */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    New Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.newMobile}
                    onChange={(e) => setEditForm({ ...editForm, newMobile: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter new mobile number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.newEmail}
                    onChange={(e) => setEditForm({ ...editForm, newEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter new email address"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <span className="font-medium text-yellow-700">Note:</span> This will send a request to CIC team for approval
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
