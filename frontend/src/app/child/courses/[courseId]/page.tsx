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
  Zap,
  Heart,
  Trophy,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Maximize,
  Lock,
  Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { childCourseApi } from "@/api/child";

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: "multiple-choice" | "true-false" | "matching" | "short-answer";
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

interface Quiz {
  questions: QuizQuestion[];
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  pointsReward: number;
  quiz?: Quiz;
  content?: any;
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

interface Character {
  mood:
    | "happy"
    | "encouraging"
    | "thinking"
    | "celebrating"
    | "sad"
    | "warning";
  message: string;
  visible: boolean;
}

// Character Guide Component with Image
const CharacterGuide = ({
  character,
  onClose,
}: {
  character: Character;
  onClose: () => void;
}) => {
  if (!character.visible) return null;

  const getCharacterImage = () => {
    return "/logo.jpg";
  };

  const getBubbleStyle = () => {
    switch (character.mood) {
      case "happy":
        return "bg-blue-500 border-blue-600";
      case "encouraging":
        return "bg-green-500 border-green-600";
      case "thinking":
        return "bg-yellow-500 border-yellow-600";
      case "celebrating":
        return "bg-purple-500 border-purple-600";
      case "sad":
        return "bg-red-500 border-red-600";
      case "warning":
        return "bg-orange-500 border-orange-600";
      default:
        return "bg-blue-500 border-blue-600";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-end gap-4 animate-bounce">
        {/* Speech Bubble */}
        <div
          className={`${getBubbleStyle()} text-white p-4 rounded-2xl rounded-br-none max-w-xs shadow-2xl border-2 relative animate-pulse`}
        >
          <p className="font-bold text-sm">{character.message}</p>
          <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-current"></div>
        </div>

        {/* Character Image */}
        <div
          onClick={onClose}
          className="w-20 h-20 cursor-pointer hover:scale-110 transition-transform animate-bounce bg-white rounded-full border-4 border-yellow-400 shadow-xl overflow-hidden"
        >
          <img
            src={getCharacterImage()}
            alt="Learning Buddy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

// Sound Effects Hook
const useSoundEffects = () => {
  const playSound = (
    type: "correct" | "wrong" | "complete" | "click" | "warning"
  ) => {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    const frequencies = {
      correct: [523, 659, 784], // C5, E5, G5 - Happy chord
      wrong: [220, 196], // A3, G3 - Descending sad notes
      complete: [523, 659, 784, 1047], // Victory fanfare
      click: [800], // Simple click
      warning: [400, 350], // Warning tone
    };

    const freqs = frequencies[type];
    freqs.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type =
          type === "correct" || type === "complete" ? "triangle" : "sine";

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 100);
    });
  };

  return { playSound };
};

// Enhanced Video Player
const EnhancedVideoPlayer = ({
  onComplete,
  isCompleted,
}: {
  onComplete: () => void;
  isCompleted: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      setWatchedPercentage(Math.max(watchedPercentage, progress));

      // Complete when 95% watched
      if (progress >= 95 && !isCompleted) {
        onComplete();
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        src="https://videos.pexels.com/video-files/9714260/9714260-uhd_2560_1440_30fps.mp4"
        className="w-full h-[450px] object-cover"
        onTimeUpdate={handleProgress}
        onEnded={() => onComplete()}
      />

      {/* Video Completion Overlay */}
      {watchedPercentage < 95 && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
          {Math.round(watchedPercentage)}% watched
        </div>
      )}

      {/* Enhanced Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-6">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => skipTime(-10)}
              className="text-white hover:text-yellow-400 transition-colors hover:scale-110"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black rounded-full p-4 transition-all transform hover:scale-110 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>

            <button
              onClick={() => skipTime(10)}
              className="text-white hover:text-yellow-400 transition-colors hover:scale-110"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-yellow-400 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-yellow-400 transition-colors"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Audio Player
const EnhancedAudioPlayer = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleAudio = () => {
    if ("speechSynthesis" in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (speechRef.current) {
          window.speechSynthesis.resume();
        } else {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.pitch = 1.1;
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            setIsCompleted(true);
            onComplete?.();
          };
          utterance.onboundary = (event) => {
            const progressPercent = (event.charIndex / text.length) * 100;
            setProgress(progressPercent);
          };
          speechRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        }
        setIsPlaying(true);
      }
    }
  };

  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
      speechRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold flex items-center gap-2">
          🎧 Listen to the Story
        </h4>
        <div className="flex items-center gap-2">
          {isCompleted && <CheckCircle className="w-6 h-6 text-green-300" />}
          <div className="text-2xl animate-bounce">🔊</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-4 mb-6">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-400 h-4 rounded-full transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={toggleAudio}
          className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-full p-4 transition-all transform hover:scale-110 font-bold shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={stopAudio}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-all transform hover:scale-110 shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {!isCompleted && (
        <p className="text-center mt-4 text-sm text-white/80">
          Listen to the complete story to continue!
        </p>
      )}
    </div>
  );
};

const GameifiedCoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Quiz states
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Audio/Reading states
  const [audioCompleted, setAudioCompleted] = useState(false);

  const [character, setCharacter] = useState<Character>({
    mood: "happy",
    message:
      "Welcome to your learning adventure! I'm here to help you succeed! 🌟",
    visible: true,
  });
  const [showPointsExplosion, setShowPointsExplosion] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSoundEffects();

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseResponse = await childCourseApi.getCourseDetails(
          courseId as string
        );

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

  const currentModule = course?.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  // Character interaction system
  const showCharacterMessage = (mood: Character["mood"], message: string) => {
    setCharacter({
      mood,
      message,
      visible: true,
    });

    // Play appropriate sound
    switch (mood) {
      case "celebrating":
        playSound("correct");
        break;
      case "sad":
        playSound("wrong");
        break;
      case "warning":
        playSound("warning");
        break;
      default:
        playSound("click");
    }
  };

  // Check if lesson is unlocked
  const isLessonUnlocked = (moduleIndex: number, lessonIndex: number) => {
    if (moduleIndex === 0 && lessonIndex === 0) return true; // First lesson always unlocked

    // Check if previous lesson is completed
    if (lessonIndex > 0) {
      const prevLesson = course?.modules[moduleIndex]?.lessons[lessonIndex - 1];
      return prevLesson?.isCompleted || false;
    }

    // Check if previous module's last lesson is completed
    if (moduleIndex > 0) {
      const prevModule = course?.modules[moduleIndex - 1];
      const lastLesson = prevModule?.lessons[prevModule.lessons.length - 1];
      return lastLesson?.isCompleted || false;
    }

    return false;
  };

  // Question timer for encouragement
  useEffect(() => {
    if (
      currentLesson?.type === "quiz" &&
      !currentLesson.isCompleted &&
      !showResult
    ) {
      questionTimerRef.current = setInterval(() => {
        setQuestionTimer((prev) => {
          const newTime = prev + 1;
          if (newTime === 15) {
            showCharacterMessage(
              "thinking",
              "Take your time! Think carefully about your answer 🤔"
            );
          } else if (newTime === 30) {
            showCharacterMessage(
              "encouraging",
              "You can do this! Read the question again 💪"
            );
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        setQuestionTimer(0);
      }
    }

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [currentLesson, currentLessonIndex, showResult]);

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

      setTotalPoints((prev) => prev + pointsEarned);
      setStreak((prev) => prev + 1);
      setLastPointsEarned(pointsEarned);
      setShowPointsExplosion(true);
      setShowCelebration(true);

      playSound("complete");

      setTimeout(() => {
        setShowPointsExplosion(false);
        setShowCelebration(false);
      }, 3000);

      const messages = [
        "Outstanding work! You're becoming a learning superstar! ⭐",
        "Incredible! You've mastered this lesson perfectly! 🌟",
        "Brilliant performance! You should be proud of yourself! 🔥",
        "Amazing job! You're on your way to greatness! 🎯",
      ];

      showCharacterMessage(
        "celebrating",
        messages[Math.floor(Math.random() * messages.length)]
      );

      // Update local course structure
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

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    if (showResult) return;

    playSound("click");
    setSelectedAnswer(answerId);
    setQuestionTimer(0);

    // Access quiz data correctly according to schema
    const currentQuestion =
      currentLesson?.quiz?.questions[currentQuestionIndex];
    const correctOption = currentQuestion?.options?.find(
      (opt: any) => opt.isCorrect
    );
    const isAnswerCorrect = answerId === correctOption?.id;

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    if (isAnswerCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      showCharacterMessage(
        "celebrating",
        "Perfect! You're absolutely right! Well done! 🎉"
      );
    } else {
      showCharacterMessage(
        "sad",
        "Oops! That's not quite right. Don't worry, learning takes practice! 💪"
      );
      setLives((prev) => Math.max(0, prev - 1));
    }

    // Auto-advance after 2.5 seconds
    setTimeout(() => {
      if (
        currentQuestionIndex <
        (currentLesson?.quiz?.questions?.length || 0) - 1
      ) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz completed
        setQuizCompleted(true);
        const totalQuestions = currentLesson?.quiz?.questions?.length || 1;
        const score = (correctAnswers / totalQuestions) * 100;
        const passingScore = currentLesson?.quiz?.passingScore || 70;

        if (score >= passingScore) {
          completeLesson(currentLesson?.pointsReward || 0);
          showCharacterMessage(
            "celebrating",
            `Fantastic! You scored ${Math.round(score)}%! Quiz completed! 🏆`
          );
        } else {
          showCharacterMessage(
            "encouraging",
            "Good effort! You can retry this quiz to improve your score! 📚"
          );
        }
      }
    }, 2500);
  };

  const nextLesson = () => {
    if (!course) return;

    const nextLessonIndex = currentLessonIndex + 1;
    const nextModuleIndex = currentModuleIndex + 1;

    if (nextLessonIndex < currentModule!.lessons.length) {
      if (isLessonUnlocked(currentModuleIndex, nextLessonIndex)) {
        setCurrentLessonIndex(nextLessonIndex);
        resetLessonState();
        showCharacterMessage(
          "happy",
          "Great! Let's continue with the next lesson! 🚀"
        );
      } else {
        showCharacterMessage(
          "warning",
          "You need to complete the current lesson first! 🔒"
        );
      }
    } else if (nextModuleIndex < course.modules.length) {
      if (isLessonUnlocked(nextModuleIndex, 0)) {
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentLessonIndex(0);
        resetLessonState();
        showCharacterMessage(
          "celebrating",
          "Module completed! Welcome to the next adventure! 🏆"
        );
      } else {
        showCharacterMessage(
          "warning",
          "Complete the current lesson to unlock the next module! 🔒"
        );
      }
    }
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    if (isLessonUnlocked(moduleIndex, lessonIndex)) {
      setCurrentModuleIndex(moduleIndex);
      setCurrentLessonIndex(lessonIndex);
      resetLessonState();
      playSound("click");
    } else {
      showCharacterMessage(
        "warning",
        "Complete the previous lessons first to unlock this one! 🔒"
      );
      playSound("warning");
    }
  };

  const resetLessonState = () => {
    setTimeSpent(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setCorrectAnswers(0);
    setAudioCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case "video":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 animate-spin text-2xl">
                🎬
              </div>
              <div className="absolute bottom-4 left-4 animate-bounce text-2xl">
                📺
              </div>

              <div className="text-center relative z-10 mb-6">
                <Video className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold mb-2">
                  {currentLesson.title}
                </h3>
                <p className="text-blue-100 mb-4 text-lg">
                  🕐 {currentLesson.durationMinutes} minutes of exciting
                  content!
                </p>
              </div>

              <EnhancedVideoPlayer
                onComplete={() => {
                  if (!currentLesson.isCompleted) {
                    completeLesson(currentLesson.pointsReward);
                  }
                }}
                isCompleted={currentLesson.isCompleted || false}
              />
            </div>
          </div>
        );

      case "quiz":
        // Check if quiz exists and has questions
        if (
          !currentLesson.quiz ||
          !currentLesson.quiz.questions ||
          quizCompleted
        ) {
          return (
            <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-green-200 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-green-600 mb-4">
                Quiz Completed!
              </h3>
              <p className="text-gray-600">
                You got {correctAnswers} out of{" "}
                {currentLesson.quiz?.questions?.length || 0} correct!
              </p>
            </div>
          );
        }

        // Access quiz data correctly according to schema
        const currentQuestion =
          currentLesson.quiz.questions[currentQuestionIndex];
        const totalQuestions = currentLesson.quiz.questions.length;

        return (
          <div className="space-y-6">
            {/* Quiz Header */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentQuestionIndex + 1}
                  </div>
                  <span className="text-gray-600 font-semibold">
                    of {totalQuestions}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: lives }).map((_, i) => (
                    <Heart
                      key={i}
                      className="w-6 h-6 text-red-500 fill-current"
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / totalQuestions) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-purple-200">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🧠</div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {currentQuestion.questionText}
                </h2>
                {questionTimer > 0 && (
                  <div className="text-orange-600 font-bold">
                    ⏱️ {questionTimer}s
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                {currentQuestion.options?.map((option: any, index: number) => {
                  let buttonClass =
                    "w-full p-4 text-left rounded-xl border-3 transition-all transform hover:scale-105 font-semibold ";

                  if (showResult && selectedAnswer === option.id) {
                    if (option.isCorrect) {
                      buttonClass +=
                        "bg-green-100 border-green-500 text-green-800";
                    } else {
                      buttonClass += "bg-red-100 border-red-500 text-red-800";
                    }
                  } else if (showResult && option.isCorrect) {
                    buttonClass +=
                      "bg-green-100 border-green-500 text-green-800";
                  } else if (selectedAnswer === option.id) {
                    buttonClass += "bg-blue-100 border-blue-500 text-blue-800";
                  } else {
                    buttonClass +=
                      "bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-gray-800";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        handleQuizAnswer(currentQuestion.id, option.id)
                      }
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              {showResult && (
                <div className="mt-8 text-center">
                  <div
                    className={`text-4xl mb-4 ${
                      isCorrect ? "animate-bounce" : "animate-pulse"
                    }`}
                  >
                    {isCorrect ? "🎉" : "💭"}
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      isCorrect ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {isCorrect
                      ? "Excellent work!"
                      : "Not quite right, but keep trying!"}
                  </p>
                  {/* Show explanation if available */}
                  {currentQuestion.explanation && (
                    <p className="text-gray-600 mt-2 text-sm">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "reading":
        const readingContent =
          currentLesson.content || currentLesson.readingContent || "";

        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 animate-bounce text-2xl">
                📖
              </div>
              <div className="absolute bottom-4 left-4 animate-spin text-2xl">
                ✨
              </div>

              <div className="text-center relative z-10">
                <BookOpen className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold mb-2">
                  {currentLesson.title}
                </h3>
                <p className="text-emerald-100 text-lg">
                  Let's explore this amazing story together! 📚
                </p>
              </div>
            </div>

            {/* Audio Player */}
            <EnhancedAudioPlayer
              text={readingContent}
              onComplete={() => {
                setAudioCompleted(true);
                showCharacterMessage(
                  "celebrating",
                  "Wonderful! You listened to the whole story! 🎧"
                );
              }}
            />

            {/* Reading Content */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-emerald-200 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-3xl animate-bounce">
                🌟
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed text-lg font-medium">
                  {readingContent}
                </p>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    if (audioCompleted) {
                      completeLesson(currentLesson.pointsReward);
                    } else {
                      showCharacterMessage(
                        "warning",
                        "Please listen to the audio story first! 🎧"
                      );
                    }
                  }}
                  disabled={currentLesson.isCompleted}
                  className={`px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                    currentLesson.isCompleted
                      ? "bg-green-500 text-white"
                      : audioCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {currentLesson.isCompleted
                    ? "📚 Story Completed! ⭐"
                    : audioCompleted
                    ? "🎉 Mark Story as Read! 📖"
                    : "🎧 Listen to Audio First!"}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-br from-gray-500 to-gray-700 rounded-3xl p-8 text-center text-white">
            <Activity className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl">New learning experience coming soon! 🚀</p>
          </div>
        );
    }
  };

  if (loading || !course || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-500 border-opacity-50 mx-auto mb-6"></div>
          <p className="text-gray-600 text-xl font-semibold">
            Loading your learning adventure...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-3xl animate-bounce opacity-20">
          ⭐
        </div>
        <div className="absolute top-20 right-20 text-2xl animate-pulse opacity-20">
          🌟
        </div>
        <div className="absolute bottom-20 left-20 text-4xl animate-bounce opacity-20">
          🎈
        </div>
        <div className="absolute bottom-10 right-10 text-3xl animate-spin opacity-20">
          🎯
        </div>
        <div className="absolute top-1/2 left-10 text-2xl animate-pulse opacity-20">
          ✨
        </div>
        <div className="absolute top-1/3 right-10 text-3xl animate-bounce opacity-20">
          🚀
        </div>
      </div>

      {/* Character Guide */}
      <CharacterGuide
        character={character}
        onClose={() => setCharacter((prev) => ({ ...prev, visible: false }))}
      />

      {/* Points Explosion */}
      {showPointsExplosion && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="animate-ping">
            <div className="text-6xl font-bold text-yellow-400 drop-shadow-2xl">
              +{lastPointsEarned} ⭐
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-12 text-center animate-bounce max-w-md shadow-2xl">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Amazing Achievement!
            </h2>
            <p className="text-gray-600 text-xl mb-4">
              You earned {lastPointsEarned} points!
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-4xl animate-spin">🏆</div>
              <div className="text-4xl animate-bounce">⭐</div>
              <div className="text-4xl animate-pulse">🌟</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                🎓 {course.title}
              </h1>
              <p className="text-purple-100 mt-2 text-lg">
                📚 {currentModule?.title} - {currentLesson?.title}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-full shadow-lg">
                <Star className="w-5 h-5 text-yellow-800" />
                <span className="font-bold text-yellow-800 text-lg">
                  {totalPoints}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-red-400 px-4 py-2 rounded-full shadow-lg">
                <Heart className="w-5 h-5 text-red-800" />
                <span className="font-bold text-red-800 text-lg">{lives}</span>
              </div>

              <div className="flex items-center gap-2 bg-orange-400 px-4 py-2 rounded-full shadow-lg">
                <Zap className="w-5 h-5 text-orange-800" />
                <span className="font-bold text-orange-800 text-lg">
                  {streak}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Game Map Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-8 border-4 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Learning Path
              </h3>

              <div className="space-y-3">
                {currentModule?.lessons.map((lesson, index) => {
                  const isUnlocked = isLessonUnlocked(
                    currentModuleIndex,
                    index
                  );
                  const isCurrent = index === currentLessonIndex;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(currentModuleIndex, index)}
                      disabled={!isUnlocked}
                      className={`w-full p-3 rounded-2xl text-left transition-all transform hover:scale-105 relative ${
                        isCurrent
                          ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg"
                          : lesson.isCompleted
                          ? "bg-gradient-to-r from-green-300 to-emerald-400 text-white"
                          : isUnlocked
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                          : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {lesson.isCompleted ? (
                            <div className="animate-bounce">🏆</div>
                          ) : isCurrent ? (
                            <div className="animate-pulse">🎯</div>
                          ) : isUnlocked ? (
                            "📝"
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{lesson.title}</p>
                          <p className="text-xs opacity-75">
                            ⏱️ {lesson.durationMinutes} min · ⭐{" "}
                            {lesson.pointsReward}
                          </p>
                        </div>
                      </div>

                      {lesson.isCompleted && (
                        <div className="absolute top-2 right-2 animate-spin text-lg">
                          ✨
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {renderLessonContent()}

              {/* Enhanced Navigation */}
              <div className="flex justify-between items-center bg-white rounded-3xl p-6 shadow-xl border-4 border-blue-200">
                <button
                  onClick={() => {
                    if (currentLessonIndex > 0) {
                      selectLesson(currentModuleIndex, currentLessonIndex - 1);
                    } else if (currentModuleIndex > 0) {
                      const prevModule = course.modules[currentModuleIndex - 1];
                      selectLesson(
                        currentModuleIndex - 1,
                        prevModule.lessons.length - 1
                      );
                    }
                  }}
                  disabled={
                    currentModuleIndex === 0 && currentLessonIndex === 0
                  }
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-bold shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-purple-600 font-bold">
                    Keep Learning!
                  </span>
                  <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                </div>

                <button
                  onClick={nextLesson}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 font-bold shadow-lg"
                >
                  Next Lesson
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

export default GameifiedCoursePlayer;
