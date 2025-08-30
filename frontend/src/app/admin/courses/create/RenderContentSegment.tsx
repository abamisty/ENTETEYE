import { errorStyles } from "@/lib/constants";
import { LearningSegment } from "@/lib/utils";
import toast from "react-hot-toast";

export const renderSegmentContent = (
  pathIndex: number,
  segmentIndex: number,
  segment: LearningSegment,
  updateSegment: any,
  validationErrors: any,
  availableCharacters: any
) => {
  const updateSegmentContent = (content: any) => {
    updateSegment(pathIndex, segmentIndex, { content });
  };

  const segmentKey = `path_${pathIndex}_segment_${segmentIndex}`;

  switch (segment.type) {
    case "instruction":
    case "review":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {segment.type === "instruction" ? "Instruction" : "Review"} Text *
            </label>
            <textarea
              value={segment.content?.instruction?.text || ""}
              onChange={(e) =>
                updateSegmentContent({
                  instruction: {
                    ...segment.content?.instruction,
                    text: e.target.value,
                  },
                })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                validationErrors[`${segmentKey}_content`]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder={`Enter ${segment.type} content...`}
              maxLength={2000}
            />
            {validationErrors[`${segmentKey}_content`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_content`]}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {segment.content?.instruction?.text?.length || 0}/2000 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media URL (optional)
            </label>
            <input
              type="url"
              value={segment.content?.instruction?.mediaUrl || ""}
              onChange={(e) =>
                updateSegmentContent({
                  instruction: {
                    ...segment.content?.instruction,
                    mediaUrl: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="https://example.com/media.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media Type
            </label>
            <select
              value={segment.content?.instruction?.mediaType || "image"}
              onChange={(e) =>
                updateSegmentContent({
                  instruction: {
                    ...segment.content?.instruction,
                    mediaType: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      );

    case "question":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={segment.content?.question?.text || ""}
              onChange={(e) =>
                updateSegmentContent({
                  question: {
                    ...segment.content?.question,
                    text: e.target.value,
                  },
                })
              }
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                validationErrors[`${segmentKey}_content`]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter your question..."
              maxLength={500}
            />
            {validationErrors[`${segmentKey}_content`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_content`]}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {segment.content?.question?.text?.length || 0}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={segment.content?.question?.type || "multiple-choice"}
              onChange={(e) => {
                const newType = e.target.value;
                let newContent = {
                  ...segment.content?.question,
                  type: newType,
                };

                // Reset content based on type
                if (newType === "multiple-choice") {
                  newContent.options = [
                    { id: "1", text: "", isCorrect: false },
                    { id: "2", text: "", isCorrect: false },
                  ];
                  delete newContent.correctAnswer;
                } else {
                  delete newContent.options;
                  newContent.correctAnswer = "";
                }

                updateSegmentContent({ question: newContent });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
            </select>
          </div>

          {/* Multiple Choice Options */}
          {segment.content?.question?.type === "multiple-choice" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Options (2-6 options) *
              </label>
              <div className="space-y-2">
                {(segment.content?.question?.options || []).map(
                  (option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${pathIndex}-${segmentIndex}`}
                        checked={option.isCorrect}
                        onChange={() => {
                          const updatedOptions =
                            segment.content?.question?.options?.map(
                              (opt, idx) => ({
                                ...opt,
                                isCorrect: idx === optionIndex,
                              })
                            ) || [];
                          updateSegmentContent({
                            question: {
                              ...segment.content?.question,
                              options: updatedOptions,
                            },
                          });
                        }}
                        className="text-primary-main"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const updatedOptions =
                            segment.content?.question?.options?.map(
                              (opt, idx) =>
                                idx === optionIndex
                                  ? { ...opt, text: e.target.value }
                                  : opt
                            ) || [];
                          updateSegmentContent({
                            question: {
                              ...segment.content?.question,
                              options: updatedOptions,
                            },
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                        placeholder={`Option ${optionIndex + 1}`}
                        maxLength={100}
                      />
                      <button
                        onClick={() => {
                          const options =
                            segment.content?.question?.options || [];
                          if (options.length <= 2) {
                            toast.error(
                              "Must have at least 2 options",
                              errorStyles
                            );
                            return;
                          }
                          const updatedOptions = options.filter(
                            (_, idx) => idx !== optionIndex
                          );
                          updateSegmentContent({
                            question: {
                              ...segment.content?.question,
                              options: updatedOptions,
                            },
                          });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={
                          (segment.content?.question?.options?.length || 0) <= 2
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )
                )}
                <button
                  onClick={() => {
                    const options = segment.content?.question?.options || [];
                    if (options.length >= 6) {
                      toast.error("Maximum 6 options allowed", errorStyles);
                      return;
                    }
                    const newOption = {
                      id: (options.length + 1).toString(),
                      text: "",
                      isCorrect: false,
                    };
                    const updatedOptions = [...options, newOption];
                    updateSegmentContent({
                      question: {
                        ...segment.content?.question,
                        options: updatedOptions,
                      },
                    });
                  }}
                  className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main"
                  disabled={
                    (segment.content?.question?.options?.length || 0) >= 6
                  }
                >
                  + Add Option
                </button>
              </div>
              {(validationErrors[`${segmentKey}_options`] ||
                validationErrors[`${segmentKey}_correct`] ||
                validationErrors[`${segmentKey}_empty_options`]) && (
                <div className="text-red-500 text-sm mt-1">
                  {validationErrors[`${segmentKey}_options`] ||
                    validationErrors[`${segmentKey}_correct`] ||
                    validationErrors[`${segmentKey}_empty_options`]}
                </div>
              )}
            </div>
          )}

          {/* True/False Options */}
          {segment.content?.question?.type === "true-false" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`true-false-${pathIndex}-${segmentIndex}`}
                    value="true"
                    checked={
                      segment.content?.question?.correctAnswer === "true"
                    }
                    onChange={(e) =>
                      updateSegmentContent({
                        question: {
                          ...segment.content?.question,
                          correctAnswer: e.target.value,
                        },
                      })
                    }
                    className="mr-2 text-primary-main"
                  />
                  True
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`true-false-${pathIndex}-${segmentIndex}`}
                    value="false"
                    checked={
                      segment.content?.question?.correctAnswer === "false"
                    }
                    onChange={(e) =>
                      updateSegmentContent({
                        question: {
                          ...segment.content?.question,
                          correctAnswer: e.target.value,
                        },
                      })
                    }
                    className="mr-2 text-primary-main"
                  />
                  False
                </label>
              </div>
              {validationErrors[`${segmentKey}_correct_answer`] && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors[`${segmentKey}_correct_answer`]}
                </p>
              )}
            </div>
          )}

          {/* Explanation for all question types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (optional)
            </label>
            <textarea
              value={segment.content?.question?.explanation || ""}
              onChange={(e) =>
                updateSegmentContent({
                  question: {
                    ...segment.content?.question,
                    explanation: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Explain why this is the correct answer..."
              maxLength={300}
            />
            <p className="text-gray-500 text-xs mt-1">
              {segment.content?.question?.explanation?.length || 0}/300
              characters
            </p>
          </div>
        </div>
      );

    case "dialogue":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Scene
            </label>
            <input
              type="text"
              value={segment.content?.dialogue?.backgroundScene || ""}
              onChange={(e) =>
                updateSegmentContent({
                  dialogue: {
                    ...segment.content?.dialogue,
                    backgroundScene: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Describe the scene setting..."
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Dialogues (1-4 characters) *
            </label>
            <div className="space-y-3">
              {(segment.content?.dialogue?.characters || []).map(
                (char, charIndex) => (
                  <div key={charIndex} className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <select
                        value={char.characterId}
                        onChange={(e) => {
                          const updatedChars =
                            segment.content?.dialogue?.characters?.map(
                              (c, idx) =>
                                idx === charIndex
                                  ? { ...c, characterId: e.target.value }
                                  : c
                            ) || [];
                          updateSegmentContent({
                            dialogue: {
                              ...segment.content?.dialogue,
                              characters: updatedChars,
                            },
                          });
                        }}
                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                          validationErrors[`${segmentKey}_char_${charIndex}_id`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Character</option>
                        {availableCharacters.map((character: any) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={char.position}
                        onChange={(e) => {
                          const updatedChars =
                            segment.content?.dialogue?.characters?.map(
                              (c, idx) =>
                                idx === charIndex
                                  ? {
                                      ...c,
                                      position: e.target.value as
                                        | "left"
                                        | "right"
                                        | "center",
                                    }
                                  : c
                            ) || [];
                          updateSegmentContent({
                            dialogue: {
                              ...segment.content?.dialogue,
                              characters: updatedChars,
                            },
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    {validationErrors[`${segmentKey}_char_${charIndex}_id`] && (
                      <p className="text-red-500 text-sm mb-2">
                        {validationErrors[`${segmentKey}_char_${charIndex}_id`]}
                      </p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lines *
                      </label>
                      {char.lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => {
                              const updatedChars =
                                segment.content?.dialogue?.characters?.map(
                                  (c, idx) => {
                                    if (idx === charIndex) {
                                      const updatedLines = c.lines.map(
                                        (l, lIdx) =>
                                          lIdx === lineIndex
                                            ? e.target.value
                                            : l
                                      );
                                      return { ...c, lines: updatedLines };
                                    }
                                    return c;
                                  }
                                ) || [];
                              updateSegmentContent({
                                dialogue: {
                                  ...segment.content?.dialogue,
                                  characters: updatedChars,
                                },
                              });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                            placeholder="Enter dialogue line..."
                            maxLength={300}
                          />
                          <button
                            onClick={() => {
                              const updatedChars =
                                segment.content?.dialogue?.characters?.map(
                                  (c, idx) => {
                                    if (idx === charIndex) {
                                      if (c.lines.length <= 1) {
                                        toast.error(
                                          "Character must have at least one line",
                                          errorStyles
                                        );
                                        return c;
                                      }
                                      return {
                                        ...c,
                                        lines: c.lines.filter(
                                          (_, lIdx) => lIdx !== lineIndex
                                        ),
                                      };
                                    }
                                    return c;
                                  }
                                ) || [];
                              updateSegmentContent({
                                dialogue: {
                                  ...segment.content?.dialogue,
                                  characters: updatedChars,
                                },
                              });
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            disabled={char.lines.length <= 1}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {validationErrors[
                        `${segmentKey}_char_${charIndex}_lines`
                      ] && (
                        <p className="text-red-500 text-sm mb-2">
                          {
                            validationErrors[
                              `${segmentKey}_char_${charIndex}_lines`
                            ]
                          }
                        </p>
                      )}
                      <button
                        onClick={() => {
                          const updatedChars =
                            segment.content?.dialogue?.characters?.map(
                              (c, idx) => {
                                if (idx === charIndex) {
                                  if (c.lines.length >= 10) {
                                    toast.error(
                                      "Maximum 10 lines per character",
                                      errorStyles
                                    );
                                    return c;
                                  }
                                  return { ...c, lines: [...c.lines, ""] };
                                }
                                return c;
                              }
                            ) || [];
                          updateSegmentContent({
                            dialogue: {
                              ...segment.content?.dialogue,
                              characters: updatedChars,
                            },
                          });
                        }}
                        className="text-sm text-primary-main hover:text-primary-secondary"
                        disabled={char.lines.length >= 10}
                      >
                        + Add Line
                      </button>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => {
                          const characters =
                            segment.content?.dialogue?.characters || [];
                          if (characters.length <= 1) {
                            toast.error(
                              "Dialogue must have at least one character",
                              errorStyles
                            );
                            return;
                          }
                          const updatedChars = characters.filter(
                            (_, idx) => idx !== charIndex
                          );
                          updateSegmentContent({
                            dialogue: {
                              ...segment.content?.dialogue,
                              characters: updatedChars,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={
                          (segment.content?.dialogue?.characters?.length ||
                            0) <= 1
                        }
                      >
                        Remove Character
                      </button>
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const characters =
                    segment.content?.dialogue?.characters || [];
                  if (characters.length >= 4) {
                    toast.error(
                      "Maximum 4 characters per dialogue",
                      errorStyles
                    );
                    return;
                  }
                  const newChar = {
                    characterId: "",
                    lines: [""],
                    position: "left" as const,
                  };
                  const updatedChars = [...characters, newChar];
                  updateSegmentContent({
                    dialogue: {
                      ...segment.content?.dialogue,
                      characters: updatedChars,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main"
                disabled={
                  (segment.content?.dialogue?.characters?.length || 0) >= 4
                }
              >
                + Add Character
              </button>
            </div>
            {validationErrors[`${segmentKey}_characters`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_characters`]}
              </p>
            )}
          </div>
        </div>
      );

    case "scenario":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              value={segment.content?.scenario?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter scenario title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Description
            </label>
            <textarea
              value={segment.content?.scenario?.description || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    description: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Describe the scenario context"
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Situation *
            </label>
            <textarea
              value={segment.content?.scenario?.situation || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    situation: e.target.value,
                  },
                })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                validationErrors[`${segmentKey}_content`]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Describe the situation in detail..."
              maxLength={1000}
            />
            {validationErrors[`${segmentKey}_content`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_content`]}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {segment.content?.scenario?.situation?.length || 0}/1000
              characters
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Questions
            </h4>
            <div className="space-y-3">
              {(segment.content?.scenario?.questions || []).map(
                (question, qIndex) => (
                  <div key={qIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Question {qIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const questions =
                            segment.content?.scenario?.questions || [];
                          if (questions.length <= 1) {
                            toast.error(
                              "Scenario must have at least one question",
                              errorStyles
                            );
                            return;
                          }
                          const updatedQuestions = questions.filter(
                            (_, idx) => idx !== qIndex
                          );
                          updateSegmentContent({
                            scenario: {
                              ...segment.content?.scenario,
                              questions: updatedQuestions,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                      regions
                    </div>
                    <textarea
                      value={question.text}
                      onChange={(e) => {
                        const updatedQuestions =
                          segment.content?.scenario?.questions?.map((q, idx) =>
                            idx === qIndex ? { ...q, text: e.target.value } : q
                          ) || [];
                        updateSegmentContent({
                          scenario: {
                            ...segment.content?.scenario,
                            questions: updatedQuestions,
                          },
                        });
                      }}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Question text..."
                      maxLength={200}
                    />
                    <select
                      value={question.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const updatedQuestions =
                          segment.content?.scenario?.questions?.map((q, idx) =>
                            idx === qIndex
                              ? {
                                  ...q,
                                  type: newType as
                                    | "multiple-choice"
                                    | "open-ended",
                                  options:
                                    newType === "multiple-choice"
                                      ? [
                                          {
                                            id: "1",
                                            text: "",
                                            isCorrect: false,
                                          },
                                          {
                                            id: "2",
                                            text: "",
                                            isCorrect: false,
                                          },
                                        ]
                                      : undefined,
                                }
                              : q
                          ) || [];
                        updateSegmentContent({
                          scenario: {
                            ...segment.content?.scenario,
                            questions: updatedQuestions,
                          },
                        });
                      }}
                      className="w-full mt-2 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="open-ended">Open Ended</option>
                    </select>
                    {question.type === "multiple-choice" && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options (2-6 options) *
                        </label>
                        <div className="space-y-2">
                          {(question.options || []).map(
                            (option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={`question-${pathIndex}-${segmentIndex}-${qIndex}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const updatedOptions =
                                      question.options?.map((opt, idx) => ({
                                        ...opt,
                                        isCorrect: idx === optionIndex,
                                      })) || [];
                                    const updatedQuestions =
                                      segment.content?.scenario?.questions?.map(
                                        (q, idx) =>
                                          idx === qIndex
                                            ? { ...q, options: updatedOptions }
                                            : q
                                      ) || [];
                                    updateSegmentContent({
                                      scenario: {
                                        ...segment.content?.scenario,
                                        questions: updatedQuestions,
                                      },
                                    });
                                  }}
                                  className="text-primary-main"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const updatedOptions =
                                      question.options?.map((opt, idx) =>
                                        idx === optionIndex
                                          ? { ...opt, text: e.target.value }
                                          : opt
                                      ) || [];
                                    const updatedQuestions =
                                      segment.content?.scenario?.questions?.map(
                                        (q, idx) =>
                                          idx === qIndex
                                            ? { ...q, options: updatedOptions }
                                            : q
                                      ) || [];
                                    updateSegmentContent({
                                      scenario: {
                                        ...segment.content?.scenario,
                                        questions: updatedQuestions,
                                      },
                                    });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  maxLength={100}
                                />
                                <button
                                  onClick={() => {
                                    const options = question.options || [];
                                    if (options.length <= 2) {
                                      toast.error(
                                        "Must have at least 2 options",
                                        errorStyles
                                      );
                                      return;
                                    }
                                    const updatedOptions = options.filter(
                                      (_, idx) => idx !== optionIndex
                                    );
                                    const updatedQuestions =
                                      segment.content?.scenario?.questions?.map(
                                        (q, idx) =>
                                          idx === qIndex
                                            ? { ...q, options: updatedOptions }
                                            : q
                                      ) || [];
                                    updateSegmentContent({
                                      scenario: {
                                        ...segment.content?.scenario,
                                        questions: updatedQuestions,
                                      },
                                    });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  disabled={
                                    (question.options?.length || 0) <= 2
                                  }
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          )}
                          <button
                            onClick={() => {
                              const options = question.options || [];
                              if (options.length >= 6) {
                                toast.error(
                                  "Maximum 6 options allowed",
                                  errorStyles
                                );
                                return;
                              }
                              const newOption = {
                                id: (options.length + 1).toString(),
                                text: "",
                                isCorrect: false,
                              };
                              const updatedOptions = [...options, newOption];
                              const updatedQuestions =
                                segment.content?.scenario?.questions?.map(
                                  (q, idx) =>
                                    idx === qIndex
                                      ? { ...q, options: updatedOptions }
                                      : q
                                ) || [];
                              updateSegmentContent({
                                scenario: {
                                  ...segment.content?.scenario,
                                  questions: updatedQuestions,
                                },
                              });
                            }}
                            className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
                            disabled={(question.options?.length || 0) >= 6}
                          >
                            + Add Option
                          </button>
                        </div>
                        {(validationErrors[
                          `${segmentKey}_questions_${qIndex}_options`
                        ] ||
                          validationErrors[
                            `${segmentKey}_questions_${qIndex}_correct`
                          ]) && (
                          <div className="text-red-500 text-sm mt-1">
                            {validationErrors[
                              `${segmentKey}_questions_${qIndex}_options`
                            ] ||
                              validationErrors[
                                `${segmentKey}_questions_${qIndex}_correct`
                              ]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const questions = segment.content?.scenario?.questions || [];
                  if (questions.length >= 10) {
                    toast.error(
                      "Maximum 10 questions per scenario",
                      errorStyles
                    );
                    return;
                  }
                  const newQuestion = {
                    id: (questions.length + 1).toString(),
                    text: "",
                    type: "multiple-choice" as const,
                    options: [
                      {
                        id: "1",
                        text: "",
                        isCorrect: false,
                      },
                      {
                        id: "2",
                        text: "",
                        isCorrect: false,
                      },
                    ],
                  };
                  const updatedQuestions = [...questions, newQuestion];
                  updateSegmentContent({
                    scenario: {
                      ...segment.content?.scenario,
                      questions: updatedQuestions,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Question
              </button>
            </div>
            {validationErrors[`${segmentKey}_questions`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_questions`]}
              </p>
            )}
          </div>
        </div>
      );

      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              value={segment.content?.scenario?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter scenario title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Description
            </label>
            <textarea
              value={segment.content?.scenario?.description || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    description: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Describe the scenario context"
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Situation *
            </label>
            <textarea
              value={segment.content?.scenario?.situation || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    situation: e.target.value,
                  },
                })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                validationErrors[`${segmentKey}_content`]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Describe the situation in detail..."
              maxLength={1000}
            />
            {validationErrors[`${segmentKey}_content`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_content`]}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {segment.content?.scenario?.situation?.length || 0}/1000
              characters
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Questions
            </h4>
            <div className="space-y-3">
              {(segment.content?.scenario?.questions || []).map(
                (question, qIndex) => (
                  <div key={qIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Question {qIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const questions =
                            segment.content?.scenario?.questions || [];
                          if (questions.length <= 1) {
                            toast.error(
                              "Scenario must have at least one question",
                              errorStyles
                            );
                            return;
                          }
                          const updatedQuestions = questions.filter(
                            (_, idx) => idx !== qIndex
                          );
                          updateSegmentContent({
                            scenario: {
                              ...segment.content?.scenario,
                              questions: updatedQuestions,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={question.text}
                      onChange={(e) => {
                        const updatedQuestions =
                          segment.content?.scenario?.questions?.map((q, idx) =>
                            idx === qIndex ? { ...q, text: e.target.value } : q
                          ) || [];
                        updateSegmentContent({
                          scenario: {
                            ...segment.content?.scenario,
                            questions: updatedQuestions,
                          },
                        });
                      }}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Question text..."
                      maxLength={200}
                    />
                    <select
                      value={question.type}
                      onChange={(e) => {
                        const updatedQuestions =
                          segment.content?.scenario?.questions?.map((q, idx) =>
                            idx === qIndex
                              ? {
                                  ...q,
                                  type: e.target.value as
                                    | "multiple-choice"
                                    | "open-ended",
                                }
                              : q
                          ) || [];
                        updateSegmentContent({
                          scenario: {
                            ...segment.content?.scenario,
                            questions: updatedQuestions,
                          },
                        });
                      }}
                      className="w-full mt-2 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="open-ended">Open Ended</option>
                    </select>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const questions = segment.content?.scenario?.questions || [];
                  if (questions.length >= 10) {
                    toast.error(
                      "Maximum 10 questions per scenario",
                      errorStyles
                    );
                    return;
                  }
                  const newQuestion = {
                    id: (questions.length + 1).toString(),
                    text: "",
                    type: "multiple-choice" as const,
                  };
                  const updatedQuestions = [...questions, newQuestion];
                  updateSegmentContent({
                    scenario: {
                      ...segment.content?.scenario,
                      questions: updatedQuestions,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Question
              </button>
            </div>
            {validationErrors[`${segmentKey}_questions`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_questions`]}
              </p>
            )}
          </div>
        </div>
      );

      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              value={segment.content?.scenario?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter scenario title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Description
            </label>
            <textarea
              value={segment.content?.scenario?.description || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    description: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Describe the scenario context"
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Situation *
            </label>
            <textarea
              value={segment.content?.scenario?.situation || ""}
              onChange={(e) =>
                updateSegmentContent({
                  scenario: {
                    ...segment.content?.scenario,
                    situation: e.target.value,
                  },
                })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                validationErrors[`${segmentKey}_content`]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Describe the situation in detail..."
              maxLength={1000}
            />
            {validationErrors[`${segmentKey}_content`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_content`]}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {segment.content?.scenario?.situation?.length || 0}/1000
              characters
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Questions
            </h4>
            <div className="space-y-3">
              {(segment.content?.scenario?.questions || []).map(
                (question, qIndex) => (
                  <div key={qIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Question {qIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const questions =
                            segment.content?.scenario?.questions || [];
                          if (questions.length <= 1) {
                            toast.error(
                              "Scenario must have at least one question",
                              errorStyles
                            );
                            return;
                          }
                          const updatedQuestions = questions.filter(
                            (_, idx) => idx !== qIndex
                          );
                          updateSegmentContent({
                            scenario: {
                              ...segment.content?.scenario,
                              questions: updatedQuestions,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={question.text}
                      onChange={(e) => {
                        const updatedQuestions =
                          segment.content?.scenario?.questions?.map((q, idx) =>
                            idx === qIndex ? { ...q, text: e.target.value } : q
                          ) || [];
                        updateSegmentContent({
                          scenario: {
                            ...segment.content?.scenario,
                            questions: updatedQuestions,
                          },
                        });
                      }}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Question text..."
                      maxLength={200}
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      Type:{" "}
                      {question.type === "multiple-choice"
                        ? "Multiple Choice"
                        : "Open Ended"}
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const questions = segment.content?.scenario?.questions || [];
                  if (questions.length >= 10) {
                    toast.error(
                      "Maximum 10 questions per scenario",
                      errorStyles
                    );
                    return;
                  }
                  const newQuestion = {
                    id: (questions.length + 1).toString(),
                    text: "",
                    type: "multiple-choice" as const,
                  };
                  const updatedQuestions = [...questions, newQuestion];
                  updateSegmentContent({
                    scenario: {
                      ...segment.content?.scenario,
                      questions: updatedQuestions,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Question
              </button>
            </div>
            {validationErrors[`${segmentKey}_questions`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_questions`]}
              </p>
            )}
          </div>
        </div>
      );
    case "flashcards":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Mode
            </label>
            <select
              value={segment.content?.flashcards?.displayMode || "sequential"}
              onChange={(e) =>
                updateSegmentContent({
                  flashcards: {
                    ...segment.content?.flashcards,
                    displayMode: e.target.value as "sequential" | "random",
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="sequential">Sequential</option>
              <option value="random">Random</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={segment.content?.flashcards?.showProgress !== false}
                onChange={(e) =>
                  updateSegmentContent({
                    flashcards: {
                      ...segment.content?.flashcards,
                      showProgress: e.target.checked,
                    },
                  })
                }
                className="mr-2 text-primary-main"
              />
              Show Progress
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={segment.content?.flashcards?.allowMarking || false}
                onChange={(e) =>
                  updateSegmentContent({
                    flashcards: {
                      ...segment.content?.flashcards,
                      allowMarking: e.target.checked,
                    },
                  })
                }
                className="mr-2 text-primary-main"
              />
              Allow Marking Cards
            </label>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Flash Cards
            </h4>
            <div className="space-y-3">
              {(segment.content?.flashcards?.cards || []).map(
                (card, cardIndex) => (
                  <div key={cardIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Card {cardIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const cards =
                            segment.content?.flashcards?.cards || [];
                          if (cards.length <= 1) {
                            toast.error(
                              "Must have at least one card",
                              errorStyles
                            );
                            return;
                          }
                          const updatedCards = cards.filter(
                            (_, idx) => idx !== cardIndex
                          );
                          updateSegmentContent({
                            flashcards: {
                              ...segment.content?.flashcards,
                              cards: updatedCards,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Front
                        </label>
                        <textarea
                          value={card.front}
                          onChange={(e) => {
                            const updatedCards =
                              segment.content?.flashcards?.cards?.map(
                                (c, idx) =>
                                  idx === cardIndex
                                    ? { ...c, front: e.target.value }
                                    : c
                              ) || [];
                            updateSegmentContent({
                              flashcards: {
                                ...segment.content?.flashcards,
                                cards: updatedCards,
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Front of card..."
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Back
                        </label>
                        <textarea
                          value={card.back}
                          onChange={(e) => {
                            const updatedCards =
                              segment.content?.flashcards?.cards?.map(
                                (c, idx) =>
                                  idx === cardIndex
                                    ? { ...c, back: e.target.value }
                                    : c
                              ) || [];
                            updateSegmentContent({
                              flashcards: {
                                ...segment.content?.flashcards,
                                cards: updatedCards,
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Back of card..."
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const cards = segment.content?.flashcards?.cards || [];
                  if (cards.length >= 50) {
                    toast.error("Maximum 50 cards allowed", errorStyles);
                    return;
                  }
                  const newCard = {
                    id: (cards.length + 1).toString(),
                    front: "",
                    back: "",
                  };
                  const updatedCards = [...cards, newCard];
                  updateSegmentContent({
                    flashcards: {
                      ...segment.content?.flashcards,
                      cards: updatedCards,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Card
              </button>
            </div>
            {validationErrors[`${segmentKey}_cards`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_cards`]}
              </p>
            )}
          </div>
        </div>
      );

    case "matching":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matching Activity Title
            </label>
            <input
              type="text"
              value={segment.content?.matching?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  matching: {
                    ...segment.content?.matching,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter matching activity title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              value={segment.content?.matching?.instructions || ""}
              onChange={(e) =>
                updateSegmentContent({
                  matching: {
                    ...segment.content?.matching,
                    instructions: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Instructions for the matching activity..."
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (seconds, optional)
            </label>
            <input
              type="number"
              value={segment.content?.matching?.timeLimit || ""}
              onChange={(e) =>
                updateSegmentContent({
                  matching: {
                    ...segment.content?.matching,
                    timeLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="e.g., 60"
              min="0"
              max="600"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={segment.content?.matching?.shuffle !== false}
                onChange={(e) =>
                  updateSegmentContent({
                    matching: {
                      ...segment.content?.matching,
                      shuffle: e.target.checked,
                    },
                  })
                }
                className="mr-2 text-primary-main"
              />
              Shuffle Items
            </label>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Matching Pairs
            </h4>
            <div className="space-y-3">
              {(segment.content?.matching?.pairs || []).map(
                (pair, pairIndex) => (
                  <div key={pairIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Pair {pairIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const pairs = segment.content?.matching?.pairs || [];
                          if (pairs.length <= 1) {
                            toast.error(
                              "Must have at least one pair",
                              errorStyles
                            );
                            return;
                          }
                          const updatedPairs = pairs.filter(
                            (_, idx) => idx !== pairIndex
                          );
                          updateSegmentContent({
                            matching: {
                              ...segment.content?.matching,
                              pairs: updatedPairs,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Left Item
                        </label>
                        <input
                          type="text"
                          value={pair.leftItem}
                          onChange={(e) => {
                            const updatedPairs =
                              segment.content?.matching?.pairs?.map((p, idx) =>
                                idx === pairIndex
                                  ? { ...p, leftItem: e.target.value }
                                  : p
                              ) || [];
                            updateSegmentContent({
                              matching: {
                                ...segment.content?.matching,
                                pairs: updatedPairs,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Left item..."
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Right Item
                        </label>
                        <input
                          type="text"
                          value={pair.rightItem}
                          onChange={(e) => {
                            const updatedPairs =
                              segment.content?.matching?.pairs?.map((p, idx) =>
                                idx === pairIndex
                                  ? { ...p, rightItem: e.target.value }
                                  : p
                              ) || [];
                            updateSegmentContent({
                              matching: {
                                ...segment.content?.matching,
                                pairs: updatedPairs,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Right item..."
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const pairs = segment.content?.matching?.pairs || [];
                  if (pairs.length >= 10) {
                    toast.error("Maximum 10 pairs allowed", errorStyles);
                    return;
                  }
                  const newPair = {
                    id: (pairs.length + 1).toString(),
                    leftItem: "",
                    rightItem: "",
                  };
                  const updatedPairs = [...pairs, newPair];
                  updateSegmentContent({
                    matching: {
                      ...segment.content?.matching,
                      pairs: updatedPairs,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Pair
              </button>
            </div>
            {validationErrors[`${segmentKey}_pairs`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_pairs`]}
              </p>
            )}
          </div>
        </div>
      );

    case "storytelling":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story Title *
            </label>
            <input
              type="text"
              value={segment.content?.storytelling?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  storytelling: {
                    ...segment.content?.storytelling,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter story title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background
            </label>
            <textarea
              value={segment.content?.storytelling?.background || ""}
              onChange={(e) =>
                updateSegmentContent({
                  storytelling: {
                    ...segment.content?.storytelling,
                    background: e.target.value,
                  },
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Describe the story background..."
              maxLength={500}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Chapters</h4>
            <div className="space-y-3">
              {(segment.content?.storytelling?.chapters || []).map(
                (chapter, chapterIndex) => (
                  <div key={chapterIndex} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium">
                        Chapter {chapterIndex + 1}
                      </h5>
                      <button
                        onClick={() => {
                          const chapters =
                            segment.content?.storytelling?.chapters || [];
                          if (chapters.length <= 1) {
                            toast.error(
                              "Story must have at least one chapter",
                              errorStyles
                            );
                            return;
                          }
                          const updatedChapters = chapters.filter(
                            (_, idx) => idx !== chapterIndex
                          );
                          updateSegmentContent({
                            storytelling: {
                              ...segment.content?.storytelling,
                              chapters: updatedChapters,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Chapter
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Chapter Title
                        </label>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => {
                            const updatedChapters =
                              segment.content?.storytelling?.chapters?.map(
                                (c, idx) =>
                                  idx === chapterIndex
                                    ? { ...c, title: e.target.value }
                                    : c
                              ) || [];
                            updateSegmentContent({
                              storytelling: {
                                ...segment.content?.storytelling,
                                chapters: updatedChapters,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Chapter title..."
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Content *
                        </label>
                        <textarea
                          value={chapter.content}
                          onChange={(e) => {
                            const updatedChapters =
                              segment.content?.storytelling?.chapters?.map(
                                (c, idx) =>
                                  idx === chapterIndex
                                    ? { ...c, content: e.target.value }
                                    : c
                              ) || [];
                            updateSegmentContent({
                              storytelling: {
                                ...segment.content?.storytelling,
                                chapters: updatedChapters,
                              },
                            });
                          }}
                          rows={3}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Chapter content..."
                          maxLength={1000}
                        />
                      </div>
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 mb-2">
                          Choices (optional)
                        </h6>
                        <div className="space-y-2">
                          {(chapter.choices || []).map(
                            (choice, choiceIndex) => (
                              <div
                                key={choiceIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(e) => {
                                    const updatedChapters =
                                      segment.content?.storytelling?.chapters?.map(
                                        (c, idx) => {
                                          if (idx === chapterIndex) {
                                            const updatedChoices =
                                              c.choices?.map((ch, chIdx) =>
                                                chIdx === choiceIndex
                                                  ? {
                                                      ...ch,
                                                      text: e.target.value,
                                                    }
                                                  : ch
                                              ) || [];
                                            return {
                                              ...c,
                                              choices: updatedChoices,
                                            };
                                          }
                                          return c;
                                        }
                                      ) || [];
                                    updateSegmentContent({
                                      storytelling: {
                                        ...segment.content?.storytelling,
                                        chapters: updatedChapters,
                                      },
                                    });
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                  placeholder="Choice text..."
                                  maxLength={100}
                                />
                                <input
                                  type="text"
                                  value={choice.nextChapter}
                                  onChange={(e) => {
                                    const updatedChapters =
                                      segment.content?.storytelling?.chapters?.map(
                                        (c, idx) => {
                                          if (idx === chapterIndex) {
                                            const updatedChoices =
                                              c.choices?.map((ch, chIdx) =>
                                                chIdx === choiceIndex
                                                  ? {
                                                      ...ch,
                                                      nextChapter:
                                                        e.target.value,
                                                    }
                                                  : ch
                                              ) || [];
                                            return {
                                              ...c,
                                              choices: updatedChoices,
                                            };
                                          }
                                          return c;
                                        }
                                      ) || [];
                                    updateSegmentContent({
                                      storytelling: {
                                        ...segment.content?.storytelling,
                                        chapters: updatedChapters,
                                      },
                                    });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                  placeholder="Next chapter ID"
                                  maxLength={10}
                                />
                                <button
                                  onClick={() => {
                                    const updatedChapters =
                                      segment.content?.storytelling?.chapters?.map(
                                        (c, idx) => {
                                          if (idx === chapterIndex) {
                                            const choices = c.choices || [];
                                            const updatedChoices =
                                              choices.filter(
                                                (_, chIdx) =>
                                                  chIdx !== choiceIndex
                                              );
                                            return {
                                              ...c,
                                              choices: updatedChoices,
                                            };
                                          }
                                          return c;
                                        }
                                      ) || [];
                                    updateSegmentContent({
                                      storytelling: {
                                        ...segment.content?.storytelling,
                                        chapters: updatedChapters,
                                      },
                                    });
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          )}
                          <button
                            onClick={() => {
                              const updatedChapters =
                                segment.content?.storytelling?.chapters?.map(
                                  (c, idx) => {
                                    if (idx === chapterIndex) {
                                      const choices = c.choices || [];
                                      const newChoice = {
                                        id: (choices.length + 1).toString(),
                                        text: "",
                                        nextChapter: "",
                                      };
                                      return {
                                        ...c,
                                        choices: [...choices, newChoice],
                                      };
                                    }
                                    return c;
                                  }
                                ) || [];
                              updateSegmentContent({
                                storytelling: {
                                  ...segment.content?.storytelling,
                                  chapters: updatedChapters,
                                },
                              });
                            }}
                            className="text-xs text-primary-main hover:text-primary-secondary"
                          >
                            + Add Choice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const chapters =
                    segment.content?.storytelling?.chapters || [];
                  const newChapter = {
                    id: (chapters.length + 1).toString(),
                    title: `Chapter ${chapters.length + 1}`,
                    content: "",
                  };
                  const updatedChapters = [...chapters, newChapter];
                  updateSegmentContent({
                    storytelling: {
                      ...segment.content?.storytelling,
                      chapters: updatedChapters,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main"
              >
                + Add Chapter
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Chapter ID *
            </label>
            <input
              type="text"
              value={segment.content?.storytelling?.startChapter || ""}
              onChange={(e) =>
                updateSegmentContent({
                  storytelling: {
                    ...segment.content?.storytelling,
                    startChapter: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter the ID of the starting chapter"
              maxLength={10}
            />
          </div>
        </div>
      );

    case "dragdrop":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Title
            </label>
            <input
              type="text"
              value={segment.content?.dragdrop?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  dragdrop: {
                    ...segment.content?.dragdrop,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter drag & drop activity title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <textarea
              value={segment.content?.dragdrop?.instructions || ""}
              onChange={(e) =>
                updateSegmentContent({
                  dragdrop: {
                    ...segment.content?.dragdrop,
                    instructions: e.target.value,
                  },
                })
              }
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                validationErrors[`${segmentKey}_instructions`]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Instructions for the drag & drop activity..."
              maxLength={500}
            />
            {validationErrors[`${segmentKey}_instructions`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_instructions`]}
              </p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Drop Zones
            </h4>
            <div className="space-y-3">
              {(segment.content?.dragdrop?.dropZones || []).map(
                (zone, zoneIndex) => (
                  <div key={zoneIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Drop Zone {zoneIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const dropZones =
                            segment.content?.dragdrop?.dropZones || [];
                          if (dropZones.length <= 1) {
                            toast.error(
                              "Must have at least one drop zone",
                              errorStyles
                            );
                            return;
                          }
                          const updatedDropZones = dropZones.filter(
                            (_, idx) => idx !== zoneIndex
                          );
                          updateSegmentContent({
                            dragdrop: {
                              ...segment.content?.dragdrop,
                              dropZones: updatedDropZones,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          X Position
                        </label>
                        <input
                          type="number"
                          value={zone.x}
                          onChange={(e) => {
                            const updatedDropZones =
                              segment.content?.dragdrop?.dropZones?.map(
                                (z, idx) =>
                                  idx === zoneIndex
                                    ? {
                                        ...z,
                                        x: parseInt(e.target.value) || 0,
                                      }
                                    : z
                              ) || [];
                            updateSegmentContent({
                              dragdrop: {
                                ...segment.content?.dragdrop,
                                dropZones: updatedDropZones,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          min="0"
                          max="1000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Y Position
                        </label>
                        <input
                          type="number"
                          value={zone.y}
                          onChange={(e) => {
                            const updatedDropZones =
                              segment.content?.dragdrop?.dropZones?.map(
                                (z, idx) =>
                                  idx === zoneIndex
                                    ? {
                                        ...z,
                                        y: parseInt(e.target.value) || 0,
                                      }
                                    : z
                              ) || [];
                            updateSegmentContent({
                              dragdrop: {
                                ...segment.content?.dragdrop,
                                dropZones: updatedDropZones,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          min="0"
                          max="1000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Width
                        </label>
                        <input
                          type="number"
                          value={zone.width}
                          onChange={(e) => {
                            const updatedDropZones =
                              segment.content?.dragdrop?.dropZones?.map(
                                (z, idx) =>
                                  idx === zoneIndex
                                    ? {
                                        ...z,
                                        width: parseInt(e.target.value) || 0,
                                      }
                                    : z
                              ) || [];
                            updateSegmentContent({
                              dragdrop: {
                                ...segment.content?.dragdrop,
                                dropZones: updatedDropZones,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          min="10"
                          max="500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Height
                        </label>
                        <input
                          type="number"
                          value={zone.height}
                          onChange={(e) => {
                            const updatedDropZones =
                              segment.content?.dragdrop?.dropZones?.map(
                                (z, idx) =>
                                  idx === zoneIndex
                                    ? {
                                        ...z,
                                        height: parseInt(e.target.value) || 0,
                                      }
                                    : z
                              ) || [];
                            updateSegmentContent({
                              dragdrop: {
                                ...segment.content?.dragdrop,
                                dropZones: updatedDropZones,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          min="10"
                          max="500"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Correct Item ID
                      </label>
                      <input
                        type="text"
                        value={zone.correctItem}
                        onChange={(e) => {
                          const updatedDropZones =
                            segment.content?.dragdrop?.dropZones?.map(
                              (z, idx) =>
                                idx === zoneIndex
                                  ? { ...z, correctItem: e.target.value }
                                  : z
                            ) || [];
                          updateSegmentContent({
                            dragdrop: {
                              ...segment.content?.dragdrop,
                              dropZones: updatedDropZones,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="ID of the correct draggable item"
                        maxLength={50}
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Label (optional)
                      </label>
                      <input
                        type="text"
                        value={zone.label || ""}
                        onChange={(e) => {
                          const updatedDropZones =
                            segment.content?.dragdrop?.dropZones?.map(
                              (z, idx) =>
                                idx === zoneIndex
                                  ? { ...z, label: e.target.value }
                                  : z
                            ) || [];
                          updateSegmentContent({
                            dragdrop: {
                              ...segment.content?.dragdrop,
                              dropZones: updatedDropZones,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="Drop zone label..."
                        maxLength={50}
                      />
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const dropZones = segment.content?.dragdrop?.dropZones || [];
                  const newDropZone = {
                    id: (dropZones.length + 1).toString(),
                    x: 100,
                    y: 100,
                    width: 80,
                    height: 80,
                    correctItem: "",
                  };
                  const updatedDropZones = [...dropZones, newDropZone];
                  updateSegmentContent({
                    dragdrop: {
                      ...segment.content?.dragdrop,
                      dropZones: updatedDropZones,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Drop Zone
              </button>
            </div>
            {validationErrors[`${segmentKey}_dropzones`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_dropzones`]}
              </p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Draggable Items
            </h4>
            <div className="space-y-3">
              {(segment.content?.dragdrop?.draggableItems || []).map(
                (item, itemIndex) => (
                  <div key={itemIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Item {itemIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const draggableItems =
                            segment.content?.dragdrop?.draggableItems || [];
                          if (draggableItems.length <= 1) {
                            toast.error(
                              "Must have at least one draggable item",
                              errorStyles
                            );
                            return;
                          }
                          const updatedDraggableItems = draggableItems.filter(
                            (_, idx) => idx !== itemIndex
                          );
                          updateSegmentContent({
                            dragdrop: {
                              ...segment.content?.dragdrop,
                              draggableItems: updatedDraggableItems,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Text *
                      </label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const updatedDraggableItems =
                            segment.content?.dragdrop?.draggableItems?.map(
                              (i, idx) =>
                                idx === itemIndex
                                  ? { ...i, text: e.target.value }
                                  : i
                            ) || [];
                          updateSegmentContent({
                            dragdrop: {
                              ...segment.content?.dragdrop,
                              draggableItems: updatedDraggableItems,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="Item text..."
                        maxLength={100}
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={item.image || ""}
                        onChange={(e) => {
                          const updatedDraggableItems =
                            segment.content?.dragdrop?.draggableItems?.map(
                              (i, idx) =>
                                idx === itemIndex
                                  ? { ...i, image: e.target.value }
                                  : i
                            ) || [];
                          updateSegmentContent({
                            dragdrop: {
                              ...segment.content?.dragdrop,
                              draggableItems: updatedDraggableItems,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const draggableItems =
                    segment.content?.dragdrop?.draggableItems || [];
                  const newDraggableItem = {
                    id: (draggableItems.length + 1).toString(),
                    text: "",
                  };
                  const updatedDraggableItems = [
                    ...draggableItems,
                    newDraggableItem,
                  ];
                  updateSegmentContent({
                    dragdrop: {
                      ...segment.content?.dragdrop,
                      draggableItems: updatedDraggableItems,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Draggable Item
              </button>
            </div>
            {validationErrors[`${segmentKey}_draggables`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_draggables`]}
              </p>
            )}
          </div>
        </div>
      );

    case "dragwords":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <textarea
              value={segment.content?.dragwords?.instructions || ""}
              onChange={(e) =>
                updateSegmentContent({
                  dragwords: {
                    ...segment.content?.dragwords,
                    instructions: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Instructions for the drag words activity..."
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text with Gaps *
            </label>
            <textarea
              value={segment.content?.dragwords?.text || ""}
              onChange={(e) =>
                updateSegmentContent({
                  dragwords: {
                    ...segment.content?.dragwords,
                    text: e.target.value,
                  },
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter text with gaps marked as {{gap1}}, {{gap2}}, etc."
              maxLength={1000}
            />
            <p className="text-gray-500 text-xs mt-1">
              {/* Use {{ gap1 }}, {{ gap2 }}, etc. to mark where words should be */}
              dragged
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Word Bank
            </h4>
            <div className="space-y-3">
              {(segment.content?.dragwords?.wordBank || []).map(
                (word, wordIndex) => (
                  <div key={wordIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Word {wordIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const wordBank =
                            segment.content?.dragwords?.wordBank || [];
                          if (wordBank.length <= 1) {
                            toast.error(
                              "Must have at least one word in the bank",
                              errorStyles
                            );
                            return;
                          }
                          const updatedWordBank = wordBank.filter(
                            (_, idx) => idx !== wordIndex
                          );
                          updateSegmentContent({
                            dragwords: {
                              ...segment.content?.dragwords,
                              wordBank: updatedWordBank,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Word *
                        </label>
                        <input
                          type="text"
                          value={word.word}
                          onChange={(e) => {
                            const updatedWordBank =
                              segment.content?.dragwords?.wordBank?.map(
                                (w, idx) =>
                                  idx === wordIndex
                                    ? { ...w, word: e.target.value }
                                    : w
                              ) || [];
                            updateSegmentContent({
                              dragwords: {
                                ...segment.content?.dragwords,
                                wordBank: updatedWordBank,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Word..."
                          maxLength={50}
                        />
                      </div>
                      <label className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          checked={word.distractor || false}
                          onChange={(e) => {
                            const updatedWordBank =
                              segment.content?.dragwords?.wordBank?.map(
                                (w, idx) =>
                                  idx === wordIndex
                                    ? { ...w, distractor: e.target.checked }
                                    : w
                              ) || [];
                            updateSegmentContent({
                              dragwords: {
                                ...segment.content?.dragwords,
                                wordBank: updatedWordBank,
                              },
                            });
                          }}
                          className="mr-2 text-primary-main"
                        />
                        <span className="text-xs text-gray-600">
                          Distractor
                        </span>
                      </label>
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const wordBank = segment.content?.dragwords?.wordBank || [];
                  const newWord = {
                    id: (wordBank.length + 1).toString(),
                    word: "",
                    distractor: false,
                  };
                  const updatedWordBank = [...wordBank, newWord];
                  updateSegmentContent({
                    dragwords: {
                      ...segment.content?.dragwords,
                      wordBank: updatedWordBank,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Word
              </button>
            </div>
            {validationErrors[`${segmentKey}_wordbank`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_wordbank`]}
              </p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Gaps</h4>
            <div className="space-y-3">
              {(segment.content?.dragwords?.gaps || []).map((gap, gapIndex) => (
                <div key={gapIndex} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">Gap {gapIndex + 1}</h5>
                    <button
                      onClick={() => {
                        const gaps = segment.content?.dragwords?.gaps || [];
                        if (gaps.length <= 1) {
                          toast.error(
                            "Must have at least one gap",
                            errorStyles
                          );
                          return;
                        }
                        const updatedGaps = gaps.filter(
                          (_, idx) => idx !== gapIndex
                        );
                        updateSegmentContent({
                          dragwords: {
                            ...segment.content?.dragwords,
                            gaps: updatedGaps,
                          },
                        });
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Gap ID (must match text)
                      </label>
                      <input
                        type="text"
                        value={gap.id}
                        onChange={(e) => {
                          const updatedGaps =
                            segment.content?.dragwords?.gaps?.map((g, idx) =>
                              idx === gapIndex
                                ? { ...g, id: e.target.value }
                                : g
                            ) || [];
                          updateSegmentContent({
                            dragwords: {
                              ...segment.content?.dragwords,
                              gaps: updatedGaps,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="gap1"
                        maxLength={20}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Correct Word ID
                      </label>
                      <input
                        type="text"
                        value={gap.correctWordId}
                        onChange={(e) => {
                          const updatedGaps =
                            segment.content?.dragwords?.gaps?.map((g, idx) =>
                              idx === gapIndex
                                ? { ...g, correctWordId: e.target.value }
                                : g
                            ) || [];
                          updateSegmentContent({
                            dragwords: {
                              ...segment.content?.dragwords,
                              gaps: updatedGaps,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="ID of correct word"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Position in Text
                    </label>
                    <input
                      type="number"
                      value={gap.position}
                      onChange={(e) => {
                        const updatedGaps =
                          segment.content?.dragwords?.gaps?.map((g, idx) =>
                            idx === gapIndex
                              ? {
                                  ...g,
                                  position: parseInt(e.target.value) || 0,
                                }
                              : g
                          ) || [];
                        updateSegmentContent({
                          dragwords: {
                            ...segment.content?.dragwords,
                            gaps: updatedGaps,
                          },
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Character position"
                      min="0"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const gaps = segment.content?.dragwords?.gaps || [];
                  const newGap = {
                    id: `gap${gaps.length + 1}`,
                    correctWordId: "",
                    position: 0,
                  };
                  const updatedGaps = [...gaps, newGap];
                  updateSegmentContent({
                    dragwords: {
                      ...segment.content?.dragwords,
                      gaps: updatedGaps,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Gap
              </button>
            </div>
            {validationErrors[`${segmentKey}_gaps`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_gaps`]}
              </p>
            )}
          </div>
        </div>
      );

    case "fillblanks":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <textarea
              value={segment.content?.fillblanks?.instructions || ""}
              onChange={(e) =>
                updateSegmentContent({
                  fillblanks: {
                    ...segment.content?.fillblanks,
                    instructions: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Instructions for the fill in the blanks activity..."
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text with Blanks *
            </label>
            <textarea
              value={segment.content?.fillblanks?.text || ""}
              onChange={(e) =>
                updateSegmentContent({
                  fillblanks: {
                    ...segment.content?.fillblanks,
                    text: e.target.value,
                  },
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter text with blanks marked as {{blank1}}, {{blank2}}, etc."
              maxLength={1000}
            />
            <p className="text-gray-500 text-xs mt-1">
              {/* Use {{ blank1 }}, {{ blank2 }}, etc. to mark where answers */}
              should be filled in
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Blanks</h4>
            <div className="space-y-3">
              {(segment.content?.fillblanks?.gaps || []).map(
                (gap, gapIndex) => (
                  <div key={gapIndex} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Blank {gapIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const gaps = segment.content?.fillblanks?.gaps || [];
                          if (gaps.length <= 1) {
                            toast.error(
                              "Must have at least one blank",
                              errorStyles
                            );
                            return;
                          }
                          const updatedGaps = gaps.filter(
                            (_, idx) => idx !== gapIndex
                          );
                          updateSegmentContent({
                            fillblanks: {
                              ...segment.content?.fillblanks,
                              gaps: updatedGaps,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Blank ID (must match text)
                        </label>
                        <input
                          type="text"
                          value={gap.id}
                          onChange={(e) => {
                            const updatedGaps =
                              segment.content?.fillblanks?.gaps?.map((g, idx) =>
                                idx === gapIndex
                                  ? { ...g, id: e.target.value }
                                  : g
                              ) || [];
                            updateSegmentContent({
                              fillblanks: {
                                ...segment.content?.fillblanks,
                                gaps: updatedGaps,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="blank1"
                          maxLength={20}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Correct Answer *
                        </label>
                        <input
                          type="text"
                          value={gap.correctAnswer}
                          onChange={(e) => {
                            const updatedGaps =
                              segment.content?.fillblanks?.gaps?.map((g, idx) =>
                                idx === gapIndex
                                  ? { ...g, correctAnswer: e.target.value }
                                  : g
                              ) || [];
                            updateSegmentContent({
                              fillblanks: {
                                ...segment.content?.fillblanks,
                                gaps: updatedGaps,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Correct answer..."
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Position in Text
                        </label>
                        <input
                          type="number"
                          value={gap.position}
                          onChange={(e) => {
                            const updatedGaps =
                              segment.content?.fillblanks?.gaps?.map((g, idx) =>
                                idx === gapIndex
                                  ? {
                                      ...g,
                                      position: parseInt(e.target.value) || 0,
                                    }
                                  : g
                              ) || [];
                            updateSegmentContent({
                              fillblanks: {
                                ...segment.content?.fillblanks,
                                gaps: updatedGaps,
                              },
                            });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Character position"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={gap.caseSensitive || false}
                            onChange={(e) => {
                              const updatedGaps =
                                segment.content?.fillblanks?.gaps?.map(
                                  (g, idx) =>
                                    idx === gapIndex
                                      ? {
                                          ...g,
                                          caseSensitive: e.target.checked,
                                        }
                                      : g
                                ) || [];
                              updateSegmentContent({
                                fillblanks: {
                                  ...segment.content?.fillblanks,
                                  gaps: updatedGaps,
                                },
                              });
                            }}
                            className="mr-2 text-primary-main"
                          />
                          <span className="text-xs text-gray-600">
                            Case Sensitive
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Hints (optional, one per line)
                      </label>
                      <textarea
                        value={gap.hints?.join("\n") || ""}
                        onChange={(e) => {
                          const hints = e.target.value
                            .split("\n")
                            .filter((h) => h.trim());
                          const updatedGaps =
                            segment.content?.fillblanks?.gaps?.map((g, idx) =>
                              idx === gapIndex ? { ...g, hints } : g
                            ) || [];
                          updateSegmentContent({
                            fillblanks: {
                              ...segment.content?.fillblanks,
                              gaps: updatedGaps,
                            },
                          });
                        }}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="Hint 1&#10;Hint 2&#10;..."
                      />
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const gaps = segment.content?.fillblanks?.gaps || [];
                  const newGap = {
                    id: `blank${gaps.length + 1}`,
                    correctAnswer: "",
                    position: 0,
                  };
                  const updatedGaps = [...gaps, newGap];
                  updateSegmentContent({
                    fillblanks: {
                      ...segment.content?.fillblanks,
                      gaps: updatedGaps,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main text-sm"
              >
                + Add Blank
              </button>
            </div>
            {validationErrors[`${segmentKey}_gaps`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_gaps`]}
              </p>
            )}
          </div>
        </div>
      );

    case "questionset":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Set Title
            </label>
            <input
              type="text"
              value={segment.content?.questionset?.title || ""}
              onChange={(e) =>
                updateSegmentContent({
                  questionset: {
                    ...segment.content?.questionset,
                    title: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Enter question set title"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <textarea
              value={segment.content?.questionset?.instructions || ""}
              onChange={(e) =>
                updateSegmentContent({
                  questionset: {
                    ...segment.content?.questionset,
                    instructions: e.target.value,
                  },
                })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Instructions for the question set..."
              maxLength={300}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={segment.content?.questionset?.passingScore || 70}
                onChange={(e) =>
                  updateSegmentContent({
                    questionset: {
                      ...segment.content?.questionset,
                      passingScore: parseInt(e.target.value) || 70,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                min="0"
                max="100"
              />
            </div>
            <div className="flex items-center space-x-4 mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={segment.content?.questionset?.showResults !== false}
                  onChange={(e) =>
                    updateSegmentContent({
                      questionset: {
                        ...segment.content?.questionset,
                        showResults: e.target.checked,
                      },
                    })
                  }
                  className="mr-2 text-primary-main"
                />
                Show Results
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    segment.content?.questionset?.randomizeOrder || false
                  }
                  onChange={(e) =>
                    updateSegmentContent({
                      questionset: {
                        ...segment.content?.questionset,
                        randomizeOrder: e.target.checked,
                      },
                    })
                  }
                  className="mr-2 text-primary-main"
                />
                Randomize Order
              </label>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Questions
            </h4>
            <div className="space-y-4">
              {(segment.content?.questionset?.questions || []).map(
                (question, qIndex) => (
                  <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium">Question {qIndex + 1}</h5>
                      <button
                        onClick={() => {
                          const questions =
                            segment.content?.questionset?.questions || [];
                          if (questions.length <= 1) {
                            toast.error(
                              "Question set must have at least one question",
                              errorStyles
                            );
                            return;
                          }
                          const updatedQuestions = questions.filter(
                            (_, idx) => idx !== qIndex
                          );
                          updateSegmentContent({
                            questionset: {
                              ...segment.content?.questionset,
                              questions: updatedQuestions,
                            },
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Question Text *
                        </label>
                        <textarea
                          value={question.text}
                          onChange={(e) => {
                            const updatedQuestions =
                              segment.content?.questionset?.questions?.map(
                                (q, idx) =>
                                  idx === qIndex
                                    ? { ...q, text: e.target.value }
                                    : q
                              ) || [];
                            updateSegmentContent({
                              questionset: {
                                ...segment.content?.questionset,
                                questions: updatedQuestions,
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Question text..."
                          maxLength={200}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => {
                              const updatedQuestions =
                                segment.content?.questionset?.questions?.map(
                                  (q, idx) =>
                                    idx === qIndex
                                      ? {
                                          ...q,
                                          type: e.target.value as
                                            | "multiple-choice"
                                            | "true-false"
                                            | "fill-blank"
                                            | "short-answer",
                                          options:
                                            e.target.value === "multiple-choice"
                                              ? [
                                                  {
                                                    id: "1",
                                                    text: "",
                                                    isCorrect: false,
                                                  },
                                                  {
                                                    id: "2",
                                                    text: "",
                                                    isCorrect: false,
                                                  },
                                                ]
                                              : undefined,
                                          correctAnswer:
                                            e.target.value !== "multiple-choice"
                                              ? ""
                                              : undefined,
                                        }
                                      : q
                                ) || [];
                              updateSegmentContent({
                                questionset: {
                                  ...segment.content?.questionset,
                                  questions: updatedQuestions,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="true-false">True/False</option>
                            <option value="fill-blank">
                              Fill in the Blank
                            </option>
                            <option value="short-answer">Short Answer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            value={question.points || 1}
                            onChange={(e) => {
                              const updatedQuestions =
                                segment.content?.questionset?.questions?.map(
                                  (q, idx) =>
                                    idx === qIndex
                                      ? {
                                          ...q,
                                          points: parseInt(e.target.value) || 1,
                                        }
                                      : q
                                ) || [];
                              updateSegmentContent({
                                questionset: {
                                  ...segment.content?.questionset,
                                  questions: updatedQuestions,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            min="1"
                            max="100"
                          />
                        </div>
                      </div>
                      {question.type === "multiple-choice" && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">
                            Answer Options
                          </label>
                          <div className="space-y-2">
                            {(question.options || []).map(
                              (option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="radio"
                                    name={`qset-${pathIndex}-${segmentIndex}-${qIndex}`}
                                    checked={option.isCorrect}
                                    onChange={() => {
                                      const updatedQuestions =
                                        segment.content?.questionset?.questions?.map(
                                          (q, idx) => {
                                            if (idx === qIndex) {
                                              const updatedOptions =
                                                q.options?.map((opt, oIdx) => ({
                                                  ...opt,
                                                  isCorrect:
                                                    oIdx === optionIndex,
                                                })) || [];
                                              return {
                                                ...q,
                                                options: updatedOptions,
                                              };
                                            }
                                            return q;
                                          }
                                        ) || [];
                                      updateSegmentContent({
                                        questionset: {
                                          ...segment.content?.questionset,
                                          questions: updatedQuestions,
                                        },
                                      });
                                    }}
                                    className="text-primary-main"
                                  />
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => {
                                      const updatedQuestions =
                                        segment.content?.questionset?.questions?.map(
                                          (q, idx) => {
                                            if (idx === qIndex) {
                                              const updatedOptions =
                                                q.options?.map((opt, oIdx) =>
                                                  oIdx === optionIndex
                                                    ? {
                                                        ...opt,
                                                        text: e.target.value,
                                                      }
                                                    : opt
                                                ) || [];
                                              return {
                                                ...q,
                                                options: updatedOptions,
                                              };
                                            }
                                            return q;
                                          }
                                        ) || [];
                                      updateSegmentContent({
                                        questionset: {
                                          ...segment.content?.questionset,
                                          questions: updatedQuestions,
                                        },
                                      });
                                    }}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    maxLength={100}
                                  />
                                  <button
                                    onClick={() => {
                                      const updatedQuestions =
                                        segment.content?.questionset?.questions?.map(
                                          (q, idx) => {
                                            if (idx === qIndex) {
                                              const options = q.options || [];
                                              if (options.length <= 2) {
                                                toast.error(
                                                  "Must have at least 2 options",
                                                  errorStyles
                                                );
                                                return q;
                                              }
                                              const updatedOptions =
                                                options.filter(
                                                  (_, oIdx) =>
                                                    oIdx !== optionIndex
                                                );
                                              return {
                                                ...q,
                                                options: updatedOptions,
                                              };
                                            }
                                            return q;
                                          }
                                        ) || [];
                                      updateSegmentContent({
                                        questionset: {
                                          ...segment.content?.questionset,
                                          questions: updatedQuestions,
                                        },
                                      });
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    disabled={
                                      (question.options?.length || 0) <= 2
                                    }
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )
                            )}
                            <button
                              onClick={() => {
                                const updatedQuestions =
                                  segment.content?.questionset?.questions?.map(
                                    (q, idx) => {
                                      if (idx === qIndex) {
                                        const options = q.options || [];
                                        if (options.length >= 6) {
                                          toast.error(
                                            "Maximum 6 options allowed",
                                            errorStyles
                                          );
                                          return q;
                                        }
                                        const newOption = {
                                          id: (options.length + 1).toString(),
                                          text: "",
                                          isCorrect: false,
                                        };
                                        return {
                                          ...q,
                                          options: [...options, newOption],
                                        };
                                      }
                                      return q;
                                    }
                                  ) || [];
                                updateSegmentContent({
                                  questionset: {
                                    ...segment.content?.questionset,
                                    questions: updatedQuestions,
                                  },
                                });
                              }}
                              className="text-xs text-primary-main hover:text-primary-secondary"
                              disabled={(question.options?.length || 0) >= 6}
                            >
                              + Add Option
                            </button>
                          </div>
                        </div>
                      )}
                      {(question.type === "true-false" ||
                        question.type === "fill-blank" ||
                        question.type === "short-answer") && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Correct Answer *
                          </label>
                          <input
                            type="text"
                            value={question.correctAnswer || ""}
                            onChange={(e) => {
                              const updatedQuestions =
                                segment.content?.questionset?.questions?.map(
                                  (q, idx) =>
                                    idx === qIndex
                                      ? {
                                          ...q,
                                          correctAnswer: e.target.value,
                                        }
                                      : q
                                ) || [];
                              updateSegmentContent({
                                questionset: {
                                  ...segment.content?.questionset,
                                  questions: updatedQuestions,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="Correct answer..."
                            maxLength={200}
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Explanation (optional)
                        </label>
                        <textarea
                          value={question.explanation || ""}
                          onChange={(e) => {
                            const updatedQuestions =
                              segment.content?.questionset?.questions?.map(
                                (q, idx) =>
                                  idx === qIndex
                                    ? { ...q, explanation: e.target.value }
                                    : q
                              ) || [];
                            updateSegmentContent({
                              questionset: {
                                ...segment.content?.questionset,
                                questions: updatedQuestions,
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Explanation..."
                          maxLength={300}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const questions =
                    segment.content?.questionset?.questions || [];
                  if (questions.length >= 20) {
                    toast.error("Maximum 20 questions allowed", errorStyles);
                    return;
                  }
                  const newQuestion = {
                    id: (questions.length + 1).toString(),
                    text: "",
                    type: "multiple-choice" as const,
                    options: [
                      { id: "1", text: "", isCorrect: false },
                      { id: "2", text: "", isCorrect: false },
                    ],
                    points: 1,
                  };
                  const updatedQuestions = [...questions, newQuestion];
                  updateSegmentContent({
                    questionset: {
                      ...segment.content?.questionset,
                      questions: updatedQuestions,
                    },
                  });
                }}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary-main hover:text-primary-main"
              >
                + Add Question
              </button>
            </div>
            {validationErrors[`${segmentKey}_questions`] && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors[`${segmentKey}_questions`]}
              </p>
            )}
          </div>
        </div>
      );
    default:
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🛠️</div>
          <p>Configuration interface for {segment.type} coming soon!</p>
          <p className="text-sm mt-1">
            This interactive activity type will be fully implemented in the next
            update.
          </p>
        </div>
      );
  }
};
