"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Book,
  Clock,
  Search,
  Trophy,
  Play,
  CheckCircle,
  RotateCcw,
  Filter,
  SortAsc,
} from "lucide-react";
import { childCourseApi } from "@/api/child";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  lastAccessedAt?: string;
  isCompleted: boolean;
  currentModuleId?: string;
  currentLessonId?: string;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  thumbnailUrl?: string;
  totalModules: number;
  totalLessons: number;
  totalDuration: number;
  tags?: string[];
  modules: any[];
  enrolledAt: string;
  progress?: CourseProgress;
}

interface Stat {
  name: string;
  value: number | string;
  icon: React.ComponentType;
}

const ChildCoursesPage = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority"); // priority, title, progress, recent
  const router = useRouter();

  const [stats, setStats] = useState<Stat[]>([
    { name: "Total Enrolled", value: 0, icon: Book },
    { name: "Completed", value: 0, icon: Trophy },
    { name: "In Progress", value: 0, icon: RotateCcw },
    { name: "Total Hours", value: 0, icon: Clock },
  ]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await childCourseApi.getEnrolledCourses();
      const coursesData = response.data || [];
      setCourses(coursesData);
      updateStats(coursesData);
    } catch (error) {
      toast.error("Failed to fetch your courses");
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (coursesData: EnrolledCourse[]) => {
    const completed = coursesData.filter(
      (course) => course.progress?.isCompleted
    ).length;
    const inProgress = coursesData.filter(
      (course) =>
        course.progress &&
        !course.progress.isCompleted &&
        course.progress.completionPercentage > 0
    ).length;
    const totalHours = coursesData.reduce(
      (sum, course) => sum + (course.totalDuration || 0),
      0
    );

    setStats([
      { name: "Total Enrolled", value: coursesData.length, icon: Book },
      { name: "Completed", value: completed, icon: Trophy },
      { name: "In Progress", value: inProgress, icon: RotateCcw },
      { name: "Total Hours", value: Math.round(totalHours / 60), icon: Clock },
    ]);
  };

  // Sort and filter courses
  const sortAndFilterCourses = () => {
    let filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus: any = true;
      if (statusFilter === "Completed") {
        matchesStatus = course.progress?.isCompleted || false;
      } else if (statusFilter === "In Progress") {
        matchesStatus =
          course.progress &&
          !course.progress.isCompleted &&
          course.progress.completionPercentage > 0;
      } else if (statusFilter === "Not Started") {
        matchesStatus =
          !course.progress || course.progress.completionPercentage === 0;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          // Priority: Not started first, then in progress, then completed
          const getStatusPriority = (course: EnrolledCourse) => {
            if (!course.progress || course.progress.completionPercentage === 0)
              return 0; // Not started
            if (course.progress.isCompleted) return 2; // Completed
            return 1; // In progress
          };
          return getStatusPriority(a) - getStatusPriority(b);

        case "title":
          return a.title.localeCompare(b.title);

        case "progress":
          const progressA = a.progress?.completionPercentage || 0;
          const progressB = b.progress?.completionPercentage || 0;
          return progressB - progressA;

        case "recent":
          const dateA = new Date(a.progress?.lastAccessedAt || a.enrolledAt);
          const dateB = new Date(b.progress?.lastAccessedAt || b.enrolledAt);
          return dateB.getTime() - dateA.getTime();

        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  // Get course status and action button info
  const getCourseStatus = (course: EnrolledCourse) => {
    if (!course.progress) {
      return {
        status: "Not Started",
        action: "Start Course",
        buttonClass: "bg-green-600 hover:bg-green-700 text-white",
        icon: Play,
      };
    }

    if (course.progress.isCompleted) {
      return {
        status: "Completed",
        action: "View Certificate",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: Trophy,
      };
    }

    if (course.progress.completionPercentage > 0) {
      return {
        status: "In Progress",
        action: "Resume",
        buttonClass: "bg-primary-main hover:bg-primary-secondary text-white",
        icon: RotateCcw,
      };
    }

    return {
      status: "Not Started",
      action: "Start Course",
      buttonClass: "bg-green-600 hover:bg-green-700 text-white",
      icon: Play,
    };
  };

  // Handle course action (start/resume/view)
  const handleCourseAction = (course: EnrolledCourse) => {
    const { status } = getCourseStatus(course);

    if (status === "Completed") {
      router.push(`/child/courses/${course.id}/certificate`);
    } else if (status === "In Progress") {
      router.push(
        `/child/courses/${course.id}/learn?moduleId=${course.progress?.currentModuleId}&lessonId=${course.progress?.currentLessonId}`
      );
    } else {
      router.push(`/child/courses/${course.id}`);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    sortAndFilterCourses();
  }, [courses, searchTerm, statusFilter, sortBy]);
  console.log("Filtered Courses:", filteredCourses);
  return (
    <div className="min-h-screen bg-gray-50 text-text2 dark:bg-gray-900 dark:text-text1">
      {/* Header */}
      <header className="bg-primary-main text-text1 p-4 shadow-md rounded-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-primary-light mt-1">
            Continue your learning journey
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
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

        {/* Search, Filters, and Sorting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your courses..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Courses</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="priority">By Priority</option>
                  <option value="title">By Title</option>
                  <option value="progress">By Progress</option>
                  <option value="recent">Recently Accessed</option>
                </select>
              </div>
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
              {filteredCourses.map((course) => {
                const {
                  status,
                  action,
                  buttonClass,
                  icon: ActionIcon,
                } = getCourseStatus(course);
                const progress = course.progress?.completionPercentage || 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex justify-between items-center flex-col w-full hover:shadow-lg transition-shadow duration-300"
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
                      <div className="absolute top-2 left-2 ">
                        <span
                          className={`text-white text-xs px-2 py-1 rounded-md ${
                            status === "Completed"
                              ? "bg-green-600"
                              : status === "In Progress"
                              ? "bg-blue-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      {status === "Completed" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-4 w-full">
                      <div className="flex w-full justify-between items-start mb-2">
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

                      {/* Progress Bar */}
                      {status !== "Not Started" && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="text-sm font-medium">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                status === "Completed"
                                  ? "bg-green-600"
                                  : "bg-primary-main"
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Course Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {course.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{course.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Course Metadata */}
                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                        <div>
                          <p className="font-medium">{course.modules.length}</p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Modules
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">
                            {course.modules.reduce(
                              (total, module) => total + module.lessons.length,
                              0
                            )}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Lessons
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">
                            {Math.round(
                              course.modules.reduce(
                                (total, module) =>
                                  total +
                                  module.lessons.reduce(
                                    (moduleTotal: any, lesson: any) =>
                                      moduleTotal + (lesson.duration || 0),
                                    0
                                  ),
                                0
                              ) / 60
                            )}
                            h
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Duration
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleCourseAction(course)}
                        className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${buttonClass}`}
                      >
                        <ActionIcon className="w-4 h-4" />
                        {action}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {courses.length === 0
                ? "No courses enrolled"
                : "No courses match your filters"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {courses.length === 0
                ? "Explore available courses and start your learning journey!"
                : "Try adjusting your search or filter criteria"}
            </p>
            {courses.length === 0 && (
              <button
                onClick={() => router.push("/child/courses/explore")}
                className="mt-4 bg-primary-main hover:bg-primary-secondary text-white px-6 py-2 rounded-md"
              >
                Explore Courses
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChildCoursesPage;
