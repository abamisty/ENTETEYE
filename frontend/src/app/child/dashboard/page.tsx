"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Book,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Star,
  Award,
  BookOpen,
  Play,
  CheckCircle,
  RotateCcw,
  ChevronRight,
  Flame,
  Brain,
  Users,
  Activity,
  PieChart,
} from "lucide-react";

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { childCourseApi } from "@/api/child";

interface ChildProfile {
  id: string;
  displayName: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  avatar?: string;
  totalPoints: number;
  currentStreak: number;
  level: number;
  family: {
    id: string;
    name: string;
  };
}

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalPoints: number;
  currentStreak: number;
  level: number;
  nextLevelPoints: number;
  badges: number;
  timeSpentMinutes: number;
  avgProgressPerCourse: number;
  coursesThisWeek: number;
  pointsThisWeek: number;
}

interface RecentActivity {
  id: string;
  type:
    | "course_completed"
    | "lesson_completed"
    | "achievement_earned"
    | "streak_milestone";
  courseTitle?: string;
  achievementTitle?: string;
  pointsEarned: number;
  timestamp: string;
}

interface UpcomingGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  type: "daily" | "weekly" | "monthly";
}

interface Course {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  thumbnailUrl?: string;
  tags?: string[];
  progress?: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    isCompleted: boolean;
    currentModuleId?: string;
    currentLessonId?: string;
    lastAccessedAt?: string;
    totalPointsEarned: number;
  };
}

const ChildDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalPoints: 0,
    currentStreak: 0,
    level: 1,
    nextLevelPoints: 1000,
    badges: 0,
    timeSpentMinutes: 0,
    avgProgressPerCourse: 0,
    coursesThisWeek: 0,
    pointsThisWeek: 0,
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingGoals, setUpcomingGoals] = useState<UpcomingGoal[]>([]);
  const router = useRouter();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // This will call the new dashboard endpoint
      const dashboardRes = await childCourseApi.getDashboardData();
      const data = dashboardRes?.data;

      if (data) {
        setProfile(data.profile);
        setStats(data.stats);
        setRecentCourses(data.recentCourses);
        setRecentActivity(data.recentActivity);
        setUpcomingGoals(data.upcomingGoals);
      }
    } catch (error) {
      toast.error("Failed to load your dashboard");
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get course status info
  const getCourseStatus = (course: Course) => {
    if (!course.progress) {
      return {
        status: "Not Started",
        action: "Start Learning",
        buttonClass: "bg-green-600 hover:bg-green-700",
        icon: Play,
      };
    }

    if (course.progress.isCompleted) {
      return {
        status: "Completed",
        action: "Review",
        buttonClass: "bg-blue-600 hover:bg-blue-700",
        icon: CheckCircle,
      };
    }

    return {
      status: "In Progress",
      action: "Continue",
      buttonClass: "bg-primary-main hover:bg-primary-secondary",
      icon: RotateCcw,
    };
  };

  const handleCourseAction = (course: Course) => {
    const { status } = getCourseStatus(course);

    if (status === "In Progress") {
      router.push(
        `/child/courses/${course.id}/learn?moduleId=${course.progress?.currentModuleId}&lessonId=${course.progress?.currentLessonId}`
      );
    } else {
      router.push(`/child/courses/${course.id}/learn`);
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_completed":
        return Trophy;
      case "lesson_completed":
        return CheckCircle;
      case "achievement_earned":
        return Award;
      case "streak_milestone":
        return Flame;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "course_completed":
        return "text-yellow-600 bg-yellow-100";
      case "lesson_completed":
        return "text-green-600 bg-green-100";
      case "achievement_earned":
        return "text-purple-600 bg-purple-100";
      case "streak_milestone":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-primary-main rounded-tr-lg rounded-tl-lg text-white p-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold">
                    {profile?.firstName?.[0] || "📚"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {profile?.firstName}!
                </h1>
                <p className="text-primary-light">
                  Ready to continue your learning journey?
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Level {stats.level}</div>
                <div className="text-sm text-primary-light">Learning Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-sm text-primary-light">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.completedCourses} completed
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Points
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPoints.toLocaleString()}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  +{stats.pointsThisWeek} this week
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Progress
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.avgProgressPerCourse}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.completedLessons} lessons done
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Time Spent
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatTimeSpent(stats.timeSpentMinutes)}
                </p>
                <p className="text-sm text-orange-600 mt-1">Learning time</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Level Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Level Progress
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                Level {stats.level}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${((1000 - stats.nextLevelPoints) / 1000) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.nextLevelPoints} points to Level {stats.level + 1}
              </p>
            </div>
          </div>

          {/* Learning Streak */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              Learning Streak
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats.currentStreak}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Days in a row
              </p>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < stats.currentStreak
                        ? "bg-orange-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Courses Accessed
                </span>
                <span className="font-semibold">{stats.coursesThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Points Earned
                </span>
                <span className="font-semibold text-green-600">
                  +{stats.pointsThisWeek}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Average Progress
                </span>
                <span className="font-semibold">
                  {stats.avgProgressPerCourse}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary-main" />
                  Continue Learning
                </h2>
                <button
                  onClick={() => router.push("/child/courses")}
                  className="text-primary-main hover:text-primary-secondary text-sm font-medium flex items-center gap-1"
                >
                  View All Courses <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentCourses?.length > 0 ? (
                  recentCourses.slice(0, 3).map((course) => {
                    const {
                      status,
                      action,
                      buttonClass,
                      icon: ActionIcon,
                    } = getCourseStatus(course);
                    const progress = course.progress?.percentage || 0;

                    return (
                      <div
                        key={course.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="w-16 h-16 object-cover"
                              />
                            ) : (
                              <Book className="w-8 h-8 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {course.title}
                              </h3>
                              <span className="bg-primary-main/10 text-primary-main text-xs px-2 py-1 rounded-md">
                                {course.ageGroup}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                              {course.description}
                            </p>

                            {status !== "Not Started" && (
                              <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-500">
                                    Progress:{" "}
                                    {course.progress?.completedLessons}/
                                    {course.progress?.totalLessons} lessons
                                  </span>
                                  <span className="text-xs font-medium text-primary-main">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-primary-main h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {course.progress && (
                              <div className="text-xs text-gray-500 mb-2">
                                Points earned:{" "}
                                {course.progress.totalPointsEarned}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleCourseAction(course)}
                            className={`${buttonClass} text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors`}
                          >
                            <ActionIcon className="w-4 h-4" />
                            {action}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No courses enrolled yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start your learning journey by exploring available courses
                    </p>
                    <button
                      onClick={() => router.push("/child/courses/explore")}
                      className="bg-primary-main hover:bg-primary-secondary text-white px-6 py-3 rounded-md font-medium"
                    >
                      Explore Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h3>

              <div className="space-y-3">
                {recentActivity?.length > 0 ? (
                  recentActivity.slice(0, 4).map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.courseTitle || activity.achievementTitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{activity.pointsEarned} points
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start learning to see your activity
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Learning Goals
              </h3>

              <div className="space-y-4">
                {upcomingGoals?.length > 0 ? (
                  upcomingGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {goal.currentValue}/{goal.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (goal.currentValue / goal.targetValue) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Target className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Goals will appear as you progress
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Quick Stats
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </span>
                  <span className="font-semibold text-purple-600">
                    {stats.totalCourses > 0
                      ? Math.round(
                          (stats.completedCourses / stats.totalCourses) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Badges Earned
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {stats.badges}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Courses
                  </span>
                  <span className="font-semibold text-blue-600">
                    {stats.inProgressCourses}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg. Session
                  </span>
                  <span className="font-semibold text-green-600">
                    {stats.completedLessons > 0
                      ? Math.round(
                          stats.timeSpentMinutes / stats.completedLessons
                        )
                      : 0}
                    m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Highlights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Achievement Highlights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Course Master
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete {stats.completedCourses} courses
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Point Collector
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earn {stats.totalPoints} total points
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Streak Champion
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.currentStreak} day learning streak
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChildDashboard;
