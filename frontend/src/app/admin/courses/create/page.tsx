"use client";
import React, { useState, useEffect, useRef } from "react";
import { courseApi } from "@/api/courses";
import { characterApi } from "@/api/characters";
import toast from "react-hot-toast";
import { errorStyles } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { LearningSegment, segmentTypes, steps } from "@/lib/utils";
import { renderSegmentContent } from "./RenderContentSegment";

// Types based on your schema
interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  type: string;
}

interface LearningPath {
  id?: string;
  title: string;
  description?: string;
  order: number;
  segments: LearningSegment[];
}

interface CourseData {
  title: string;
  description: string;
  tags: string[];
  ageGroup: "10-12" | "13-15" | "16-18";
  learningObjectives: string[];
  thumbnailUrl?: string;
  isCustom: boolean;
  customRequestId?: string;
  featuredCharacterIds: string[];
  learningPaths: LearningPath[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface StepValidation {
  isValid: boolean;
  errors: ValidationErrors;
}

const AdminCourseCreation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const isEditMode = !!courseId;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>(
    []
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [stepValidations, setStepValidations] = useState<StepValidation[]>([
    { isValid: false, errors: {} },
    { isValid: false, errors: {} },
    { isValid: false, errors: {} },
    { isValid: false, errors: {} },
    { isValid: false, errors: {} },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    tags: [],
    ageGroup: "10-12",
    learningObjectives: [],
    isCustom: false,
    featuredCharacterIds: [],
    learningPaths: [
      {
        title: "",
        description: "",
        order: 1,
        segments: [
          {
            order: 1,
            type: "instruction",
            basePoints: 10,
            content: { instruction: { text: "" } },
          },
        ],
      },
    ],
  });

  useEffect(() => {
    fetchCharacters();
    if (isEditMode && courseId) {
      fetchCourseData(courseId);
    } else {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      validateCurrentStep();
    }
  }, [courseData, thumbnailFile, activeStep, initialLoading]);

  const fetchCharacters = async () => {
    try {
      const response = await characterApi.getAllCharacters();
      if (response.success) {
        setAvailableCharacters(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  };

  const fetchCourseData = async (id: string) => {
    try {
      setInitialLoading(true);
      const response = await courseApi.getCourse(id);
      if (response.success && response.data) {
        const course = response.data;
        setCourseData({
          title: course.title,
          description: course.description,
          tags: course.tags || [],
          ageGroup: course.ageGroup,
          learningObjectives: course.learningObjectives || [],
          thumbnailUrl: course.thumbnailUrl,
          isCustom: course.isCustom || false,
          customRequestId: course.customRequestId,
          featuredCharacterIds:
            course.featuredCharacters?.map((c: any) => c.id) || [],
          learningPaths:
            course.learningPaths?.map((path: any) => ({
              id: path.id,
              title: path.title,
              description: path.description,
              order: path.order,
              segments:
                path.segments?.map((segment: any) => ({
                  id: segment.id,
                  order: segment.order,
                  type: segment.type,
                  basePoints: segment.basePoints,
                  bonusPoints: segment.bonusPoints,
                  content: segment.content,
                })) || [],
            })) || [],
        });

        if (course.thumbnailUrl) {
          setThumbnailPreview(course.thumbnailUrl);
        }
      } else {
        toast.error("Course not found", errorStyles);
        router.push("/admin/courses/create");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course data", errorStyles);
      router.push("/admin/courses/create");
    } finally {
      setInitialLoading(false);
    }
  };

  // Helper function to get default content for segment type
  const getDefaultContentForType = (type: string): any => {
    switch (type) {
      case "instruction":
      case "review":
        return { instruction: { text: "", mediaType: "image" } };
      case "question":
        return {
          question: {
            text: "",
            type: "multiple-choice",
            options: [
              { id: "1", text: "", isCorrect: false },
              { id: "2", text: "", isCorrect: false },
            ],
            explanation: "",
          },
        };
      case "dialogue":
        return {
          dialogue: {
            characters: [
              {
                characterId: "",
                lines: [""],
                position: "left" as const,
              },
            ],
            backgroundScene: "",
          },
        };

      case "scenario":
        return {
          scenario: {
            title: "",
            description: "",
            situation: "",
            questions: [
              {
                id: "1",
                text: "",
                type: "multiple-choice",
                options: [
                  { id: "1", text: "", isCorrect: false, feedback: "" },
                  { id: "2", text: "", isCorrect: false, feedback: "" },
                ],
                explanation: "",
              },
            ],
          },
        };
      case "flashcards":
        return {
          flashcards: {
            cards: [
              { id: "1", front: "", back: "" },
              { id: "2", front: "", back: "" },
            ],
            displayMode: "sequential",
            showProgress: true,
            allowMarking: false,
          },
        };
      case "matching":
        return {
          matching: {
            title: "",
            instructions: "",
            pairs: [
              { id: "1", leftItem: "", rightItem: "" },
              { id: "2", leftItem: "", rightItem: "" },
            ],
            shuffle: true,
          },
        };
      case "storytelling":
        return {
          storytelling: {
            title: "",
            background: "",
            chapters: [
              {
                id: "1",
                title: "Chapter 1",
                content: "",
                choices: [{ id: "1", text: "Continue", nextChapter: "2" }],
              },
            ],
            startChapter: "1",
          },
        };
      case "dragdrop":
        return {
          dragdrop: {
            title: "",
            instructions: "",
            dropZones: [
              {
                id: "1",
                x: 100,
                y: 100,
                width: 80,
                height: 80,
                correctItem: "1",
              },
            ],
            draggableItems: [{ id: "1", text: "Item 1" }],
          },
        };
      case "dragwords":
        return {
          dragwords: {
            text: "This is a {{gap1}} with missing {{gap2}}.",
            instructions: "Drag words from the bank to fill the gaps.",
            wordBank: [
              { id: "1", word: "text", distractor: false },
              { id: "2", word: "words", distractor: false },
              { id: "3", word: "distractor", distractor: true },
            ],
            gaps: [
              { id: "gap1", correctWordId: "1", position: 10 },
              { id: "gap2", correctWordId: "2", position: 30 },
            ],
          },
        };
      case "fillblanks":
        return {
          fillblanks: {
            text: "The capital of France is {{gap1}}.",
            instructions: "Fill in the blanks with the correct answers.",
            gaps: [
              {
                id: "gap1",
                correctAnswer: "Paris",
                position: 20,
                hints: ["Starts with P"],
              },
            ],
          },
        };
      case "questionset":
        return {
          questionset: {
            title: "",
            instructions: "",
            questions: [
              {
                id: "1",
                text: "",
                type: "multiple-choice",
                options: [
                  { id: "1", text: "", isCorrect: false },
                  { id: "2", text: "", isCorrect: false },
                ],
                points: 10,
              },
            ],
            passingScore: 70,
            showResults: true,
            randomizeOrder: false,
          },
        };
      default:
        return {};
    }
  };

  // Validation functions for each step
  const validateStep0 = (): StepValidation => {
    const errors: ValidationErrors = {};

    if (!courseData.title.trim()) {
      errors.title = "Course title is required";
    } else if (courseData.title.length < 3) {
      errors.title = "Course title must be at least 3 characters";
    } else if (courseData.title.length > 100) {
      errors.title = "Course title must be less than 100 characters";
    }

    if (!courseData.description.trim()) {
      errors.description = "Course description is required";
    } else if (courseData.description.length < 20) {
      errors.description = "Course description must be at least 20 characters";
    } else if (courseData.description.length > 500) {
      errors.description =
        "Course description must be less than 500 characters";
    }

    if (!courseData.ageGroup) {
      errors.ageGroup = "Age group is required";
    }

    if (courseData.learningObjectives.length === 0) {
      errors.learningObjectives = "At least one learning objective is required";
    } else if (courseData.learningObjectives.length > 10) {
      errors.learningObjectives = "Maximum 10 learning objectives allowed";
    }

    if (!thumbnailFile && !courseData.thumbnailUrl) {
      errors.thumbnail = "Course thumbnail is required";
    }

    if (courseData.tags.length > 15) {
      errors.tags = "Maximum 15 tags allowed";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const validateStep1 = (): StepValidation => {
    const errors: ValidationErrors = {};

    if (courseData.learningPaths.length === 0) {
      errors.learningPaths = "At least one learning path is required";
    } else if (courseData.learningPaths.length > 10) {
      errors.learningPaths = "Maximum 10 learning paths allowed";
    }

    courseData.learningPaths.forEach((path, index) => {
      if (!path.title.trim()) {
        errors[`path_${index}_title`] = `Learning path ${
          index + 1
        } title is required`;
      } else if (path.title.length < 3) {
        errors[`path_${index}_title`] = `Learning path ${
          index + 1
        } title must be at least 3 characters`;
      } else if (path.title.length > 100) {
        errors[`path_${index}_title`] = `Learning path ${
          index + 1
        } title must be less than 100 characters`;
      }

      if (path.description && path.description.length > 300) {
        errors[`path_${index}_description`] = `Learning path ${
          index + 1
        } description must be less than 300 characters`;
      }

      if (path.order < 1) {
        errors[`path_${index}_order`] = `Learning path ${
          index + 1
        } order must be at least 1`;
      }
    });

    // Check for duplicate orders
    const orders = courseData.learningPaths.map((path) => path.order);
    const duplicateOrders = orders.filter(
      (order, index) => orders.indexOf(order) !== index
    );
    if (duplicateOrders.length > 0) {
      errors.duplicate_orders = "Learning path orders must be unique";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const validateStep2 = (): StepValidation => {
    const errors: ValidationErrors = {};

    courseData.learningPaths.forEach((path, pathIndex) => {
      if (path.segments.length === 0) {
        errors[
          `path_${pathIndex}_segments`
        ] = `Learning path "${path.title}" must have at least one segment`;
      } else if (path.segments.length > 20) {
        errors[
          `path_${pathIndex}_segments`
        ] = `Learning path "${path.title}" cannot have more than 20 segments`;
      }

      path.segments.forEach((segment, segmentIndex) => {
        const segmentKey = `path_${pathIndex}_segment_${segmentIndex}`;

        if (segment.basePoints < 0) {
          errors[`${segmentKey}_basePoints`] = `Segment ${
            segmentIndex + 1
          } base points cannot be negative`;
        } else if (segment.basePoints > 100) {
          errors[`${segmentKey}_basePoints`] = `Segment ${
            segmentIndex + 1
          } base points cannot exceed 100`;
        }

        if (
          segment.bonusPoints &&
          (segment.bonusPoints < 0 || segment.bonusPoints > 50)
        ) {
          errors[`${segmentKey}_bonusPoints`] = `Segment ${
            segmentIndex + 1
          } bonus points must be between 0 and 50`;
        }

        // Validate content based on segment type
        switch (segment.type) {
          case "instruction":
          case "review":
            if (!segment.content?.instruction?.text?.trim()) {
              errors[`${segmentKey}_content`] = `${
                segment.type === "instruction" ? "Instruction" : "Review"
              } segment ${segmentIndex + 1} must have content text`;
            } else if (segment.content.instruction.text.length > 2000) {
              errors[`${segmentKey}_content`] = `${
                segment.type === "instruction" ? "Instruction" : "Review"
              } segment ${
                segmentIndex + 1
              } text is too long (max 2000 characters)`;
            }
            break;

          case "question":
            if (!segment.content?.question?.text?.trim()) {
              errors[`${segmentKey}_content`] = `Question segment ${
                segmentIndex + 1
              } must have question text`;
            } else if (segment.content.question.text.length > 500) {
              errors[`${segmentKey}_content`] = `Question segment ${
                segmentIndex + 1
              } text is too long (max 500 characters)`;
            }

            if (segment.content?.question?.type === "multiple-choice") {
              const options = segment.content.question.options || [];
              if (options.length < 2) {
                errors[`${segmentKey}_options`] = `Multiple choice question ${
                  segmentIndex + 1
                } must have at least 2 options`;
              } else if (options.length > 6) {
                errors[`${segmentKey}_options`] = `Multiple choice question ${
                  segmentIndex + 1
                } cannot have more than 6 options`;
              }

              const correctOptions = options.filter((opt) => opt.isCorrect);
              if (correctOptions.length !== 1) {
                errors[`${segmentKey}_correct`] = `Multiple choice question ${
                  segmentIndex + 1
                } must have exactly one correct answer`;
              }

              const emptyOptions = options.filter((opt) => !opt.text.trim());
              if (emptyOptions.length > 0) {
                errors[
                  `${segmentKey}_empty_options`
                ] = `Multiple choice question ${
                  segmentIndex + 1
                } has empty options`;
              }
            } else if (segment.content?.question?.type === "true-false") {
              if (!segment.content.question.correctAnswer) {
                errors[`${segmentKey}_correct_answer`] = `True/False question ${
                  segmentIndex + 1
                } must have a correct answer`;
              }
            } else if (segment.content?.question?.type === "fill-blank") {
              if (!segment.content.question.correctAnswer?.trim()) {
                errors[
                  `${segmentKey}_correct_answer`
                ] = `Fill in the blank question ${
                  segmentIndex + 1
                } must have a correct answer`;
              }
            }
            break;

          case "dialogue":
            const characters = segment.content?.dialogue?.characters || [];
            if (characters.length === 0) {
              errors[`${segmentKey}_characters`] = `Dialogue segment ${
                segmentIndex + 1
              } must have at least one character`;
            } else if (characters.length > 4) {
              errors[`${segmentKey}_characters`] = `Dialogue segment ${
                segmentIndex + 1
              } cannot have more than 4 characters`;
            }

            characters.forEach((char, charIndex) => {
              if (!char.characterId) {
                errors[`${segmentKey}_char_${charIndex}_id`] = `Character ${
                  charIndex + 1
                } in dialogue segment ${segmentIndex + 1} must be selected`;
              }
              if (
                char.lines.length === 0 ||
                char.lines.every((line) => !line.trim())
              ) {
                errors[`${segmentKey}_char_${charIndex}_lines`] = `Character ${
                  charIndex + 1
                } in dialogue segment ${
                  segmentIndex + 1
                } must have at least one line`;
              }
            });
            break;

          case "scenario":
            if (!segment.content?.scenario?.situation?.trim()) {
              errors[`${segmentKey}_content`] = `Scenario segment ${
                segmentIndex + 1
              } must have a situation description`;
            } else if (segment.content.scenario.situation.length > 1000) {
              errors[`${segmentKey}_content`] = `Scenario segment ${
                segmentIndex + 1
              } situation is too long (max 1000 characters)`;
            }

            if (!segment.content?.scenario?.questions?.length) {
              errors[`${segmentKey}_questions`] = `Scenario segment ${
                segmentIndex + 1
              } must have at least one question`;
            }
            break;

          case "flashcards":
            if (!segment.content?.flashcards?.cards?.length) {
              errors[`${segmentKey}_cards`] = `Flashcards segment ${
                segmentIndex + 1
              } must have at least one card`;
            } else if (segment.content.flashcards.cards.length > 50) {
              errors[`${segmentKey}_cards`] = `Flashcards segment ${
                segmentIndex + 1
              } cannot have more than 50 cards`;
            }
            break;

          case "matching":
            if (!segment.content?.matching?.pairs?.length) {
              errors[`${segmentKey}_pairs`] = `Matching segment ${
                segmentIndex + 1
              } must have at least one pair`;
            } else if (segment.content.matching.pairs.length > 10) {
              errors[`${segmentKey}_pairs`] = `Matching segment ${
                segmentIndex + 1
              } cannot have more than 10 pairs`;
            }
            break;

          case "storytelling":
            if (!segment.content?.storytelling?.chapters?.length) {
              errors[`${segmentKey}_chapters`] = `Storytelling segment ${
                segmentIndex + 1
              } must have at least one chapter`;
            }
            break;

          case "dragdrop":
            if (!segment.content?.dragdrop?.dropZones?.length) {
              errors[`${segmentKey}_dropzones`] = `Drag & Drop segment ${
                segmentIndex + 1
              } must have at least one drop zone`;
            }
            if (!segment.content?.dragdrop?.draggableItems?.length) {
              errors[`${segmentKey}_draggables`] = `Drag & Drop segment ${
                segmentIndex + 1
              } must have at least one draggable item`;
            }
            break;

          case "dragwords":
            if (!segment.content?.dragwords?.gaps?.length) {
              errors[`${segmentKey}_gaps`] = `Drag Words segment ${
                segmentIndex + 1
              } must have at least one gap`;
            }
            if (!segment.content?.dragwords?.wordBank?.length) {
              errors[`${segmentKey}_wordbank`] = `Drag Words segment ${
                segmentIndex + 1
              } must have at least one word in the bank`;
            }
            break;

          case "fillblanks":
            if (!segment.content?.fillblanks?.gaps?.length) {
              errors[`${segmentKey}_gaps`] = `Fill Blanks segment ${
                segmentIndex + 1
              } must have at least one gap`;
            }
            break;

          case "questionset":
            if (!segment.content?.questionset?.questions?.length) {
              errors[`${segmentKey}_questions`] = `Question Set segment ${
                segmentIndex + 1
              } must have at least one question`;
            } else if (segment.content.questionset.questions.length > 20) {
              errors[`${segmentKey}_questions`] = `Question Set segment ${
                segmentIndex + 1
              } cannot have more than 20 questions`;
            }
            break;
        }
      });

      // Check for duplicate segment orders within each path
      const segmentOrders = path.segments.map((segment) => segment.order);
      const duplicateSegmentOrders = segmentOrders.filter(
        (order, index) => segmentOrders.indexOf(order) !== index
      );
      if (duplicateSegmentOrders.length > 0) {
        errors[
          `path_${pathIndex}_duplicate_orders`
        ] = `Learning path "${path.title}" has duplicate segment orders`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const validateStep3 = (): StepValidation => {
    const errors: ValidationErrors = {};

    if (courseData.featuredCharacterIds.length === 0) {
      errors.featuredCharacters = "At least one featured character is required";
    } else if (courseData.featuredCharacterIds.length > 8) {
      errors.featuredCharacters = "Maximum 8 featured characters allowed";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const validateStep4 = (): StepValidation => {
    // Step 4 is review, validate all previous steps
    const step0Validation = validateStep0();
    const step1Validation = validateStep1();
    const step2Validation = validateStep2();
    const step3Validation = validateStep3();

    const allErrors = {
      ...step0Validation.errors,
      ...step1Validation.errors,
      ...step2Validation.errors,
      ...step3Validation.errors,
    };

    return {
      isValid:
        step0Validation.isValid &&
        step1Validation.isValid &&
        step2Validation.isValid &&
        step3Validation.isValid,
      errors: allErrors,
    };
  };

  const validateCurrentStep = () => {
    if (initialLoading) return;

    let validation: StepValidation;

    switch (activeStep) {
      case 0:
        validation = validateStep0();
        break;
      case 1:
        validation = validateStep1();
        break;
      case 2:
        validation = validateStep2();
        break;
      case 3:
        validation = validateStep3();
        break;
      case 4:
        validation = validateStep4();
        break;
      default:
        validation = { isValid: false, errors: {} };
    }

    setValidationErrors(validation.errors);

    // Update step validations
    setStepValidations((prev) => {
      const newValidations = [...prev];
      newValidations[activeStep] = validation;
      return newValidations;
    });
  };

  const handleNextStep = () => {
    const currentValidation =
      activeStep === 0
        ? validateStep0()
        : activeStep === 1
        ? validateStep1()
        : activeStep === 2
        ? validateStep2()
        : activeStep === 3
        ? validateStep3()
        : validateStep4();

    if (!currentValidation.isValid) {
      setValidationErrors(currentValidation.errors);
      toast.error(
        "Please fix the validation errors before proceeding",
        errorStyles
      );
      return;
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      setValidationErrors({});
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setValidationErrors({});
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB", errorStyles);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file", errorStyles);
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addLearningPath = () => {
    if (courseData.learningPaths.length >= 10) {
      toast.error("Maximum 10 learning paths allowed", errorStyles);
      return;
    }

    const newPath: LearningPath = {
      title: "",
      description: "",
      order: courseData.learningPaths.length + 1,
      segments: [
        {
          order: 1,
          type: "instruction",
          basePoints: 10,
          content: getDefaultContentForType("instruction"),
        },
      ],
    };
    setCourseData((prev) => ({
      ...prev,
      learningPaths: [...prev.learningPaths, newPath],
    }));
  };

  const updateLearningPath = (
    pathIndex: number,
    updates: Partial<LearningPath>
  ) => {
    setCourseData((prev) => ({
      ...prev,
      learningPaths: prev.learningPaths.map((path, idx) =>
        idx === pathIndex ? { ...path, ...updates } : path
      ),
    }));
  };

  const addSegment = (pathIndex: number) => {
    const path = courseData.learningPaths[pathIndex];
    if (path.segments.length >= 20) {
      toast.error("Maximum 20 segments allowed per path", errorStyles);
      return;
    }

    const newSegment: LearningSegment = {
      order: path.segments.length + 1,
      type: "instruction",
      basePoints: 10,
      content: getDefaultContentForType("instruction"),
    };

    updateLearningPath(pathIndex, {
      segments: [...path.segments, newSegment],
    });
  };

  const updateSegment = (
    pathIndex: number,
    segmentIndex: number,
    updates: Partial<LearningSegment>
  ) => {
    const updatedPath = { ...courseData.learningPaths[pathIndex] };
    updatedPath.segments = updatedPath.segments.map((segment, idx) =>
      idx === segmentIndex ? { ...segment, ...updates } : segment
    );
    updateLearningPath(pathIndex, updatedPath);
  };

  const removeSegment = (pathIndex: number, segmentIndex: number) => {
    const path = courseData.learningPaths[pathIndex];
    if (path.segments.length <= 1) {
      toast.error("Learning path must have at least one segment", errorStyles);
      return;
    }

    const updatedPath = { ...courseData.learningPaths[pathIndex] };
    updatedPath.segments = updatedPath.segments.filter(
      (_, idx) => idx !== segmentIndex
    );
    // Reorder segments
    updatedPath.segments = updatedPath.segments.map((segment, idx) => ({
      ...segment,
      order: idx + 1,
    }));
    updateLearningPath(pathIndex, updatedPath);
  };

  const removeLearningPath = (pathIndex: number) => {
    if (courseData.learningPaths.length <= 1) {
      toast.error("Course must have at least one learning path", errorStyles);
      return;
    }

    setCourseData((prev) => ({
      ...prev,
      learningPaths: prev.learningPaths
        .filter((_, idx) => idx !== pathIndex)
        .map((path, idx) => ({ ...path, order: idx + 1 })), // Reorder paths
    }));
  };

  const handleSubmit = async () => {
    const finalValidation = validateStep4();
    if (!finalValidation.isValid) {
      setValidationErrors(finalValidation.errors);
      toast.error(
        "Please fix all validation errors before submitting",
        errorStyles
      );
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      if (thumbnailFile) {
        formData.append("file", thumbnailFile);
      }

      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("tags", JSON.stringify(courseData.tags));
      formData.append("ageGroup", courseData.ageGroup);
      formData.append(
        "learningObjectives",
        JSON.stringify(courseData.learningObjectives)
      );
      formData.append("isCustom", JSON.stringify(courseData.isCustom));
      formData.append(
        "customRequestId",
        JSON.stringify(courseData.customRequestId)
      );
      formData.append(
        "featuredCharacterIds",
        JSON.stringify(courseData.featuredCharacterIds)
      );
      formData.append(
        "learningPaths",
        JSON.stringify(courseData.learningPaths)
      );

      let response;
      if (isEditMode && courseId) {
        response = await courseApi.updateCourse(courseId, formData);
      } else {
        response = await courseApi.createCourse(formData);
      }

      if (response.success) {
        router.push("/admin/courses");
      } else {
        throw new Error(
          response.message ||
            `Failed to ${isEditMode ? "update" : "create"} course`
        );
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} course:`,
        error
      );
      toast.error(
        error.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } course. Please try again.`,
        errorStyles
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Course" : "Create New Course"}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditMode
                  ? "Update your course content"
                  : "Build engaging educational experiences"}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Step {activeStep + 1} of {steps.length}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="pb-4">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === activeStep
                          ? "bg-primary-main text-white"
                          : index < activeStep ||
                            stepValidations[index]?.isValid
                          ? "bg-green-500 text-white"
                          : stepValidations[index] &&
                            !stepValidations[index].isValid &&
                            Object.keys(stepValidations[index].errors).length >
                              0
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index < activeStep || stepValidations[index]?.isValid
                        ? "✓"
                        : stepValidations[index] &&
                          !stepValidations[index].isValid &&
                          Object.keys(stepValidations[index].errors).length > 0
                        ? "!"
                        : step.icon}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        index === activeStep
                          ? "text-primary-main"
                          : index < activeStep ||
                            stepValidations[index]?.isValid
                          ? "text-green-600"
                          : stepValidations[index] &&
                            !stepValidations[index].isValid &&
                            Object.keys(stepValidations[index].errors).length >
                              0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 mx-4 h-0.5 ${
                        index < activeStep || stepValidations[index]?.isValid
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 0: Course Basics */}
        {activeStep === 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Course Information</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                      validationErrors.title
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter course title"
                    maxLength={100}
                  />
                  {validationErrors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.title}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {courseData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                      validationErrors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Describe what students will learn"
                    maxLength={500}
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {courseData.description.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group *
                  </label>
                  <select
                    value={courseData.ageGroup}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        ageGroup: e.target.value as any,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                      validationErrors.ageGroup
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="10-12">10-12 years</option>
                    <option value="13-15">13-15 years</option>
                    <option value="16-18">16-18 years</option>
                  </select>
                  {validationErrors.ageGroup && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.ageGroup}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (max 15)
                  </label>
                  <input
                    type="text"
                    placeholder="Type tags separated by commas and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        if (courseData.tags.length >= 15) {
                          toast.error("Maximum 15 tags allowed", errorStyles);
                          return;
                        }
                        const newTags = e.currentTarget.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0 && tag.length <= 50);

                        if (newTags.some((tag) => tag.length > 50)) {
                          toast.error(
                            "Tag length cannot exceed 50 characters",
                            errorStyles
                          );
                          return;
                        }

                        setCourseData((prev) => ({
                          ...prev,
                          tags: [
                            ...prev.tags,
                            ...newTags.filter(
                              (tag) => !prev.tags.includes(tag)
                            ),
                          ].slice(0, 15),
                        }));
                        e.currentTarget.value = "";
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                      validationErrors.tags
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {validationErrors.tags && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.tags}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {courseData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-main/10 text-primary-main"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            setCourseData((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((_, i) => i !== index),
                            }))
                          }
                          className="ml-1 hover:bg-primary-main/20 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {courseData.tags.length}/15 tags
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Objectives * (max 10)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter objective and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        if (courseData.learningObjectives.length >= 10) {
                          toast.error(
                            "Maximum 10 learning objectives allowed",
                            errorStyles
                          );
                          return;
                        }
                        const objective = e.currentTarget.value.trim();
                        if (objective.length > 200) {
                          toast.error(
                            "Learning objective cannot exceed 200 characters",
                            errorStyles
                          );
                          return;
                        }
                        setCourseData((prev) => ({
                          ...prev,
                          learningObjectives: [
                            ...prev.learningObjectives,
                            objective,
                          ],
                        }));
                        e.currentTarget.value = "";
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                      validationErrors.learningObjectives
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    maxLength={200}
                  />
                  {validationErrors.learningObjectives && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.learningObjectives}
                    </p>
                  )}
                  <ul className="mt-2 space-y-1">
                    {courseData.learningObjectives.map((objective, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{objective}</span>
                        <button
                          onClick={() =>
                            setCourseData((prev) => ({
                              ...prev,
                              learningObjectives:
                                prev.learningObjectives.filter(
                                  (_, i) => i !== index
                                ),
                            }))
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-500 text-xs mt-1">
                    {courseData.learningObjectives.length}/10 objectives
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Thumbnail *
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-main transition-colors ${
                    validationErrors.thumbnail
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto h-48 w-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview("");
                          if (isEditMode) {
                            setCourseData((prev) => ({
                              ...prev,
                              thumbnailUrl: undefined,
                            }));
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4">
                        <label
                          htmlFor="thumbnail-upload"
                          className="cursor-pointer"
                        >
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload a thumbnail
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 2MB
                          </span>
                        </label>
                        <input
                          ref={fileInputRef}
                          id="thumbnail-upload"
                          name="thumbnail-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {validationErrors.thumbnail && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.thumbnail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Learning Paths */}
        {activeStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Learning Paths</h2>
              <button
                onClick={addLearningPath}
                className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-secondary disabled:opacity-50"
                disabled={courseData.learningPaths.length >= 10}
              >
                + Add Path
              </button>
            </div>

            {validationErrors.learningPaths && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">
                  {validationErrors.learningPaths}
                </p>
              </div>
            )}

            {validationErrors.duplicate_orders && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">
                  {validationErrors.duplicate_orders}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {courseData.learningPaths.map((path, pathIndex) => (
                <div
                  key={pathIndex}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-md font-medium">
                      Path {pathIndex + 1}
                    </h3>
                    {courseData.learningPaths.length > 1 && (
                      <button
                        onClick={() => removeLearningPath(pathIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove Path
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Path Title *
                      </label>
                      <input
                        type="text"
                        value={path.title}
                        onChange={(e) =>
                          updateLearningPath(pathIndex, {
                            title: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                          validationErrors[`path_${pathIndex}_title`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., Introduction to Programming"
                        maxLength={100}
                      />
                      {validationErrors[`path_${pathIndex}_title`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`path_${pathIndex}_title`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <input
                        type="number"
                        value={path.order}
                        onChange={(e) =>
                          updateLearningPath(pathIndex, {
                            order: parseInt(e.target.value) || 1,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                          validationErrors[`path_${pathIndex}_order`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        min="1"
                      />
                      {validationErrors[`path_${pathIndex}_order`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`path_${pathIndex}_order`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={path.description || ""}
                      onChange={(e) =>
                        updateLearningPath(pathIndex, {
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        validationErrors[`path_${pathIndex}_description`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Describe this learning path..."
                      maxLength={300}
                    />
                    {validationErrors[`path_${pathIndex}_description`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors[`path_${pathIndex}_description`]}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {(path.description || "").length}/300 characters
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-4">
              {courseData.learningPaths.length}/10 paths
            </p>
          </div>
        )}

        {/* Step 2: Segments */}
        {activeStep === 2 && (
          <div className="space-y-6">
            {courseData.learningPaths.map((path, pathIndex) => (
              <div key={pathIndex} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Segments for: {path.title || `Path ${pathIndex + 1}`}
                  </h2>
                  <button
                    onClick={() => addSegment(pathIndex)}
                    className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-secondary disabled:opacity-50"
                    disabled={path.segments.length >= 20}
                  >
                    + Add Segment
                  </button>
                </div>

                {validationErrors[`path_${pathIndex}_segments`] && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">
                      {validationErrors[`path_${pathIndex}_segments`]}
                    </p>
                  </div>
                )}

                {validationErrors[`path_${pathIndex}_duplicate_orders`] && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">
                      {validationErrors[`path_${pathIndex}_duplicate_orders`]}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {path.segments.map((segment, segmentIndex) => (
                    <div
                      key={segmentIndex}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-md font-medium">
                          Segment {segmentIndex + 1}
                        </h3>
                        {path.segments.length > 1 && (
                          <button
                            onClick={() =>
                              removeSegment(pathIndex, segmentIndex)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            value={segment.type}
                            onChange={(e) => {
                              const newType = e.target.value as any;
                              updateSegment(pathIndex, segmentIndex, {
                                type: newType,
                                content: getDefaultContentForType(newType),
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                          >
                            {segmentTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Points (0-100)
                          </label>
                          <input
                            type="number"
                            value={segment.basePoints}
                            onChange={(e) =>
                              updateSegment(pathIndex, segmentIndex, {
                                basePoints: parseInt(e.target.value) || 0,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                              validationErrors[
                                `path_${pathIndex}_segment_${segmentIndex}_basePoints`
                              ]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min="0"
                            max="100"
                          />
                          {validationErrors[
                            `path_${pathIndex}_segment_${segmentIndex}_basePoints`
                          ] && (
                            <p className="text-red-500 text-xs mt-1">
                              {
                                validationErrors[
                                  `path_${pathIndex}_segment_${segmentIndex}_basePoints`
                                ]
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bonus Points (0-50)
                          </label>
                          <input
                            type="number"
                            value={segment.bonusPoints || ""}
                            onChange={(e) =>
                              updateSegment(pathIndex, segmentIndex, {
                                bonusPoints:
                                  parseInt(e.target.value) || undefined,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                              validationErrors[
                                `path_${pathIndex}_segment_${segmentIndex}_bonusPoints`
                              ]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min="0"
                            max="50"
                          />
                          {validationErrors[
                            `path_${pathIndex}_segment_${segmentIndex}_bonusPoints`
                          ] && (
                            <p className="text-red-500 text-xs mt-1">
                              {
                                validationErrors[
                                  `path_${pathIndex}_segment_${segmentIndex}_bonusPoints`
                                ]
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Content Configuration
                        </h4>
                        {renderSegmentContent(
                          pathIndex,
                          segmentIndex,
                          segment,
                          updateSegment,
                          validationErrors,
                          availableCharacters
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  {path.segments.length}/20 segments
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Characters */}
        {activeStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Featured Characters</h2>

            {validationErrors.featuredCharacters && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">
                  {validationErrors.featuredCharacters}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCharacters.map((character) => (
                <div
                  key={character.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    courseData.featuredCharacterIds.includes(character.id)
                      ? "border-primary-main bg-primary-main/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setCourseData((prev) => ({
                      ...prev,
                      featuredCharacterIds: prev.featuredCharacterIds.includes(
                        character.id
                      )
                        ? prev.featuredCharacterIds.filter(
                            (id) => id !== character.id
                          )
                        : prev.featuredCharacterIds.length >= 8
                        ? (toast.error(
                            "Maximum 8 featured characters allowed",
                            errorStyles
                          ),
                          prev.featuredCharacterIds)
                        : [...prev.featuredCharacterIds, character.id],
                    }));
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={character.avatarUrl}
                      alt={character.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {character.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {character.type}
                      </p>
                    </div>
                    {courseData.featuredCharacterIds.includes(character.id) && (
                      <div className="ml-auto text-primary-main">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-4">
              {courseData.featuredCharacterIds.length}/8 characters selected
            </p>
          </div>
        )}

        {/* Step 4: Review */}
        {activeStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Review Course</h2>

            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-800 font-medium mb-2">
                  Please fix the following errors:
                </h3>
                <ul className="text-red-600 text-sm space-y-1">
                  {Object.entries(validationErrors).map(([key, error]) => (
                    <li key={key}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Course Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>
                    <strong>Title:</strong> {courseData.title}
                  </p>
                  <p>
                    <strong>Description:</strong> {courseData.description}
                  </p>
                  <p>
                    <strong>Age Group:</strong> {courseData.ageGroup}
                  </p>
                  <p>
                    <strong>Tags:</strong>{" "}
                    {courseData.tags.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Learning Objectives:</strong>{" "}
                    {courseData.learningObjectives.length} objectives
                  </p>
                  <p>
                    <strong>Thumbnail:</strong>{" "}
                    {thumbnailFile || courseData.thumbnailUrl
                      ? "✓ Set"
                      : "Not uploaded"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Learning Paths ({courseData.learningPaths.length})
                </h3>
                {courseData.learningPaths.map((path, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 mb-2">
                    <p>
                      <strong>{path.title}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      {path.segments.length} segments, Order: {path.order}
                    </p>
                    {path.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {path.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Featured Characters ({courseData.featuredCharacterIds.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {courseData.featuredCharacterIds.map((characterId) => {
                    const character = availableCharacters.find(
                      (c) => c.id === characterId
                    );
                    return character ? (
                      <span
                        key={characterId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-main/10 text-primary-main"
                      >
                        {character.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Content Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>
                    <strong>Total Paths:</strong>{" "}
                    {courseData.learningPaths.length}
                  </p>
                  <p>
                    <strong>Total Segments:</strong>{" "}
                    {courseData.learningPaths.reduce(
                      (total, path) => total + path.segments.length,
                      0
                    )}
                  </p>
                  <p>
                    <strong>Total Base Points:</strong>{" "}
                    {courseData.learningPaths.reduce(
                      (total, path) =>
                        total +
                        path.segments.reduce(
                          (segmentTotal, segment) =>
                            segmentTotal + segment.basePoints,
                          0
                        ),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePreviousStep}
            disabled={activeStep === 0}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-secondary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? `${isEditMode ? "Updating" : "Creating"}...`
                : `${isEditMode ? "Update" : "Create"} Course`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCreation;
