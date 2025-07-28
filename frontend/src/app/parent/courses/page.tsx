"use client";
import { BarChart, Book, Clock, Plus, Search, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { courseApi } from "@/api/courses";
import { parentApi } from "@/api/parent";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const ParentCoursesDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("All Age Groups");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 6,
    total: 0,
  });

  // Enrollment modal state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [enrolling, setEnrolling] = useState(false);

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
        isApproved: true, // Only show approved courses to parents
      };

      const response = await courseApi.listCourses(params);
      setCourses(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }));
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch children for enrollment
  const fetchChildren = async () => {
    try {
      const response = await parentApi.getAllChildren();
      setChildren(response.data);
      if (response.data.length > 0) {
        setSelectedChildId(response.data[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch children");
      console.error("Error fetching children:", error);
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

  // Open enrollment modal
  const openEnrollmentModal = (course: Course) => {
    setSelectedCourse(course);
    fetchChildren();
    setShowEnrollmentModal(true);
  };

  // Handle enrollment submission
  const handleEnrollment = async () => {
    if (!selectedCourse || !selectedChildId) return;

    try {
      setEnrolling(true);
      await parentApi.enrollChildInCourse({
        childId: selectedChildId,
        courseId: selectedCourse.id,
      });
      setShowEnrollmentModal(false);
    } catch (error) {
      console.error("Error enrolling child:", error);
    } finally {
      setEnrolling(false);
    }
  };

  // Fetch courses on component mount and when filters change
  useEffect(() => {
    fetchCourses();
  }, [pagination.page, searchTerm, ageGroupFilter]);

  return (
    <div className="min-h-screen bg-gray-50 text-text2 dark:bg-gray-900 dark:text-text1">
      {/* Header */}
      <header className="bg-primary-main text-text1 p-4 shadow-md rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Available Courses</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
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
                      <button
                        onClick={() => router.push(`/courses/${course.id}`)}
                        className="text-primary-main hover:text-primary-secondary text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => openEnrollmentModal(course)}
                        className="bg-primary-main hover:bg-primary-secondary text-white px-4 py-2 rounded-md text-sm"
                      >
                        Enroll Child
                      </button>
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
              {searchTerm || ageGroupFilter !== "All Age Groups"
                ? "Try adjusting your search or filter criteria"
                : "There are currently no available courses"}
            </p>
          </div>
        )}
      </main>

      <Dialog open={showEnrollmentModal} onOpenChange={setShowEnrollmentModal}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enroll Child in Course</DialogTitle>
            <DialogDescription>
              Select which child you want to enroll in this course.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course
              </label>
              <input
                type="text"
                disabled
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                value={selectedCourse?.title || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Child
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.displayName} ({child.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEnrollmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnrollment}
                disabled={enrolling || !selectedChildId}
                className="bg-primary-main hover:bg-primary-secondary text-white px-4 py-2 rounded-md text-sm"
              >
                {enrolling ? "Enrolling..." : "Enroll Child"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentCoursesDashboard;
