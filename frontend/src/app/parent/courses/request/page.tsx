"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  courseRequestApi,
  type CourseRequestData,
  type CourseRequestFilters,
} from "@/api/course_requests";

const statusConfig: any = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    label: "Pending",
  },
  under_review: {
    color: "bg-blue-100 text-blue-800",
    icon: Eye,
    label: "Under Review",
  },
  approved: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Approved",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Rejected",
  },
  implemented: {
    color: "bg-primary-main/10 text-primary-main",
    icon: CheckCircle,
    label: "Implemented",
  },
};

export default function CourseRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userVotes, setUserVotes] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState<any>();
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    suggestedAgeGroup: "",
    suggestedTags: "",
    suggestedObjectives: "",
    rationale: "",
    realWorldApplication: "",
  });

  // Load course requests
  const loadCourseRequests = async () => {
    try {
      setLoading(true);
      const filters: CourseRequestFilters = {
        page: currentPage,
        limit: 12,
        sortBy: getSortByField(sortBy),
        sortOrder: getSortOrder(sortBy),
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const response = await courseRequestApi.getMyCourseRequests(filters);
      setRequests(response.data.requests || []);
      setTotalPages(Math.ceil((response.total || 0) / 12));
    } catch (error) {
      console.error("Failed to load course requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for sorting
  const getSortByField = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return "createdAt";
      case "oldest":
        return "createdAt";
      case "popular":
        return "voteCount";
      case "title":
        return "title";
      default:
        return "createdAt";
    }
  };

  const getSortOrder = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return "DESC" as const;
      case "oldest":
        return "ASC" as const;
      case "popular":
        return "DESC" as const;
      case "title":
        return "ASC" as const;
      default:
        return "DESC" as const;
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadCourseRequests();
  }, [currentPage, sortBy, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadCourseRequests();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredRequests = requests;

  const sortedRequests = filteredRequests;

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const requestData: CourseRequestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        suggestedAgeGroup: formData.suggestedAgeGroup as
          | "10-12"
          | "13-15"
          | "16-18"
          | undefined,
        suggestedTags: formData.suggestedTags
          ? formData.suggestedTags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        suggestedObjectives: formData.suggestedObjectives
          ? formData.suggestedObjectives
              .split(",")
              .map((obj) => obj.trim())
              .filter(Boolean)
          : undefined,
        rationale: formData.rationale.trim() || undefined,
        realWorldApplication: formData.realWorldApplication.trim() || undefined,
      };

      await courseRequestApi.createCourseRequest(requestData);

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        suggestedAgeGroup: "",
        suggestedTags: "",
        suggestedObjectives: "",
        rationale: "",
        realWorldApplication: "",
      });
      setIsModalOpen(false);

      // Reload requests to show the new one
      loadCourseRequests();
    } catch (error) {
      console.error("Failed to create course request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br z-[-1] from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Course Requests
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Request new courses and see what other parents are asking for
              </p>
            </div>

            {/* Mobile: Full width button, Desktop: Normal button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto sm:self-start inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-main to-primary-secondary text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters & Sort
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          {/* Search Bar - Always visible */}
          <div className="mb-4 lg:mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search course requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filters - Collapsible on mobile, always visible on desktop */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block mt-4 lg:mt-4`}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="implemented">Implemented</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 sm:mb-6 px-1">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm sm:text-base">
                Loading course requests...
              </span>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-600">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {sortedRequests.length}
              </span>{" "}
              course requests
              {totalPages > 1 && (
                <span className="text-gray-500">
                  {" "}
                  • Page {currentPage} of {totalPages}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedRequests.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No course requests found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Be the first to request a new course!"}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 sm:px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedRequests.map((request: any) => {
              const StatusIcon = statusConfig[request.status]?.icon || Clock;
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 p-5 sm:p-6 hover:border-purple-200 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {request.title}
                      </h3>
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusConfig[request.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[request.status]?.label || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                    {request.description}
                  </p>

                  {/* Tags */}
                  {request.suggestedTags &&
                    request.suggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {request.suggestedTags
                          .slice(0, 3)
                          .map((tag: any, index: any) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 text-xs rounded-full border border-purple-200/50 hover:border-purple-300 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        {request.suggestedTags.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{request.suggestedTags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  {/* Age Group & Vote Count */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    {request.suggestedAgeGroup && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Ages {request.suggestedAgeGroup}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {request.voteCount} votes
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <User className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5" />
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {request.requestedBy?.name || "Anonymous"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && sortedRequests.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[1000000000000000000000000000000000] flex items-end sm:items-center justify-center p-0 sm:p-4  animate-fadeIn">
          <div className="bg-white  rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-slideUp sm:animate-scaleIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Create Course Request
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tell us about the course you'd like to see
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 sm:p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., Advanced Python Programming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe what this course should cover..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Suggested Age Group
                    </label>
                    <select
                      value={formData.suggestedAgeGroup}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          suggestedAgeGroup: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select age group</option>
                      <option value="10-12">10-12 years</option>
                      <option value="13-15">13-15 years</option>
                      <option value="16-18">16-18 years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Suggested Tags
                    </label>
                    <input
                      type="text"
                      value={formData.suggestedTags}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          suggestedTags: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Programming, Science (comma-separated)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Learning Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={formData.suggestedObjectives}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        suggestedObjectives: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="What should students learn? (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rationale
                  </label>
                  <textarea
                    rows={3}
                    value={formData.rationale}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rationale: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Why is this course needed?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Real-World Application
                  </label>
                  <textarea
                    rows={3}
                    value={formData.realWorldApplication}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        realWorldApplication: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="How would students apply this in real life?"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !formData.title.trim() ||
                    !formData.description.trim()
                  }
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
