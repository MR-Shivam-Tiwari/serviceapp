"use client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Plus, AlertTriangle, FileText } from "lucide-react";
import ShortcutFooter from "../Home/ShortcutFooter";
import { useState } from "react";

const Complaints = () => {
  const navigate = useNavigate();
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full">
        {/* Enhanced Header */}
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center ">
              <div>
                <h2 className="text-xl text-nowrap font-bold tracking-wide">
                  Complaints Management
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-20">
          {/* Action Cards */}
          <div className="space-y-6">
            {/* Pending Complaints Card */}
            <div
              onClick={() => navigate("/pendingcomplaints")}
              className="group relative bg-gradient-to-br from-white to-orange-50 hover:from-orange-50 hover:to-red-50 rounded-2xl shadow-lg hover:shadow-2xl border border-orange-200 hover:border-orange-300 p-8 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">
                    Pending Complaints
                  </h3>
                </div>
                <div className="text-orange-600 group-hover:text-orange-700 transition-colors">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/5 to-red-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Create Complaint Card */}
            <div
              onClick={() => navigate("/createcomplaint")}
              className="group relative bg-gradient-to-br from-white to-green-50 hover:from-green-50 hover:to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl border border-green-200 hover:border-green-300 p-8 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                    Create Complaint
                  </h3>
                </div>
                <div className="text-green-600 group-hover:text-green-700 transition-colors">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/5 to-emerald-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
};

export default Complaints;
