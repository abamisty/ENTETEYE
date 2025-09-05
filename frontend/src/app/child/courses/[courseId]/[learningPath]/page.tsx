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
  Shuffle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Gamepad2,
  Users,
  Puzzle,
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
      const timer = setTimeout(onClose, 800);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000000] p-2 xs:p-4">
      <div className="bg-white rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 text-center animate-bounce shadow-2xl border-4 border-amber-400 max-w-[16rem] xs:max-w-[18rem] w-full">
        <div className="text-3xl xs:text-4xl sm:text-6xl mb-3 xs:mb-4 animate-pulse">
          {type === "correct" && "🎉"}
          {type === "bonus" && "⭐"}
          {type === "complete" && "🏆"}
        </div>
        <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          {type === "correct" && "Awesome Achievement!"}
          {type === "bonus" && "Bonus Points Unlocked!"}
          {type === "complete" && "Level Complete!"}
        </h3>
        <p className="text-green-600 text-base xs:text-lg sm:text-xl font-bold animate-pulse">
          +{points} XP {bonus && `(+${bonus} bonus!)`}
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-3 h-3 xs:w-4 xs:h-4 text-amber-500 fill-current animate-bounce"
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
    if (hasBeenActive && !isActive && !hasTyped) {
      setDisplayedText(text);
      return;
    }

    if (hasTyped) {
      setDisplayedText(text);
      return;
    }

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
      className={`flex items-start gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-6 transition-all duration-500 transform ${
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
              className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full border-3 transition-all duration-300 shadow-md ${
                isActive
                  ? "border-blue-500 scale-110 shadow-lg shadow-blue-400/30 ring-2 xs:ring-4 ring-blue-400/20"
                  : "border-slate-400"
              }`}
            />
            {isActive && (
              <>
                <div className="absolute -top-0.5 xs:-top-1 -right-0.5 xs:-right-1 bg-green-500 rounded-full p-0.5 xs:p-1 animate-pulse shadow-sm">
                  <Volume2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <div className="absolute -bottom-1.5 xs:-bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-0.5 xs:gap-1">
                    <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-center text-slate-600 mt-1 xs:mt-2 font-semibold">
            {character?.name || "Character"}
          </p>
        </div>
      )}

      <div
        className={`max-w-[240px] xs:max-w-xs sm:max-w-lg p-2 xs:p-3 sm:p-4 rounded-xl xs:rounded-2xl relative transition-all duration-300 shadow-lg ${
          isLeft
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tl-sm"
            : isCenter
            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg"
            : "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm"
        } ${
          isActive
            ? "scale-105 border border-white/20 ring-1 xs:ring-2 ring-white/10 shadow-xl"
            : ""
        }`}
      >
        <TypewriterText
          text={message}
          isActive={isActive}
          onComplete={onComplete}
          speed={30}
        />

        {!isCenter && (
          <div
            className={`absolute top-3 xs:top-4 w-0 h-0 ${
              isLeft
                ? "-left-1.5 xs:-left-2 border-r-6 xs:border-r-8 border-r-blue-500 border-t-6 xs:border-t-8 border-t-transparent border-b-6 xs:border-b-8 border-b-transparent"
                : "-right-1.5 xs:-right-2 border-l-6 xs:border-l-8 border-l-green-500 border-t-6 xs:border-t-8 border-t-transparent border-b-6 xs:border-b-8 border-b-transparent"
            }`}
          />
        )}

        <div
          className={`absolute -top-1.5 xs:-top-2 ${
            isLeft ? "-right-1.5 xs:-right-2" : "-left-1.5 xs:-left-2"
          } bg-amber-400 text-slate-800 rounded-full w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-sm`}
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
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [displayedStoryText, setDisplayedStoryText] = useState("");
  const [storyTextComplete, setStoryTextComplete] = useState(false);
  const [showHintFor, setShowHintFor] = useState<string | null>(null);
  const storyTextRef = useRef(null);

  const shuffleArray = (array: any) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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
  const [openEndedAnswer, setOpenEndedAnswer] = useState("");

  // Question states
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
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

  // New activity states
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false);
  const [matchingPairs, setMatchingPairs] = useState<{ [key: string]: string }>(
    {}
  );
  const [matchingCompleted, setMatchingCompleted] = useState(false);
  const [currentStoryChapter, setCurrentStoryChapter] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [dragDropItems, setDragDropItems] = useState<{
    [key: string]: { x: number; y: number; placed: boolean };
  }>({});
  const [dragWordsAnswers, setDragWordsAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionSetAnswers, setQuestionSetAnswers] = useState<{
    [key: number]: any;
  }>({});
  const [scenarioAnswers, setScenarioAnswers] = useState<{
    [key: number]: string;
  }>({});

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
      setVisibleMessageCount(i + 1);
      setCurrentDialogueIndex(i);

      await new Promise((resolve) => setTimeout(resolve, 300));

      await speakText(allDialogueMessages[i].text);

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
        }, 1500);
      } else {
        setTimeout(() => {
          setShowResult(false);
          setBlanksCompleted(false);
        }, 1500);
      }
    }, 1500);
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

        return {
          practice: {
            completed: practiceCompleted,
            interactions: Object.keys(draggedItems).length,
            details: draggedItems,
          },
        };
      case "flashcards":
        return {
          flashcards: {
            completed: flashcardsCompleted,
            cardsViewed: currentFlashcardIndex + 1,
          },
        };
      case "matching":
        return {
          matching: {
            completed: matchingCompleted,
            pairs: matchingPairs,
          },
        };
      case "storytelling":
        return {
          storytelling: {
            completed: storyCompleted,
            chaptersRead: [currentStoryChapter],
          },
        };
      case "dragdrop":
        return {
          dragdrop: {
            completed: practiceCompleted,
            itemsPaced: Object.keys(dragDropItems).length,
          },
        };
      case "dragwords":
      case "fillblanks":
        return {
          [currentSegment.type]: {
            completed: practiceCompleted,
            answers:
              currentSegment.type === "dragwords"
                ? dragWordsAnswers
                : fillBlanksAnswers,
          },
        };
      case "questionset":
        return {
          questionset: {
            completed: practiceCompleted,
            answers: questionSetAnswers,
            currentQuestion: currentQuestionIndex,
          },
        };
      case "scenario":
        return {
          scenario: {
            completed: practiceCompleted,
            answers: scenarioAnswers,
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

    // Reset new activity states
    setCurrentFlashcardIndex(0);
    setShowFlashcardBack(false);
    setFlashcardsCompleted(false);
    setMatchingPairs({});
    setMatchingCompleted(false);
    setCurrentStoryChapter("");
    setStoryCompleted(false);
    setDragDropItems({});
    setDragWordsAnswers({});
    setFillBlanksAnswers({});
    setCurrentQuestionIndex(0);
    setQuestionSetAnswers({});
    setScenarioAnswers({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 rounded-lg to-indigo-50 flex items-center justify-center p-2 xs:p-4">
        <div className="text-center">
          <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 xs:mb-4"></div>
          <p className="text-slate-700 text-lg xs:text-xl sm:text-2xl font-bold">
            Loading your adventure...
          </p>
          <div className="flex items-center justify-center gap-1 xs:gap-2 mt-3 xs:mt-4">
            <Sparkles className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            <span className="text-slate-600 text-xs xs:text-sm sm:text-base">
              Preparing something amazing!
            </span>
            <Sparkles className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentPath || !currentSegment) {
    router.push(`/child/courses/${courseId}`);
    return null;
  }

  const progress =
    ((currentSegmentIndex + 1) / currentPath.segments.length) * 100;
  const sessionTime = Math.floor((currentTime - sessionStartTime) / 1000);
  const minutes = Math.floor(sessionTime / 60);
  const seconds = sessionTime % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 text-slate-800 rounded-lg">
      {/* Enhanced Header with Gamification - Mobile First */}
      <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm p-2 xs:p-3 sm:p-4 sticky top-0 z-[100000] border-b rounded-tr-lg rounded-tl-lg border-blue-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          <button
            onClick={() => router.push(`/child/courses/${courseId}`)}
            className="p-1.5 xs:p-2 sm:p-3 hover:bg-white/60 rounded-full transition-all duration-300 group hover:rotate-90 flex-shrink-0"
          >
            <X className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 transition-transform" />
          </button>

          {/* Enhanced Progress Section - Responsive */}
          <div className="flex-1 mx-1 xs:mx-2 sm:mx-6">
            <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-4 mb-1 xs:mb-2">
              <ProgressRing progress={progress} size={32} />
              <div className="text-center">
                <div className="bg-white/60 rounded-full h-2 xs:h-3 sm:h-4 w-24 xs:w-32 sm:w-48 overflow-hidden border border-blue-200 shadow-sm">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 xs:mt-1">
                  Level {currentSegmentIndex + 1} of{" "}
                  {currentPath.segments.length}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats - Mobile Responsive */}
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 bg-red-100 backdrop-blur-sm px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 rounded-full border border-red-300 shadow-sm">
              <Heart className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="font-bold text-red-600 text-xs xs:text-sm sm:text-base">
                {hearts}
              </span>
            </div>
            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 bg-orange-100 backdrop-blur-sm px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 rounded-full border border-orange-300 shadow-sm">
              <Zap className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="font-bold text-orange-600 text-xs xs:text-sm sm:text-base">
                {streak}
              </span>
            </div>
            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 bg-amber-100 backdrop-blur-sm px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 rounded-full border border-amber-300 shadow-sm">
              <Star className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-600" />
              <span className="font-bold text-amber-700 text-xs xs:text-sm sm:text-base">
                {xp.toLocaleString()}
              </span>
            </div>
            <div className="hidden xs:flex items-center gap-1 sm:gap-2 bg-blue-100 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-blue-300 shadow-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <span className="font-mono text-blue-600 text-xs sm:text-sm">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="w-full mx-auto p-3 py-[4rem]  sm:py-[8rem] ">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 text-slate-800 shadow-xl border border-blue-200 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-5 left-5 sm:top-10 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-500/5 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-indigo-500/5 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-sky-400/5 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Storytelling Segment */}
          {currentSegment.type === "storytelling" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-violet-100/80 to-purple-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-violet-300 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-violet-600 animate-pulse" />
                  <span className="text-sm sm:text-base md:text-lg font-bold text-violet-600">
                    Interactive Story
                  </span>
                  {isStoryPlaying && (
                    <div className="bg-violet-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-violet-700 flex items-center gap-0.5 sm:gap-1">
                        <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
                        Playing
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!currentStoryChapter && (
                <div className="text-center px-2 sm:px-0">
                  <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-violet-200 backdrop-blur-sm shadow-inner">
                    <h4 className="text-lg sm:text-2xl md:text-3xl font-bold text-violet-800 mb-3 sm:mb-4">
                      {currentSegment.content.storytelling.title}
                    </h4>
                    {currentSegment.content.storytelling.background && (
                      <p className="text-sm sm:text-base md:text-lg text-violet-700 leading-relaxed mb-4 sm:mb-6">
                        {currentSegment.content.storytelling.background}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentStoryChapter(
                        currentSegment.content.storytelling.startChapter
                      );
                      setIsStoryPlaying(false);
                      setStoryTextComplete(false);
                    }}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transform hover:scale-105 transition-all shadow-lg"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                    Begin Story
                  </button>
                </div>
              )}

              {currentStoryChapter && (
                <div className="space-y-4 sm:space-y-6">
                  {(() => {
                    const chapter =
                      currentSegment.content.storytelling.chapters.find(
                        (ch: any) => ch.id === currentStoryChapter
                      );

                    if (!chapter) return null;

                    return (
                      <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-violet-200 backdrop-blur-sm shadow-inner">
                        <h4 className="text-base sm:text-xl md:text-2xl font-bold text-violet-800 mb-3 sm:mb-4">
                          {chapter.title}
                        </h4>

                        {/* Story Content with Typing Animation */}
                        <div className="prose prose-sm sm:prose-base md:prose-lg text-violet-700 mb-4 sm:mb-6 relative min-h-[80px] sm:min-h-[100px] md:min-h-[120px]">
                          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                            <span ref={storyTextRef} className="inline">
                              {displayedStoryText}
                            </span>
                            {isStoryPlaying && (
                              <span className="inline-block w-0.5 h-4 sm:h-5 md:h-6 bg-violet-600 ml-0.5 sm:ml-1 animate-pulse"></span>
                            )}
                          </p>

                          {/* Audio Controls */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-violet-200">
                            <button
                              onClick={async () => {
                                const chapter =
                                  currentSegment.content.storytelling.chapters.find(
                                    (ch: any) => ch.id === currentStoryChapter
                                  );

                                if (!chapter) return;

                                setIsStoryPlaying(true);
                                setDisplayedStoryText("");
                                setStoryTextComplete(false);

                                if ("speechSynthesis" in window) {
                                  speechSynthesis.cancel();
                                }

                                const speakText = (
                                  text: string
                                ): Promise<void> => {
                                  return new Promise((resolve) => {
                                    if ("speechSynthesis" in window) {
                                      speechSynthesis.cancel();
                                      const utterance =
                                        new SpeechSynthesisUtterance(text);
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

                                const speechPromise = speakText(
                                  chapter.content
                                );

                                let currentIndex = 0;
                                const typingInterval = setInterval(() => {
                                  if (currentIndex < chapter.content.length) {
                                    setDisplayedStoryText(
                                      chapter.content.substring(
                                        0,
                                        currentIndex + 1
                                      )
                                    );
                                    currentIndex++;
                                  } else {
                                    clearInterval(typingInterval);
                                  }
                                }, 30);

                                await speechPromise;

                                clearInterval(typingInterval);
                                setDisplayedStoryText(chapter.content);
                                setIsStoryPlaying(false);
                                setStoryTextComplete(true);
                              }}
                              disabled={isStoryPlaying}
                              className="bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all transform hover:scale-105 disabled:hover:scale-100"
                            >
                              {isStoryPlaying ? (
                                <>
                                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                                  <span>Narrating...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>
                                    {displayedStoryText ? "Replay" : "Listen"}
                                  </span>
                                </>
                              )}
                            </button>

                            {isStoryPlaying && (
                              <button
                                onClick={() => {
                                  if ("speechSynthesis" in window) {
                                    speechSynthesis.cancel();
                                  }
                                  const chapter =
                                    currentSegment.content.storytelling.chapters.find(
                                      (ch: any) => ch.id === currentStoryChapter
                                    );
                                  if (chapter) {
                                    setDisplayedStoryText(chapter.content);
                                    setIsStoryPlaying(false);
                                    setStoryTextComplete(true);
                                  }
                                }}
                                className="text-violet-600 hover:text-violet-800 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors"
                              >
                                Skip ⏭
                              </button>
                            )}

                            {isStoryPlaying && (
                              <div className="flex-1 min-w-[100px] bg-violet-200 rounded-full h-1 sm:h-1.5 overflow-hidden">
                                <div
                                  className="bg-violet-500 h-full transition-all duration-100 ease-out"
                                  style={{
                                    width: `${
                                      (displayedStoryText.length /
                                        chapter.content.length) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Choices */}
                        {storyTextComplete && chapter.choices ? (
                          <div className="space-y-2 sm:space-y-3 animate-fadeIn">
                            <p className="font-semibold text-violet-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                              <span>What do you choose?</span>
                              <div className="flex gap-0.5 sm:gap-1">
                                <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"></div>
                                <div
                                  className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </p>
                            {chapter.choices.map(
                              (choice: any, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    if (choice.nextChapter) {
                                      setCurrentStoryChapter(
                                        choice.nextChapter
                                      );
                                      setDisplayedStoryText("");
                                      setStoryTextComplete(false);
                                      setIsStoryPlaying(false);
                                    } else {
                                      setStoryCompleted(true);
                                      setCelebrationPoints(
                                        currentSegment.basePoints
                                      );
                                      setCelebrationType("complete");
                                      setShowCelebration(true);
                                      setXp(xp + currentSegment.basePoints);
                                      setTimeout(completeSegment, 3000);
                                    }
                                  }}
                                  className="w-full text-left p-3 sm:p-4 bg-white/80 hover:bg-violet-100 border-2 border-violet-200 hover:border-violet-400 rounded-lg sm:rounded-xl transition-all transform hover:scale-[1.02] group"
                                  style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animation:
                                      "slideInFromRight 0.5s ease-out forwards",
                                  }}
                                >
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-violet-500 group-hover:bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-colors">
                                      {index + 1}
                                    </div>
                                    <span className="font-semibold text-violet-800 group-hover:text-violet-900 text-sm sm:text-base flex-1">
                                      {choice.text}
                                    </span>
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400 group-hover:text-violet-600 transform group-hover:translate-x-1 transition-all" />
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        ) : storyTextComplete && !chapter.choices ? (
                          <div className="text-center animate-fadeIn">
                            <button
                              onClick={() => {
                                setStoryCompleted(true);
                                setCelebrationPoints(currentSegment.basePoints);
                                setCelebrationType("complete");
                                setShowCelebration(true);
                                setXp(xp + currentSegment.basePoints);
                                setTimeout(completeSegment, 3000);
                              }}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base transform hover:scale-105 transition-all shadow-lg"
                            >
                              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                              Complete Story
                            </button>
                          </div>
                        ) : (
                          !storyTextComplete && (
                            <div className="text-center py-3 sm:py-4">
                              <div className="text-xs sm:text-sm text-violet-600 flex items-center justify-center gap-1.5 sm:gap-2">
                                <div className="flex gap-0.5 sm:gap-1">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-400 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  ></div>
                                  <div
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                </div>
                                <span>Listen to continue...</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <style jsx>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes slideInFromRight {
                  from {
                    opacity: 0;
                    transform: translateX(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }

                .animate-fadeIn {
                  animation: fadeIn 0.6s ease-out forwards;
                }
              `}</style>
            </div>
          )}

          {/* Flashcards Segment */}
          {currentSegment.type === "flashcards" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-purple-300 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-purple-600">
                    Flashcard Review
                  </h3>
                  <div className="bg-purple-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-700">
                      {currentFlashcardIndex + 1}/
                      {currentSegment.content.flashcards.cards.length}
                    </span>
                  </div>
                </div>
              </div>

              {currentSegment.content.flashcards.cards.length > 0 && (
                <div className="max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
                  <div
                    className="relative w-full h-56 sm:h-64 md:h-80 cursor-pointer transform transition-transform duration-500 hover:scale-105"
                    style={{ perspective: "1000px" }}
                    onClick={() => setShowFlashcardBack(!showFlashcardBack)}
                  >
                    <div
                      className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                        showFlashcardBack ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center p-4 sm:p-6 backface-hidden">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-medium text-purple-100 mb-1.5 sm:mb-2">
                            FRONT
                          </div>
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-relaxed">
                            {
                              currentSegment.content.flashcards.cards[
                                currentFlashcardIndex
                              ].front
                            }
                          </p>
                          <div className="mt-3 sm:mt-4 text-purple-200 text-xs sm:text-sm">
                            Tap to reveal answer
                          </div>
                        </div>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center p-4 sm:p-6 backface-hidden rotate-y-180">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-medium text-green-100 mb-1.5 sm:mb-2">
                            BACK
                          </div>
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-relaxed">
                            {
                              currentSegment.content.flashcards.cards[
                                currentFlashcardIndex
                              ].back
                            }
                          </p>
                          <div className="mt-3 sm:mt-4 text-green-200 text-xs sm:text-sm">
                            Tap to flip back
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-4 sm:mt-6 md:mt-8 px-2 sm:px-0">
                    <button
                      onClick={() => {
                        if (currentFlashcardIndex > 0) {
                          setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                          setShowFlashcardBack(false);
                        }
                      }}
                      disabled={currentFlashcardIndex === 0}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 hover:bg-purple-200 disabled:bg-slate-100 disabled:text-slate-400 text-purple-700 rounded-full font-semibold text-xs sm:text-sm transition-all"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    <div className="flex gap-1">
                      {currentSegment.content.flashcards.cards.map(
                        (_: any, index: number) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                              index === currentFlashcardIndex
                                ? "bg-purple-500 scale-125"
                                : index < currentFlashcardIndex
                                ? "bg-green-500"
                                : "bg-slate-300"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (
                          currentFlashcardIndex <
                          currentSegment.content.flashcards.cards.length - 1
                        ) {
                          setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                          setShowFlashcardBack(false);
                        } else {
                          setFlashcardsCompleted(true);
                          setCelebrationPoints(currentSegment.basePoints);
                          setCelebrationType("complete");
                          setShowCelebration(true);
                          setXp(xp + currentSegment.basePoints);
                          setTimeout(completeSegment, 3000);
                        }
                      }}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-semibold text-xs sm:text-sm transition-all"
                    >
                      {currentFlashcardIndex ===
                      currentSegment.content.flashcards.cards.length - 1
                        ? "Complete"
                        : "Next"}
                      {currentFlashcardIndex ===
                      currentSegment.content.flashcards.cards.length - 1 ? (
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Matching Activity */}
          {currentSegment.type === "matching" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-teal-100/80 to-cyan-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-teal-300 shadow-sm">
                  <Puzzle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-teal-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-teal-600">
                    Match the Pairs
                  </h3>
                  <div className="bg-teal-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-teal-700">
                      {Object.keys(matchingPairs).length}/
                      {currentSegment.content.matching.pairs.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50/80 to-cyan-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 text-center border border-teal-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-teal-800 relative z-10">
                  {currentSegment.content.matching.instructions ||
                    "Drag items from the left to match with items on the right!"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Left column */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-center font-bold text-teal-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    Items to Match
                  </h4>
                  {currentSegment.content.matching.pairs.map(
                    (pair: any, index: number) => (
                      <div
                        key={`left-${index}`}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify({ item: pair.leftItem, index })
                          )
                        }
                        onTouchStart={(e) => {
                          // Mobile touch support
                          const touch = e.touches[0];
                          const element = e.currentTarget as HTMLElement;
                          element.style.position = "fixed";
                          element.style.zIndex = "1000";
                          element.style.left = `${
                            touch.pageX - element.offsetWidth / 2
                          }px`;
                          element.style.top = `${
                            touch.pageY - element.offsetHeight / 2
                          }px`;
                        }}
                        className={`p-3 sm:p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base cursor-grab active:cursor-grabbing hover:scale-105 transition-all shadow-lg touch-none ${
                          Object.values(matchingPairs).includes(pair.leftItem)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {pair.leftItem}
                      </div>
                    )
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-center font-bold text-teal-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    Match With
                  </h4>
                  {shuffleArray(currentSegment.content.matching.pairs).map(
                    (pair: any, index: number) => (
                      <div
                        key={`right-${index}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragData = JSON.parse(
                            e.dataTransfer.getData("text/plain")
                          );
                          if (dragData.index === index) {
                            setMatchingPairs((prev) => ({
                              ...prev,
                              [pair.rightItem]: dragData.item,
                            }));

                            if (
                              Object.keys(matchingPairs).length + 1 ===
                              currentSegment.content.matching.pairs.length
                            ) {
                              setMatchingCompleted(true);
                              setTimeout(() => {
                                setCelebrationPoints(currentSegment.basePoints);
                                setCelebrationType("complete");
                                setShowCelebration(true);
                                setXp(xp + currentSegment.basePoints);
                                setTimeout(completeSegment, 3000);
                              }, 1000);
                            }
                          }
                        }}
                        className={`p-3 sm:p-4 border-2 sm:border-3 border-dashed rounded-lg sm:rounded-xl min-h-[50px] sm:min-h-[60px] md:min-h-16 flex items-center justify-center text-center transition-all ${
                          matchingPairs[pair.rightItem]
                            ? "border-green-500 bg-green-100 text-green-700"
                            : "border-teal-400 bg-teal-50 text-teal-600 hover:border-teal-500 hover:bg-teal-100"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-sm sm:text-base">
                            {pair.rightItem}
                          </div>
                          {matchingPairs[pair.rightItem] && (
                            <div className="mt-1.5 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white rounded-full text-[10px] sm:text-xs md:text-sm font-bold">
                              ✓ {matchingPairs[pair.rightItem]}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scenario Segment */}
          {currentSegment.type === "scenario" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-blue-300 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-blue-600">
                    Scenario Challenge
                  </h3>
                  <div className="bg-blue-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-700">
                      {currentQuestionIndex + 1}/
                      {currentSegment.content.scenario.questions.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-blue-200 backdrop-blur-sm shadow-inner">
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-blue-800 mb-2 sm:mb-3 md:mb-4">
                  {currentSegment.content.scenario.title}
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-blue-700 mb-2 sm:mb-3 md:mb-4">
                  {currentSegment.content.scenario.description}
                </p>
                <p className="text-sm sm:text-base md:text-lg text-blue-900 leading-relaxed">
                  {currentSegment.content.scenario.situation}
                </p>
              </div>

              {currentSegment.content.scenario.questions.length > 0 && (
                <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto px-2 sm:px-0">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-blue-200">
                    <h5 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800 mb-2 sm:mb-3">
                      Question {currentQuestionIndex + 1}:{" "}
                      {
                        currentSegment.content.scenario.questions[
                          currentQuestionIndex
                        ].text
                      }
                    </h5>
                    {currentSegment.content.scenario.questions[
                      currentQuestionIndex
                    ].type === "multiple-choice" ? (
                      <div className="space-y-2 sm:space-y-3">
                        {currentSegment.content.scenario.questions[
                          currentQuestionIndex
                        ].options.map((option: any, optionIndex: number) => (
                          <button
                            key={optionIndex}
                            onClick={() => {
                              const isCorrect = option.isCorrect;
                              setSelectedAnswer(optionIndex);
                              setShowFeedback(true);
                              if (isCorrect) {
                                setCorrectAnswers((prev) => prev + 1);
                              }
                            }}
                            className={`w-full p-2.5 sm:p-3 text-left rounded-lg border transition-all text-xs sm:text-sm md:text-base ${
                              selectedAnswer === optionIndex && showFeedback
                                ? option.isCorrect
                                  ? "bg-green-100 border-green-500 text-green-800"
                                  : "bg-red-100 border-red-500 text-red-800"
                                : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                            }`}
                            disabled={showFeedback}
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={openEndedAnswer}
                        onChange={(e) => setOpenEndedAnswer(e.target.value)}
                        rows={3}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm md:text-base"
                        placeholder="Type your answer here..."
                        maxLength={500}
                      />
                    )}
                    {showFeedback && (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-800">
                        <p className="text-xs sm:text-sm font-medium">
                          {currentSegment.content.scenario.questions[
                            currentQuestionIndex
                          ].type === "multiple-choice"
                            ? currentSegment.content.scenario.questions[
                                currentQuestionIndex
                              ].options[selectedAnswer].isCorrect
                              ? "Correct! Well done."
                              : "Incorrect. Try again or move to the next question."
                            : "Your response has been recorded."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-4 sm:mt-6 md:mt-8 px-2 sm:px-0">
                    <button
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex(currentQuestionIndex - 1);
                          setSelectedAnswer(null);
                          setShowFeedback(false);
                          setOpenEndedAnswer("");
                        }
                      }}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-slate-100 disabled:text-slate-400 text-blue-700 rounded-full font-semibold text-xs sm:text-sm transition-all"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    <div className="flex gap-1">
                      {currentSegment.content.scenario.questions.map(
                        (_: any, index: number) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                              index === currentQuestionIndex
                                ? "bg-blue-500 scale-125"
                                : index < currentQuestionIndex
                                ? "bg-green-500"
                                : "bg-slate-300"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (
                          currentQuestionIndex <
                          currentSegment.content.scenario.questions.length - 1
                        ) {
                          setCurrentQuestionIndex(currentQuestionIndex + 1);
                          setSelectedAnswer(null);
                          setShowFeedback(false);
                          setOpenEndedAnswer("");
                        } else {
                          setCelebrationPoints(currentSegment.basePoints);
                          setCelebrationType("complete");
                          setShowCelebration(true);
                          setXp(xp + currentSegment.basePoints);
                          setTimeout(completeSegment, 3000);
                        }
                      }}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold text-xs sm:text-sm transition-all"
                    >
                      {currentQuestionIndex ===
                      currentSegment.content.scenario.questions.length - 1
                        ? "Complete"
                        : "Next"}
                      {currentQuestionIndex ===
                      currentSegment.content.scenario.questions.length - 1 ? (
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Segment */}
          {currentSegment.type === "question" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-indigo-300 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-indigo-600">
                    Question Challenge
                  </h3>
                </div>
              </div>

              <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto px-2 sm:px-0">
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-indigo-200">
                  <h5 className="text-sm sm:text-base md:text-lg font-semibold text-indigo-800 mb-2 sm:mb-3">
                    {currentSegment.content.question.text}
                  </h5>
                  {currentSegment.content.question.type ===
                  "multiple-choice" ? (
                    <div className="space-y-2 sm:space-y-3">
                      {currentSegment.content.question.options.map(
                        (option: any, optionIndex: number) => (
                          <button
                            key={optionIndex}
                            onClick={() => {
                              const isCorrect = option.isCorrect;
                              setSelectedAnswer(optionIndex);
                              setShowFeedback(true);
                              if (isCorrect) {
                                setCorrectAnswers((prev) => prev + 1);
                              }
                            }}
                            className={`w-full p-2.5 sm:p-3 text-left rounded-lg border transition-all text-xs sm:text-sm md:text-base ${
                              selectedAnswer === optionIndex && showFeedback
                                ? option.isCorrect
                                  ? "bg-green-100 border-green-500 text-green-800"
                                  : "bg-red-100 border-red-500 text-red-800"
                                : "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100"
                            }`}
                            disabled={showFeedback}
                          >
                            {option.text}
                          </button>
                        )
                      )}
                    </div>
                  ) : currentSegment.content.question.type === "true-false" ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {["true", "false"].map((value, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const isCorrect =
                              value ===
                              currentSegment.content.question.correctAnswer;
                            setSelectedAnswer(value);
                            setShowFeedback(true);
                            if (isCorrect) {
                              setCorrectAnswers((prev) => prev + 1);
                            }
                          }}
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-xs sm:text-sm md:text-base ${
                            selectedAnswer === value && showFeedback
                              ? value ===
                                currentSegment.content.question.correctAnswer
                                ? "bg-green-100 border-green-500 text-green-800"
                                : "bg-red-100 border-red-500 text-red-800"
                              : "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100"
                          }`}
                          disabled={showFeedback}
                        >
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={openEndedAnswer}
                      onChange={(e) => setOpenEndedAnswer(e.target.value)}
                      rows={4}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm md:text-base"
                      placeholder="Type your answer here..."
                      maxLength={500}
                    />
                  )}
                  {showFeedback && (
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-indigo-50 text-indigo-800">
                      <p className="text-xs sm:text-sm font-medium">
                        {currentSegment.content.question.type ===
                        "multiple-choice"
                          ? currentSegment.content.question.options[
                              selectedAnswer
                            ].isCorrect
                            ? "Correct! Well done."
                            : "Incorrect. Try again or complete the segment."
                          : currentSegment.content.question.type ===
                            "true-false"
                          ? selectedAnswer ===
                            currentSegment.content.question.correctAnswer
                            ? "Correct! Well done."
                            : "Incorrect. Try again or complete the segment."
                          : "Your response has been recorded."}
                      </p>
                      {currentSegment.content.question.explanation && (
                        <p className="text-xs sm:text-sm mt-1.5 sm:mt-2">
                          {currentSegment.content.question.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-end mt-4 sm:mt-6 md:mt-8 px-2 sm:px-0">
                  <button
                    onClick={() => {
                      setCelebrationPoints(currentSegment.basePoints);
                      setCelebrationType("complete");
                      setShowCelebration(true);
                      setXp(xp + currentSegment.basePoints);
                      setTimeout(completeSegment, 3000);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold text-xs sm:text-sm transition-all"
                  >
                    Complete
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Scenario Activity */}
          {currentSegment.type === "scenario" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-100/80 to-red-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-orange-300 shadow-sm">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-orange-600">
                    Interactive Scenario
                  </h3>
                </div>
              </div>

              {currentSegment.content.scenario.backgroundImage && (
                <div className="text-center mb-4 sm:mb-6">
                  <img
                    src={currentSegment.content.scenario.backgroundImage}
                    alt="Scenario Background"
                    className="max-w-full sm:max-w-sm md:max-w-md mx-auto rounded-xl sm:rounded-2xl shadow-lg border border-orange-200"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-orange-50/80 to-red-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-orange-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-orange-800 mb-2 sm:mb-3 md:mb-4">
                  {currentSegment.content.scenario.title}
                </h4>
                <p className="text-sm sm:text-base md:text-lg text-orange-700 leading-relaxed mb-2 sm:mb-3 md:mb-4">
                  {currentSegment.content.scenario.situation}
                </p>
                {currentSegment.content.scenario.description && (
                  <p className="text-xs sm:text-sm md:text-base text-orange-600">
                    {currentSegment.content.scenario.description}
                  </p>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {currentSegment.content.scenario.questions.map(
                  (question: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/80 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-orange-200"
                    >
                      <h5 className="font-bold text-orange-800 mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">
                        Question {index + 1}: {question.text}
                      </h5>

                      {question.type === "multiple-choice" &&
                        question.options && (
                          <div className="space-y-1.5 sm:space-y-2">
                            {question.options.map(
                              (option: any, optIndex: number) => (
                                <button
                                  key={optIndex}
                                  onClick={() => {
                                    setScenarioAnswers((prev) => ({
                                      ...prev,
                                      [index]: option.id,
                                    }));

                                    if (
                                      Object.keys(scenarioAnswers).length +
                                        1 ===
                                      currentSegment.content.scenario.questions
                                        .length
                                    ) {
                                      setTimeout(() => {
                                        setCelebrationPoints(
                                          currentSegment.basePoints
                                        );
                                        setCelebrationType("complete");
                                        setShowCelebration(true);
                                        setXp(xp + currentSegment.basePoints);
                                        setTimeout(completeSegment, 3000);
                                      }, 1000);
                                    }
                                  }}
                                  className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm md:text-base ${
                                    scenarioAnswers[index] === option.id
                                      ? "border-orange-500 bg-orange-100"
                                      : "border-orange-200 hover:border-orange-400"
                                  }`}
                                >
                                  {option.text}
                                </button>
                              )
                            )}
                          </div>
                        )}

                      {question.type === "short-answer" && (
                        <textarea
                          value={scenarioAnswers[index] || ""}
                          onChange={(e) => {
                            setScenarioAnswers((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }));
                          }}
                          className="w-full p-2 sm:p-3 border-2 border-orange-200 rounded-lg resize-none focus:border-orange-500 focus:outline-none text-xs sm:text-sm md:text-base"
                          rows={3}
                          placeholder="Type your answer here..."
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Drag & Drop Activity */}
          {currentSegment.type === "dragdrop" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-100/80 to-teal-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-emerald-300 shadow-sm">
                  <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-emerald-600">
                    Drag & Drop Challenge
                  </h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 text-center border border-emerald-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-emerald-800 relative z-10">
                  {currentSegment.content.dragdrop.instructions}
                </p>
              </div>

              <div className="relative">
                {currentSegment.content.dragdrop.backgroundImage && (
                  <div className="w-full h-64 sm:h-80 md:h-96 bg-cover bg-center rounded-xl sm:rounded-2xl relative overflow-hidden border border-emerald-200">
                    <img
                      src={currentSegment.content.dragdrop.backgroundImage}
                      alt="Drop Background"
                      className="w-full h-full object-cover"
                    />

                    {/* Drop zones */}
                    {currentSegment.content.dragdrop.dropZones.map(
                      (zone: any, index: number) => (
                        <div
                          key={index}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const itemId = e.dataTransfer.getData("text/plain");
                            const item =
                              currentSegment.content.dragdrop.draggableItems.find(
                                (item: any) => item.id === itemId
                              );

                            if (item && zone.correctItem === item.id) {
                              setDragDropItems((prev) => ({
                                ...prev,
                                [itemId]: {
                                  x: zone.x,
                                  y: zone.y,
                                  placed: true,
                                },
                              }));

                              const totalItems =
                                currentSegment.content.dragdrop.draggableItems
                                  .length;
                              const placedItems =
                                Object.values(dragDropItems).filter(
                                  (item: any) => item.placed
                                ).length + 1;

                              if (placedItems === totalItems) {
                                setPracticeCompleted(true);
                                setTimeout(() => {
                                  setCelebrationPoints(
                                    currentSegment.basePoints
                                  );
                                  setCelebrationType("complete");
                                  setShowCelebration(true);
                                  setXp(xp + currentSegment.basePoints);
                                  setTimeout(completeSegment, 3000);
                                }, 1000);
                              }
                            }
                          }}
                          className="absolute border-2 border-dashed border-emerald-400 bg-emerald-100/50 rounded-lg flex items-center justify-center text-emerald-700 font-semibold"
                          style={{
                            left: `${zone.x}%`,
                            top: `${zone.y}%`,
                            width: "80px",
                            height: "40px",
                          }}
                        >
                          {dragDropItems[zone.correctItem]?.placed ? (
                            <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                              ✓ Placed!
                            </div>
                          ) : (
                            <div className="text-[10px] sm:text-xs text-center">
                              Drop Here
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Draggable items */}
                <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
                  {currentSegment.content.dragdrop.draggableItems.map(
                    (item: any) => (
                      <div
                        key={item.id}
                        draggable={!dragDropItems[item.id]?.placed}
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", item.id)
                        }
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm cursor-grab active:cursor-grabbing transition-all shadow-lg ${
                          dragDropItems[item.id]?.placed
                            ? "bg-green-500 text-white cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105"
                        }`}
                      >
                        {item.text}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Drag Words Activity */}
          {currentSegment.type === "dragwords" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-blue-300 shadow-sm">
                  <Puzzle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-blue-600">
                    Fill the Gaps
                  </h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-blue-200 backdrop-blur-sm shadow-inner">
                <div className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-800 leading-relaxed">
                  {(() => {
                    const content = currentSegment.content.dragwords;
                    let textParts = content.text.split(/(\[GAP_\d+\])/);

                    return textParts.map((part: string, index: number) => {
                      const gapMatch = part.match(/\[GAP_(\d+)\]/);
                      if (gapMatch) {
                        const gapId = gapMatch[1];

                        return (
                          <span
                            key={index}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const wordId =
                                e.dataTransfer.getData("text/plain");
                              const word = content.wordBank.find(
                                (w: any) => w.id === wordId
                              );

                              if (word) {
                                setDragWordsAnswers((prev) => ({
                                  ...prev,
                                  [gapId]: word.word,
                                }));

                                if (
                                  Object.keys(dragWordsAnswers).length + 1 ===
                                  content.gaps.length
                                ) {
                                  let allCorrect = true;
                                  content.gaps.forEach((gap: any) => {
                                    const userAnswer =
                                      gapId === gap.id
                                        ? word.word
                                        : dragWordsAnswers[gap.id];
                                    const correctWord = content.wordBank.find(
                                      (w: any) => w.id === gap.correctWordId
                                    );
                                    if (userAnswer !== correctWord?.word) {
                                      allCorrect = false;
                                    }
                                  });

                                  if (allCorrect) {
                                    setPracticeCompleted(true);
                                    setTimeout(() => {
                                      setCelebrationPoints(
                                        currentSegment.basePoints
                                      );
                                      setCelebrationType("complete");
                                      setShowCelebration(true);
                                      setXp(xp + currentSegment.basePoints);
                                      setTimeout(completeSegment, 3000);
                                    }, 1000);
                                  }
                                }
                              }
                            }}
                            className="inline-block mx-1 sm:mx-2 px-2 sm:px-3 py-0.5 sm:py-1 border-2 border-dashed border-blue-400 bg-blue-100 rounded-lg min-w-[50px] sm:min-w-[60px] md:min-w-20 text-center font-bold text-xs sm:text-sm md:text-base"
                          >
                            {dragWordsAnswers[gapId] || "____"}
                          </span>
                        );
                      }
                      return <span key={index}>{part}</span>;
                    });
                  })()}
                </div>
              </div>

              {/* Word bank */}
              <div className="text-center">
                <h4 className="font-bold text-blue-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  Word Bank
                </h4>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {currentSegment.content.dragwords.wordBank.map(
                    (word: any) => (
                      <div
                        key={word.id}
                        draggable={
                          !Object.values(dragWordsAnswers).includes(word.word)
                        }
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", word.id)
                        }
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg ${
                          Object.values(dragWordsAnswers).includes(word.word)
                            ? "bg-green-500 text-white cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-grab active:cursor-grabbing hover:scale-105"
                        }`}
                      >
                        {word.word}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fill Blanks Activity */}
          {currentSegment.type === "fillblanks" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-100/80 to-amber-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-yellow-300 shadow-sm">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-yellow-600">
                    Complete the Text
                  </h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50/80 to-amber-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-yellow-200 backdrop-blur-sm shadow-inner">
                <div className="text-sm sm:text-base md:text-lg lg:text-xl text-yellow-800 leading-relaxed">
                  {(() => {
                    const content = currentSegment.content.fillblanks;
                    let textParts = content.text.split(/(\{\{gap\d+\}\})/);

                    return textParts.map((part: string, index: number) => {
                      const gapMatch = part.match(/\{\{gap(\d+)\}\}/);
                      if (gapMatch) {
                        const gapId = gapMatch[1];
                        const gapData = content.gaps.find(
                          (gap: any) => gap.id === `gap${gapId}`
                        );
                        const currentAnswer = fillBlanksAnswers[gapId] || "";
                        const isAnswered = currentAnswer.trim() !== "";
                        const isCorrect =
                          isAnswered &&
                          currentAnswer.toLowerCase().trim() ===
                            gapData?.correctAnswer.toLowerCase().trim();
                        const isIncorrect = isAnswered && !isCorrect;

                        return (
                          <div
                            key={index}
                            className="inline-block relative group mx-1 sm:mx-2"
                          >
                            <input
                              type="text"
                              value={currentAnswer}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setFillBlanksAnswers((prev) => ({
                                  ...prev,
                                  [gapId]: newValue,
                                }));

                                if (newValue.trim() !== "") {
                                  const correct =
                                    newValue.toLowerCase().trim() ===
                                    gapData?.correctAnswer.toLowerCase().trim();
                                  if (correct) {
                                    const input = e.target;
                                    input.classList.add("animate-bounce");
                                    setTimeout(() => {
                                      input.classList.remove("animate-bounce");
                                    }, 600);
                                  }
                                }

                                const updatedAnswers = {
                                  ...fillBlanksAnswers,
                                  [gapId]: newValue,
                                };

                                if (
                                  Object.keys(updatedAnswers).length ===
                                    content.gaps.length &&
                                  Object.values(updatedAnswers).every(
                                    (val) => val.trim() !== ""
                                  )
                                ) {
                                  let allCorrect = true;
                                  content.gaps.forEach((gap: any) => {
                                    const userAnswer = updatedAnswers[gap.id]
                                      ?.toLowerCase()
                                      .trim();
                                    const correctAnswer = gap.correctAnswer
                                      .toLowerCase()
                                      .trim();
                                    if (userAnswer !== correctAnswer) {
                                      allCorrect = false;
                                    }
                                  });

                                  if (allCorrect) {
                                    setPracticeCompleted(true);
                                    setTimeout(() => {
                                      setCelebrationPoints(
                                        currentSegment.basePoints
                                      );
                                      setCelebrationType("complete");
                                      setShowCelebration(true);
                                      setXp(xp + currentSegment.basePoints);
                                      setTimeout(completeSegment, 3000);
                                    }, 1000);
                                  }
                                }
                              }}
                              onBlur={() => {
                                if (isAnswered && isIncorrect) {
                                  const input = document.querySelector(
                                    `input[value="${currentAnswer}"]`
                                  ) as HTMLElement;
                                  if (input) {
                                    input.classList.add("animate-pulse");
                                    setTimeout(() => {
                                      input.classList.remove("animate-pulse");
                                    }, 1000);
                                  }
                                }
                              }}
                              className={`
                          inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg min-w-[60px] sm:min-w-[80px] md:min-w-24 text-center font-bold text-xs sm:text-sm md:text-base
                          focus:outline-none transition-all duration-300 transform
                          ${
                            !isAnswered
                              ? "border-2 border-yellow-400 bg-yellow-100 focus:border-yellow-500 focus:scale-105"
                              : isCorrect
                              ? "border-2 border-green-400 bg-green-100 text-green-800 shadow-md"
                              : "border-2 border-red-400 bg-red-100 text-red-800 animate-pulse"
                          }
                          hover:scale-105 focus:scale-110
                        `}
                              placeholder="?"
                              maxLength={gapData?.correctAnswer.length + 5}
                            />

                            {/* Feedback Icons */}
                            {isAnswered && (
                              <div
                                className={`absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                                  isCorrect
                                    ? "bg-green-500 animate-bounce"
                                    : "bg-red-500 animate-pulse"
                                }`}
                              >
                                {isCorrect ? "✓" : "✗"}
                              </div>
                            )}

                            {/* Hint */}
                            {!isCorrect && gapData?.hint && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 sm:mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap pointer-events-none">
                                💡 {gapData.hint}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-800 rotate-45"></div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return <span key={index}>{part}</span>;
                    });
                  })()}
                </div>

                {/* Progress */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-yellow-200">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-yellow-600 mb-1.5 sm:mb-2">
                    <span>Progress</span>
                    <span>
                      {
                        Object.values(fillBlanksAnswers).filter(
                          (answer) => answer.trim() !== ""
                        ).length
                      }{" "}
                      / {currentSegment.content.fillblanks.gaps.length}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (Object.values(fillBlanksAnswers).filter(
                            (answer) => answer.trim() !== ""
                          ).length /
                            currentSegment.content.fillblanks.gaps.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Encouragement */}
                {Object.values(fillBlanksAnswers).filter(
                  (answer) => answer.trim() !== ""
                ).length > 0 && (
                  <div className="mt-3 sm:mt-4 text-center">
                    <div
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                        Object.values(fillBlanksAnswers).filter(
                          (answer) => answer.trim() !== ""
                        ).length ===
                        currentSegment.content.fillblanks.gaps.length
                          ? "bg-green-100 text-green-700 animate-pulse"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {Object.values(fillBlanksAnswers).filter(
                        (answer) => answer.trim() !== ""
                      ).length ===
                      currentSegment.content.fillblanks.gaps.length ? (
                        <>🎉 All blanks filled! Checking answers...</>
                      ) : (
                        <>⚡ Keep going! You're doing great!</>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full flex justify-center">
                {Object.values(fillBlanksAnswers).filter(
                  (answer) => answer.trim() !== ""
                ).length === currentSegment.content.fillblanks.gaps.length && (
                  <button
                    onClick={completeSegment}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 transition-all shadow-lg border border-green-400/30 relative overflow-hidden group animate-pulse text-sm sm:text-base"
                  >
                    <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span>Complete & Continue</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Question Set Activity */}
          {currentSegment.type === "questionset" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-indigo-300 shadow-sm">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-indigo-600">
                    Question Challenge
                  </h3>
                  <div className="bg-indigo-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-indigo-700">
                      {currentQuestionIndex + 1}/
                      {currentSegment.content.questionset.questions.length}
                    </span>
                  </div>
                </div>
              </div>

              {currentSegment.content.questionset.questions.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  {(() => {
                    const question =
                      currentSegment.content.questionset.questions[
                        currentQuestionIndex
                      ];

                    return (
                      <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-indigo-200 backdrop-blur-sm shadow-inner">
                        <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-indigo-800 mb-4 sm:mb-6">
                          {question.text}
                        </h4>

                        {question.type === "multiple-choice" &&
                          question.options && (
                            <div className="space-y-2 sm:space-y-3">
                              {question.options.map(
                                (option: any, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setQuestionSetAnswers((prev) => ({
                                        ...prev,
                                        [currentQuestionIndex]: option.id,
                                      }));
                                    }}
                                    className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all transform hover:scale-[1.02] text-sm sm:text-base ${
                                      questionSetAnswers[
                                        currentQuestionIndex
                                      ] === option.id
                                        ? "border-indigo-500 bg-indigo-100"
                                        : "border-indigo-200 hover:border-indigo-400"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                        {String.fromCharCode(65 + index)}
                                      </div>
                                      <span className="font-semibold">
                                        {option.text}
                                      </span>
                                    </div>
                                  </button>
                                )
                              )}
                            </div>
                          )}

                        {question.type === "true-false" && (
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {["true", "false"].map((answer) => (
                              <button
                                key={answer}
                                onClick={() => {
                                  setQuestionSetAnswers((prev) => ({
                                    ...prev,
                                    [currentQuestionIndex]: answer,
                                  }));
                                }}
                                className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 font-bold text-sm sm:text-base md:text-lg transition-all transform hover:scale-105 ${
                                  questionSetAnswers[currentQuestionIndex] ===
                                  answer
                                    ? "border-indigo-500 bg-indigo-100"
                                    : "border-indigo-200 hover:border-indigo-400"
                                }`}
                              >
                                <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                                  {answer === "true" ? "✅" : "❌"}
                                </div>
                                {answer.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        )}

                        {question.type === "short-answer" && (
                          <textarea
                            value={
                              questionSetAnswers[currentQuestionIndex] || ""
                            }
                            onChange={(e) => {
                              setQuestionSetAnswers((prev) => ({
                                ...prev,
                                [currentQuestionIndex]: e.target.value,
                              }));
                            }}
                            className="w-full p-3 sm:p-4 border-2 border-indigo-200 rounded-lg sm:rounded-xl resize-none focus:border-indigo-500 focus:outline-none text-sm sm:text-base"
                            rows={4}
                            placeholder="Type your answer here..."
                          />
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center mt-6 sm:mt-8">
                          <button
                            onClick={() =>
                              setCurrentQuestionIndex(
                                Math.max(0, currentQuestionIndex - 1)
                              )
                            }
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-100 hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 text-indigo-700 rounded-full font-semibold text-xs sm:text-sm transition-all"
                          >
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                          </button>

                          <div className="flex gap-0.5 sm:gap-1 md:gap-2">
                            {currentSegment.content.questionset.questions.map(
                              (_: any, index: number) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                                    index === currentQuestionIndex
                                      ? "bg-indigo-500 scale-125"
                                      : questionSetAnswers[index] !== undefined
                                      ? "bg-green-500"
                                      : "bg-slate-300"
                                  }`}
                                />
                              )
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (
                                currentQuestionIndex <
                                currentSegment.content.questionset.questions
                                  .length -
                                  1
                              ) {
                                setCurrentQuestionIndex(
                                  currentQuestionIndex + 1
                                );
                              } else {
                                setPracticeCompleted(true);
                                setCelebrationPoints(currentSegment.basePoints);
                                setCelebrationType("complete");
                                setShowCelebration(true);
                                setXp(xp + currentSegment.basePoints);
                                setTimeout(completeSegment, 3000);
                              }
                            }}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold text-xs sm:text-sm transition-all"
                          >
                            {currentQuestionIndex ===
                            currentSegment.content.questionset.questions
                              .length -
                              1
                              ? "Complete"
                              : "Next"}
                            {currentQuestionIndex ===
                            currentSegment.content.questionset.questions
                              .length -
                              1 ? (
                              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* True/False Question */}
          {currentSegment.type === "question" &&
            currentSegment.content.question.type === "true-false" && (
              <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-amber-300 shadow-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-bounce">
                      🤔
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-amber-600">
                      True or False?
                    </h3>
                    <div className="bg-amber-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-amber-700 inline" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 text-center border border-amber-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-pulse"></div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-amber-800 leading-relaxed relative z-10">
                    {currentSegment.content.question.text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                  {[
                    { id: "true", label: "TRUE", emoji: "✅", color: "green" },
                    { id: "false", label: "FALSE", emoji: "❌", color: "red" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showResult}
                      className={`
                p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl border-2 sm:border-3 font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl transition-all transform hover:scale-105 shadow-lg backdrop-blur-sm relative overflow-hidden group
                ${
                  selectedAnswer === option.id
                    ? showResult
                      ? currentSegment.content.question.correctAnswer ===
                        option.id
                        ? "border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 text-green-700 shadow-green-200 ring-2 ring-green-400/30"
                        : "border-red-500 bg-gradient-to-br from-red-50/80 to-pink-50/80 text-red-700 shadow-red-200 ring-2 ring-red-400/30"
                      : "border-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 text-blue-700 shadow-blue-200 ring-2 ring-blue-400/30"
                    : showResult &&
                      currentSegment.content.question.correctAnswer ===
                        option.id
                    ? "border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 text-green-700 shadow-green-200 ring-2 ring-green-400/30"
                    : `border-slate-300 bg-gradient-to-br from-slate-50/80 to-slate-100/80 hover:border-${option.color}-400 text-slate-700 shadow-slate-200`
                }
              `}
                    >
                      <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-700"></div>
                      <div className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3 relative z-10">
                        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl transform group-hover:scale-110 transition-transform">
                          {option.emoji}
                        </div>
                        <span>{option.label}</span>
                        {showResult && selectedAnswer === option.id && (
                          <div className="mt-1 sm:mt-2 animate-bounce">
                            {currentSegment.content.question.correctAnswer ===
                            option.id ? (
                              <Check className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-500 mx-auto" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {showResult && (
                  <div
                    className={`text-center p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden shadow-lg ${
                      isCorrect
                        ? "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-400"
                        : "bg-gradient-to-br from-red-50/80 to-pink-50/80 border-red-400"
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl mb-3 sm:mb-4 animate-bounce">
                      {isCorrect ? "🎉" : "🤔"}
                    </div>
                    <h3
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-4 ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Excellent!" : "Try again!"}
                    </h3>
                    {isCorrect && (
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500 animate-pulse" />
                        <p className="text-blue-600 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold">
                          +{currentSegment.basePoints} XP
                          {attempts === 0 && currentSegment.bonusPoints && (
                            <span className="text-amber-600 animate-pulse">
                              {" "}
                              (+{currentSegment.bonusPoints} bonus!)
                            </span>
                          )}
                        </p>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500 animate-pulse" />
                      </div>
                    )}
                    {currentSegment.content.question.explanation && (
                      <div className="bg-blue-50/80 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mt-3 sm:mt-4 border border-blue-200 backdrop-blur-sm shadow-inner">
                        <p className="text-blue-700 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
                          {currentSegment.content.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Multiple Choice Question */}

          {/* Instruction Segment */}
          {currentSegment.type === "instruction" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-indigo-300 shadow-sm">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-bounce">
                    📚
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-indigo-600">
                    Learning Time!
                  </h3>
                  <div className="bg-indigo-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-700 inline" />
                  </div>
                </div>
              </div>

              {currentSegment.content.instruction.mediaUrl && (
                <div className="text-center mb-3 sm:mb-4 md:mb-6">
                  <img
                    src={currentSegment.content.instruction.mediaUrl}
                    alt="Learning Material"
                    className="max-w-[200px] sm:max-w-xs md:max-w-md mx-auto rounded-xl sm:rounded-2xl shadow-lg border border-indigo-200 hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-indigo-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 to-transparent animate-pulse"></div>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-center relative z-10 text-indigo-800">
                  {currentSegment.content.instruction.text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() =>
                    speakText(currentSegment.content.instruction.text)
                  }
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg border border-indigo-400/30 transition-all hover:scale-105 relative overflow-hidden group text-xs sm:text-sm md:text-base"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10" />
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transform hover:scale-105 transition-all border border-green-400/30 relative overflow-hidden group text-xs sm:text-sm md:text-base"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <span className="relative z-10">Got it!</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10" />
                </button>
              </div>
            </div>
          )}

          {/* Review Segment */}
          {currentSegment.type === "review" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-indigo-300 shadow-sm">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-bounce">
                    📝
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-indigo-600">
                    Review Time!
                  </h3>
                  <div className="bg-indigo-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-700 inline" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 text-center border border-indigo-200 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 to-transparent animate-pulse"></div>
                <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-indigo-700 mb-3 sm:mb-4 relative z-10">
                  Let's Review What You've Learned!
                </h4>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-indigo-600 leading-relaxed relative z-10">
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
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full font-bold flex items-center gap-2 sm:gap-3 mx-auto transform hover:scale-105 transition-all shadow-lg border border-indigo-400/30 relative overflow-hidden group text-xs sm:text-sm md:text-base"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative z-10" />
                  <span className="relative z-10">Complete Review</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative z-10" />
                </button>
              </div>
            </div>
          )}

          {/* Dialogue Segment */}
          {currentSegment.type === "dialogue" && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-blue-300 shadow-sm">
                  <div className="flex gap-0.5 sm:gap-1">
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
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    Interactive Conversation
                  </h3>
                  <div className="bg-blue-200 rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 shadow-sm">
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-700">
                      {visibleMessageCount}/{allDialogueMessages.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dialogue Messages Container */}
              <div
                ref={dialogueContainerRef}
                className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-br from-slate-50/80 to-blue-50/80 rounded-xl sm:rounded-2xl border border-slate-200 backdrop-blur-sm relative shadow-inner"
              >
                {/* Progress indicator */}
                <div className="sticky top-0 bg-gradient-to-r from-transparent via-slate-50/90 to-transparent p-1.5 sm:p-2 mb-3 sm:mb-4 z-10">
                  <div className="flex justify-center">
                    <div className="flex gap-1 sm:gap-1.5 md:gap-2">
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
                    onComplete={() => {}}
                  />
                ))}

                {/* Empty state */}
                {visibleMessageCount === 0 && (
                  <div className="text-center py-6 sm:py-8 md:py-12">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 animate-pulse">
                      💭
                    </div>
                    <p className="text-slate-500 text-sm sm:text-base md:text-lg">
                      Ready to start the conversation?
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
                <button
                  onClick={playDialogue}
                  disabled={isPlayingDialogue}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 transition-all shadow-lg border border-blue-400/30 relative overflow-hidden group text-xs sm:text-sm md:text-base"
                >
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                  {isPlayingDialogue ? (
                    <>
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-pulse" />
                      <span>
                        Playing... ({visibleMessageCount}/
                        {allDialogueMessages.length})
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
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
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 transition-all shadow-lg border border-green-400/30 relative overflow-hidden group animate-pulse text-xs sm:text-sm md:text-base"
                  >
                    <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-1000"></div>
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span>Complete & Continue</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-1 mt-3 sm:mt-4">
          {currentPath.segments.map((_: any, index: number) => (
            <div
              key={index}
              className={`w-1.5 h-0.5 sm:w-2 sm:h-1 md:w-3 md:h-1 rounded-full transition-all duration-500 ${
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

      {/* Enhanced Hearts Warning - Mobile Responsive */}
      {hearts <= 2 && hearts > 0 && (
        <div className="fixed bottom-3 xs:bottom-4 sm:bottom-6 left-3 xs:left-4 sm:left-6 bg-gradient-to-r from-red-100/95 to-pink-100/95 backdrop-blur-sm text-red-700 p-2 xs:p-3 sm:p-4 rounded-xl xs:rounded-2xl shadow-lg animate-pulse border border-red-300 max-w-[280px] xs:max-w-xs">
          <div className="flex items-center gap-1 xs:gap-2">
            <Heart className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse flex-shrink-0" />
            <span className="font-bold text-xs xs:text-sm sm:text-base">
              Only {hearts} hearts left! Be careful!
            </span>
            <div className="ml-1 xs:ml-2 flex gap-0.5 xs:gap-1">
              {[...Array(hearts)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-red-500 fill-current animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hearts Depleted Modal - Mobile Responsive */}
      {hearts === 0 && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 xs:p-4">
          <div className="bg-white rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 text-center max-w-[300px] xs:max-w-sm w-full shadow-2xl border-4 border-red-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-pink-50/50 animate-pulse"></div>
            <div className="text-3xl xs:text-4xl sm:text-6xl mb-3 xs:mb-4 animate-bounce relative z-10">
              💔
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-800 mb-3 xs:mb-4 relative z-10">
              Out of Hearts!
            </h3>
            <p className="text-slate-600 mb-4 xs:mb-6 relative z-10 text-sm xs:text-base">
              Don't worry! You can try again or take a break and come back
              later.
            </p>
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 justify-center relative z-10">
              <button
                onClick={() => {
                  setHearts(5);
                  setAttempts(0);
                  setShowResult(false);
                  setSelectedAnswer(null);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-3 xs:px-4 sm:px-6 py-2 xs:py-2 sm:py-3 rounded-full font-bold transform hover:scale-105 transition-all shadow-lg text-xs xs:text-sm sm:text-base"
              >
                <Heart className="w-3 h-3 xs:w-4 xs:h-4 inline mr-1 xs:mr-2" />
                Try Again
              </button>
              <button
                onClick={() => router.push(`/child/courses/${courseId}`)}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-3 xs:px-4 sm:px-6 py-2 xs:py-2 sm:py-3 rounded-full font-bold transform hover:scale-105 transition-all shadow-lg text-xs xs:text-sm sm:text-base"
              >
                <Home className="w-3 h-3 xs:w-4 xs:h-4 inline mr-1 xs:mr-2" />
                Exit Lesson
              </button>
            </div>
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
