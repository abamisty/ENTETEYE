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
  FileText,
  Activity,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

// Mock data - replace with actual API calls
const mockCourse = {
  id: "course-1",
  title: "Amazing Space Adventures",
  description:
    "Explore the wonders of space and learn about planets, stars, and galaxies!",
  ageGroup: "10-12",
  thumbnailUrl:
    "https://videos.pexels.com/video-files/9714260/9714260-uhd_2560_1440_30fps.mp4",
  modules: [
    {
      id: "module-1",
      title: "Our Solar System",
      description: "Learn about planets and the sun",
      order: 1,
      lessons: [
        {
          id: "lesson-1",
          title: "Introduction to Space",
          type: "video",
          durationMinutes: 5,
          pointsReward: 50,
          videoUrl: "https://example.com/video1.mp4",
          order: 1,
        },
        {
          id: "lesson-2",
          title: "Planet Quiz",
          type: "quiz",
          durationMinutes: 10,
          pointsReward: 100,
          quiz: {
            questions: [
              {
                id: "q1",
                questionText: "Which planet is closest to the Sun?",
                questionType: "multiple-choice",
                options: [
                  { id: "a", text: "Venus", isCorrect: false },
                  { id: "b", text: "Mercury", isCorrect: true },
                  { id: "c", text: "Earth", isCorrect: false },
                  { id: "d", text: "Mars", isCorrect: false },
                ],
                points: 50,
              },
              {
                id: "q2",
                questionText: "How many planets are in our solar system?",
                questionType: "multiple-choice",
                options: [
                  { id: "a", text: "7", isCorrect: false },
                  { id: "b", text: "8", isCorrect: true },
                  { id: "c", text: "9", isCorrect: false },
                  { id: "d", text: "10", isCorrect: false },
                ],
                points: 50,
              },
            ],
            passingScore: 70,
          },
          order: 2,
        },
        {
          id: "lesson-3",
          title: "Space Facts",
          type: "reading",
          durationMinutes: 8,
          pointsReward: 75,
          readingContent:
            "Space is vast and full of amazing phenomena. Did you know that one day on Venus equals 243 Earth days? And Jupiter is so big that all other planets could fit inside it!",
          order: 3,
        },
      ],
    },
  ],
};

const mockEnrollment = {
  id: "enrollment-1",
  progressPercentage: 33,
  coursePreferences: {
    difficulty: "medium",
    dailyGoalMinutes: 30,
  },
};

const CoursePlayer = () => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<any>({});
  const [totalPoints, setTotalPoints] = useState(150);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const timeRef = useRef<any>(null);

  const currentModule = mockCourse.modules[currentModuleIndex];
  const currentLesson: any = currentModule?.lessons[currentLessonIndex];

  // Time tracking
  useEffect(() => {
    if (isPlaying) {
      timeRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
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

  const completeLesson = (lessonId: string, pointsEarned = 0) => {
    setLessonProgress((prev: any) => ({
      ...prev,
      [lessonId]: { completed: true, timeSpent, pointsEarned },
    }));
    setTotalPoints((prev) => prev + pointsEarned);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const nextLesson = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
      setTimeSpent(0);
      setQuizAnswers({});
    } else if (currentModuleIndex < mockCourse.modules.length - 1) {
      setCurrentModuleIndex((prev) => prev + 1);
      setCurrentLessonIndex(0);
      setTimeSpent(0);
      setQuizAnswers({});
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
      setTimeSpent(0);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
      const prevModule = mockCourse.modules[currentModuleIndex - 1];
      setCurrentLessonIndex(prevModule.lessons.length - 1);
      setTimeSpent(0);
    }
  };

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    setQuizAnswers((prev: any) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const submitQuiz = () => {
    const quiz: any = currentLesson.quiz;
    let correctAnswers = 0;

    quiz.questions.forEach((question: any) => {
      const selectedAnswer = quizAnswers[question.id];
      const correctOption = question.options.find((opt: any) => opt.isCorrect);
      if (selectedAnswer === correctOption.id) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const pointsEarned =
      score >= quiz.passingScore
        ? currentLesson.pointsReward
        : Math.floor(currentLesson.pointsReward * 0.5);

    completeLesson(currentLesson.id, pointsEarned);
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
                <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    src="https://videos.pexels.com/video-files/9714260/9714260-uhd_2560_1440_30fps.mp4"
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (!isPlaying)
                    completeLesson(
                      currentLesson.id,
                      currentLesson.pointsReward
                    );
                }}
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 mx-auto"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {isPlaying ? "Pause" : "Play"}
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

            {currentLesson.quiz.questions.map(
              (question: any, qIndex: number) => (
                <div
                  key={question.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    Question {qIndex + 1}: {question.questionText}
                  </h4>
                  <div className="space-y-3">
                    {question.options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleQuizAnswer(question.id, option.id)}
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
              )
            )}

            {Object.keys(quizAnswers).length ===
              currentLesson.quiz.questions.length && (
              <button
                onClick={submitQuiz}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                Submit Quiz! 🎯
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
                onClick={() =>
                  completeLesson(currentLesson.id, currentLesson.pointsReward)
                }
                className="mt-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                I've Read This! 📚
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
                {mockCourse.title}
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Module Progress */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Progress
              </h3>

              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Course Progress</span>
                  <span>{mockEnrollment.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${mockEnrollment.progressPercentage}%` }}
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
                      {lessonProgress[lesson.id]?.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lesson.durationMinutes} min
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
                    currentModuleIndex === mockCourse.modules.length - 1 &&
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
