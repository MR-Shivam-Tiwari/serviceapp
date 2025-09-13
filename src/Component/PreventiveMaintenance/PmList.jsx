import React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Users,
  AlertTriangle,
  Calendar,
} from "lucide-react";

export default function PmList({
  pms,
  selectedPms,
  toggleSelection,
  selectedPmsCount,
  handleRemoveAll,
  handleProceed,
  searchQuery,
  setSearchQuery,
  currentPage,
  totalPages,
  handlePageChange,
  getStatusBadgeColor,
  getStatusIcon,
  currentMonth,
  isLoading,
}) {
  return (
    <>
      {/* Search and Remove All */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Customer Code, Serial No, or Description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-500"
            />
          </div>
          {selectedPmsCount > 0 && (
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleRemoveAll}
                className="px-6 py-3 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
              >
                Remove All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center py-14">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <p className="text-gray-700 mt-4">Searching...</p>
        </div>
      )}

      {/* PM Cards */}
      {!isLoading && pms.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pms.map((pm) => {
              const isSelected = selectedPms.some((sel) => sel._id === pm._id);
              const maxSelected = !isSelected && selectedPmsCount === 10;
              const dueMonthMismatch = pm.pmStatus === "Due" && pm.pmDueMonth !== currentMonth;
              const disabled = maxSelected || dueMonthMismatch;

              return (
                <div
                  key={pm._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className="bg-white/90 backdrop-blur-sm mx-1 my-1 rounded-xl p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="font-bold text-gray-800">{pm.customerCode}</span>
                        </div>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                            pm.pmStatus
                          )}`}
                        >
                          {getStatusIcon(pm.pmStatus)}
                          <span>{pm.pmStatus}</span>
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-500">PM Type:</span>
                          <p className="font-medium text-gray-800">{pm.pmType}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Description:</span>
                          <p className="font-medium text-gray-800 text-sm">{pm.materialDescription}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Serial Number:</span>
                          <p className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg text-sm inline-block">
                            {pm.serialNumber}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500">Due:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {pm.pmDueMonth}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSelection(pm)}
                        disabled={disabled}
                        title={
                          dueMonthMismatch
                            ? `PM due month (${pm.pmDueMonth}) is not current month (${currentMonth})`
                            : maxSelected
                            ? "You can select a maximum of 10 PMs."
                            : ""
                        }
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isSelected ? "Remove" : "Select"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination - Only show when searching */}
          {searchQuery.trim() && totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/80 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 6) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNumber
                          ? "bg-blue-500 text-white"
                          : "bg-white/80 text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                      aria-current={currentPage === pageNumber ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/80 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        !isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No PMs Found
            </h3>
            <p className="text-gray-500">
              {searchQuery.trim()
                ? "No matching PMs found for your search."
                : "There are no Due or Overdue PMs for this customer."}
            </p>
          </div>
        )
      )}
      
      {/* Fixed Footer with Proceed Button */}
      {selectedPmsCount > 0 && (
        <div className="fixed bottom-12 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/20 shadow-2xl p-6 z-50">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleProceed}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
            >
              <span className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>
                  Proceed with {selectedPmsCount} PM
                  {selectedPmsCount > 1 && "s"}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
