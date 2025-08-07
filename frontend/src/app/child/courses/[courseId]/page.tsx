"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Star,
  Award,
  BookOpen,
  Video,
  Brain,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Activity,
} from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { childCourseApi } from "@/api/child";

interface Lesson {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  pointsReward: number;
  quiz?: {
    questions: {
      id: string;
      questionText: string;
      options: {
        id: string;
        text: string;
        isCorrect: boolean;
      }[];
    }[];
    passingScore: number;
  };
  readingContent?: string;
  isCompleted?: boolean;
  completedAt?: Date;
  timeSpentMinutes?: number;
  quizResults?: any;
  activityResults?: any;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

interface Enrollment {
  id: string;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
  updatedAt: Date;
}

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const timeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseResponse = await childCourseApi.getCourseDetails(
          courseId as string
        );

        console.log(courseResponse);
        setCourse(courseResponse.data);
        setEnrollment(courseResponse.data.enrollment);

        const points = courseResponse.data.modules
          .flatMap((module: Module) => module.lessons)
          .filter((lesson: Lesson) => lesson.isCompleted)
          .reduce(
            (sum: number, lesson: Lesson) =>
              sum + (lesson.activityResults?.pointsEarned || 0),
            0
          );

        setTotalPoints(points);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        toast.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  console.log(course);
  // Time tracking
  useEffect(() => {
    if (isPlaying) {
      timeRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else if (timeRef.current) {
      clearInterval(timeRef.current);
    }

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completeLesson = async (pointsEarned = 0) => {
    try {
      if (!course || !currentLesson) return;

      await childCourseApi.updateLessonProgress(
        courseId as string,
        currentLesson.id,
        {
          isCompleted: true,
          timeSpentMinutes: Math.ceil(timeSpent / 60),
          activityResults: {
            activityType: currentLesson.type,
            data: {},
            pointsEarned,
          },
        }
      );

      // Update local state
      setTotalPoints((prev) => prev + pointsEarned);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);

      // Update course structure to mark lesson as completed
      setCourse((prev) => {
        if (!prev) return null;

        const updatedModules = prev.modules.map((module, mIndex) => {
          if (mIndex === currentModuleIndex) {
            const updatedLessons = module.lessons.map((lesson, lIndex) => {
              if (lIndex === currentLessonIndex) {
                return {
                  ...lesson,
                  isCompleted: true,
                  timeSpentMinutes: Math.ceil(timeSpent / 60),
                  activityResults: {
                    activityType: lesson.type,
                    data: {},
                    pointsEarned,
                  },
                };
              }
              return lesson;
            });
            return { ...module, lessons: updatedLessons };
          }
          return module;
        });

        return { ...prev, modules: updatedModules };
      });
    } catch (error) {
      console.error("Failed to update lesson progress:", error);
      toast.error("Failed to save your progress");
    }
  };

  const nextLesson = () => {
    if (!course) return;

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
      setTimeSpent(0);
      setQuizAnswers({});
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex((prev) => prev + 1);
      setCurrentLessonIndex(0);
      setTimeSpent(0);
      setQuizAnswers({});
    }
  };

  const prevLesson = () => {
    if (!course) return;

    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
      setTimeSpent(0);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
      const prevModule = course.modules[currentModuleIndex - 1];
      setCurrentLessonIndex(prevModule.lessons.length - 1);
      setTimeSpent(0);
    }
  };

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const submitQuiz = async () => {
    if (!currentLesson?.quiz) return;

    const quiz = currentLesson.quiz;
    let correctAnswers = 0;

    quiz.questions.forEach((question) => {
      const selectedAnswer = quizAnswers[question.id];
      const correctOption = question.options.find((opt) => opt.isCorrect);
      if (selectedAnswer === correctOption?.id) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const pointsEarned =
      score >= quiz.passingScore
        ? currentLesson.pointsReward
        : Math.floor(currentLesson.pointsReward * 0.5);

    await completeLesson(pointsEarned);
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case "video":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl p-8 text-white text-center">
              <Video className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{currentLesson.title}</h3>
              <p className="text-purple-100 mb-6">
                Duration: {currentLesson.durationMinutes} minutes
              </p>
              <div className="bg-black/20 rounded-xl p-6 mb-6">
                <div className="w-full h-[65  vh] bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    src="https://videos.pexels.com/video-files/9714260/9714260-uhd_2560_1440_30fps.mp4"
                    controls
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!currentLesson.isCompleted) {
                    completeLesson(currentLesson.pointsReward);
                  }
                }}
                disabled={currentLesson.isCompleted}
                className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto ${
                  currentLesson.isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-white text-purple-600 hover:bg-purple-50"
                }`}
              >
                {currentLesson.isCompleted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </>
                ) : (
                  "Mark as Completed"
                )}
              </button>
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 text-white text-center">
              <Brain className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{currentLesson.title}</h3>
              <p className="text-green-100">Test your knowledge!</p>
            </div>

            {currentLesson.quiz?.questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
              >
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Question {qIndex + 1}: {question.questionText}
                </h4>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleQuizAnswer(question.id, option.id)}
                      disabled={currentLesson.isCompleted}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        quizAnswers[question.id] === option.id
                          ? "bg-blue-100 border-blue-400 text-blue-800"
                          : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {currentLesson.quiz &&
              Object.keys(quizAnswers).length ===
                currentLesson.quiz.questions.length && (
                <button
                  onClick={submitQuiz}
                  disabled={currentLesson.isCompleted}
                  className={`w-full text-white py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                    currentLesson.isCompleted
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  }`}
                >
                  {currentLesson.isCompleted
                    ? "Quiz Completed ✓"
                    : "Submit Quiz! 🎯"}
                </button>
              )}
          </div>
        );

      case "reading":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-8 text-white text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{currentLesson.title}</h3>
              <p className="text-orange-100">Let's read and learn!</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-100">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {currentLesson.readingContent}
                </p>
              </div>

              <button
                onClick={() => completeLesson(currentLesson.pointsReward)}
                disabled={currentLesson.isCompleted}
                className={`mt-6 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
                  currentLesson.isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
                }`}
              >
                {currentLesson.isCompleted
                  ? "Reading Completed ✓"
                  : "I've Read This! 📚"}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 rounded-2xl p-8 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Lesson type not yet implemented</p>
          </div>
        );
    }
  };

  if (loading || !course || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  return (
    <div className="min-h-screen ">
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Awesome Job!
            </h2>
            <p className="text-gray-600">
              You earned {currentLesson?.pointsReward} points!
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {course.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {currentModule?.title} - {currentLesson?.title}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">
                  {totalPoints} points
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-800">
                  {formatTime(timeSpent)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-0 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Module Progress */}
          <div className="lg:col-span-1 w-full  ">
            <div className="bg-white h-full rounded-lg w-full shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Progress
              </h3>

              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Course Progress</span>
                  <span>{enrollment.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${enrollment.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Module Lessons */}
              <div className="space-y-3">
                {currentModule?.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonIndex(index)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      index === currentLessonIndex
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {lesson.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lesson.durationMinutes} min ·{" "}
                          {lesson.isCompleted ? "Completed" : "Not started"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {renderLessonContent()}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevLesson}
                  disabled={
                    currentModuleIndex === 0 && currentLessonIndex === 0
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTimeSpent(0)}
                    className="p-3 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={nextLesson}
                  disabled={
                    currentModuleIndex === course.modules.length - 1 &&
                    currentLessonIndex === currentModule?.lessons.length - 1
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
