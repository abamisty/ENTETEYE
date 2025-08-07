"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  Target,
  Award,
  Brain,
  Heart,
  Zap,
  Plus,
  Eye,
  Settings,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { parentApi } from "@/api/parent";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  birthDate: string;
  gender: string;
  avatarUrl: string;
  enrollments?: Enrollment[];
}

interface Enrollment {
  id: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    description: string;
    ageGroup: string;
    thumbnailUrl?: string;
  };
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    isCompleted: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface FamilyStats {
  totalChildren: number;
  totalEnrollments: number;
  totalCompletedCourses: number;
  averageProgress: number;
  totalLearningHours: number;
  weeklyStreakDays: number;
  badgesEarned: number;
  pointsEarned: number;
}

interface ProgressData {
  date: string;
  progress: number;
  completions: number;
  timeSpent: number;
}

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyStats>({
    totalChildren: 0,
    totalEnrollments: 0,
    totalCompletedCourses: 0,
    averageProgress: 0,
    totalLearningHours: 0,
    weeklyStreakDays: 0,
    badgesEarned: 0,
    pointsEarned: 0,
  });
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [familyDetails, setFamilyDetails] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const router = useRouter();

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch family details and subscription
      const [familyRes] = await Promise.all([parentApi.getFamilyDetails()]);

      setFamilyDetails(familyRes?.data);

      // Fetch children
      const childrenRes = await parentApi.getAllChildren();
      const childrenData = childrenRes?.data || [];

      // Fetch enrollments for each child
      const childrenWithEnrollments = await Promise.all(
        childrenData.map(async (child: Child) => {
          try {
            const enrollmentsRes = await parentApi.getChildEnrollments(
              child.id
            );
            return {
              ...child,
              enrollments: enrollmentsRes?.data || [],
            };
          } catch (error) {
            console.error(
              `Failed to fetch enrollments for child ${child.id}:`,
              error
            );
            return {
              ...child,
              enrollments: [],
            };
          }
        })
      );

      setChildren(childrenWithEnrollments);

      // Calculate family statistics
      calculateFamilyStats(childrenWithEnrollments);

      // Generate progress trend data
      generateProgressData(childrenWithEnrollments);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate family statistics from children data
  const calculateFamilyStats = (childrenData: Child[]) => {
    const totalChildren = childrenData.length;
    const allEnrollments = childrenData.flatMap(
      (child) => child.enrollments || []
    );
    const totalEnrollments = allEnrollments.length;
    const completedCourses = allEnrollments.filter(
      (enrollment) => enrollment.progress?.isCompleted
    ).length;

    const averageProgress =
      totalEnrollments > 0
        ? Math.round(
            allEnrollments.reduce(
              (sum, enrollment) => sum + (enrollment.progress?.percentage || 0),
              0
            ) / totalEnrollments
          )
        : 0;

    // Estimate learning hours based on progress
    const totalLearningHours = Math.round(
      allEnrollments.reduce(
        (sum, enrollment) =>
          sum + (enrollment.progress?.completedLessons || 0) * 0.5,
        0
      )
    );

    // Calculate weekly streak (simulated)
    const weeklyStreakDays = Math.min(7, Math.floor(averageProgress / 15));

    // Calculate badges and points (simulated based on completions)
    const badgesEarned =
      Math.floor(completedCourses / 2) + Math.floor(averageProgress / 25);
    const pointsEarned = completedCourses * 100 + averageProgress * 10;

    setFamilyStats({
      totalChildren,
      totalEnrollments,
      totalCompletedCourses: completedCourses,
      averageProgress,
      totalLearningHours,
      weeklyStreakDays,
      badgesEarned,
      pointsEarned,
    });
  };

  // Generate trend data for charts
  const generateProgressData = (childrenData: Child[]) => {
    const last7Days = [];
    const currentDate = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Simulate daily progress (in real app, this would come from actual activity data)
      const dailyProgress = Math.floor(Math.random() * 20) + (80 - i * 2);
      const dailyCompletions = Math.floor(Math.random() * 3);
      const dailyTimeSpent = Math.floor(Math.random() * 60) + 30;

      last7Days.push({
        date: dateStr,
        progress: dailyProgress,
        completions: dailyCompletions,
        timeSpent: dailyTimeSpent,
      });
    }

    setProgressData(last7Days);
  };

  // Get child's age from date of birth
  const getChildAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Get progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-main to-primary-secondary rounded-xl p-6 text-white mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user.firstName || "Parent"}! 👋
              </h2>
              <p className="text-white/90 mb-4">
                Your family has completed {familyStats.totalCompletedCourses}{" "}
                courses this month. Keep up the amazing work!
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Weekly Streak</div>
                  <div className="text-xl font-bold">
                    {familyStats.weeklyStreakDays} days
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Points Earned</div>
                  <div className="text-xl font-bold">
                    {familyStats.pointsEarned.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Badges</div>
                  <div className="text-xl font-bold">
                    {familyStats.badgesEarned}
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Learning Hours</div>
                  <div className="text-xl font-bold">
                    {familyStats.totalLearningHours}h
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/parent/children/add")}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Child
              </button>
              <button
                onClick={() => router.push("/parent/settings")}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Children
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {familyStats.totalChildren}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  Active learners
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Course Enrollments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {familyStats.totalEnrollments}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {familyStats.totalCompletedCourses} completed
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Progress
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {familyStats.averageProgress}%
                </p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Family progress
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Learning Time
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {familyStats.totalLearningHours}h
                </p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  This month
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Children Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Children's Progress
                </h3>
                <button
                  onClick={() => router.push("/parent/analytics")}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </button>
              </div>

              <div className="space-y-4">
                {children.length > 0 ? (
                  children.map((child) => {
                    const enrollments = child?.enrollments || [];
                    const averageProgress =
                      enrollments?.length > 0
                        ? Math.round(
                            enrollments.reduce(
                              (sum, enrollment) =>
                                sum + (enrollment.progress?.percentage || 0),
                              0
                            ) / enrollments.length
                          )
                        : 0;

                    const completedCourses = 0;

                    return (
                      <div
                        key={child.id}
                        className="border border-gray-100 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              <img
                                src={child.avatarUrl}
                                alt="Avatar"
                                width={70}
                                height={70}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-white">
                                {child.displayName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Age {getChildAge(child.birthDate)} •{" "}
                                {enrollments.length} courses
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-[#4f9cf9]">
                              {averageProgress}%
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {completedCourses} completed
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                              averageProgress
                            )}`}
                            style={{ width: `${averageProgress}%` }}
                          ></div>
                        </div>

                        {/* Recent courses */}
                        {enrollments.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {enrollments.slice(0, 2).map((enrollment) => (
                              <div
                                key={enrollment.id}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2"
                              >
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {enrollment.course.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {enrollment.progress?.percentage || 0}%
                                  complete
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                          <button
                            onClick={() =>
                              router.push(`/parent/children/${child.id}`)
                            }
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>
                          {enrollments.length === 0 && (
                            <button
                              onClick={() =>
                                router.push(
                                  `/parent/children/${child.id}/enroll`
                                )
                              }
                              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                            >
                              Enroll in Course
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      No children added yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Add your first child to start tracking their learning
                      progress
                    </p>
                    <button
                      onClick={() => router.push("/parent/children/add")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Add Child
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Achievements & Family Progress Chart */}
          <div className="space-y-6">
            {/* Weekly Progress Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Weekly Progress
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31 41 55)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {familyStats.totalCompletedCourses > 0 ? (
                  [
                    {
                      badge: "🏆",
                      title: "Course Completed",
                      subtitle: "Finished learning module",
                      time: "2 hours ago",
                    },
                    {
                      badge: "🌟",
                      title: "Perfect Score",
                      subtitle: "Aced the quiz",
                      time: "1 day ago",
                    },
                    {
                      badge: "🎯",
                      title: "Goal Achieved",
                      subtitle: "Met weekly target",
                      time: "2 days ago",
                    },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="text-2xl">{achievement.badge}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.subtitle}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {achievement.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Achievements will appear here as your children progress
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Status */}
            {subscription && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Subscription Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Plan
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {subscription.plan}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        subscription.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Next Payment
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(
                        subscription.nextPaymentDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
