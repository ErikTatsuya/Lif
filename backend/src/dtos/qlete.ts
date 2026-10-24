export type QuizParams = {
  id: string;
};

export type QuizListQuery = {
  q?: string;
  page?: number;
};

export type SubmitAnswersBody = Record<string, string>;

export type CheckAnswerBody = {
  questionId: number;
  optionId: number | null;
};

export type QuizInputDto = {
  title: string;
  description?: string;
  questions: Array<{
    prompt: string;
    explanation?: string;
    options: Array<{ text: string; isCorrect: boolean }>;
  }>;
};

export type ErrorResponseDto = {
  error: string;
};

export type QuizSummaryDto = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  questionCount: number;
};

export type QuizListResponseDto = {
  quizzes: QuizSummaryDto[];
  page: number;
  pageSize: 20;
  hasMore: boolean;
};

export type QuizOptionDto = {
  id: number;
  questionId: number;
  position: number;
  text: string;
};

export type PublicQuizQuestionDto = {
  id: number;
  position: number;
  prompt: string;
  options: QuizOptionDto[];
};

export type PublicQuizResponseDto = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  questions: PublicQuizQuestionDto[];
  isOwner: boolean;
};

export type EditableQuizOptionDto = QuizOptionDto & {
  isCorrect: boolean;
};

export type EditableQuizQuestionDto = PublicQuizQuestionDto & {
  explanation: string | null;
  options: EditableQuizOptionDto[];
};

export type EditableQuizResponseDto = Omit<PublicQuizResponseDto, "isOwner" | "questions"> & {
  questions: EditableQuizQuestionDto[];
};

export type QuizSubmissionResponseDto = {
  score: number;
  total: number;
  questions: Array<{
    questionId: number;
    prompt: string;
    selectedOptionId: number | null;
    explanation: string | null;
    options: Array<{
      id: number;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
};

export type CheckAnswerResponseDto = {
  isCorrect: boolean;
  correctOptionId: number;
};

export const quizInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "questions"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 160, pattern: "\\S" },
    description: { type: "string", maxLength: 2000 },
    questions: {
      type: "array",
      minItems: 1,
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prompt", "options"],
        properties: {
          prompt: { type: "string", minLength: 1, maxLength: 1000, pattern: "\\S" },
          explanation: { type: "string", maxLength: 2000 },
          options: {
            type: "array",
            minItems: 2,
            maxItems: 10,
            contains: {
              type: "object",
              required: ["isCorrect"],
              properties: { isCorrect: { const: true } },
            },
            items: {
              type: "object",
              additionalProperties: false,
              required: ["text", "isCorrect"],
              properties: {
                text: { type: "string", minLength: 1, maxLength: 500, pattern: "\\S" },
                isCorrect: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const quizParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: { id: { type: "string", minLength: 6, maxLength: 21 } },
} as const;

export const quizListQuerySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    q: { type: "string", maxLength: 100 },
    page: { type: "integer", minimum: 1, maximum: 999999 },
  },
} as const;

export const ownedQuizListQuerySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    page: { type: "integer", minimum: 1, maximum: 999999 },
  },
} as const;

export const submitAnswersSchema = {
  type: "object",
  maxProperties: 100,
  propertyNames: { pattern: "^[1-9][0-9]*$" },
  additionalProperties: { type: "string", minLength: 1, maxLength: 12 },
} as const;

export const checkAnswerSchema = {
  type: "object",
  additionalProperties: false,
  required: ["questionId"],
  properties: {
    questionId: { type: "integer", minimum: 1 },
    optionId: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
  },
} as const;

export const errorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error"],
  properties: { error: { type: "string" } },
} as const;

const quizSummarySchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "description", "createdAt", "questionCount"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    questionCount: { type: "integer", minimum: 0 },
  },
} as const;

export const quizListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["quizzes", "page", "pageSize", "hasMore"],
  properties: {
    quizzes: { type: "array", items: quizSummarySchema },
    page: { type: "integer", minimum: 1 },
    pageSize: { const: 20 },
    hasMore: { type: "boolean" },
  },
} as const;

const quizOptionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "questionId", "position", "text"],
  properties: {
    id: { type: "integer" },
    questionId: { type: "integer" },
    position: { type: "integer" },
    text: { type: "string" },
  },
} as const;

const editableQuizOptionSchema = {
  ...quizOptionSchema,
  required: [...quizOptionSchema.required, "isCorrect"],
  properties: {
    ...quizOptionSchema.properties,
    isCorrect: { type: "boolean" },
  },
} as const;

const publicQuizQuestionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "position", "prompt", "options"],
  properties: {
    id: { type: "integer" },
    position: { type: "integer" },
    prompt: { type: "string" },
    options: { type: "array", items: quizOptionSchema },
  },
} as const;

const editableQuizQuestionSchema = {
  ...publicQuizQuestionSchema,
  required: [...publicQuizQuestionSchema.required, "explanation"],
  properties: {
    ...publicQuizQuestionSchema.properties,
    explanation: { anyOf: [{ type: "string" }, { type: "null" }] },
    options: { type: "array", items: editableQuizOptionSchema },
  },
} as const;

const quizProperties = {
  id: { type: "string" },
  title: { type: "string" },
  description: { type: "string" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
} as const;

export const publicQuizResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [...Object.keys(quizProperties), "questions", "isOwner"],
  properties: {
    ...quizProperties,
    questions: { type: "array", items: publicQuizQuestionSchema },
    isOwner: { type: "boolean" },
  },
} as const;

export const editableQuizResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [...Object.keys(quizProperties), "questions"],
  properties: {
    ...quizProperties,
    questions: { type: "array", items: editableQuizQuestionSchema },
  },
} as const;

export const createdQuizResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: { id: { type: "string" } },
} as const;

export const updatedQuizResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["message"],
  properties: { message: { type: "string" } },
} as const;

export const checkAnswerResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["isCorrect", "correctOptionId"],
  properties: {
    isCorrect: { type: "boolean" },
    correctOptionId: { type: "integer" },
  },
} as const;

export const quizSubmissionResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "total", "questions"],
  properties: {
    score: { type: "integer", minimum: 0 },
    total: { type: "integer", minimum: 0 },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["questionId", "prompt", "selectedOptionId", "explanation", "options"],
        properties: {
          questionId: { type: "integer" },
          prompt: { type: "string" },
          selectedOptionId: { anyOf: [{ type: "integer" }, { type: "null" }] },
          explanation: { anyOf: [{ type: "string" }, { type: "null" }] },
          options: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "text", "isCorrect"],
              properties: {
                id: { type: "integer" },
                text: { type: "string" },
                isCorrect: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
} as const;
