"use client";
import { childCourseApi } from "@/api/child";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// Updated interfaces to match your database structure
interface SegmentProgress {
  id: string;
  isCompleted: boolean;
  pointsEarned: number;
  interactionData?: any;
}

interface LearningSegment {
  id: string;
  order: number;
  type: "dialogue" | "instruction" | "question" | "practice" | "review";
  basePoints: number;
  bonusPoints?: number;
  content?: any;
  isCompleted?: boolean;
  pointsEarned?: number;
  interactionData?: any;
}

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  progressPercentage: number;
  segments: LearningSegment[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  thumbnailUrl: string;
  learningPaths: LearningPath[];
  enrollment: {
    id: string;
    totalPointsEarned: number;
    completionPercentage: number;
  };
}

const GameCourseTrail = () => {
  const router = useRouter();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { courseId } = useParams();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await childCourseApi.getCourseDetails(courseId as string);
        setCourseData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const getSegmentIcon = (segment: LearningSegment) => {
    switch (segment.type) {
      case "dialogue":
        return "💬";
      case "instruction":
        return "📚";
      case "question":
        return "❓";
      case "practice":
        return "⚡";
      case "review":
        return "📖";
      default:
        return "📚";
    }
  };

  const getSegmentTypeColor = (type: string) => {
    const colors = {
      dialogue: "from-pink-400 to-pink-600",
      instruction: "from-blue-400 to-blue-600",
      question: "from-purple-400 to-purple-600",
      practice: "from-green-400 to-green-600",
      review: "from-yellow-400 to-yellow-600",
    };
    return colors[type as keyof typeof colors] || "from-gray-400 to-gray-600";
  };

  const handlePathClick = (path: LearningPath) => {
    const isUnlocked = isPathUnlocked(path);
    if (isUnlocked) {
      router.push(`/child/courses/${courseData?.id}/${path.id}`);
    }
  };

  const isPathUnlocked = (path: LearningPath) => {
    console.log(path);
    if (path.order === 1) return true;

    const previousPath = courseData?.learningPaths.find(
      (p) => p.order === path.order - 1
    );
    return previousPath?.isCompleted || false;
  };

  const calculateTotalPoints = () => {
    if (!courseData) return { total: 0, earned: 0 };

    let totalPoints = 0;
    let earnedPoints = 0;

    courseData.learningPaths.forEach((path) => {
      path.segments.forEach((segment) => {
        totalPoints += segment.basePoints + (segment.bonusPoints || 0);
        earnedPoints += segment.pointsEarned || 0;
      });
    });

    return { total: totalPoints, earned: earnedPoints };
  };

  const calculateOverallProgress = () => {
    if (!courseData || courseData.learningPaths.length === 0) return 0;

    const completedPaths = courseData.learningPaths.filter(
      (path) => path.isCompleted
    ).length;
    return Math.round((completedPaths / courseData.learningPaths.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-slate-700 text-xl">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) return null;

  const { total: totalPoints, earned: earnedPoints } = calculateTotalPoints();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br rounded-lg overflow-hidden from-blue-50 via-sky-50 to-indigo-50 text-slate-800">
      {/* Header */}
      <div className="relative p-4 sm:p-6 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent leading-tight">
                {courseData.title}
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {courseData.description}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                Age Group: {courseData.ageGroup}
              </p>
            </div>
            <div className="text-center lg:text-right bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
              <div className="flex items-center justify-center lg:justify-end gap-2 text-amber-600 text-lg sm:text-xl font-bold">
                <span>⭐</span>
                <span className="text-sm sm:text-lg">
                  {earnedPoints} / {totalPoints}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Experience Points
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/50 rounded-full h-3 sm:h-4 overflow-hidden border border-blue-200 shadow-sm">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${overallProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-2">
            {overallProgress}% Complete - Keep going, champion!
          </p>
        </div>
      </div>

      {/* Trail Container */}
      <div className="container mx-auto max-w-5xl p-4 sm:p-6">
        <div className="relative">
          {/* Trail Path - Responsive line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-blue-300 to-indigo-400 opacity-40 hidden sm:block"></div>

          {/* Learning Path Nodes */}
          <div className="relative z-10 space-y-8 sm:space-y-16 lg:space-y-24">
            {courseData.learningPaths
              .sort((a, b) => a.order - b.order)
              .map((path, index) => {
                const isCompleted = path.isCompleted;
                const isUnlocked = isPathUnlocked(path);
                const isActive = isUnlocked && !isCompleted;
                const totalSegmentPoints = path.segments.reduce(
                  (sum, segment) =>
                    sum + segment.basePoints + (segment.bonusPoints || 0),
                  0
                );
                const earnedSegmentPoints = path.segments.reduce(
                  (sum, segment) => sum + (segment.pointsEarned || 0),
                  0
                );

                return (
                  <div key={path.id} className="relative">
                    <div
                      className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 ${
                        index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                      }`}
                    >
                      {/* Path Node */}
                      <div
                        onClick={() => handlePathClick(path)}
                        className={`
                          relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full cursor-pointer transition-all duration-300 transform flex items-center justify-center shadow-lg border-4 border-white
                          ${isUnlocked ? "hover:scale-110" : ""}
                          ${
                            isCompleted
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-200"
                              : isActive
                              ? "bg-gradient-to-r from-blue-400 to-blue-600 shadow-blue-200 animate-pulse"
                              : "bg-gradient-to-r from-slate-300 to-slate-400 shadow-slate-200"
                          }
                        `}
                      >
                        {/* Path Number */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 bg-amber-400 text-slate-800 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md border-2 border-white">
                          {path.order}
                        </div>

                        {/* Main Icon */}
                        <div className="text-xl sm:text-2xl lg:text-4xl">
                          {isCompleted ? (
                            <span className="text-white">✅</span>
                          ) : isUnlocked ? (
                            <span>🎯</span>
                          ) : (
                            <span className="text-slate-500">🔒</span>
                          )}
                        </div>

                        {/* Points Badge */}
                        {isCompleted && (
                          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-800 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold flex items-center gap-1 shadow-md border-2 border-white">
                            <span>⭐</span>
                            <span className="hidden xs:inline">
                              {earnedSegmentPoints}
                            </span>
                          </div>
                        )}

                        {/* Glow Effect for Active Paths */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
                        )}
                      </div>

                      {/* Path Info Card */}
                      <div
                        className={`
                        flex-1 w-full sm:max-w-sm lg:max-w-md bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-blue-200 shadow-lg
                        ${isUnlocked ? "opacity-100" : "opacity-70"}
                        transition-all duration-300 hover:scale-105 hover:shadow-xl
                      `}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-bold text-base sm:text-lg lg:text-xl leading-tight ${
                                isCompleted
                                  ? "text-green-600"
                                  : isActive
                                  ? "text-slate-800"
                                  : "text-slate-500"
                              }`}
                            >
                              {path.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                              {path.segments.length} segments
                            </p>
                          </div>
                          {path.progressPercentage > 0 && (
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs sm:text-sm font-bold ml-2 shadow-sm">
                              {path.progressPercentage}%
                            </div>
                          )}
                        </div>

                        {path.description && (
                          <p className="text-slate-600 text-xs sm:text-sm mb-3 leading-relaxed">
                            {path.description}
                          </p>
                        )}

                        {/* Segments Preview */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {path.segments.slice(0, 5).map((segment) => (
                            <div
                              key={segment.id}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                                segment.isCompleted
                                  ? "bg-green-500"
                                  : "bg-slate-300"
                              } shadow-sm`}
                              title={`Segment ${segment.order}: ${segment.type}`}
                            />
                          ))}
                          {path.segments.length > 5 && (
                            <span className="text-xs text-slate-500 self-center ml-1">
                              +{path.segments.length - 5}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 bg-slate-50 rounded-lg p-2">
                          <div className="flex items-center gap-1">
                            <span>📊</span>
                            <span className="text-xs">
                              {
                                path.segments.filter((s) => s.isCompleted)
                                  .length
                              }{" "}
                              / {path.segments.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            <span className="text-xs">
                              {totalSegmentPoints} XP
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {isUnlocked && (
                          <button
                            onClick={() => handlePathClick(path)}
                            className={`
                              w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg
                              ${
                                isCompleted
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                              }
                            `}
                          >
                            {isCompleted ? "Review Path" : "Start Learning"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Completion Celebration */}
        {overallProgress === 100 && (
          <div className="text-center mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-xl border-2 border-amber-200 shadow-xl backdrop-blur-sm">
            <div className="text-4xl sm:text-6xl mb-4">🏆</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-600 mb-2">
              Congratulations, Champion!
            </h2>
            <p className="text-slate-700 text-base sm:text-lg mb-4 max-w-md mx-auto">
              You've completed the entire course adventure!
            </p>
            <button className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-800 px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-md text-sm sm:text-base">
              View Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCourseTrail;
