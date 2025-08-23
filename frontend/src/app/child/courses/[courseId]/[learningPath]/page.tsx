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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 text-center animate-bounce shadow-2xl border-4 border-yellow-400">
        <div className="text-6xl mb-4 animate-pulse">
          {type === "correct" && "🎉"}
          {type === "bonus" && "⭐"}
          {type === "complete" && "🏆"}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {type === "correct" && "Awesome Achievement!"}
          {type === "bonus" && "Bonus Points Unlocked!"}
          {type === "complete" && "Level Complete!"}
        </h3>
        <p className="text-green-600 text-xl font-bold animate-pulse">
          +{points} XP {bonus && `(+${bonus} bonus!)`}
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-4 h-4 text-yellow-400 fill-current animate-bounce"
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
      {isTyping && <span className="animate-pulse text-blue-400">|</span>}
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
      className={`flex items-start gap-4 mb-6 transition-all duration-500 transform ${
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
              className={`w-16 h-16 rounded-full border-3 transition-all duration-300 ${
                isActive
                  ? "border-blue-400 scale-110 shadow-lg shadow-blue-400/30 ring-4 ring-blue-400/20"
                  : "border-gray-400"
              }`}
            />
            {isActive && (
              <>
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 animate-pulse">
                  <Volume2 className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-center text-blue-300 mt-2 font-semibold">
            {character?.name || "Character"}
          </p>
        </div>
      )}

      <div
        className={`max-w-lg p-4 rounded-2xl relative transition-all duration-300 ${
          isLeft
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tl-sm"
            : isCenter
            ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg"
            : "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm"
        } ${
          isActive
            ? "shadow-xl transform scale-105 border border-white/20 ring-2 ring-white/10"
            : "shadow-lg"
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
          } bg-yellow-400 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}
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
          stroke="rgb(31 41 55)"
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
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-yellow-400">
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
            className={`mx-2 px-3 py-2 border-2 border-dashed rounded-lg bg-gray-800 text-white text-center min-w-32 font-bold transition-all ${
              showResult
                ? blankAnswers[index]?.toLowerCase().trim() ===
                  question.correctAnswer
                    ?.split(",")
                    [index]?.toLowerCase()
                    .trim()
                  ? "border-green-400 bg-green-900/30 ring-2 ring-green-400/20"
                  : "border-red-400 bg-red-900/30 ring-2 ring-red-400/20"
                : "border-blue-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:border-blue-300"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-2xl font-bold">
            Loading your adventure...
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-blue-200">Preparing something amazing!</span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentPath || !currentSegment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Oops! Adventure not found
          </h2>
          <button
            onClick={() => router.push(`/child/courses/${courseId}`)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
          >
            <Home className="w-5 h-5 inline mr-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Enhanced Header with Gamification */}
      <div className="bg-gradient-to-r from-purple-800/60 to-blue-800/60 backdrop-blur-sm p-4 border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push(`/child/courses/${courseId}`)}
            className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 group hover:rotate-90"
          >
            <X className="w-6 h-6 transition-transform" />
          </button>

          {/* Enhanced Progress Section */}
          <div className="flex-1 mx-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <ProgressRing progress={progress} size={50} />
              <div className="text-center">
                <div className="bg-black/20 rounded-full h-4 w-48 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-700 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Level {currentSegmentIndex + 1} of{" "}
                  {currentPath.segments.length}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-red-400/30">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-bold text-red-200">{hearts}</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-orange-400/30">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-orange-200">{streak}</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-yellow-400/30">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-200">
                {xp.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-blue-400/30">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-blue-200 text-sm">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full -px-[4rem] mx-auto p-6">
        <div className="bg-black/80 backdrop-blur-sm rounded-3xl p-8 text-white shadow-2xl border border-purple-500/30 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-400/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Enhanced Progressive Dialogue Segment */}
          {currentSegment.type === "dialogue" && (
            <div className="space-y-6 relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-6 py-3 border border-blue-400/30">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-400 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Interactive Conversation
                  </h3>
                  <div className="bg-blue-400/20 rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-blue-300">
                      {visibleMessageCount}/{allDialogueMessages.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Dialogue Messages Container with Auto-scroll */}
              <div
                ref={dialogueContainerRef}
                className="max-h-96 overflow-y-auto p-6 bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-2xl border border-gray-600/30 backdrop-blur-sm relative"
              >
                {/* Dialogue progress indicator */}
                <div className="sticky top-0 bg-gradient-to-r from-transparent via-gray-900/80 to-transparent p-2 mb-4 z-10">
                  <div className="flex justify-center">
                    <div className="flex gap-2">
                      {allDialogueMessages.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-500 ${
                            index < visibleMessageCount
                              ? "bg-blue-400 scale-125"
                              : index === visibleMessageCount
                              ? "bg-yellow-400 animate-pulse scale-110"
                              : "bg-gray-600 scale-75"
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
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4 animate-pulse">💭</div>
                    <p className="text-gray-400 text-lg">
                      Ready to start the conversation?
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Controls */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={playDialogue}
                  disabled={isPlayingDialogue}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 transform hover:scale-105 transition-all shadow-lg border border-blue-400/30 relative overflow-hidden group"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>

                  {isPlayingDialogue ? (
                    <>
                      <Volume2 className="w-6 h-6 animate-pulse" />
                      <span>
                        Playing... ({visibleMessageCount}/
                        {allDialogueMessages.length})
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>
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
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 transform hover:scale-105 transition-all shadow-lg border border-green-400/30 relative overflow-hidden group animate-pulse"
                  >
                    <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                    <Trophy className="w-6 h-6" />
                    Complete & Continue
                    <ArrowRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Fill in the Blanks Question */}
          {currentSegment.type === "question" &&
            currentSegment.content.question.type === "fill-blank" && (
              <div className="space-y-6 relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-6 py-3 border border-yellow-400/30 mb-4">
                    <div className="text-4xl animate-bounce">✏️</div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      Fill in the Blanks!
                    </h3>
                    <div className="bg-yellow-400/20 rounded-full px-3 py-1">
                      <Award className="w-4 h-4 text-yellow-300 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-2xl p-8 mb-8 text-center border border-yellow-500/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse"></div>
                  <p className="text-2xl leading-relaxed text-yellow-200 relative z-10">
                    {renderFillInBlanks()}
                  </p>
                </div>

                {showResult && (
                  <div
                    className={`text-center p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-900/60 to-emerald-900/60 border-green-400"
                        : "bg-gradient-to-br from-red-900/60 to-pink-900/60 border-red-400"
                    }`}
                  >
                    <div className="text-8xl mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-3xl font-bold mb-4 ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "Perfect!" : "Not quite right!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <p className="text-yellow-400 text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-orange-400 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-900/40 rounded-xl p-4 mt-4 border border-blue-500/50 backdrop-blur-sm">
                        <p className="text-blue-200 text-lg leading-relaxed">
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
              <div className="space-y-6 relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-6 py-3 border border-yellow-400/30 mb-4">
                    <div className="text-4xl animate-bounce">🤔</div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      True or False?
                    </h3>
                    <div className="bg-yellow-400/20 rounded-full px-3 py-1">
                      <Target className="w-4 h-4 text-yellow-300 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-2xl p-8 mb-8 text-center border border-yellow-500/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse"></div>
                  <p className="text-2xl font-bold text-yellow-200 leading-relaxed relative z-10">
                    {currentSegment.content.question.text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { id: "true", label: "TRUE", emoji: "✅", color: "green" },
                    { id: "false", label: "FALSE", emoji: "❌", color: "red" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showResult}
                      className={`
                        p-8 rounded-2xl border-3 font-bold text-2xl transition-all transform hover:scale-105 shadow-lg backdrop-blur-sm relative overflow-hidden group
                        ${
                          selectedAnswer === option.id
                            ? showResult
                              ? currentSegment.content.question
                                  .correctAnswer === option.id
                                ? "border-green-400 bg-gradient-to-br from-green-900/60 to-emerald-900/60 text-green-200 shadow-green-500/50 ring-2 ring-green-400/30"
                                : "border-red-400 bg-gradient-to-br from-red-900/60 to-pink-900/60 text-red-200 shadow-red-500/50 ring-2 ring-red-400/30"
                              : "border-blue-400 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 text-blue-200 shadow-blue-500/50 ring-2 ring-blue-400/30"
                            : showResult &&
                              currentSegment.content.question.correctAnswer ===
                                option.id
                            ? "border-green-400 bg-gradient-to-br from-green-900/60 to-emerald-900/60 text-green-200 shadow-green-500/50 ring-2 ring-green-400/30"
                            : `border-gray-600 bg-gradient-to-br from-gray-800/60 to-gray-900/60 hover:border-${option.color}-400 hover:bg-gradient-to-br hover:from-${option.color}-900/30 hover:to-${option.color}-800/30 text-gray-200 hover:text-${option.color}-200`
                        }
                      `}
                    >
                      <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/10 transition-transform duration-700"></div>
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="text-5xl transform group-hover:scale-110 transition-transform">
                          {option.emoji}
                        </div>
                        <span>{option.label}</span>
                        {showResult && selectedAnswer === option.id && (
                          <div className="mt-2 animate-bounce">
                            {currentSegment.content.question.correctAnswer ===
                            option.id ? (
                              <Check className="w-8 h-8 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-8 h-8 text-red-400 mx-auto" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {showResult && (
                  <div
                    className={`text-center p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-900/60 to-emerald-900/60 border-green-400"
                        : "bg-gradient-to-br from-red-900/60 to-pink-900/60 border-red-400"
                    }`}
                  >
                    <div className="text-8xl mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-3xl font-bold mb-4 ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "Excellent!" : "Try again!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <p className="text-yellow-400 text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-orange-400 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-900/40 rounded-xl p-4 mt-4 border border-blue-500/50 backdrop-blur-sm">
                        <p className="text-blue-200 text-lg leading-relaxed">
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
              <div className="space-y-6 relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-6 py-3 border border-yellow-400/30 mb-4">
                    <div className="text-4xl animate-bounce">🎯</div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      Choose the Best Answer!
                    </h3>
                    <div className="bg-yellow-400/20 rounded-full px-3 py-1">
                      <Trophy className="w-4 h-4 text-yellow-300 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-2xl p-6 mb-8 text-center border border-yellow-500/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse"></div>
                  <p className="text-2xl font-bold text-yellow-200 leading-relaxed relative z-10">
                    {currentSegment.content.question.text}
                  </p>
                </div>

                <div className="grid gap-4 mb-8">
                  {currentSegment.content.question.options?.map(
                    (option: any, index: number) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option.id)}
                        disabled={showResult}
                        className={`
                        p-6 rounded-2xl border-3 text-left font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg backdrop-blur-sm relative overflow-hidden group
                        ${
                          selectedAnswer === option.id
                            ? showResult
                              ? option.isCorrect
                                ? "border-green-400 bg-gradient-to-br from-green-900/60 to-emerald-900/60 text-green-200 shadow-green-500/50 ring-2 ring-green-400/20"
                                : "border-red-400 bg-gradient-to-br from-red-900/60 to-pink-900/60 text-red-200 shadow-red-500/50 ring-2 ring-red-400/20"
                              : "border-blue-400 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 text-blue-200 shadow-blue-500/50 ring-2 ring-blue-400/20"
                            : showResult && option.isCorrect
                            ? "border-green-400 bg-gradient-to-br from-green-900/60 to-emerald-900/60 text-green-200 shadow-green-500/50 ring-2 ring-green-400/20"
                            : "border-gray-600 bg-gradient-to-br from-gray-800/60 to-gray-900/60 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-900/30 hover:to-indigo-900/30 text-gray-200 hover:text-blue-200"
                        }
                      `}
                      >
                        <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/5 transition-transform duration-700"></div>
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option.text}</span>
                          </div>
                          {showResult && selectedAnswer === option.id && (
                            <div className="flex-shrink-0 animate-bounce">
                              {option.isCorrect ? (
                                <Check className="w-8 h-8 text-green-400" />
                              ) : (
                                <X className="w-8 h-8 text-red-400" />
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
                    className={`text-center p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-900/60 to-emerald-900/60 border-green-400"
                        : "bg-gradient-to-br from-red-900/60 to-pink-900/60 border-red-400"
                    }`}
                  >
                    <div className="text-8xl mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-3xl font-bold mb-4 ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "Fantastic!" : "Not quite right!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <p className="text-yellow-400 text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-orange-400 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-900/40 rounded-xl p-4 mt-4 border border-blue-500/50 backdrop-blur-sm">
                        <p className="text-blue-200 text-lg leading-relaxed">
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
            <div className="space-y-6 relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full px-6 py-3 border border-purple-400/30 mb-4">
                  <div className="text-4xl animate-bounce">📚</div>
                  <h3 className="text-2xl font-bold text-purple-400">
                    Learning Time!
                  </h3>
                  <div className="bg-purple-400/20 rounded-full px-3 py-1">
                    <Sparkles className="w-4 h-4 text-purple-300 inline" />
                  </div>
                </div>
              </div>

              {currentSegment.content.instruction.mediaUrl && (
                <div className="text-center mb-6">
                  <img
                    src={currentSegment.content.instruction.mediaUrl}
                    alt="Learning Material"
                    className="max-w-md mx-auto rounded-2xl shadow-lg border border-purple-400/30 hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-8 mb-8 border border-purple-500/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent animate-pulse"></div>
                <p className="text-xl leading-relaxed text-center relative z-10">
                  {currentSegment.content.instruction.text}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() =>
                    speakText(currentSegment.content.instruction.text)
                  }
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg border border-purple-400/30 transition-all hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <Volume2 className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Read Aloud</span>
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all border border-green-400/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <span className="relative z-10">Got it!</span>
                  <ArrowRight className="w-5 h-5 relative z-10" />
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Practice Segment - Drag and Drop */}
          {currentSegment.type === "practice" &&
            currentSegment.content.practice.type === "drag-drop" && (
              <div className="space-y-6 relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full px-6 py-3 border border-green-400/30 mb-4">
                    <div className="text-4xl animate-bounce">🎮</div>
                    <h3 className="text-2xl font-bold text-green-400">
                      Practice Time!
                    </h3>
                    <div className="bg-green-400/20 rounded-full px-3 py-1">
                      <Target className="w-4 h-4 text-green-300 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl p-6 mb-8 text-center border border-green-500/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent animate-pulse"></div>
                  <p className="text-xl font-bold text-green-200 relative z-10">
                    {currentSegment.content.practice.instructions}
                  </p>
                </div>

                {/* Draggable Items */}
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-purple-400 mb-4 text-center">
                    Available Items:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {currentSegment.content.practice.components.items.map(
                      (item: string, index: number) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("text/plain", item)
                          }
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-mono font-bold cursor-grab active:cursor-grabbing hover:scale-105 transition-all shadow-lg border border-purple-400/30 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-700"></div>
                          <span className="relative z-10">{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Drop Targets */}
                <div className="grid gap-4">
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
                          border-3 border-dashed p-6 rounded-2xl text-center transition-all min-h-20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden
                          ${
                            draggedItems[target]
                              ? "border-green-400 bg-gradient-to-br from-green-900/40 to-emerald-900/40 text-green-200 shadow-lg shadow-green-500/20"
                              : "border-gray-600 bg-gradient-to-br from-gray-800/40 to-gray-900/40 text-gray-400 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-blue-900/20 hover:text-purple-300"
                          }
                        `}
                      >
                        <div>
                          <p className="font-bold text-lg mb-2">{target}</p>
                          {draggedItems[target] && (
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-lg font-mono font-bold animate-pulse">
                              {draggedItems[target]}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {practiceCompleted && (
                  <div className="text-center p-8 bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl border-2 border-green-400 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-pulse"></div>
                    <div className="text-8xl mb-4 animate-bounce">🏆</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-4">
                      Perfect Match!
                    </h3>
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                      <p className="text-yellow-400 text-2xl font-bold">
                        +{currentSegment.basePoints} XP
                      </p>
                      <TrendingUp className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Enhanced Review Segment */}
          {currentSegment.type === "review" && (
            <div className="space-y-6 relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full px-6 py-3 border border-indigo-400/30 mb-4">
                  <div className="text-4xl animate-bounce">📝</div>
                  <h3 className="text-2xl font-bold text-indigo-400">
                    Review Time!
                  </h3>
                  <div className="bg-indigo-400/20 rounded-full px-3 py-1">
                    <Award className="w-4 h-4 text-indigo-300 inline" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-8 text-center border border-indigo-500/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/5 to-transparent animate-pulse"></div>
                <h4 className="text-2xl font-bold text-indigo-300 mb-4 relative z-10">
                  Let's Review What You've Learned!
                </h4>
                <p className="text-lg text-indigo-200 leading-relaxed relative z-10">
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
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 mx-auto transform hover:scale-105 transition-all shadow-lg border border-indigo-400/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <Target className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Complete Review</span>
                  <ArrowRight className="w-6 h-6 relative z-10" />
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Segment Navigation */}
          <div className="mt-12 pt-6 border-t border-purple-500/30 relative z-10">
            <div className="flex justify-between items-center text-sm text-purple-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
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
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Mini progress indicators */}
            <div className="flex justify-center gap-1 mt-4">
              {currentPath.segments.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-3 h-1 rounded-full transition-all duration-500 ${
                    index < currentSegmentIndex
                      ? "bg-green-400"
                      : index === currentSegmentIndex
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-gray-600"
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
        <div className="fixed bottom-6 left-6 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm text-white p-4 rounded-2xl shadow-lg animate-pulse border border-red-400/50">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-200 animate-pulse" />
            <span className="font-bold">
              Only {hearts} hearts left! Be careful!
            </span>
            <div className="ml-2 flex gap-1">
              {[...Array(hearts)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-4 h-4 text-red-400 fill-current animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hearts Depleted Modal */}
      {hearts === 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl p-8 text-center max-w-md shadow-2xl border-4 border-red-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 animate-pulse"></div>
            <div className="text-6xl mb-4 animate-bounce relative z-10">💔</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10">
              Out of Hearts!
            </h3>
            <p className="text-gray-600 mb-6 relative z-10">
              Don't worry! You can try again or take a break and come back
              later.
            </p>
            <div className="flex gap-3 justify-center relative z-10">
              <button
                onClick={() => {
                  setHearts(5);
                  setAttempts(0);
                  setShowResult(false);
                  setSelectedAnswer(null);
                }}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all shadow-lg"
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Try Again
              </button>
              <button
                onClick={() => router.push(`/child/courses/${courseId}`)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all shadow-lg"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Exit Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Achievement Streak Indicator */}
      {streak > 10 && (
        <div className="fixed top-20 right-6 bg-gradient-to-r from-orange-500/90 to-yellow-500/90 backdrop-blur-sm text-white p-3 rounded-2xl shadow-lg border border-orange-400/50 animate-pulse">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-200" />
            <span className="font-bold text-sm">{streak} Day Streak! 🔥</span>
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
