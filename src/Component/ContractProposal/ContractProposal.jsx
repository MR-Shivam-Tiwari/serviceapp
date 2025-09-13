"use client";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileEdit,
  Clock,
  Calculator,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import ShortcutFooter from "../Home/ShortcutFooter";

function ContractProposal() {
  const navigate = useNavigate();
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 44,
    bottom: 28,
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed  left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
        <div className="flex items-center p-4 py-4 text-white">
          <button
            className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Contract Proposal</h1>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 my-20 overflow-y-auto">
        <div className="px-4 py-5">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Create CMC/NCMC Card */}
            <div className="group">
              <button
                onClick={() => navigate("/create-proposal")}
                className="w-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8 relative z-10">
                  <div className="flex flex-col items-center space-y-5">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FileEdit className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Create CMC/NCMC
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Draft new contract proposals
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </button>
            </div>

            {/* Pending Proposal Card */}
            <div className="group">
              <button
                onClick={() => navigate("/pending-proposal")}
                className="w-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8 relative z-10">
                  <div className="flex flex-col items-center space-y-5">
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                      <Clock className="h-8 w-8 text-white" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Pending Opportunity
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Review awaiting proposals
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </button>
            </div>

            {/* Quote Generation Card */}
            <div className="group">
              <button
                onClick={() => navigate("/quote-generation")}
                className="w-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8 relative z-10">
                  <div className="flex flex-col items-center space-y-5">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calculator className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Quote Generation
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Generate pricing quotes
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </button>
            </div>

            {/* Proposal Completed Card */}
            <div className="group pb-5">
              <button
                onClick={() => navigate("/completed-order")}
                className="w-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8 relative z-10">
                  <div className="flex flex-col items-center space-y-5">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Proposal Completed
                      </h3>
                      <p className="text-gray-500 text-sm">
                        View completed proposals
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ShortcutFooter safeAreaInsets={safeAreaInsets} />
    </div>
  );
}

export default ContractProposal;
