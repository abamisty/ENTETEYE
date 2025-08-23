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
    if (path.order === 1) return true; // First path is always unlocked

    // Find the previous path
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 border-solid mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center rounded-lg overflow-hidden justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg text-white overflow-hidden">
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {courseData.title}
              </h1>
              <p className="text-blue-200 mt-1">{courseData.description}</p>
              <p className="text-sm text-blue-300 mt-1">
                Age Group: {courseData.ageGroup}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400 text-xl font-bold">
                <span>⭐</span>
                {earnedPoints} / {totalPoints}
              </div>
              <p className="text-sm text-blue-200">Experience Points</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-black/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-blue-200 mt-2">
            {overallProgress}% Complete - Keep going, champion!
          </p>
        </div>
      </div>

      {/* Trail Container */}
      <div className="container mx-auto max-w-4xl p-6">
        <div className="relative">
          {/* Trail Path - Simple line version */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 opacity-30"></div>

          {/* Learning Path Nodes */}
          <div className="relative z-10 space-y-24">
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
                      className={`flex items-center gap-8 ${
                        index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      {/* Path Node */}
                      <div
                        onClick={() => handlePathClick(path)}
                        className={`
                          relative w-24 h-24 md:w-32 md:h-32 rounded-full cursor-pointer transition-all duration-300 transform flex items-center justify-center
                          ${isUnlocked ? "hover:scale-110" : ""}
                          ${
                            isCompleted
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50"
                              : isActive
                              ? "bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50 animate-pulse"
                              : "bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg shadow-gray-500/30"
                          }
                        `}
                      >
                        {/* Path Number */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                          {path.order}
                        </div>

                        {/* Main Icon */}
                        <div className="text-2xl md:text-4xl">
                          {isCompleted ? (
                            <span className="text-white">✅</span>
                          ) : isUnlocked ? (
                            <span>🎯</span>
                          ) : (
                            <span className="text-gray-400">🔒</span>
                          )}
                        </div>

                        {/* Points Badge */}
                        {isCompleted && (
                          <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                            <span>⭐</span>
                            {earnedSegmentPoints}
                          </div>
                        )}

                        {/* Glow Effect for Active Paths */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                        )}
                      </div>

                      {/* Path Info Card */}
                      <div
                        className={`
                        flex-1 max-w-md bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30
                        ${isUnlocked ? "opacity-100" : "opacity-60"}
                        transition-all duration-300 hover:scale-105
                      `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className={`font-bold text-lg ${
                                isCompleted
                                  ? "text-green-400"
                                  : isActive
                                  ? "text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              {path.title}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {path.segments.length} segments
                            </p>
                          </div>
                          {path.progressPercentage > 0 && (
                            <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-bold">
                              {path.progressPercentage}%
                            </div>
                          )}
                        </div>

                        {path.description && (
                          <p className="text-gray-300 text-sm mb-3">
                            {path.description}
                          </p>
                        )}

                        {/* Segments Preview */}
                        <div className="flex gap-1 mb-3">
                          {path.segments.slice(0, 5).map((segment) => (
                            <div
                              key={segment.id}
                              className={`w-3 h-3 rounded-full ${
                                segment.isCompleted
                                  ? "bg-green-400"
                                  : "bg-gray-600"
                              }`}
                              title={`Segment ${segment.order}: ${segment.type}`}
                            />
                          ))}
                          {path.segments.length > 5 && (
                            <span className="text-xs text-gray-400 self-center">
                              +{path.segments.length - 5} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <span>📊</span>
                            {
                              path.segments.filter((s) => s.isCompleted).length
                            }{" "}
                            / {path.segments.length} completed
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            {totalSegmentPoints} XP
                          </div>
                        </div>

                        {/* Action Button */}
                        {isUnlocked && (
                          <button
                            onClick={() => handlePathClick(path)}
                            className={`
                              w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
                              ${
                                isCompleted
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                              }
                            `}
                          >
                            {isCompleted ? "Review Path" : "Start Learning"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Achievement Badge */}
                    {isCompleted && path.progressPercentage === 100 && (
                      <div className="absolute top-0 right-0 z-20">
                        <div className="bg-yellow-400 text-black rounded-full p-2 animate-bounce">
                          <span className="text-lg">👑</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Completion Celebration */}
        {overallProgress === 100 && (
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              Congratulations, Champion!
            </h2>
            <p className="text-white text-lg mb-4">
              You've completed the entire course adventure!
            </p>
            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform">
              View Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCourseTrail;
