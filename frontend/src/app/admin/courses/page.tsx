"use client";
import { BarChart, Book, Clock, Plus, Search, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { courseApi } from "@/api/courses";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  thumbnailUrl?: string;
  totalModules?: number;
  totalLessons?: number;
  totalDuration?: number;
  isApproved: boolean;
  tags?: string[];
  modules: any;
}

interface Stat {
  name: string;
  value: number | string;
  icon: React.ComponentType;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

const AdminCoursesDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([
    { name: "Total Courses", value: 0, icon: Book },
    { name: "Active Students", value: 0, icon: Users },
    { name: "Total Hours", value: 0, icon: Clock },
    { name: "Completion Rate", value: "0%", icon: BarChart },
  ]);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("All Age Groups");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 6,
    total: 0,
  });

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ageGroup:
          ageGroupFilter !== "All Age Groups" ? ageGroupFilter : undefined,
        isApproved:
          statusFilter === "Approved"
            ? true
            : statusFilter === "Pending"
            ? false
            : undefined,
      };

      const response = await courseApi.listCourses(params);
      setCourses(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }));

      setStats([
        { name: "Total Courses", value: response.data.legth, icon: Book },
        { name: "Active Students", value: 156, icon: Users },
        { name: "Total Hours", value: 86, icon: Clock },
        { name: "Completion Rate", value: "78%", icon: BarChart },
      ]);
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };
  const calculateCourseTotals = (course: Course) => {
    let totalLessons = 0;
    let totalDuration = 0;

    if (course.modules) {
      course.modules.forEach((module: any) => {
        if (module.lessons) {
          totalLessons += module.lessons.length;
          totalDuration += module.lessons.reduce((sum: any, lesson: any) => {
            return sum + (lesson.durationMinutes || 0);
          }, 0);
        }
      });
    }

    return { totalLessons, totalDuration };
  };
  // Handle course approval
  const handleApproveCourse = async (courseId: string) => {
    try {
      await courseApi.approveCourse(courseId);
      toast.success("Course approved successfully");
      fetchCourses(); // Refresh the list
    } catch (error) {
      toast.error("Failed to approve course");
      console.error("Error approving course:", error);
    }
  };

  // Fetch courses on component mount and when filters change
  useEffect(() => {
    fetchCourses();
  }, [pagination.page, searchTerm, ageGroupFilter, statusFilter]);
  return (
    <div className="min-h-screen bg-gray-50 text-text2 dark:bg-gray-900 dark:text-text1">
      {/* Header */}
      <header className="bg-primary-main text-text1 p-4 shadow-md rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Course Management Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                router.push("/admin/courses/create");
              }}
              className="bg-primary-secondary hover:bg-blue-600 px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="mr-2" /> New Course
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats?.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center"
            >
              <div className="p-3 rounded-full bg-primary-main/10 text-primary-main mr-4">
                <stat.icon />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                value={ageGroupFilter}
                onChange={(e) => setAgeGroupFilter(e.target.value)}
              >
                <option>All Age Groups</option>
                <option>10-12</option>
                <option>13-15</option>
                <option>16-18</option>
              </select>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Approved</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course: any) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!course.isApproved && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">
                        Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {course.title}
                      </h3>
                      <span className="bg-primary-main/10 text-primary-main text-xs px-2 py-1 rounded-md">
                        {course.ageGroup}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Course Metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                      <div>
                        <p className="font-medium">
                          {course.modules.length || 0}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Modules
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {calculateCourseTotals(course).totalLessons || 0}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Lessons
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {calculateCourseTotals(course).totalDuration || 0} min
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Duration
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <button className="text-primary-main hover:text-primary-secondary text-sm font-medium">
                        View Details
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            router.push(
                              `/admin/courses/create?courseId=${course.id}`
                            );
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Edit
                        </button>
                        {!course.isApproved && (
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleApproveCourse(course.id)}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    Previous
                  </button>
                  {Array.from({
                    length: Math.ceil(pagination.total / pagination.limit),
                  }).map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded-md ${
                        pagination.page === i + 1
                          ? "bg-primary-main text-text1"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: i + 1 }))
                      }
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                    disabled={
                      pagination.page * pagination.limit >= pagination.total
                    }
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && courses?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No courses found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ||
              ageGroupFilter !== "All Age Groups" ||
              statusFilter !== "All Status"
                ? "Try adjusting your search or filter criteria"
                : "Create a new course to get started"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCoursesDashboard;
