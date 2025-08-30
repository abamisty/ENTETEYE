"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Heart,
  Edit3,
  Send,
  ChevronDown,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Loader2,
  MoreVertical,
  Check,
  X,
  Pause,
  Archive,
} from "lucide-react";
import {
  courseRequestApi,
  type CourseRequestFilters,
  type CourseRequestStatusUpdate,
  type CourseRequestCommentData,
} from "@/api/course_requests";

const statusConfig: any = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending",
    action: "Review",
  },
  under_review: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Eye,
    label: "Under Review",
    action: "Decide",
  },
  approved: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Approved",
    action: "Implement",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Rejected",
    action: "Reconsider",
  },
  implemented: {
    color: "bg-primary-main/10 text-primary-main border-primary-main/20",
    icon: CheckCircle,
    label: "Implemented",
    action: "View",
  },
  duplicate: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Archive,
    label: "Duplicate",
    action: "Review",
  },
};

const statusActions: any = [
  {
    value: "pending",
    label: "Mark as Pending",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: Eye,
    color: "text-blue-600",
  },
  {
    value: "approved",
    label: "Approve",
    icon: CheckCircle,
    color: "text-green-600",
  },
  { value: "rejected", label: "Reject", icon: XCircle, color: "text-red-600" },
  {
    value: "implemented",
    label: "Mark Implemented",
    icon: Check,
    color: "text-primary-main",
  },
  {
    value: "duplicate",
    label: "Mark Duplicate",
    icon: Archive,
    color: "text-gray-600",
  },
];

export default function AdminCourseRequests() {
  const [requests, setRequests] = useState<any>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRequest, setExpandedRequest] = useState<any>(null);
  const [comments, setComments] = useState<any>({});
  const [newComment, setNewComment] = useState("");
  const [commentingOn, setCommentingOn] = useState(null);
  const [statusModal, setStatusModal] = useState<any>({
    open: false,
    requestId: null,
    currentStatus: null,
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    rejectionReason: "",
    adminNotes: "",
    implementedCourseId: "",
  });

  // Load course requests
  const loadCourseRequests = async () => {
    try {
      setLoading(true);
      const filters: CourseRequestFilters = {
        page: currentPage,
        limit: 20,
        sortBy: getSortByField(sortBy),
        sortOrder: getSortOrder(sortBy),
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const response = await courseRequestApi.getCourseRequests(filters);
      console.log(response);
      setRequests(response.data.requests || []);
      setTotalPages(Math.ceil((response.total || 0) / 20));
    } catch (error) {
      console.error("Failed to load course requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await courseRequestApi.getCourseRequestStats();
      setStats(response.data || {});
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  // Load comments for a specific request
  const loadComments = async (requestId: string) => {
    try {
      const response = await courseRequestApi.getCourseRequestComments(
        requestId
      );
      setComments((prev: any) => ({
        ...prev,
        [requestId]: response.data || [],
      }));
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  // Helper functions
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

  // Event handlers
  const handleExpandRequest = (requestId: string) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(requestId);
      if (!comments[requestId]) {
        loadComments(requestId);
      }
    }
  };

  const handleAddComment = async (requestId: string) => {
    if (!newComment.trim()) return;

    try {
      const commentData: CourseRequestCommentData = {
        content: newComment.trim(),
        isAdminComment: true,
      };

      await courseRequestApi.addCommentToCourseRequest(requestId, commentData);
      setNewComment("");
      setCommentingOn(null);
      loadComments(requestId); // Reload comments
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusUpdate.status) return;

    try {
      const updateData: CourseRequestStatusUpdate = {
        status: statusUpdate.status as any,
        rejectionReason: statusUpdate.rejectionReason || undefined,
        adminNotes: statusUpdate.adminNotes || undefined,
        implementedCourseId: statusUpdate.implementedCourseId || undefined,
      };

      await courseRequestApi.updateCourseRequestStatus(
        statusModal.requestId,
        updateData
      );

      setRequests((prev: any) =>
        prev.map((request: any) =>
          request.id === statusModal.requestId
            ? { ...request, status: statusUpdate.status }
            : request
        )
      );

      // Close modal and reset
      setStatusModal({ open: false, requestId: null, currentStatus: null });
      setStatusUpdate({
        status: "",
        rejectionReason: "",
        adminNotes: "",
        implementedCourseId: "",
      });

      // Reload stats
      loadStats();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openStatusModal = (requestId: string, currentStatus: string) => {
    setStatusModal({ open: true, requestId, currentStatus });
    setStatusUpdate({ ...statusUpdate, status: "" });
  };

  // Load data on mount and filter changes
  useEffect(() => {
    loadCourseRequests();
  }, [currentPage, sortBy, statusFilter]);

  useEffect(() => {
    loadStats();
  }, []);

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

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value || 0}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Course Requests Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and review course requests from parents
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadStats}
              className="px-4 py-2 text-primary-main border border-primary-main rounded-lg hover:bg-primary-main hover:text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Refresh Stats
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={FileText}
            color="bg-blue-500"
            trend="+12% this month"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending + stats.under_review || 0}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Implemented"
            value={stats.implemented}
            icon={Check}
            color="bg-primary-main"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, description, or requester..."
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
                <option value="duplicate">Duplicate</option>
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

        {/* Course Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-main" />
              <p className="text-gray-600">Loading course requests...</p>
            </div>
          ) : (
            <div className="space-y-0">
              {requests.map((request: any, index: any) => {
                const StatusIcon = statusConfig[request.status]?.icon || Clock;
                const isExpanded = expandedRequest === request.id;
                const requestComments = comments[request.id] || [];

                return (
                  <div
                    key={request.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    {/* Main Row */}
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleExpandRequest(request.id)}
                          className="mt-1 p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                {request.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {request.description}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {request.requestedBy?.name || "Anonymous"}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {request.voteCount || 0} votes
                                </div>
                                {requestComments.length > 0 && (
                                  <div className="flex items-center">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    {requestComments.length} comments
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                                  statusConfig[request.status]?.color ||
                                  "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                <StatusIcon className="w-4 h-4 mr-2" />
                                {statusConfig[request.status]?.label ||
                                  "Unknown"}
                              </div>

                              <button
                                onClick={() =>
                                  openStatusModal(request.id, request.status)
                                }
                                className="px-3 py-1 text-sm bg-primary-main text-white rounded-lg hover:bg-primary-main/90 transition-colors"
                              >
                                {statusConfig[request.status]?.action ||
                                  "Update"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t bg-white p-6 space-y-6">
                        {/* Request Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                              Request Details
                            </h4>
                            <div className="space-y-3 text-sm">
                              {request.suggestedAgeGroup && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Age Group:
                                  </span>
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {request.suggestedAgeGroup} years
                                  </span>
                                </div>
                              )}
                              {request.suggestedTags &&
                                request.suggestedTags.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Tags:
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {request.suggestedTags.map(
                                        (tag: string, i: number) => (
                                          <span
                                            key={i}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                          >
                                            {tag}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              {request.rationale && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Rationale:
                                  </span>
                                  <p className="mt-1 text-gray-600">
                                    {request.rationale}
                                  </p>
                                </div>
                              )}
                              {request.realWorldApplication && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Real-World Application:
                                  </span>
                                  <p className="mt-1 text-gray-600">
                                    {request.realWorldApplication}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                              Admin Information
                            </h4>
                            <div className="space-y-3 text-sm">
                              {request.adminNotes && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Admin Notes:
                                  </span>
                                  <p className="mt-1 text-gray-600">
                                    {request.adminNotes}
                                  </p>
                                </div>
                              )}
                              {request.rejectionReason && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Rejection Reason:
                                  </span>
                                  <p className="mt-1 text-red-600">
                                    {request.rejectionReason}
                                  </p>
                                </div>
                              )}
                              {request.reviewedBy && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Reviewed By:
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    {request.reviewedBy.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">
                            Comments
                          </h4>

                          {/* Add Comment */}
                          <div className="mb-4">
                            {commentingOn === request.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={newComment}
                                  onChange={(e) =>
                                    setNewComment(e.target.value)
                                  }
                                  placeholder="Add an admin comment..."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddComment(request.id)}
                                    disabled={!newComment.trim()}
                                    className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-main/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Add Comment
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCommentingOn(null);
                                      setNewComment("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCommentingOn(request.id)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Add Comment
                              </button>
                            )}
                          </div>

                          {/* Comments List */}
                          <div className="space-y-4 max-h-60 overflow-y-auto">
                            {requestComments.length > 0 ? (
                              requestComments.map((comment: any) => (
                                <div
                                  key={comment.id}
                                  className={`p-4 rounded-lg border ${
                                    comment.isAdminComment
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-gray-900">
                                          {comment.author?.name || "Unknown"}
                                        </span>
                                        {comment.isAdminComment && (
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Admin
                                          </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            comment.createdAt
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-gray-700">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm italic">
                                No comments yet
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {requests.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No course requests found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No course requests have been submitted yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === pageNum
                        ? "bg-primary-main text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Status
              </h2>
              <p className="text-gray-600 mt-2">
                Change the status of this course request
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) =>
                    setStatusUpdate((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                >
                  <option value="">Select status...</option>
                  {statusActions.map((action: any) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              {statusUpdate.status === "rejected" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={statusUpdate.rejectionReason}
                    onChange={(e) =>
                      setStatusUpdate((prev) => ({
                        ...prev,
                        rejectionReason: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                    placeholder="Explain why this request was rejected..."
                  />
                </div>
              )}

              {statusUpdate.status === "implemented" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course ID
                  </label>
                  <input
                    type="text"
                    value={statusUpdate.implementedCourseId}
                    onChange={(e) =>
                      setStatusUpdate((prev) => ({
                        ...prev,
                        implementedCourseId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                    placeholder="Enter the implemented course ID..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={statusUpdate.adminNotes}
                  onChange={(e) =>
                    setStatusUpdate((prev) => ({
                      ...prev,
                      adminNotes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="Add internal notes about this decision..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-4">
              <button
                onClick={() => {
                  setStatusModal({
                    open: false,
                    requestId: null,
                    currentStatus: null,
                  });
                  setStatusUpdate({
                    status: "",
                    rejectionReason: "",
                    adminNotes: "",
                    implementedCourseId: "",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!statusUpdate.status}
                className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-main/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
