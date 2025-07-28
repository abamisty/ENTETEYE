"use client";
import React, { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Zap,
  BookOpen,
  Play,
  Award,
  Target,
  Clock,
  Flame,
  Brain,
  Heart,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Gift,
  Crown,
  Gamepad2,
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
  family: {
    id: string;
    name: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  thumbnailUrl?: string;
  totalModules: number;
  totalLessons: number;
  totalDuration: number;
  tags?: string[];
  progress?: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    isCompleted: boolean;
    currentModuleId?: string;
    currentLessonId?: string;
    lastAccessedAt?: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  earnedAt: string;
  type: string;
}

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalPoints: number;
  currentStreak: number;
  level: number;
  nextLevelPoints: number;
  badges: number;
  timeSpent: number;
}

const ChildDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalPoints: 0,
    currentStreak: 0,
    level: 1,
    nextLevelPoints: 1000,
    badges: 0,
    timeSpent: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const router = useRouter();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch child profile
      const profileRes = await childCourseApi.getChildProfile();
      setProfile(profileRes?.data);

      // Fetch enrolled courses
      const enrolledRes = await childCourseApi.getEnrolledCourses();
      const enrolledData = enrolledRes?.data || [];
      setEnrolledCourses(enrolledData);

      // Fetch recommended courses
      const recommendedRes = await childCourseApi.getRecommendedCourses();
      setRecommendedCourses(recommendedRes?.data || []);

      // Calculate stats from enrolled courses
      calculateStats(enrolledData);

      // Generate achievements (in real app, this would come from backend)
      generateAchievements(enrolledData);
    } catch (error) {
      toast.error("Failed to load your dashboard");
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from course data
  const calculateStats = (courses: Course[]) => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.progress?.isCompleted
    ).length;
    const totalLessons = courses.reduce(
      (sum, course) => sum + (course.progress?.totalLessons || 0),
      0
    );
    const completedLessons = courses.reduce(
      (sum, course) => sum + (course.progress?.completedLessons || 0),
      0
    );

    // Calculate points based on progress
    const totalPoints = completedLessons * 50 + completedCourses * 200;

    // Calculate level (every 1000 points = 1 level)
    const level = Math.floor(totalPoints / 1000) + 1;
    const nextLevelPoints = 1000 - (totalPoints % 1000);

    // Calculate streak (simulated)
    const currentStreak = Math.min(7, Math.floor(completedLessons / 3));

    // Calculate badges
    const badges = Math.floor(completedCourses / 2) + Math.floor(level / 2);

    // Calculate time spent (estimated)
    const timeSpent = completedLessons * 30; // 30 minutes per lesson

    setStats({
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      totalPoints,
      currentStreak,
      level,
      nextLevelPoints,
      badges,
      timeSpent,
    });
  };

  // Generate achievements based on progress
  const generateAchievements = (courses: Course[]) => {
    const sampleAchievements: Achievement[] = [];

    if (courses.length > 0) {
      sampleAchievements.push({
        id: "1",
        title: "First Steps",
        description: "Started your first course!",
        badge: "🌟",
        earnedAt: new Date().toISOString(),
        type: "milestone",
      });
    }

    const completedCourses = courses.filter(
      (course) => course.progress?.isCompleted
    );
    if (completedCourses.length > 0) {
      sampleAchievements.push({
        id: "2",
        title: "Course Conqueror",
        description: "Completed your first course!",
        badge: "🏆",
        earnedAt: new Date().toISOString(),
        type: "completion",
      });
    }

    if (stats.currentStreak >= 3) {
      sampleAchievements.push({
        id: "3",
        title: "Learning Streak",
        description: "Learned for 3 days in a row!",
        badge: "🔥",
        earnedAt: new Date().toISOString(),
        type: "streak",
      });
    }

    setAchievements(sampleAchievements);
  };

  // Get child's age
  const getAge = (dateOfBirth: string) => {
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

  // Get motivational messages based on progress
  const getMotivationalMessage = () => {
    if (stats.completedCourses === 0) {
      return "Ready to start your learning adventure? Let's go!";
    }
    if (stats.completedCourses < 3) {
      return "Great start! Keep up the amazing work!";
    }
    if (stats.completedCourses < 5) {
      return "You're becoming a learning superstar! ⭐";
    }
    return "Wow! You're an incredible learner! Keep exploring!";
  };

  // Get course status info
  const getCourseStatus = (course: Course) => {
    if (!course.progress) {
      return {
        status: "Not Started",
        action: "Start Learning",
        buttonClass: "bg-green-500 hover:bg-green-600",
        icon: Play,
      };
    }

    if (course.progress.isCompleted) {
      return {
        status: "Completed",
        action: "Review",
        buttonClass: "bg-blue-500 hover:bg-blue-600",
        icon: CheckCircle,
      };
    }

    return {
      status: "In Progress",
      action: "Continue",
      buttonClass: "bg-orange-500 hover:bg-orange-600",
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-500 to-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-80 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">
            Loading your adventure...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-500 to-green-400">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  profile?.firstName?.[0] || "😊"
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Welcome back, {profile?.displayName || profile?.firstName}! 👋
                </h1>
                <p className="text-white/90">{getMotivationalMessage()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/20 rounded-2xl p-3 text-center">
                <Crown className="w-6 h-6 mx-auto mb-1" />
                <div className="text-lg font-bold">Level {stats.level}</div>
                <div className="text-xs opacity-90">
                  {stats.nextLevelPoints} to next
                </div>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 text-center">
                <Flame className="w-6 h-6 mx-auto mb-1" />
                <div className="text-lg font-bold">{stats.currentStreak}</div>
                <div className="text-xs opacity-90">day streak</div>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 text-center">
                <Star className="w-6 h-6 mx-auto mb-1" />
                <div className="text-lg font-bold">{stats.totalPoints}</div>
                <div className="text-xs opacity-90">points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.totalCourses}
            </div>
            <div className="text-sm text-gray-600">Courses Enrolled</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.completedCourses} completed
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.badges}
            </div>
            <div className="text-sm text-gray-600">Badges Earned</div>
            <div className="text-xs text-purple-600 mt-1">Keep learning!</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {formatTimeSpent(stats.timeSpent)}
            </div>
            <div className="text-sm text-gray-600">Time Learning</div>
            <div className="text-xs text-blue-600 mt-1">Amazing effort!</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.completedLessons}
            </div>
            <div className="text-sm text-gray-600">Lessons Done</div>
            <div className="text-xs text-pink-600 mt-1">
              of {stats.totalLessons} total
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-blue-600" />
                  My Learning Adventures
                </h2>
                <button
                  onClick={() => router.push("/child/courses")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.slice(0, 3).map((course) => {
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
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                            ) : (
                              "📚"
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                              {course.description}
                            </p>

                            {status !== "Not Started" && (
                              <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-600">
                                    Progress
                                  </span>
                                  <span className="text-xs font-bold text-blue-600">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleCourseAction(course)}
                            className={`${buttonClass} text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
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
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      No courses yet!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ask your parents to enroll you in some exciting courses!
                    </p>
                    <button
                      onClick={() => router.push("/child/courses/explore")}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
            {/* Achievements */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h3>

              <div className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.slice(0, 3).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                    >
                      <div className="text-2xl">{achievement.badge}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Start learning to earn your first achievement!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Recommended for You
              </h3>

              <div className="space-y-3">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.slice(0, 2).map((course) => (
                    <div
                      key={course.id}
                      className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200"
                    >
                      <h4 className="font-bold text-gray-800 text-sm mb-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-lg">
                          {course.ageGroup}
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/child/courses/${course.id}`)
                          }
                          className="text-xs bg-pink-500 text-white px-3 py-1 rounded-lg hover:bg-pink-600 transition-colors"
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Heart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      We'll recommend courses based on your interests!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Fun Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                Learning Stats
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Learning Level</span>
                  <span className="font-bold text-indigo-600">
                    Level {stats.level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Streak</span>
                  <span className="font-bold text-orange-600">
                    {stats.currentStreak} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Points</span>
                  <span className="font-bold text-green-600">
                    {stats.totalPoints}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <p className="text-xs text-indigo-800 text-center">
                    🎯 {stats.nextLevelPoints} more points to reach Level{" "}
                    {stats.level + 1}!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
