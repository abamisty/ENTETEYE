"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  X,
  BookOpen,
  Video,
  HelpCircle,
  Activity,
  Clock,
  Tag,
  GraduationCap,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { courseApi } from "@/api/courses";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

// Enhanced Validation Schema
const CourseSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  ageGroup: Yup.string().required("Age group is required"),
  thumbnail: Yup.mixed().required("Thumbnail is required"),
  tags: Yup.array().of(Yup.string()),
  modules: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Module title is required"),
      lessons: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().required("Lesson title is required"),
          type: Yup.string().required("Lesson type is required"),
          durationMinutes: Yup.number()
            .positive("Duration must be positive")
            .required("Duration is required"),
          // content: Yup.string().when("type", {
          //   is: (type: string) => type === "reading",
          //   then: (schema) =>
          //     schema.required("Content is required for reading lessons"),
          //   otherwise: (schema) => schema,
          // }),
          // videoUrl: Yup.string().when("type", {
          //   is: (type: string) => type === "video",
          //   then: (schema) =>
          //     schema
          //       .url("Must be a valid URL")
          //       .required("Video URL is required"),
          //   otherwise: (schema) => schema,
          // }),
          // questions: Yup.array().when("type", {
          //   is: (type: string) => type === "quiz",
          //   then: (schema) =>
          //     schema
          //       .of(
          //         Yup.object().shape({
          //           question: Yup.string().required("Question is required"),
          //           options: Yup.array()
          //             .of(Yup.string().required("Option is required"))
          //             .min(2, "At least 2 options required"),
          //         })
          //       )
          //       .min(1, "At least one question is required for quiz"),
          //   otherwise: (schema) => schema,
          // }),
        })
      ),
    })
  ),
});

const CreateCoursePage: React.FC<any> = ({ onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  console.log(courseId);
  const isEditMode = !!courseId;
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    ageGroup: "",
    thumbnail: null,
    tags: [],
    modules: [
      {
        title: "",
        description: "",
        lessons: [
          {
            title: "",
            type: "",
            durationMinutes: 30,
            content: "",
            videoUrl: "",
            questions: [
              {
                question: "",
                options: ["", ""],
                correctAnswer: 0,
              },
            ],
          },
        ],
      },
    ],
  });

  const steps = [
    {
      title: "Course Details",
      description: "Set up basic course information and branding",
      icon: GraduationCap,
    },
    {
      title: "Modules Setup",
      description: "Structure your course with organized modules",
      icon: BookOpen,
    },
    {
      title: "Lessons Creation",
      description: "Build engaging lessons with various content types",
      icon: FileText,
    },
    {
      title: "Review & Submit",
      description: "Review and finalize your course creation",
      icon: Eye,
    },
  ];

  const lessonTypes = [
    {
      value: "video",
      label: "Video Lesson",
      icon: Video,
      color: "bg-red-100 text-red-700",
    },
    {
      value: "reading",
      label: "Reading Material",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "quiz",
      label: "Interactive Quiz",
      icon: HelpCircle,
      color: "bg-green-100 text-green-700",
    },
    {
      value: "activity",
      label: "Practical Activity",
      icon: Activity,
      color: "bg-purple-100 text-purple-700",
    },
  ];
  const router = useRouter();
  const ageGroups = [
    {
      value: "10-12",
      label: "10-12 years (Elementary)",
      description: "Basic concepts and interactive learning",
    },
    {
      value: "13-15",
      label: "13-15 years (Middle School)",
      description: "Intermediate topics with structured activities",
    },
    {
      value: "16-18",
      label: "16-18 years (High School)",
      description: "Advanced concepts and critical thinking",
    },
  ];

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      setFieldValue("thumbnail", file);
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (isEditMode) {
      const fetchCourseData = async () => {
        try {
          const response = await courseApi.getCourse(courseId);
          if (response.success) {
            const course = response.data;
            setInitialValues({
              title: course.title,
              description: course.description,
              ageGroup: course.ageGroup,
              thumbnail: course.thumbnailUrl,
              tags: course.tags || [],
              modules: course.modules || [
                {
                  title: "",
                  description: "",
                  lessons: [
                    {
                      title: "",
                      type: "",
                      durationMinutes: 30,
                      content: "",
                      videoUrl: "",
                      questions: [
                        {
                          question: "",
                          options: ["", ""],
                          correctAnswer: 0,
                        },
                      ],
                    },
                  ],
                },
              ],
            });
            setThumbnailPreview(course.thumbnailUrl);
          } else {
            router.push("/admin/courses");
          }
        } catch (error) {
          router.push("/admin/courses");
        }
      };
      fetchCourseData();
    }
  }, [courseId, isEditMode, router]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      // Append the thumbnail file if exists
      if (thumbnailFile) {
        formData.append("file", thumbnailFile);
      } else if (thumbnailPreview && typeof thumbnailPreview === "string") {
        // If keeping existing thumbnail
        formData.append("thumbnailUrl", thumbnailPreview);
      }

      // Append all other course data as JSON
      const courseData = {
        title: values.title,
        description: values.description,
        ageGroup: values.ageGroup,
        tags: values.tags || [],
        learningObjectives: [], // Add this if needed
        modules: values.modules.map((module: any) => ({
          title: module.title,
          description: module.description || "",
          order: module.order || 0,
          lessons: module.lessons.map((lesson: any) => ({
            title: lesson.title,
            description: lesson.description || "",
            type: lesson.type || "reading",
            order: lesson.order || 0,
            durationMinutes: lesson.durationMinutes || 0,
            // Type-specific fields
            ...(lesson.type === "video" && { videoUrl: lesson.videoUrl || "" }),
            ...(lesson.type === "quiz" && { quiz: lesson.questions || [] }),
            ...(lesson.type === "activity" && {
              activity: { instructions: lesson.content || "" },
            }),
            ...(lesson.type === "reading" && {
              readingContent: lesson.content || "",
            }),
          })),
        })),
      };

      formData.append("data", JSON.stringify(courseData));

      if (isEditMode) {
        const response = await courseApi.updateCourse(courseId, formData);
        if (response.success) {
          // router.push("/admin/courses");
        }
      } else {
        const response = await courseApi.createCourse(formData);
        if (response.success) {
          // router.push("/admin/courses");
        }
      }
    } catch (error: any) {
      console.error("Operation failed:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } course. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (values: any, errors: any, step: number) => {
    switch (step) {
      case 0:
        return (
          !errors.title &&
          !errors.description &&
          !errors.ageGroup &&
          !errors.thumbnail &&
          values.title &&
          values.description &&
          values.ageGroup &&
          values.thumbnail
        );
      case 1:
        return values.modules.every(
          (module: any, index: number) =>
            !errors.modules?.[index]?.title && module.title
        );
      case 2:
        return values.modules.every((module: any, moduleIndex: number) =>
          module.lessons.every((lesson: any, lessonIndex: number) => {
            const lessonErrors =
              errors.modules?.[moduleIndex]?.lessons?.[lessonIndex];

            let typeSpecificValid = true;

            // Check type-specific validation
            if (lesson.type === "video" && !lesson.videoUrl) {
              typeSpecificValid = false;
            }
            if (lesson.type === "reading" && !lesson.content) {
              typeSpecificValid = false;
            }
            if (
              lesson.type === "quiz" &&
              (!lesson.questions || lesson.questions.length === 0)
            ) {
              typeSpecificValid = false;
            }

            return (
              !lessonErrors?.title &&
              !lessonErrors?.type &&
              !lessonErrors?.durationMinutes &&
              lesson.title &&
              lesson.type &&
              lesson.durationMinutes &&
              typeSpecificValid
            );
          })
        );
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-secondary rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEditMode ? "Update Course" : "Create New Course"}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isEditMode
                    ? "Edit your course content"
                    : "Build engaging educational content for your students"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Step {activeStep + 1} of {steps.length}
              </div>
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stepper */}
        <Card className="mb-8 border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;

                return (
                  <React.Fragment key={index}>
                    <div
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                        isActive ? "scale-105" : ""
                      }`}
                      onClick={() => !isSubmitting && setActiveStep(index)}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${
                          isCompleted
                            ? "bg-green-500 text-white shadow-lg"
                            : isActive
                            ? "bg-primary-secondary text-white shadow-lg ring-4 ring-blue-200 dark:ring-blue-800"
                            : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <span
                          className={`text-sm font-semibold block ${
                            isActive
                              ? "text-primary-secondary dark:text-blue-400"
                              : isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-24 block">
                          {step.description}
                        </span>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            index < activeStep
                              ? "bg-green-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Formik
          initialValues={initialValues}
          validationSchema={CourseSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue }: any) => (
            <Form className="space-y-6">
              {/* Step 1: Enhanced Course Details */}
              {activeStep === 0 && (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl">
                      <GraduationCap className="mr-3 h-6 w-6 text-primary-secondary" />
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-sm font-semibold"
                          >
                            Course Title *
                          </Label>
                          <Field
                            as={Input}
                            id="title"
                            name="title"
                            placeholder="e.g., Introduction to Web Development"
                            className="h-11"
                            disabled={isSubmitting}
                          />
                          {errors.title && touched.title && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.title}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-sm font-semibold"
                          >
                            Course Description *
                          </Label>
                          <Field
                            as={Textarea}
                            id="description"
                            name="description"
                            placeholder="Describe what students will learn and achieve in this course..."
                            rows={4}
                            className="resize-none"
                            disabled={isSubmitting}
                          />
                          {errors.description && touched.description && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="ageGroup"
                            className="text-sm font-semibold"
                          >
                            Target Age Group *
                          </Label>
                          <Select
                            onValueChange={(value) =>
                              setFieldValue("ageGroup", value)
                            }
                            value={values.ageGroup}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select target age group" />
                            </SelectTrigger>
                            <SelectContent>
                              {ageGroups.map((group) => (
                                <SelectItem
                                  key={group.value}
                                  value={group.value}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {group.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {group.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.ageGroup && touched.ageGroup && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ageGroup}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center">
                            <Tag className="mr-2 h-4 w-4" />
                            Course Tags
                          </Label>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                              {values.tags.length === 0 && (
                                <span className="text-slate-400 text-sm">
                                  No tags added yet
                                </span>
                              )}
                              {values.tags.map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1 px-3 py-1"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTags = [...values.tags];
                                      newTags.splice(index, 1);
                                      setFieldValue("tags", newTags);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                                    disabled={isSubmitting}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <Input
                              placeholder="Type a tag and press Enter (e.g., programming, beginner, web-development)"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  e.currentTarget.value.trim()
                                ) {
                                  e.preventDefault();
                                  const newTag = e.currentTarget.value.trim();
                                  if (!values.tags.includes(newTag)) {
                                    setFieldValue("tags", [
                                      ...values.tags,
                                      newTag,
                                    ]);
                                  }
                                  e.currentTarget.value = "";
                                }
                              }}
                              className="h-11"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Thumbnail */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Course Thumbnail *
                        </Label>
                        <div className="relative">
                          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                            {thumbnailPreview ? (
                              <div className="relative">
                                <img
                                  src={thumbnailPreview}
                                  alt="Course thumbnail"
                                  className="mx-auto h-48 w-full object-cover rounded-lg shadow-sm"
                                />
                                <button
                                  type="button"
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                  onClick={() => {
                                    setFieldValue("thumbnail", null);
                                    setThumbnailFile(null);
                                    setThumbnailPreview(null);
                                  }}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                <div>
                                  <label
                                    htmlFor="thumbnail"
                                    className={`cursor-pointer inline-flex items-center px-4 py-2 bg-primary-secondary hover:bg-blue-700 text-white rounded-lg transition-colors ${
                                      isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose Image
                                  </label>
                                  <input
                                    id="thumbnail"
                                    name="thumbnail"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleThumbnailChange(e, setFieldValue)
                                    }
                                    disabled={isSubmitting}
                                  />
                                </div>
                                <p className="text-sm text-slate-500">
                                  PNG, JPG up to 2MB • Recommended: 1280x720px
                                </p>
                              </div>
                            )}
                          </div>
                          {errors.thumbnail && touched.thumbnail && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.thumbnail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Enhanced Modules Setup */}
              {activeStep === 1 && (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl">
                      <BookOpen className="mr-3 h-6 w-6 text-primary-secondary" />
                      Course Modules
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Organize your course content into structured modules
                    </p>
                  </CardHeader>
                  <CardContent>
                    <FieldArray name="modules">
                      {({ push, remove }) => (
                        <div className="space-y-6">
                          {values.modules.map(
                            (module: any, moduleIndex: any) => (
                              <Card
                                key={moduleIndex}
                                className="border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                              >
                                <CardHeader className="pb-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-sm font-semibold text-primary-secondary dark:text-blue-400">
                                          {moduleIndex + 1}
                                        </span>
                                      </div>
                                      <CardTitle className="text-lg">
                                        Module {moduleIndex + 1}
                                      </CardTitle>
                                    </div>
                                    {values.modules.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(moduleIndex)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        disabled={isSubmitting}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Module
                                      </Button>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`modules.${moduleIndex}.title`}
                                      className="text-sm font-semibold"
                                    >
                                      Module Title *
                                    </Label>
                                    <Field
                                      as={Input}
                                      id={`modules.${moduleIndex}.title`}
                                      name={`modules.${moduleIndex}.title`}
                                      placeholder="e.g., Getting Started with HTML"
                                      className="h-11"
                                      disabled={isSubmitting}
                                    />
                                    {errors.modules?.[moduleIndex]?.title &&
                                      touched.modules?.[moduleIndex]?.title && (
                                        <p className="text-red-500 text-xs">
                                          {
                                            errors.modules[moduleIndex]
                                              .description
                                          }
                                        </p>
                                      )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              push({
                                title: "",
                                description: "",
                                lessons: [
                                  {
                                    title: "",
                                    type: "",
                                    durationMinutes: 30,
                                    content: "",
                                    videoUrl: "",
                                    questions: [
                                      {
                                        question: "",
                                        options: ["", ""],
                                        correctAnswer: 0,
                                      },
                                    ],
                                  },
                                ],
                              })
                            }
                            className="w-full h-12 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            disabled={isSubmitting}
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Module
                          </Button>
                        </div>
                      )}
                    </FieldArray>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Enhanced Lessons Creation */}
              {activeStep === 2 && (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="mr-3 h-6 w-6 text-primary-secondary" />
                      Module Lessons
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Create engaging lessons with various content types
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-4">
                      {values.modules.map((module: any, moduleIndex: any) => (
                        <AccordionItem
                          key={moduleIndex}
                          value={`module-${moduleIndex}`}
                          className="border border-slate-200 dark:border-slate-700 rounded-lg px-0"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-semibold text-primary-secondary dark:text-blue-400">
                                  {moduleIndex + 1}
                                </span>
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold">
                                  {module.title || `Module ${moduleIndex + 1}`}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {module.lessons.length} lesson
                                  {module.lessons.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <FieldArray name={`modules.${moduleIndex}.lessons`}>
                              {({ push, remove }) => (
                                <div className="space-y-6">
                                  {module.lessons.map(
                                    (lesson: any, lessonIndex: any) => {
                                      const lessonType = lessonTypes.find(
                                        (type) => type.value === lesson.type
                                      );
                                      const LessonIcon =
                                        lessonType?.icon || FileText;

                                      return (
                                        <Card
                                          key={lessonIndex}
                                          className="border border-slate-200 dark:border-slate-700"
                                        >
                                          <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start">
                                              <div className="flex items-center">
                                                <div
                                                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                                    lessonType?.color ||
                                                    "bg-slate-100 text-slate-600"
                                                  }`}
                                                >
                                                  <LessonIcon className="w-4 h-4" />
                                                </div>
                                                <CardTitle className="text-base">
                                                  Lesson {lessonIndex + 1}
                                                </CardTitle>
                                              </div>
                                              {module.lessons.length > 1 && (
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    remove(lessonIndex)
                                                  }
                                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                  disabled={isSubmitting}
                                                >
                                                  <Trash2 className="w-4 h-4 mr-2" />
                                                  Remove
                                                </Button>
                                              )}
                                            </div>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                              <Label className="text-sm font-semibold">
                                                Lesson Title *
                                              </Label>
                                              <Field
                                                as={Input}
                                                name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                                                placeholder="e.g., Creating Your First HTML Page"
                                                className="h-11"
                                                disabled={isSubmitting}
                                              />
                                              {errors.modules?.[moduleIndex]
                                                ?.lessons?.[lessonIndex]
                                                ?.title &&
                                                touched.modules?.[moduleIndex]
                                                  ?.lessons?.[lessonIndex]
                                                  ?.title && (
                                                  <p className="text-red-500 text-xs">
                                                    {
                                                      errors.modules[
                                                        moduleIndex
                                                      ].lessons[lessonIndex]
                                                        .title
                                                    }
                                                  </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                  Lesson Type *
                                                </Label>
                                                <Select
                                                  onValueChange={(value) =>
                                                    setFieldValue(
                                                      `modules.${moduleIndex}.lessons.${lessonIndex}.type`,
                                                      value
                                                    )
                                                  }
                                                  value={lesson.type}
                                                  disabled={isSubmitting}
                                                >
                                                  <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select lesson type" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {lessonTypes.map((type) => {
                                                      const Icon = type.icon;
                                                      return (
                                                        <SelectItem
                                                          key={type.value}
                                                          value={type.value}
                                                        >
                                                          <div className="flex items-center">
                                                            <Icon className="mr-2 h-4 w-4" />
                                                            {type.label}
                                                          </div>
                                                        </SelectItem>
                                                      );
                                                    })}
                                                  </SelectContent>
                                                </Select>
                                                {errors.modules?.[moduleIndex]
                                                  ?.lessons?.[lessonIndex]
                                                  ?.type &&
                                                  touched.modules?.[moduleIndex]
                                                    ?.lessons?.[lessonIndex]
                                                    ?.type && (
                                                    <p className="text-red-500 text-xs">
                                                      {
                                                        errors.modules[
                                                          moduleIndex
                                                        ].lessons[lessonIndex]
                                                          .type
                                                      }
                                                    </p>
                                                  )}
                                              </div>

                                              <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center">
                                                  <Clock className="mr-1 h-4 w-4" />
                                                  Duration (minutes) *
                                                </Label>
                                                <Field
                                                  as={Input}
                                                  type="number"
                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationMinutes`}
                                                  min="1"
                                                  max="180"
                                                  className="h-11"
                                                  disabled={isSubmitting}
                                                />
                                                {errors.modules?.[moduleIndex]
                                                  ?.lessons?.[lessonIndex]
                                                  ?.durationMinutes &&
                                                  touched.modules?.[moduleIndex]
                                                    ?.lessons?.[lessonIndex]
                                                    ?.durationMinutes && (
                                                    <p className="text-red-500 text-xs">
                                                      {
                                                        errors.modules[
                                                          moduleIndex
                                                        ].lessons[lessonIndex]
                                                          .durationMinutes
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                            </div>

                                            {/* Content based on lesson type */}
                                            {lesson.type === "video" && (
                                              <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center">
                                                  <Video className="mr-1 h-4 w-4" />
                                                  Video URL *
                                                </Label>
                                                <Field
                                                  as={Input}
                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`}
                                                  placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                                                  className="h-11"
                                                  disabled={isSubmitting}
                                                />
                                                {errors.modules?.[moduleIndex]
                                                  ?.lessons?.[lessonIndex]
                                                  ?.videoUrl &&
                                                  touched.modules?.[moduleIndex]
                                                    ?.lessons?.[lessonIndex]
                                                    ?.videoUrl && (
                                                    <p className="text-red-500 text-xs">
                                                      {
                                                        errors.modules[
                                                          moduleIndex
                                                        ].lessons[lessonIndex]
                                                          .videoUrl
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                            )}

                                            {lesson.type === "reading" && (
                                              <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center">
                                                  <BookOpen className="mr-1 h-4 w-4" />
                                                  Reading Content *
                                                </Label>
                                                <Field
                                                  as={Textarea}
                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.content`}
                                                  placeholder="Enter the lesson content here. You can include explanations, examples, and instructions..."
                                                  rows={8}
                                                  className="resize-none"
                                                  disabled={isSubmitting}
                                                />
                                                {errors.modules?.[moduleIndex]
                                                  ?.lessons?.[lessonIndex]
                                                  ?.content &&
                                                  touched.modules?.[moduleIndex]
                                                    ?.lessons?.[lessonIndex]
                                                    ?.content && (
                                                    <p className="text-red-500 text-xs">
                                                      {
                                                        errors.modules[
                                                          moduleIndex
                                                        ].lessons[lessonIndex]
                                                          .content
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                            )}

                                            {lesson.type === "activity" && (
                                              <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center">
                                                  <Activity className="mr-1 h-4 w-4" />
                                                  Activity Instructions
                                                </Label>
                                                <Field
                                                  as={Textarea}
                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.content`}
                                                  placeholder="Describe the activity, what students need to do, and any materials required..."
                                                  rows={6}
                                                  className="resize-none"
                                                  disabled={isSubmitting}
                                                />
                                              </div>
                                            )}

                                            {lesson.type === "quiz" && (
                                              <div className="space-y-4">
                                                <Label className="text-sm font-semibold flex items-center">
                                                  <HelpCircle className="mr-1 h-4 w-4" />
                                                  Quiz Questions
                                                </Label>
                                                <FieldArray
                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions`}
                                                >
                                                  {({
                                                    push: pushQuestion,
                                                    remove: removeQuestion,
                                                  }) => (
                                                    <div className="space-y-4">
                                                      {lesson.questions?.map(
                                                        (
                                                          question: any,
                                                          questionIndex: any
                                                        ) => (
                                                          <Card
                                                            key={questionIndex}
                                                            className="bg-slate-50 dark:bg-slate-800"
                                                          >
                                                            <CardHeader className="pb-3">
                                                              <div className="flex justify-between items-center">
                                                                <CardTitle className="text-sm">
                                                                  Question{" "}
                                                                  {questionIndex +
                                                                    1}
                                                                </CardTitle>
                                                                {lesson
                                                                  .questions
                                                                  .length >
                                                                  1 && (
                                                                  <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                      removeQuestion(
                                                                        questionIndex
                                                                      )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700"
                                                                    disabled={
                                                                      isSubmitting
                                                                    }
                                                                  >
                                                                    <Trash2 className="w-4 h-4" />
                                                                  </Button>
                                                                )}
                                                              </div>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                              <div className="space-y-2">
                                                                <Label className="text-sm font-medium">
                                                                  Question Text
                                                                  *
                                                                </Label>
                                                                <Field
                                                                  as={Input}
                                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.question`}
                                                                  placeholder="Enter your question here..."
                                                                  className="h-11"
                                                                  disabled={
                                                                    isSubmitting
                                                                  }
                                                                />
                                                              </div>

                                                              <div className="space-y-2">
                                                                <Label className="text-sm font-medium">
                                                                  Answer Options
                                                                  *
                                                                </Label>
                                                                <FieldArray
                                                                  name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options`}
                                                                >
                                                                  {({
                                                                    push: pushOption,
                                                                    remove:
                                                                      removeOption,
                                                                  }) => (
                                                                    <div className="space-y-2">
                                                                      {question.options?.map(
                                                                        (
                                                                          option: any,
                                                                          optionIndex: any
                                                                        ) => (
                                                                          <div
                                                                            key={
                                                                              optionIndex
                                                                            }
                                                                            className="flex items-center space-x-2"
                                                                          >
                                                                            <input
                                                                              type="radio"
                                                                              name={`question-${moduleIndex}-${lessonIndex}-${questionIndex}`}
                                                                              checked={
                                                                                question.correctAnswer ===
                                                                                optionIndex
                                                                              }
                                                                              onChange={() =>
                                                                                setFieldValue(
                                                                                  `modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.correctAnswer`,
                                                                                  optionIndex
                                                                                )
                                                                              }
                                                                              className="text-green-600"
                                                                              disabled={
                                                                                isSubmitting
                                                                              }
                                                                            />
                                                                            <Field
                                                                              as={
                                                                                Input
                                                                              }
                                                                              name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options.${optionIndex}`}
                                                                              placeholder={`Option ${
                                                                                optionIndex +
                                                                                1
                                                                              }`}
                                                                              className="flex-1 h-10"
                                                                              disabled={
                                                                                isSubmitting
                                                                              }
                                                                            />
                                                                            {question
                                                                              .options
                                                                              .length >
                                                                              2 && (
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                  removeOption(
                                                                                    optionIndex
                                                                                  )
                                                                                }
                                                                                className="text-red-500 hover:text-red-700"
                                                                                disabled={
                                                                                  isSubmitting
                                                                                }
                                                                              >
                                                                                <X className="w-4 h-4" />
                                                                              </Button>
                                                                            )}
                                                                          </div>
                                                                        )
                                                                      )}
                                                                      {question
                                                                        .options
                                                                        .length <
                                                                        6 && (
                                                                        <Button
                                                                          type="button"
                                                                          variant="outline"
                                                                          size="sm"
                                                                          onClick={() =>
                                                                            pushOption(
                                                                              ""
                                                                            )
                                                                          }
                                                                          className="w-full"
                                                                          disabled={
                                                                            isSubmitting
                                                                          }
                                                                        >
                                                                          <Plus className="w-4 h-4 mr-2" />
                                                                          Add
                                                                          Option
                                                                        </Button>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                </FieldArray>
                                                                <p className="text-xs text-slate-500">
                                                                  Select the
                                                                  correct answer
                                                                  by clicking
                                                                  the radio
                                                                  button
                                                                </p>
                                                              </div>
                                                            </CardContent>
                                                          </Card>
                                                        )
                                                      )}

                                                      <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                          pushQuestion({
                                                            question: "",
                                                            options: ["", ""],
                                                            correctAnswer: 0,
                                                          })
                                                        }
                                                        className="w-full"
                                                        disabled={isSubmitting}
                                                      >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Question
                                                      </Button>
                                                    </div>
                                                  )}
                                                </FieldArray>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      );
                                    }
                                  )}

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      push({
                                        title: "",
                                        type: "",
                                        durationMinutes: 30,
                                        content: "",
                                        videoUrl: "",
                                        questions: [
                                          {
                                            question: "",
                                            options: ["", ""],
                                            correctAnswer: 0,
                                          },
                                        ],
                                      })
                                    }
                                    className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    disabled={isSubmitting}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Lesson
                                  </Button>
                                </div>
                              )}
                            </FieldArray>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Enhanced Review & Submit */}
              {activeStep === 3 && (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl">
                      <Eye className="mr-3 h-6 w-6 text-primary-secondary" />
                      Review Your Course
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Review all course details before submission
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Course Overview */}
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                          <GraduationCap className="mr-2 h-5 w-5 text-primary-secondary" />
                          Course Overview
                        </h3>
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-4">
                                <div>
                                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Course Title
                                  </Label>
                                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {values.title || "Untitled Course"}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Description
                                  </Label>
                                  <p className="text-slate-700 dark:text-slate-300">
                                    {values.description ||
                                      "No description provided"}
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                      Age Group
                                    </Label>
                                    <p className="font-medium">
                                      {ageGroups.find(
                                        (g) => g.value === values.ageGroup
                                      )?.label || "Not selected"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                      Total Modules
                                    </Label>
                                    <p className="font-medium">
                                      {values.modules.length}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Tags
                                  </Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {values.tags.length > 0 ? (
                                      values.tags.map(
                                        (tag: string, index: number) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800"
                                          >
                                            {tag}
                                          </Badge>
                                        )
                                      )
                                    ) : (
                                      <span className="text-slate-500">
                                        No tags added
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Course Thumbnail
                                </Label>
                                {thumbnailPreview ? (
                                  <img
                                    src={thumbnailPreview}
                                    alt="Course thumbnail"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-white shadow-sm mt-2"
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mt-2">
                                    <span className="text-slate-500">
                                      No thumbnail
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Course Structure */}
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                          <BookOpen className="mr-2 h-5 w-5 text-primary-secondary" />
                          Course Structure
                        </h3>
                        <div className="space-y-4">
                          {values.modules.map(
                            (module: any, moduleIndex: number) => (
                              <Card
                                key={moduleIndex}
                                className="border border-slate-200 dark:border-slate-700"
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-semibold text-primary-secondary dark:text-blue-400">
                                        {moduleIndex + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <CardTitle className="text-base">
                                        {module.title ||
                                          `Module ${moduleIndex + 1}`}
                                      </CardTitle>
                                      <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {module.lessons.length} lesson
                                        {module.lessons.length !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                    {module.description ||
                                      "No description provided"}
                                  </p>
                                  <div className="space-y-2">
                                    {module.lessons.map(
                                      (lesson: any, lessonIndex: number) => {
                                        const lessonType = lessonTypes.find(
                                          (type) => type.value === lesson.type
                                        );
                                        const LessonIcon =
                                          lessonType?.icon || FileText;

                                        return (
                                          <div
                                            key={lessonIndex}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                          >
                                            <div className="flex items-center">
                                              <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                                  lessonType?.color ||
                                                  "bg-slate-200 text-slate-600"
                                                }`}
                                              >
                                                <LessonIcon className="w-3 h-3" />
                                              </div>
                                              <div>
                                                <p className="font-medium text-sm">
                                                  {lesson.title ||
                                                    `Lesson ${lessonIndex + 1}`}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                  {lessonType?.label ||
                                                    "No type selected"}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500">
                                              <Clock className="w-3 h-3 mr-1" />
                                              {lesson.durationMinutes} min
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      </div>

                      {/* Course Statistics */}
                      <div>
                        <h3 className="font-semibold text-lg mb-4">
                          Course Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="text-center p-4">
                            <div className="text-2xl font-bold text-primary-secondary">
                              {values.modules.length}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Modules
                            </p>
                          </Card>
                          <Card className="text-center p-4">
                            <div className="text-2xl font-bold text-green-600">
                              {values.modules.reduce(
                                (acc: number, module: any) =>
                                  acc + module.lessons.length,
                                0
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Lessons
                            </p>
                          </Card>
                          <Card className="text-center p-4">
                            <div className="text-2xl font-bold text-purple-600">
                              {values.modules.reduce(
                                (acc: number, module: any) =>
                                  acc +
                                  module.lessons.reduce(
                                    (lessonAcc: number, lesson: any) =>
                                      lessonAcc + (lesson.durationMinutes || 0),
                                    0
                                  ),
                                0
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Total Minutes
                            </p>
                          </Card>
                          <Card className="text-center p-4">
                            <div className="text-2xl font-bold text-orange-600">
                              {values.modules.reduce(
                                (acc: number, module: any) =>
                                  acc +
                                  module.lessons
                                    .filter(
                                      (lesson: any) => lesson.type === "quiz"
                                    )
                                    .reduce(
                                      (quizAcc: number, lesson: any) =>
                                        quizAcc +
                                        (lesson.questions?.length || 0),
                                      0
                                    ),
                                0
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Quiz Questions
                            </p>
                          </Card>
                        </div>
                      </div>

                      {/* Submit Progress */}
                      {isSubmitting && (
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                  Creating Your Course...
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  Please wait while we set up your course
                                  structure and content.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Navigation */}
              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setActiveStep((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={activeStep === 0 || isSubmitting}
                      className="flex items-center px-6 py-2"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Step
                    </Button>

                    <div className="flex items-center space-x-2">
                      {activeStep < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={() => {
                            const canProceed = validateStep(
                              values,
                              errors,
                              activeStep
                            );
                            if (canProceed) {
                              setActiveStep((prev) => prev + 1);
                            } else {
                              toast.error(
                                "Please fill in all required fields before proceeding."
                              );
                            }
                          }}
                          className="px-6 py-2 bg-primary-secondary text-white hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-2 bg-green-600 text-white hover:bg-green-700"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating Course...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Create Course
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateCoursePage;
