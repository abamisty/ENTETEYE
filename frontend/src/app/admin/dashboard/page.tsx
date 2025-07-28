"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  UserCheck,
  Trophy,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  MoreVertical,
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
import { adminApi } from "@/api/admin";
import { toast } from "react-hot-toast";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  completionRate: number;
  monthlyGrowth: number;
  averageEngagement: number;
}

interface TrendData {
  date: string;
  enrollments: number;
  revenue: number;
  users: number;
  completions: number;
}

interface CourseStats {
  id: string;
  title: string;
  enrollments: number;
  completionRate: number;
  revenue: number;
  isApproved: boolean;
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "completion" | "subscription";
  userName: string;
  courseName?: string;
  timestamp: string;
  amount?: number;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    completionRate: 0,
    monthlyGrowth: 0,
    averageEngagement: 0,
  });

  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topCourses, setTopCourses] = useState<CourseStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [courseCategories, setCourseCategories] = useState<any[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all required data
      const [
        usersRes,
        coursesRes,
        enrollmentsRes,
        subscriptionsRes,
        analyticsRes,
      ] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllCourses(),
        adminApi.getAllEnrollments(),
        adminApi.getAllSubscriptions(),
        adminApi.getEnrollmentAnalytics(),
      ]);

      // Process users data
      const users = usersRes?.data || [];

      // Process courses data
      const courses = coursesRes?.data || [];

      // Process enrollments data
      const enrollments = enrollmentsRes?.data || [];

      // Process subscriptions data
      const subscriptions = subscriptionsRes?.data || [];

      // Process analytics data
      const analytics = analyticsRes?.data || {};

      // Calculate revenue from subscriptions
      const totalRevenue = subscriptions.reduce(
        (sum: number, sub: any) => sum + (sub.amount || 0),
        0
      );

      // Calculate active subscriptions
      const activeSubscriptions = subscriptions.filter(
        (sub: any) => sub.status === "active"
      ).length;

      // Calculate monthly growth (comparing last month vs current month enrollments)
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

      const currentMonthEnrollments = enrollments.filter((enrollment: any) => {
        const enrollmentDate = new Date(enrollment.createdAt);
        return enrollmentDate.getMonth() === currentMonth;
      }).length;

      const lastMonthEnrollments = enrollments.filter((enrollment: any) => {
        const enrollmentDate = new Date(enrollment.createdAt);
        return enrollmentDate.getMonth() === lastMonth;
      }).length;

      const monthlyGrowth =
        lastMonthEnrollments > 0
          ? ((currentMonthEnrollments - lastMonthEnrollments) /
              lastMonthEnrollments) *
            100
          : 0;

      // Set main stats
      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalRevenue: totalRevenue,
        activeSubscriptions: activeSubscriptions,
        completionRate: analytics.completionRate || 0,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        averageEngagement: calculateAverageEngagement(enrollments),
      });

      // Process top courses data
      const processedCourses = courses
        .map((course: any) => ({
          id: course.id,
          title: course.title,
          enrollments: course.stats?.totalEnrollments || 0,
          completionRate: course.stats?.completionRate || 0,
          revenue: (course.stats?.totalEnrollments || 0) * 50, // Estimated revenue
          isApproved: course.isApproved,
        }))
        .sort((a: any, b: any) => b.enrollments - a.enrollments)
        .slice(0, 5);

      setTopCourses(processedCourses);

      // Process trend data from analytics
      const processedTrendData = processTrendData(
        analytics.enrollmentTrend || [],
        enrollments,
        subscriptions
      );
      setTrendData(processedTrendData);

      // Process recent activity
      const processedActivity = processRecentActivity(
        enrollments,
        subscriptions
      );
      setRecentActivity(processedActivity);

      // Process course categories
      const categories = processCourseCategories(courses);
      setCourseCategories(categories);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate average engagement
  const calculateAverageEngagement = (enrollments: any[]) => {
    if (enrollments.length === 0) return 0;

    const totalProgress = enrollments.reduce(
      (sum: number, enrollment: any) =>
        sum + (enrollment.progress?.percentage || 0),
      0
    );

    return Math.round(totalProgress / enrollments.length);
  };

  // Helper function to process trend data
  const processTrendData = (
    enrollmentTrend: any[],
    enrollments: any[],
    subscriptions: any[]
  ) => {
    const last6Months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      // Count enrollments for this month
      const monthEnrollments = enrollments.filter((enrollment: any) => {
        const enrollmentDate = new Date(enrollment.createdAt);
        return (
          enrollmentDate.getMonth() === date.getMonth() &&
          enrollmentDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Count completions for this month
      const monthCompletions = enrollments.filter((enrollment: any) => {
        const enrollmentDate = new Date(enrollment.updatedAt);
        return (
          enrollment.progress?.isCompleted &&
          enrollmentDate.getMonth() === date.getMonth() &&
          enrollmentDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Calculate revenue for this month from subscriptions
      const monthRevenue = subscriptions
        .filter((sub: any) => {
          const subDate = new Date(sub.createdAt);
          return (
            subDate.getMonth() === date.getMonth() &&
            subDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum: number, sub: any) => sum + (sub.amount || 0), 0);

      last6Months.push({
        date: monthName,
        enrollments: monthEnrollments,
        revenue: monthRevenue,
        users: Math.floor(monthEnrollments * 0.7), // Estimated based on enrollments
        completions: monthCompletions,
      });
    }

    return last6Months;
  };

  // Helper function to process recent activity
  const processRecentActivity = (enrollments: any[], subscriptions: any[]) => {
    const activities: RecentActivity[] = [];

    // Add recent enrollments
    enrollments
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3)
      .forEach((enrollment: any) => {
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: "enrollment",
          userName: enrollment.child?.displayName || "Unknown Student",
          courseName: enrollment.course?.title || "Unknown Course",
          timestamp: enrollment.createdAt,
        });
      });

    // Add recent completions
    enrollments
      .filter((enrollment: any) => enrollment.progress?.isCompleted)
      .sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 2)
      .forEach((enrollment: any) => {
        activities.push({
          id: `completion-${enrollment.id}`,
          type: "completion",
          userName: enrollment.child?.displayName || "Unknown Student",
          courseName: enrollment.course?.title || "Unknown Course",
          timestamp: enrollment.updatedAt,
        });
      });

    // Add recent subscriptions
    subscriptions
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 2)
      .forEach((subscription: any) => {
        activities.push({
          id: `subscription-${subscription.id}`,
          type: "subscription",
          userName: subscription.managedBy?.name || "Unknown User",
          timestamp: subscription.createdAt,
          amount: subscription.amount,
        });
      });

    // Sort all activities by timestamp and return top 5
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);
  };

  // Helper function to process course categories
  const processCourseCategories = (courses: any[]) => {
    const categoryCount: { [key: string]: number } = {};

    courses.forEach((course: any) => {
      const ageGroup = course.ageGroup || "Unknown";
      categoryCount[ageGroup] = (categoryCount[ageGroup] || 0) + 1;
    });

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

    return Object.entries(categoryCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case "completion":
        return <Trophy className="w-4 h-4 text-green-600" />;
      case "subscription":
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case "enrollment":
        return `enrolled in ${activity.courseName}`;
      case "completion":
        return `completed ${activity.courseName}`;
      case "subscription":
        return `subscribed for ${formatCurrency(activity.amount || 0)}`;
      default:
        return "performed an action";
    }
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="bg-primary-main hover:bg-primary-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p
                  className={`text-sm flex items-center mt-1 ${
                    stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.monthlyGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(stats.monthlyGrowth)}% this month
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
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {topCourses.filter((course) => course.isApproved).length}{" "}
                  approved
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
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {stats.activeSubscriptions} active subscriptions
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Course Completion
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.completionRate}%
                </p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Target className="w-4 h-4 mr-1" />
                  {stats.averageEngagement}% avg engagement
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enrollment Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-sm" />
                <YAxis className="text-sm" />
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
                  dataKey="enrollments"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(31 41 55)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Course Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Age Groups
            </h3>
            {courseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={courseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No course data available
              </div>
            )}
          </div>

          {/* User Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Completions
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(31 41 55)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar
                  dataKey="completions"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Subscriptions
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.activeSubscriptions}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg. Engagement
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.averageEngagement}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Enrollments
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.totalEnrollments}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Performing Courses
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topCourses.length > 0 ? (
                  topCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {course.enrollments} enrollments •{" "}
                          {course.completionRate}% completion
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {formatCurrency(course.revenue)}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              course.isApproved
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {course.isApproved ? "Approved" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No course data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">
                            {activity.userName}
                          </span>{" "}
                          <span className="text-gray-600 dark:text-gray-400">
                            {getActivityText(activity)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
