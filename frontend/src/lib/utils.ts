import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const steps = [
  { title: "Course Basics", icon: "📚" },
  { title: "Learning Paths", icon: "🛤️" },
  { title: "Segments", icon: "🧩" },
  { title: "Characters", icon: "👥" },
  { title: "Review", icon: "👁️" },
];

export const segmentTypes = [
  {
    value: "dialogue",
    label: "Dialogue",
    icon: "💬",
    description: "Character conversations",
  },
  {
    value: "instruction",
    label: "Instruction",
    icon: "📝",
    description: "Teaching content",
  },
  {
    value: "question",
    label: "Question",
    icon: "❓",
    description: "Interactive questions",
  },
  {
    value: "review",
    label: "Review",
    icon: "📋",
    description: "Summary and recap",
  },
  // New activity types
  {
    value: "scenario",
    label: "Scenario",
    icon: "🌄",
    description: "Scenario-based questions",
  },
  {
    value: "flashcards",
    label: "Flash Cards",
    icon: "📇",
    description: "Interactive flash cards",
  },
  {
    value: "matching",
    label: "Matching",
    icon: "🔗",
    description: "Matching activities",
  },
  {
    value: "storytelling",
    label: "Story Telling",
    icon: "📖",
    description: "Interactive stories",
  },
  {
    value: "dragdrop",
    label: "Drag & Drop",
    icon: "↔️",
    description: "Drag and drop interactions",
  },
  {
    value: "dragwords",
    label: "Drag Words",
    icon: "🔤",
    description: "Drag words into text",
  },
  {
    value: "fillblanks",
    label: "Fill Blanks",
    icon: "📝",
    description: "Fill in the blanks",
  },
  {
    value: "questionset",
    label: "Question Set",
    icon: "❓❓",
    description: "Set of multiple questions",
  },
];

export interface LearningSegment {
  id?: string;
  order: number;
  type:
    | "dialogue"
    | "instruction"
    | "question"
    | "review"
    | "scenario"
    | "flashcards"
    | "matching"
    | "storytelling"
    | "dragdrop"
    | "dragwords"
    | "fillblanks"
    | "questionset";
  basePoints: number;
  bonusPoints?: number;
  content?: {
    // Existing content types...
    dialogue?: {
      characters: Array<{
        characterId: string;
        lines: string[];
        position: "left" | "right" | "center";
      }>;
      backgroundScene?: string;
      audioUrl?: string;
    };
    instruction?: {
      text: string;
      mediaUrl?: string;
      mediaType?: "image" | "video" | "audio";
    };
    question?: {
      text: string;
      type: "multiple-choice" | "true-false" | "fill-blank" | "matching";
      options?: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
      correctAnswer?: string;
      explanation?: string;
    };

    // New content types
    scenario?: {
      title: string;
      description: string;
      situation: string;
      questions: Array<{
        id: string;
        text: string;
        type: "multiple-choice" | "open-ended";
        options?: Array<{
          id: string;
          text: string;
          isCorrect: boolean;
          feedback?: string;
        }>;
        correctAnswer?: string;
        explanation?: string;
      }>;
      backgroundImage?: string;
      characterInvolved?: string;
    };
    flashcards?: {
      cards: Array<{
        id: string;
        front: string;
        back: string;
        frontImage?: string;
        backImage?: string;
        audioHint?: string;
      }>;
      displayMode: "sequential" | "random";
      showProgress: boolean;
      allowMarking: boolean;
    };
    matching?: {
      title: string;
      instructions: string;
      pairs: Array<{
        id: string;
        leftItem: string;
        rightItem: string;
        leftImage?: string;
        rightImage?: string;
      }>;
      timeLimit?: number;
      shuffle: boolean;
    };
    storytelling?: {
      title: string;
      background: string;
      chapters: Array<{
        id: string;
        title: string;
        content: string;
        image?: string;
        audio?: string;
        choices?: Array<{
          id: string;
          text: string;
          nextChapter: string;
        }>;
      }>;
      startChapter: string;
    };
    dragdrop?: {
      title: string;
      instructions: string;
      backgroundImage?: string;
      dropZones: Array<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        correctItem: string;
        label?: string;
      }>;
      draggableItems: Array<{
        id: string;
        text: string;
        image?: string;
      }>;
    };
    dragwords?: {
      text: string;
      instructions: string;
      wordBank: Array<{
        id: string;
        word: string;
        distractor?: boolean;
      }>;
      gaps: Array<{
        id: string;
        correctWordId: string;
        position: number;
      }>;
    };
    fillblanks?: {
      text: string;
      instructions: string;
      gaps: Array<{
        id: string;
        correctAnswer: string;
        position: number;
        hints?: Array<string>;
        caseSensitive?: boolean;
      }>;
    };
    questionset?: {
      title: string;
      instructions: string;
      questions: Array<{
        id: string;
        text: string;
        type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer";
        options?: Array<{
          id: string;
          text: string;
          isCorrect: boolean;
        }>;
        correctAnswer?: string;
        explanation?: string;
        points: number;
      }>;
      passingScore: number;
      showResults: boolean;
      randomizeOrder: boolean;
    };
  };
}
