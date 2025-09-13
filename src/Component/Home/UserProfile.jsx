"use client";

import { useState, useEffect } from "react";

import {
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  BadgeIcon as IdCard,
  Building,
  MapPin,
  Target,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShortcutFooter from "./ShortcutFooter";

export default function UserProfile() {
  //   const router = useRouter()
  const [userData, setUserData] = useState(null);
  const naviagte = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    dealer: false,
    locations: false,
    demographics: false,
    skills: false,
  });
  const [expandedSkillGroups, setExpandedSkillGroups] = useState({});
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  useEffect(() => {
    // Get data from localStorage
    const fetchUserData = () => {
      try {
        const storedData = localStorage.getItem("user");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
        } else {
          console.error("No user data found in localStorage");
          // You might want to handle this case differently, like redirecting to login
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    };

    fetchUserData();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSkillGroup = (group) => {
    setExpandedSkillGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const groupSkillsByProductGroup = (skills) => {
    return (
      skills?.reduce((groups, skill) => {
        const group = skill.productGroup || "Other";
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(skill);
        return groups;
      }, {}) || {}
    );
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const skillGroups = groupSkillsByProductGroup(userData.skills);

  // Helper function to extract branch names
  const getBranchNames = (branches) => {
    if (!branches) return [];
    return branches.map((branch) => {
      if (typeof branch === "object" && branch.name) {
        return branch.name;
      }
      return branch;
    });
  };

  // Helper function to extract demographic values
  const getDemographicValues = (demographic) => {
    if (!demographic.values) return [];
    return demographic.values.map((value) => {
      if (typeof value === "object" && value.name) {
        return value.name;
      }
      return value;
    });
  };

  return (
    <div className="  bg-gradient-to-br   pb-6">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center mb-4">
          <button
            onClick={() => naviagte("/")}
            className="flex items-center space-x-1 text-blue-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {userData.profileimage ? (
              <img
                src={`${process.env.REACT_APP_BASE_URL}${userData.profileimage}`}
                alt={`${userData.firstname} ${userData.lastname}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {`${userData.firstname} ${userData.lastname}`.slice(0, 15)}
            </h1>

            <p className="text-blue-100 text-sm">{userData.role?.roleName}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                userData.status === "Active"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {userData.status}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
              {userData.role?.roleId}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="px-4 mt-6 space-y-4 pb-20 max-h-[calc(100vh-220px)] overflow-y-auto">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("personal")}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                expandedSections.personal ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              expandedSections.personal
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {userData.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Mobile
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {userData.mobilenumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <IdCard className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Employee ID
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {userData.employeeid}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Building className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Department
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {userData.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dealer Information */}
        {userData.usertype === "dealer" && userData.dealerInfo && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection("dealer")}
              className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Dealer Information
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                  expandedSections.dealer ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                expandedSections.dealer
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <div className="p-4 space-y-4 h-[250px] overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                      Dealer Name
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {userData.dealerInfo.dealerName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                        Code
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {userData.dealerInfo.dealerCode}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {userData.dealerInfo.dealerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl ">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-2">
                      Branches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getBranchNames(userData.branch).map((branch, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium"
                        >
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locations & Managers */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("locations")}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Locations & Managers
              </h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                expandedSections.locations ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              expandedSections.locations
                ? "max-h-[500px] opacity-100 overflow-y-auto"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 space-y-4">
              {userData.location && userData.location.length > 0 && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-2">
                    Assigned Locations
                  </p>
                  {userData.location.map((loc, index) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {typeof loc === "object" ? JSON.stringify(loc) : loc}
                    </p>
                  ))}
                </div>
              )}
              {userData.manageremail && userData.manageremail.length > 0 && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-2">
                    Manager Emails
                  </p>
                  <div className="space-y-1">
                    {userData.manageremail.map((email, index) => (
                      <p key={index} className="text-sm text-gray-700">
                        {email}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demographics */}
        {/* {userData.demographics && userData.demographics.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection("demographics")}
              className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Demographics
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                  expandedSections.demographics ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                expandedSections.demographics
                  ? "max-h-[500px] opacity-100 overflow-y-auto"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 space-y-3">
                {userData.demographics.map((demo, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                        {demo.type}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getDemographicValues(demo).map((value, valueIndex) => (
                        <span
                          key={valueIndex}
                          className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        {/* Product Skills */}
        {userData.skills && userData.skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection("skills")}
              className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Product Skills
                </h2>
                <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                  {userData.skills.length}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                  expandedSections.skills ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                expandedSections.skills
                  ? "max-h-[500px] opacity-100 overflow-y-auto"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 space-y-3">
                {Object.entries(skillGroups).map(([groupName, skills]) => (
                  <div
                    key={groupName}
                    className="border border-orange-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSkillGroup(groupName)}
                      className="w-full p-3 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <ChevronRight
                          className={`w-4 h-4 text-orange-600 transition-transform duration-200 ${
                            expandedSkillGroups[groupName] ? "rotate-90" : ""
                          }`}
                        />
                        <span className="font-medium text-gray-800">
                          {groupName}
                        </span>
                        <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                          {skills.length}
                        </span>
                      </div>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        expandedSkillGroups[groupName]
                          ? "max-h-[500px] opacity-100 overflow-y-auto"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="p-3 space-y-2 bg-white">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <p className="text-sm font-medium text-gray-800 mb-2">
                              {skill.productName}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {skill.partNumbers.map(
                                (partNumber, partIndex) => (
                                  <span
                                    key={partIndex}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-mono"
                                  >
                                    {partNumber}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}
