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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Course Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Request new courses and see what other parents are asking for
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-primary-main text-white rounded-lg hover:bg-primary-main/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search course requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
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
        <div className="mb-6">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading course requests...
            </div>
          ) : (
            <p className="text-gray-600">
              Showing {sortedRequests.length} course requests
              {totalPages > 1 && (
                <span>
                  {" "}
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedRequests.map((request: any) => {
              const StatusIcon = statusConfig[request.status]?.icon || Clock;
              const hasVoted = userVotes.has(request.id);
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {request.title}
                      </h3>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {request.description}
                  </p>

                  {/* Tags */}
                  {request.suggestedTags &&
                    request.suggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {request.suggestedTags
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        {request.suggestedTags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{request.suggestedTags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  {/* Age Group */}
                  {request.suggestedAgeGroup && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Ages {request.suggestedAgeGroup}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      {request.requestedBy?.name || "Anonymous"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {sortedRequests.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No course requests found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Be the first to request a new course!"}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-main/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Request
            </button>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Course Request
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Tell us about the course you'd like to see offered
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="e.g., Advanced Python Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="Describe what this course should cover..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  >
                    <option value="">Select age group</option>
                    <option value="10-12">10-12 years</option>
                    <option value="13-15">13-15 years</option>
                    <option value="16-18">16-18 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                    placeholder="e.g., Programming, Science, Art (comma-separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="What should students learn from this course? (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="Why is this course needed? What gap does it fill?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="How would students apply what they learn in real life?"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                  className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-main/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
    </div>
  );
}
