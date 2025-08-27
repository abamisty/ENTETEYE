"use client";
import React, { useState, useEffect, useRef, JSX } from "react";
import {
  Check,
  X,
  Volume2,
  Play,
  Pause,
  ArrowRight,
  Star,
  Heart,
  Zap,
  Trophy,
  Target,
  Sparkles,
  Home,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { childCourseApi } from "@/api/child";

// Celebration component with enhanced animations
const CelebrationPopup = ({
  show,
  type,
  points,
  bonus,
  onClose,
}: {
  show: boolean;
  type: "correct" | "bonus" | "complete";
  points: number;
  bonus?: number;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-center animate-bounce shadow-2xl border-4 border-amber-400 max-w-sm w-full">
        <div className="text-4xl sm:text-6xl mb-4 animate-pulse">
          {type === "correct" && "🎉"}
          {type === "bonus" && "⭐"}
          {type === "complete" && "🏆"}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          {type === "correct" && "Awesome Achievement!"}
          {type === "bonus" && "Bonus Points Unlocked!"}
          {type === "complete" && "Level Complete!"}
        </h3>
        <p className="text-green-600 text-lg sm:text-xl font-bold animate-pulse">
          +{points} XP {bonus && `(+${bonus} bonus!)`}
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-current animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Typing Animation Component
const TypewriterText = ({
  text,
  onComplete,
  isActive = true,
  hasBeenActive = false,
  speed = 50,
}: {
  text: string;
  onComplete?: () => void;
  isActive?: boolean;
  hasBeenActive?: boolean;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  useEffect(() => {
    // If message has been active before and is no longer active, show full text
    if (hasBeenActive && !isActive && !hasTyped) {
      setDisplayedText(text);
      return;
    }

    // If message has already been typed, don't type again
    if (hasTyped) {
      setDisplayedText(text);
      return;
    }

    // Only start typing if currently active and hasn't been typed yet
    if (!isActive || hasTyped) {
      return;
    }

    setDisplayedText("");
    setIsTyping(true);
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setHasTyped(true);
        clearInterval(typeInterval);
        onComplete?.();
      }
    }, speed);

    return () => {
      clearInterval(typeInterval);
      setIsTyping(false);
    };
  }, [text, isActive, hasBeenActive, hasTyped, speed, onComplete]);

  // Reset typing state when text changes (new message)
  useEffect(() => {
    setHasTyped(false);
    setDisplayedText("");
  }, [text]);

  return (
    <span className="font-medium">
      {displayedText}
      {isTyping && <span className="animate-pulse text-blue-500">|</span>}
    </span>
  );
};

// Enhanced Progressive Dialogue Message Component
const DialogueMessage = ({
  message,
  character,
  position,
  isVisible,
  isActive,
  onComplete,
  messageIndex,
}: {
  message: string;
  character: any;
  position: "left" | "right" | "center";
  isVisible: boolean;
  isActive: boolean;
  onComplete?: () => void;
  messageIndex: number;
}) => {
  const isLeft = position === "left";
  const isCenter = position === "center";
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div
      ref={messageRef}
      className={`flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 transition-all duration-500 transform ${
        isLeft ? "flex-row" : isCenter ? "justify-center" : "flex-row-reverse"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ animationDelay: `${messageIndex * 0.2}s` }}
    >
      {!isCenter && (
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={
                character?.avatarUrl ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
              }
              alt={character?.name || "Character"}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 transition-all duration-300 shadow-md ${
                isActive
                  ? "border-blue-500 scale-110 shadow-lg shadow-blue-400/30 ring-4 ring-blue-400/20"
                  : "border-slate-400"
              }`}
            />
            {isActive && (
              <>
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 animate-pulse shadow-sm">
                  <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-center text-slate-600 mt-2 font-semibold">
            {character?.name || "Character"}
          </p>
        </div>
      )}

      <div
        className={`max-w-xs sm:max-w-lg p-3 sm:p-4 rounded-2xl relative transition-all duration-300 shadow-lg ${
          isLeft
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tl-sm"
            : isCenter
            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg"
            : "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm"
        } ${
          isActive
            ? "scale-105 border border-white/20 ring-2 ring-white/10 shadow-xl"
            : ""
        }`}
      >
        <TypewriterText
          text={message}
          isActive={isActive}
          onComplete={onComplete}
          speed={30}
        />

        {/* Enhanced Speech bubble arrow */}
        {!isCenter && (
          <div
            className={`absolute top-4 w-0 h-0 ${
              isLeft
                ? "-left-2 border-r-8 border-r-blue-500 border-t-8 border-t-transparent border-b-8 border-b-transparent"
                : "-right-2 border-l-8 border-l-green-500 border-t-8 border-t-transparent border-b-8 border-b-transparent"
            }`}
          />
        )}

        {/* Message number badge */}
        <div
          className={`absolute -top-2 ${
            isLeft ? "-right-2" : "-left-2"
          } bg-amber-400 text-slate-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-sm`}
        >
          {messageIndex + 1}
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component for gamification
const ProgressRing = ({
  progress,
  size = 60,
}: {
  progress: number;
  size?: number;
}) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(148 163 184)"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          style={{
            strokeDasharray,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-blue-600">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

const LearningSegmentPage = ({
  courseId,
  pathId,
}: {
  courseId: string;
  pathId: string;
}) => {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(12);
  const [xp, setXp] = useState(1250);
  const [sessionStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Celebration states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<
    "correct" | "bonus" | "complete"
  >("correct");
  const [celebrationPoints, setCelebrationPoints] = useState(0);
  const [celebrationBonus, setCelebrationBonus] = useState<
    number | undefined
  >();

  // Enhanced dialogue states
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(-1);
  const [dialogueCompleted, setDialogueCompleted] = useState(false);
  const [allDialogueMessages, setAllDialogueMessages] = useState<any[]>([]);
  const [visibleMessageCount, setVisibleMessageCount] = useState(0);
  const dialogueContainerRef = useRef<HTMLDivElement>(null);

  // Question states
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Fill in blanks states
  const [blankAnswers, setBlankAnswers] = useState<{ [key: number]: string }>(
    {}
  );
  const [blanksCompleted, setBlanksCompleted] = useState(false);

  // Practice states
  const [draggedItems, setDraggedItems] = useState<{ [key: string]: string }>(
    {}
  );
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // Instruction states
  const [instructionRead, setInstructionRead] = useState(false);

  const currentSegment = currentPath?.segments?.[currentSegmentIndex];

  // Update current time every second for timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (
      currentSegment?.type === "dialogue" &&
      allDialogueMessages.length === 0
    ) {
      initializeDialogue();
    }
  }, [currentSegment]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await childCourseApi.getCourseDetails(courseId);
      if (response.success) {
        setCourseData(response.data);
        const targetPath = response.data.learningPaths.find(
          (path: any) => path.id === pathId
        );
        setCurrentPath(targetPath);
      }
    } catch (error) {
      console.error("Failed to fetch course data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDialogue = () => {
    if (!currentSegment?.content?.dialogue) return;

    const messages: any[] = [];
    const dialogue = currentSegment.content.dialogue;

    // Create a flat array of all messages with character info
    dialogue.characters.forEach((characterData: any) => {
      const character = courseData?.featuredCharacters?.find(
        (char: any) => char.id === characterData.characterId
      );

      characterData.lines.forEach((line: string, index: number) => {
        messages.push({
          text: line,
          character: character,
          position:
            characterData.position ||
            (messages.length % 2 === 0 ? "left" : "right"),
          characterId: characterData.characterId,
        });
      });
    });

    setAllDialogueMessages(messages);
    setVisibleMessageCount(0);
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => resolve();
        speechSynthesis.speak(utterance);
      } else {
        setTimeout(resolve, text.length * 50);
      }
    });
  };

  const playDialogue = async () => {
    setIsPlayingDialogue(true);
    setCurrentDialogueIndex(-1);
    setVisibleMessageCount(0);

    for (let i = 0; i < allDialogueMessages.length; i++) {
      // Make current message visible
      setVisibleMessageCount(i + 1);
      setCurrentDialogueIndex(i);

      // Small delay to show the message appearing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Speak the text
      await speakText(allDialogueMessages[i].text);

      // Pause between messages
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setIsPlayingDialogue(false);
    setDialogueCompleted(true);
  };

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return;

    setSelectedAnswer(optionId);
    const question = currentSegment.content.question;
    let correct = false;

    if (question.type === "multiple-choice") {
      const selectedOption = question.options.find(
        (opt: any) => opt.id === optionId
      );
      correct = selectedOption?.isCorrect || false;
    } else if (question.type === "true-false") {
      correct = optionId === question.correctAnswer;
    }

    setIsCorrect(correct);
    setShowResult(true);
    setAttempts(attempts + 1);

    if (!correct && hearts > 0) {
      setHearts(hearts - 1);
    }

    setTimeout(() => {
      if (correct) {
        const basePoints = currentSegment.basePoints;
        const bonusPoints =
          attempts === 0 ? currentSegment.bonusPoints || 0 : 0;
        const totalPoints = basePoints + bonusPoints;

        setCelebrationPoints(basePoints);
        setCelebrationBonus(bonusPoints > 0 ? bonusPoints : undefined);
        setCelebrationType(bonusPoints > 0 ? "bonus" : "correct");
        setShowCelebration(true);
        setXp(xp + totalPoints);

        setTimeout(() => {
          completeSegment();
        }, 3000);
      } else {
        setTimeout(() => {
          setShowResult(false);
          setSelectedAnswer(null);
        }, 2000);
      }
    }, 1500);
  };

  const handleBlankAnswer = (blankIndex: number, value: string) => {
    const newAnswers = { ...blankAnswers, [blankIndex]: value };
    setBlankAnswers(newAnswers);

    const question = currentSegment.content.question;
    const totalBlanks = (question.text.match(/_____/g) || []).length;
    const filledBlanks = Object.keys(newAnswers).filter(
      (key) => newAnswers[parseInt(key)].trim() !== ""
    ).length;

    if (filledBlanks === totalBlanks) {
      setBlanksCompleted(true);
      setTimeout(checkBlankAnswers, 1000);
    }
  };

  const checkBlankAnswers = () => {
    const question = currentSegment.content.question;
    const correctAnswers = question.correctAnswer?.split(",") || [];
    let allCorrect = true;

    correctAnswers.forEach((answer: string, index: number) => {
      const userAnswer = blankAnswers[index]?.toLowerCase().trim();
      const correctAnswer = answer.toLowerCase().trim();
      if (userAnswer !== correctAnswer) {
        allCorrect = false;
      }
    });

    setIsCorrect(allCorrect);
    setShowResult(true);
    setAttempts(attempts + 1);

    if (!allCorrect && hearts > 0) {
      setHearts(hearts - 1);
    }

    setTimeout(() => {
      if (allCorrect) {
        const basePoints = currentSegment.basePoints;
        const bonusPoints =
          attempts === 0 ? currentSegment.bonusPoints || 0 : 0;
        const totalPoints = basePoints + bonusPoints;

        setCelebrationPoints(basePoints);
        setCelebrationBonus(bonusPoints > 0 ? bonusPoints : undefined);
        setCelebrationType(bonusPoints > 0 ? "bonus" : "correct");
        setShowCelebration(true);
        setXp(xp + totalPoints);

        setTimeout(() => {
          completeSegment();
        }, 3000);
      } else {
        setTimeout(() => {
          setShowResult(false);
          setBlanksCompleted(false);
        }, 2000);
      }
    }, 1500);
  };

  const renderFillInBlanks = () => {
    const question = currentSegment.content.question;
    const parts = question.text.split("_____");
    const elements: JSX.Element[] = [];

    parts.forEach((part: string, index: number) => {
      elements.push(<span key={`text-${index}`}>{part}</span>);

      if (index < parts.length - 1) {
        elements.push(
          <input
            key={`blank-${index}`}
            type="text"
            value={blankAnswers[index] || ""}
            onChange={(e) => handleBlankAnswer(index, e.target.value)}
            disabled={showResult}
            className={`mx-2 px-2 sm:px-3 py-1 sm:py-2 border-2 border-dashed rounded-lg bg-blue-50 text-slate-800 text-center min-w-24 sm:min-w-32 font-bold transition-all text-sm sm:text-base ${
              showResult
                ? blankAnswers[index]?.toLowerCase().trim() ===
                  question.correctAnswer
                    ?.split(",")
                    [index]?.toLowerCase()
                    .trim()
                  ? "border-green-500 bg-green-100 ring-2 ring-green-400/20"
                  : "border-red-500 bg-red-100 ring-2 ring-red-400/20"
                : "border-blue-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:border-blue-600"
            }`}
            placeholder="?"
          />
        );
      }
    });

    return elements;
  };

  const completeSegment = async () => {
    try {
      await childCourseApi.updateSegmentProgress(courseId, currentSegment.id, {
        isCompleted: true,
        pointsEarned:
          currentSegment.basePoints +
          (attempts === 0 ? currentSegment.bonusPoints || 0 : 0),
        interactionData: getInteractionData(),
      });

      if (currentSegmentIndex < currentPath.segments.length - 1) {
        setCurrentSegmentIndex(currentSegmentIndex + 1);
        resetSegmentState();
      } else {
        setTimeout(() => {
          alert(
            "🎉 Amazing! You've completed this learning path! Ready for the next adventure?"
          );
          router.push(`/child/courses/${courseId}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const getInteractionData = () => {
    switch (currentSegment.type) {
      case "dialogue":
        return {
          dialogue: {
            listenedFully: dialogueCompleted,
            interactions: 1,
          },
        };
      case "question":
        return {
          question: {
            answer: selectedAnswer || blankAnswers,
            isCorrect: isCorrect,
            attempts: attempts,
          },
        };
      case "instruction":
        return {
          instruction: {
            readFully: instructionRead,
            timeSpent: Date.now(),
          },
        };
      case "practice":
        return {
          practice: {
            completed: practiceCompleted,
            interactions: Object.keys(draggedItems).length,
            details: draggedItems,
          },
        };
      default:
        return {};
    }
  };

  const resetSegmentState = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setAttempts(0);
    setDialogueCompleted(false);
    setCurrentDialogueIndex(-1);
    setAllDialogueMessages([]);
    setVisibleMessageCount(0);
    setInstructionRead(false);
    setIsPlayingDialogue(false);
    setDraggedItems({});
    setPracticeCompleted(false);
    setBlankAnswers({});
    setBlanksCompleted(false);
  };

  const handleDragDrop = (item: string, target: string) => {
    setDraggedItems((prev) => ({
      ...prev,
      [target]: item,
    }));

    const practice = currentSegment.content.practice;
    const allTargetsFilled = practice.components.targets.every(
      (target: string) => draggedItems[target] || target === item
    );

    if (allTargetsFilled) {
      setPracticeCompleted(true);
      setTimeout(() => {
        setCelebrationPoints(currentSegment.basePoints);
        setCelebrationType("complete");
        setShowCelebration(true);
        setXp(xp + currentSegment.basePoints);
        setTimeout(completeSegment, 3000);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 text-xl sm:text-2xl font-bold">
            Loading your adventure...
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            <span className="text-slate-600 text-sm sm:text-base">
              Preparing something amazing!
            </span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentPath || !currentSegment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl sm:text-6xl mb-4">😕</div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
            Oops! Adventure not found
          </h2>
          <button
            onClick={() => router.push(`/child/courses/${courseId}`)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const progress =
    ((currentSegmentIndex + 1) / currentPath.segments.length) * 100;
  const sessionTime = Math.floor((currentTime - sessionStartTime) / 1000);
  const minutes = Math.floor(sessionTime / 60);
  const seconds = sessionTime % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 text-slate-800">
      {/* Enhanced Header with Gamification */}
      <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm p-3 sm:p-4 border-b border-blue-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(`/child/courses/${courseId}`)}
            className="p-2 sm:p-3 hover:bg-white/60 rounded-full transition-all duration-300 group hover:rotate-90 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />
          </button>

          {/* Enhanced Progress Section */}
          <div className="flex-1 mx-2 sm:mx-6">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
              <ProgressRing progress={progress} size={40} />
              <div className="text-center">
                <div className="bg-white/60 rounded-full h-3 sm:h-4 w-32 sm:w-48 overflow-hidden border border-blue-200 shadow-sm">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Level {currentSegmentIndex + 1} of{" "}
                  {currentPath.segments.length}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 bg-red-100 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-red-300 shadow-sm">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="font-bold text-red-600 text-sm sm:text-base">
                {hearts}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-orange-100 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-orange-300 shadow-sm">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="font-bold text-orange-600 text-sm sm:text-base">
                {streak}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-amber-100 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-amber-300 shadow-sm">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              <span className="font-bold text-amber-700 text-sm sm:text-base">
                {xp.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-blue-100 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-blue-300 shadow-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <span className="font-mono text-blue-600 text-xs sm:text-sm">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto p-4 sm:p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 text-slate-800 shadow-xl border border-blue-200 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/5 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-20 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-500/5 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/4 w-12 h-12 sm:w-16 sm:h-16 bg-sky-400/5 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Enhanced Progressive Dialogue Segment */}
          {currentSegment.type === "dialogue" && (
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-blue-300 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    Interactive Conversation
                  </h3>
                  <div className="bg-blue-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                    <span className="text-xs sm:text-sm font-semibold text-blue-700">
                      {visibleMessageCount}/{allDialogueMessages.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Dialogue Messages Container with Auto-scroll */}
              <div
                ref={dialogueContainerRef}
                className="max-h-80 sm:max-h-96 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50/80 to-blue-50/80 rounded-2xl border border-slate-200 backdrop-blur-sm relative shadow-inner"
              >
                {/* Dialogue progress indicator */}
                <div className="sticky top-0 bg-gradient-to-r from-transparent via-slate-50/90 to-transparent p-2 mb-4 z-10">
                  <div className="flex justify-center">
                    <div className="flex gap-1 sm:gap-2">
                      {allDialogueMessages.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-500 ${
                            index < visibleMessageCount
                              ? "bg-blue-500 scale-125"
                              : index === visibleMessageCount
                              ? "bg-amber-500 animate-pulse scale-110"
                              : "bg-slate-300 scale-75"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {allDialogueMessages.map((message, index) => (
                  <DialogueMessage
                    key={index}
                    message={message.text}
                    character={message.character}
                    position={message.position}
                    isVisible={index < visibleMessageCount}
                    isActive={index === currentDialogueIndex}
                    messageIndex={index}
                    onComplete={() => {
                      // Animation complete callback
                    }}
                  />
                ))}

                {/* Empty state when no messages visible */}
                {visibleMessageCount === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-3xl sm:text-4xl mb-4 animate-pulse">
                      💭
                    </div>
                    <p className="text-slate-500 text-base sm:text-lg">
                      Ready to start the conversation?
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Controls */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={playDialogue}
                  disabled={isPlayingDialogue}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 transition-all shadow-lg border border-blue-400/30 relative overflow-hidden group"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>

                  {isPlayingDialogue ? (
                    <>
                      <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                      <span className="text-sm sm:text-base">
                        Playing... ({visibleMessageCount}/
                        {allDialogueMessages.length})
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-sm sm:text-base">
                        {visibleMessageCount === 0
                          ? "Start Conversation"
                          : "Continue Conversation"}
                      </span>
                    </>
                  )}
                </button>

                {dialogueCompleted && (
                  <button
                    onClick={completeSegment}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 transition-all shadow-lg border border-green-400/30 relative overflow-hidden group animate-pulse"
                  >
                    <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">
                      Complete & Continue
                    </span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Fill in the Blanks Question */}
          {currentSegment.type === "question" &&
            currentSegment.content.question.type === "fill-blank" && (
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-amber-300 shadow-sm mb-4">
                    <div className="text-2xl sm:text-4xl animate-bounce">
                      ✏️
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-amber-600">
                      Fill in the Blanks!
                    </h3>
                    <div className="bg-amber-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-700 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-center border border-amber-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-pulse"></div>
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-amber-800 relative z-10">
                    {renderFillInBlanks()}
                  </p>
                </div>

                {showResult && (
                  <div
                    className={`text-center p-4 sm:p-6 lg:p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden shadow-lg ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-400"
                        : "bg-gradient-to-br from-red-50/80 to-pink-50/80 border-red-400"
                    }`}
                  >
                    <div className="text-4xl sm:text-6xl lg:text-8xl mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Perfect!" : "Not quite right!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                        <p className="text-blue-600 text-lg sm:text-xl lg:text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-amber-600 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-50/80 rounded-xl p-3 sm:p-4 mt-4 border border-blue-200 backdrop-blur-sm shadow-inner">
                        <p className="text-blue-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                          {currentSegment.content.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Enhanced True/False Question */}
          {currentSegment.type === "question" &&
            currentSegment.content.question.type === "true-false" && (
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-amber-300 shadow-sm mb-4">
                    <div className="text-2xl sm:text-4xl animate-bounce">
                      🤔
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-amber-600">
                      True or False?
                    </h3>
                    <div className="bg-amber-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-amber-700 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-center border border-amber-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-pulse"></div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-800 leading-relaxed relative z-10">
                    {currentSegment.content.question.text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {[
                    { id: "true", label: "TRUE", emoji: "✅", color: "green" },
                    { id: "false", label: "FALSE", emoji: "❌", color: "red" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showResult}
                      className={`
                        p-4 sm:p-6 lg:p-8 rounded-2xl border-3 font-bold text-lg sm:text-xl lg:text-2xl transition-all transform hover:scale-105 shadow-lg backdrop-blur-sm relative overflow-hidden group
                        ${
                          selectedAnswer === option.id
                            ? showResult
                              ? currentSegment.content.question
                                  .correctAnswer === option.id
                                ? "border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 text-green-700 shadow-green-200 ring-2 ring-green-400/30"
                                : "border-red-500 bg-gradient-to-br from-red-50/80 to-pink-50/80 text-red-700 shadow-red-200 ring-2 ring-red-400/30"
                              : "border-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 text-blue-700 shadow-blue-200 ring-2 ring-blue-400/30"
                            : showResult &&
                              currentSegment.content.question.correctAnswer ===
                                option.id
                            ? "border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 text-green-700 shadow-green-200 ring-2 ring-green-400/30"
                            : `border-slate-300 bg-gradient-to-br from-slate-50/80 to-slate-100/80 hover:border-${option.color}-400 hover:bg-gradient-to-br hover:from-${option.color}-50/30 hover:to-${option.color}-100/30 text-slate-700 hover:text-${option.color}-700 shadow-slate-200`
                        }
                      `}
                    >
                      <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-700"></div>
                      <div className="flex flex-col items-center gap-2 sm:gap-3 relative z-10">
                        <div className="text-3xl sm:text-4xl lg:text-5xl transform group-hover:scale-110 transition-transform">
                          {option.emoji}
                        </div>
                        <span>{option.label}</span>
                        {showResult && selectedAnswer === option.id && (
                          <div className="mt-2 animate-bounce">
                            {currentSegment.content.question.correctAnswer ===
                            option.id ? (
                              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {showResult && (
                  <div
                    className={`text-center p-4 sm:p-6 lg:p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden shadow-lg ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-400"
                        : "bg-gradient-to-br from-red-50/80 to-pink-50/80 border-red-400"
                    }`}
                  >
                    <div className="text-4xl sm:text-6xl lg:text-8xl mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Excellent!" : "Try again!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                        <p className="text-blue-600 text-lg sm:text-xl lg:text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-amber-600 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-50/80 rounded-xl p-3 sm:p-4 mt-4 border border-blue-200 backdrop-blur-sm shadow-inner">
                        <p className="text-blue-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                          {currentSegment.content.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Enhanced Multiple Choice Question */}
          {currentSegment.type === "question" &&
            currentSegment.content.question.type === "multiple-choice" && (
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-amber-300 shadow-sm mb-4">
                    <div className="text-2xl sm:text-4xl animate-bounce">
                      🎯
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-amber-600">
                      Choose the Best Answer!
                    </h3>
                    <div className="bg-amber-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-700 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-center border border-amber-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-pulse"></div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-800 leading-relaxed relative z-10">
                    {currentSegment.content.question.text}
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {currentSegment.content.question.options?.map(
                    (option: any, index: number) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option.id)}
                        disabled={showResult}
                        className={`
                        p-4 sm:p-6 rounded-2xl border-3 text-left font-semibold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-[1.02] shadow-lg backdrop-blur-sm relative overflow-hidden group
                        ${
                          selectedAnswer === option.id
                            ? showResult
                              ? option.isCorrect
                                ? "border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 text-green-700 shadow-green-200 ring-2 ring-green-400/20"
                                : "border-red-500 bg-gradient-to-br from-red-50/80 to-pink-50/80 text-red-700 shadow-red-200 ring-2 ring-red-400/20"
                              : "border-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 text-blue-700 shadow-blue-200 ring-2 ring-blue-400/20"
                            : showResult && option.isCorrect
                            ? "border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 text-green-700 shadow-green-200 ring-2 ring-green-400/20"
                            : "border-slate-300 bg-gradient-to-br from-slate-50/80 to-slate-100/80 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-indigo-50/30 text-slate-700 hover:text-blue-700 shadow-slate-200"
                        }
                      `}
                      >
                        <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/10 transition-transform duration-700"></div>
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-current/20 flex items-center justify-center text-xs sm:text-sm font-bold">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option.text}</span>
                          </div>
                          {showResult && selectedAnswer === option.id && (
                            <div className="flex-shrink-0 animate-bounce">
                              {option.isCorrect ? (
                                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                              ) : (
                                <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>

                {showResult && (
                  <div
                    className={`text-center p-4 sm:p-6 lg:p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden shadow-lg ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-400"
                        : "bg-gradient-to-br from-red-50/80 to-pink-50/80 border-red-400"
                    }`}
                  >
                    <div className="text-4xl sm:text-6xl lg:text-8xl mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Fantastic!" : "Not quite right!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                        <p className="text-blue-600 text-lg sm:text-xl lg:text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-amber-600 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-50/80 rounded-xl p-3 sm:p-4 mt-4 border border-blue-200 backdrop-blur-sm shadow-inner">
                        <p className="text-blue-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                          {currentSegment.content.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Enhanced Instruction Segment */}
          {currentSegment.type === "instruction" && (
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-indigo-300 shadow-sm mb-4">
                  <div className="text-2xl sm:text-4xl animate-bounce">📚</div>
                  <h3 className="text-lg sm:text-2xl font-bold text-indigo-600">
                    Learning Time!
                  </h3>
                  <div className="bg-indigo-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-700 inline" />
                  </div>
                </div>
              </div>

              {currentSegment.content.instruction.mediaUrl && (
                <div className="text-center mb-4 sm:mb-6">
                  <img
                    src={currentSegment.content.instruction.mediaUrl}
                    alt="Learning Material"
                    className="max-w-xs sm:max-w-md mx-auto rounded-2xl shadow-lg border border-indigo-200 hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-indigo-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 to-transparent animate-pulse"></div>
                <p className="text-lg sm:text-xl leading-relaxed text-center relative z-10 text-indigo-800">
                  {currentSegment.content.instruction.text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() =>
                    speakText(currentSegment.content.instruction.text)
                  }
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg border border-indigo-400/30 transition-all hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10 text-sm sm:text-base">
                    Read Aloud
                  </span>
                </button>

                <button
                  onClick={() => {
                    setInstructionRead(true);
                    setCelebrationPoints(currentSegment.basePoints);
                    setCelebrationType("complete");
                    setShowCelebration(true);
                    setXp(xp + currentSegment.basePoints);
                    setTimeout(completeSegment, 3000);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all border border-green-400/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <span className="relative z-10 text-sm sm:text-base">
                    Got it!
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Practice Segment - Drag and Drop */}
          {currentSegment.type === "practice" &&
            currentSegment.content.practice.type === "drag-drop" && (
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-green-300 shadow-sm mb-4">
                    <div className="text-2xl sm:text-4xl animate-bounce">
                      🎮
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-green-600">
                      Practice Time!
                    </h3>
                    <div className="bg-green-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-700 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-center border border-green-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/20 to-transparent animate-pulse"></div>
                  <p className="text-lg sm:text-xl font-bold text-green-700 relative z-10">
                    {currentSegment.content.practice.instructions}
                  </p>
                </div>

                {/* Draggable Items */}
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-bold text-indigo-600 mb-3 sm:mb-4 text-center">
                    Available Items:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {currentSegment.content.practice.components.items.map(
                      (item: string, index: number) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("text/plain", item)
                          }
                          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-mono font-bold cursor-grab active:cursor-grabbing hover:scale-105 transition-all shadow-lg border border-indigo-400/30 relative overflow-hidden group text-sm sm:text-base"
                        >
                          <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-700"></div>
                          <span className="relative z-10">{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Drop Targets */}
                <div className="grid gap-3 sm:gap-4">
                  {currentSegment.content.practice.components.targets.map(
                    (target: string, index: number) => (
                      <div
                        key={index}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const item = e.dataTransfer.getData("text/plain");
                          handleDragDrop(item, target);
                        }}
                        className={`
                          border-3 border-dashed p-4 sm:p-6 rounded-2xl text-center transition-all min-h-16 sm:min-h-20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden
                          ${
                            draggedItems[target]
                              ? "border-green-500 bg-gradient-to-br from-green-50/60 to-emerald-50/60 text-green-700 shadow-lg shadow-green-200/50"
                              : "border-slate-400 bg-gradient-to-br from-slate-50/60 to-slate-100/60 text-slate-600 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50/40 hover:to-blue-50/40 hover:text-indigo-700"
                          }
                        `}
                      >
                        <div>
                          <p className="font-bold text-sm sm:text-base lg:text-lg mb-2">
                            {target}
                          </p>
                          {draggedItems[target] && (
                            <div className="bg-indigo-500 text-white px-2 sm:px-3 py-1 rounded-lg font-mono font-bold animate-pulse text-sm">
                              {draggedItems[target]}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {practiceCompleted && (
                  <div className="text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-2xl border-2 border-green-400 backdrop-blur-sm relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/20 to-transparent animate-pulse"></div>
                    <div className="text-4xl sm:text-6xl lg:text-8xl mb-4 animate-bounce">
                      🏆
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-4">
                      Perfect Match!
                    </h3>
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                      <p className="text-blue-600 text-lg sm:text-xl lg:text-2xl font-bold">
                        +{currentSegment.basePoints} XP
                      </p>
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Enhanced Review Segment */}
          {currentSegment.type === "review" && (
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-indigo-300 shadow-sm mb-4">
                  <div className="text-2xl sm:text-4xl animate-bounce">📝</div>
                  <h3 className="text-lg sm:text-2xl font-bold text-indigo-600">
                    Review Time!
                  </h3>
                  <div className="bg-indigo-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-700 inline" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl p-4 sm:p-6 lg:p-8 text-center border border-indigo-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 to-transparent animate-pulse"></div>
                <h4 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-4 relative z-10">
                  Let's Review What You've Learned!
                </h4>
                <p className="text-base sm:text-lg text-indigo-600 leading-relaxed relative z-10">
                  Take a moment to think about the concepts we've covered. This
                  helps strengthen your understanding!
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setCelebrationPoints(currentSegment.basePoints);
                    setCelebrationType("complete");
                    setShowCelebration(true);
                    setXp(xp + currentSegment.basePoints);
                    setTimeout(completeSegment, 3000);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold flex items-center gap-2 sm:gap-3 mx-auto transform hover:scale-105 transition-all shadow-lg border border-indigo-400/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                  <span className="relative z-10 text-sm sm:text-base">
                    Complete Review
                  </span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Segment Navigation */}
          <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-indigo-200 relative z-10">
            <div className="flex justify-between items-center text-xs sm:text-sm text-indigo-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>
                  Level {currentSegmentIndex + 1} of{" "}
                  {currentPath.segments.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="capitalize">
                  {currentSegment.type.charAt(0).toUpperCase() +
                    currentSegment.type.slice(1)}{" "}
                  Challenge
                </span>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Mini progress indicators */}
            <div className="flex justify-center gap-1 mt-3 sm:mt-4">
              {currentPath.segments.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-0.5 sm:w-3 sm:h-1 rounded-full transition-all duration-500 ${
                    index < currentSegmentIndex
                      ? "bg-green-500"
                      : index === currentSegmentIndex
                      ? "bg-amber-500 animate-pulse"
                      : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Celebration Popup */}
      <CelebrationPopup
        show={showCelebration}
        type={celebrationType}
        points={celebrationPoints}
        bonus={celebrationBonus}
        onClose={() => {
          setShowCelebration(false);
          setCelebrationBonus(undefined);
        }}
      />

      {/* Enhanced Hearts Warning */}
      {hearts <= 2 && hearts > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 bg-gradient-to-r from-red-100/95 to-pink-100/95 backdrop-blur-sm text-red-700 p-3 sm:p-4 rounded-2xl shadow-lg animate-pulse border border-red-300 max-w-xs">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
            <span className="font-bold text-sm sm:text-base">
              Only {hearts} hearts left! Be careful!
            </span>
            <div className="ml-2 flex gap-1">
              {[...Array(hearts)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hearts Depleted Modal */}
      {hearts === 0 && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center max-w-sm w-full shadow-2xl border-4 border-red-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-pink-50/50 animate-pulse"></div>
            <div className="text-4xl sm:text-6xl mb-4 animate-bounce relative z-10">
              💔
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 relative z-10">
              Out of Hearts!
            </h3>
            <p className="text-slate-600 mb-6 relative z-10 text-sm sm:text-base">
              Don't worry! You can try again or take a break and come back
              later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <button
                onClick={() => {
                  setHearts(5);
                  setAttempts(0);
                  setShowResult(false);
                  setSelectedAnswer(null);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transform hover:scale-105 transition-all shadow-lg text-sm sm:text-base"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Try Again
              </button>
              <button
                onClick={() => router.push(`/child/courses/${courseId}`)}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transform hover:scale-105 transition-all shadow-lg text-sm sm:text-base"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Exit Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Achievement Streak Indicator */}
      {streak > 10 && (
        <div className="fixed top-16 sm:top-20 right-4 sm:right-6 bg-gradient-to-r from-orange-100/95 to-amber-100/95 backdrop-blur-sm text-orange-700 p-2 sm:p-3 rounded-2xl shadow-lg border border-orange-300 animate-pulse max-w-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            <span className="font-bold text-xs sm:text-sm">
              {streak} Day Streak! 🔥
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const LearningPage = () => {
  const { courseId, learningPath } = useParams();

  return (
    <LearningSegmentPage
      courseId={courseId as string}
      pathId={learningPath as string}
    />
  );
};

export default LearningPage;
