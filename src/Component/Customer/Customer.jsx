"use client";

import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShortcutFooter from "../Home/ShortcutFooter";
import { useState } from "react";

export default function Customer() {
  const navigate = useNavigate();
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="relative">
        {/* Header */}
        <div className="fixed   left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center p-4 py-4 text-white">
            <button
              className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              Customer Management
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-20">
          <div className="max-w-md mx-auto space-y-6">
            {/* Search Customer Card */}
            <div className="group">
              <button
                onClick={() => navigate("/searchcustomer")}
                className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        Search Customer
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Find existing customers
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </button>
            </div>

            {/* Add New Customer Card */}
            <div className="group">
              <button
                onClick={() => navigate("/addnewcustomer")}
                className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        Add New Customer
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Create customer profile
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
        <ShortcutFooter safeAreaInsets={safeAreaInsets} />
        {/* Decorative Elements */}
        <div className="absolute top-20 right-4 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-4 w-16 h-16 bg-emerald-200/30 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
