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
  progressPercentage: number;
  isCompleted: boolean;
  totalPointsEarned: number;
  pathProgress?: PathProgress[];
  lastAccessedAt?: Date;
}

interface PathProgress {
  learningPathId: string;
  progressPercentage: number;
  isCompleted: boolean;
  pointsEarned: number;
  segmentProgress?: SegmentProgress[];
}

interface SegmentProgress {
  segmentId: string;
  isCompleted: boolean;
  pointsEarned: number;
  timeSpentSeconds: number;
}

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  order: number;
  segments: LearningSegment[];
}

interface LearningSegment {
  id: string;
  order: number;
  type: string;
  basePoints: number;
  bonusPoints?: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  thumbnailUrl?: string;
  tags?: string[];
  learningPaths: LearningPath[];
  enrolledAt: string;
  enrollmentStatus?: CourseProgress;
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
    { name: "Total Points", value: 0, icon: BarChart },
  ]);

  // Calculate total lessons and duration from learning paths and segments
  const calculateCourseTotals = (course: EnrolledCourse) => {
    const totalLessons = course.learningPaths.reduce(
      (sum, path) => Number(sum) + Number(path.segments?.length),
      0
    );

    // Estimate duration based on segment types (this is a simplified approach)
    const totalDuration = course.learningPaths.reduce((sum, path) => {
      return (
        sum +
        path.segments?.reduce((segSum, segment) => {
          let segmentDuration = 5;
          if (segment.type === "dialogue") segmentDuration = 3;
          if (segment.type === "practice") segmentDuration = 10;
          if (segment.type === "question") segmentDuration = 2;
          return Number(segSum) + Number(segmentDuration);
        }, 0)
      );
    }, 0);

    console.log(course.learningPaths);
    return { totalLessons, totalDuration };
  };

  // Calculate completed lessons from progress data
  const calculateCompletedLessons = (course: EnrolledCourse) => {
    if (!course.enrollmentStatus || !course.enrollmentStatus.pathProgress)
      return 0;

    return course.enrollmentStatus.pathProgress.reduce((sum, path) => {
      if (!path.segmentProgress) return sum;
      return sum + path.segmentProgress.filter((seg) => seg.isCompleted).length;
    }, 0);
  };

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
      (course) => course.enrollmentStatus?.isCompleted
    ).length;

    const inProgress = coursesData.filter(
      (course) =>
        course.enrollmentStatus &&
        !course.enrollmentStatus.isCompleted &&
        course.enrollmentStatus.progressPercentage > 0
    ).length;

    const totalPoints = coursesData.reduce(
      (sum, course) => sum + (course.enrollmentStatus?.totalPointsEarned || 0),
      0
    );

    setStats([
      { name: "Total Enrolled", value: coursesData.length, icon: Book },
      { name: "Completed", value: completed, icon: Trophy },
      { name: "In Progress", value: inProgress, icon: RotateCcw },
      { name: "Total Points", value: totalPoints, icon: BarChart },
    ]);
  };

  // Sort and filter courses
  const sortAndFilterCourses = () => {
    let filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      console.log(course);
      let matchesStatus: any = true;
      if (statusFilter === "Completed") {
        matchesStatus = course.enrollmentStatus?.isCompleted || false;
      } else if (statusFilter === "In Progress") {
        matchesStatus =
          course.enrollmentStatus &&
          !course.enrollmentStatus.isCompleted &&
          course.enrollmentStatus.progressPercentage > 0;
      } else if (statusFilter === "Not Started") {
        matchesStatus =
          !course.enrollmentStatus ||
          course.enrollmentStatus.progressPercentage === 0;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          // Priority: Not started first, then in progress, then completed
          const getStatusPriority = (course: EnrolledCourse) => {
            if (
              !course.enrollmentStatus ||
              course.enrollmentStatus.progressPercentage === 0
            )
              return 0; // Not started
            if (course.enrollmentStatus.isCompleted) return 2; // Completed
            return 1; // In progress
          };
          return getStatusPriority(a) - getStatusPriority(b);

        case "title":
          return a.title.localeCompare(b.title);

        case "progress":
          const progressA = a.enrollmentStatus?.progressPercentage || 0;
          const progressB = b.enrollmentStatus?.progressPercentage || 0;
          return progressB - progressA;

        case "recent":
          const dateA = new Date(
            a.enrollmentStatus?.lastAccessedAt || a.enrolledAt
          );
          const dateB = new Date(
            b.enrollmentStatus?.lastAccessedAt || b.enrolledAt
          );
          return dateB.getTime() - dateA.getTime();

        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  // Get course status and action button info
  const getCourseStatus = (course: EnrolledCourse) => {
    if (!course.enrollmentStatus) {
      return {
        status: "Not Started",
        action: "Start Course",
        buttonClass: "bg-green-600 hover:bg-green-700 text-white",
        icon: Play,
      };
    }

    if (course.enrollmentStatus.isCompleted) {
      return {
        status: "Completed",
        action: "View Certificate",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white ",
        icon: Trophy,
      };
    }

    if (course.enrollmentStatus.progressPercentage > 0) {
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

  // Find the next segment to continue from
  const findNextSegment = (course: EnrolledCourse) => {
    if (!course.enrollmentStatus || !course.enrollmentStatus.pathProgress) {
      // Start from the beginning
      return {
        pathId: course.learningPaths[0]?.id,
        segmentId: course.learningPaths[0]?.segments[0]?.id,
      };
    }

    // Find the first incomplete segment
    for (const path of course.learningPaths) {
      const pathProgress = course.enrollmentStatus.pathProgress?.find(
        (p) => p.learningPathId === path.id
      );

      for (const segment of path.segments) {
        const segmentCompleted = pathProgress?.segmentProgress?.some(
          (sp) => sp.segmentId === segment.id && sp.isCompleted
        );

        if (!segmentCompleted) {
          return {
            pathId: path.id,
            segmentId: segment.id,
          };
        }
      }
    }

    // All segments completed (shouldn't happen if isCompleted is properly set)
    return {
      pathId: course.learningPaths[0]?.id,
      segmentId: course.learningPaths[0]?.segments[0]?.id,
    };
  };

  // Handle course action (start/resume/view)
  const handleCourseAction = (course: EnrolledCourse) => {
    const { status } = getCourseStatus(course);

    if (status === "Completed") {
      router.push(`/child/courses/${course.id}/certificate`);
    } else {
      // For both "In Progress" and "Not Started", find the next segment
      const nextSegment = findNextSegment(course);
      router.push(
        `/child/courses/${course.id}/learn?pathId=${nextSegment.pathId}&segmentId=${nextSegment.segmentId}`
      );
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    sortAndFilterCourses();
  }, [courses, searchTerm, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 text-text2 dark:bg-gray-900 dark:text-text1">
      {/* Header */}
      <header className="bg-primary-main text-text1 p-4 shadow-md rounded-tr-lg rounded-tl-lg">
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
                const progress =
                  course.enrollmentStatus?.progressPercentage || 0;
                const completedLessons = calculateCompletedLessons(course);
                const { totalLessons, totalDuration } =
                  calculateCourseTotals(course);

                return (
                  <div
                    key={course.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl flex justify-between flex-col shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary-main/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Compact Thumbnail Section */}
                    <div className="relative h-44 bg-gradient-to-br from-primary-main/10 to-blue-500/10">
                      {course.thumbnailUrl && (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Floating Status & Age Badge */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                            status === "Completed"
                              ? "bg-green-500/90 text-white"
                              : status === "In Progress"
                              ? "bg-blue-500/90 text-white"
                              : "bg-gray-600/90 text-white"
                          }`}
                        >
                          {status}
                        </span>

                        <span className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-primary-main text-xs font-medium px-2.5 py-1 rounded-full">
                          {course.ageGroup}
                        </span>
                      </div>

                      {/* Completion Check */}
                      {status === "Completed" && (
                        <div className="absolute bottom-2 right-2">
                          <CheckCircle className="w-6 h-6 text-green-500 drop-shadow-lg" />
                        </div>
                      )}
                    </div>

                    {/* Compact Content Section */}
                    <div className="p-4 space-y-3">
                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Progress Bar (Compact) */}
                      {status !== "Not Started" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="font-semibold text-primary-main">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                status === "Completed"
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : "bg-gradient-to-r from-primary-main to-blue-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Compact Stats Row */}
                      <div className="flex justify-between items-center text-center py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {totalLessons}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Segments
                          </p>
                        </div>
                        <div className="flex-1 border-x border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-bold text-primary-main">
                            {completedLessons}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Done
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {Math.round(totalDuration / 60)}h
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Time
                          </p>
                        </div>
                      </div>

                      {/* Tags & Points Row */}
                      <div className="flex justify-between items-center">
                        {/* Compact Tags */}
                        <div className="flex gap-1 flex-1">
                          {course.tags &&
                            course.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="bg-primary-main/10 text-primary-main text-xs px-2 py-0.5 rounded-md font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          {course.tags && course.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{course.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Points Badge */}
                        {course.enrollmentStatus && (
                          <div className="flex items-center gap-1 bg-primary-main/10 px-2.5 py-1 rounded-lg">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Points:
                            </span>
                            <span className="text-sm font-bold text-primary-main">
                              {course.enrollmentStatus.totalPointsEarned}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Compact Action Button */}
                      <button
                        onClick={() =>
                          router.push(`/child/courses/${course.id}`)
                        }
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md ${buttonClass}`}
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
