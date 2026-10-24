import { randomBytes } from "node:crypto";
import { and, desc, eq, exists, ilike, inArray, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { optionsTable, questionsTable, quizzesTable } from "../db/schema.js";
import type { QuizInputDto } from "../dtos/qlete.js";

export class QuizAnswerError extends Error {}

function createQuizId(): string {
  return randomBytes(6).toString("base64url");
}

async function insertQuestions(
  transaction: Parameters<Parameters<typeof db.transaction>[0]>[0],
  quizId: string,
  questions: QuizInputDto["questions"]
) {
  for (const [questionIndex, question] of questions.entries()) {
    const insertedQuestion = await transaction
      .insert(questionsTable)
      .values({
        quizId,
        position: questionIndex + 1,
        prompt: question.prompt,
        explanation: question.explanation ?? null,
      })
      .returning({ id: questionsTable.id })
      .then(rows => rows[0]);

    if (!insertedQuestion) {
      throw new Error("Não foi possível criar uma pergunta do quiz.");
    }

    await transaction.insert(optionsTable).values(
      question.options.map((option, optionIndex) => ({
        questionId: insertedQuestion.id,
        position: optionIndex + 1,
        text: option.text,
        isCorrect: option.isCorrect,
      }))
    );
  }
}

export async function createQuiz(ownerId: number, payload: QuizInputDto) {
  const id = createQuizId();
  await db.transaction(async transaction => {
    await transaction.insert(quizzesTable).values({
      id,
      ownerId,
      title: payload.title,
      description: payload.description ?? "",
    });
    await insertQuestions(transaction, id, payload.questions);
  });
  return id;
}

export async function getQuizList(options: {
  page: number;
  search?: string;
  ownerId?: number;
}) {
  const conditions = [];
  if (options.ownerId !== undefined) {
    conditions.push(eq(quizzesTable.ownerId, options.ownerId));
  }
  const searchTerms = options.search?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (searchTerms.length) {
    conditions.push(...searchTerms.map(term => {
      const escapedTerm = term.replace(/[\\%_]/g, "\\$&");
      const pattern = `%${escapedTerm}%`;
      const matchingQuestion = db.select({ id: questionsTable.id })
        .from(questionsTable)
        .where(and(
          eq(questionsTable.quizId, quizzesTable.id),
          ilike(questionsTable.prompt, pattern),
        ));

      return or(
        ilike(quizzesTable.title, pattern),
        ilike(quizzesTable.description, pattern),
        exists(matchingQuestion),
      );
    }));
  }

  const quizQuery = db.select({
    id: quizzesTable.id,
    title: quizzesTable.title,
    description: quizzesTable.description,
    createdAt: quizzesTable.createdAt,
  }).from(quizzesTable);
  const rows = await quizQuery
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(quizzesTable.createdAt))
    .limit(21)
    .offset((options.page - 1) * 20);

  const hasMore = rows.length > 20;
  const quizzes = rows.slice(0, 20);
  if (!quizzes.length) return { quizzes: [], hasMore };

  const quizIds = quizzes.map(quiz => quiz.id);
  const questions = await db
    .select({ quizId: questionsTable.quizId })
    .from(questionsTable)
    .where(inArray(questionsTable.quizId, quizIds));
  const questionCounts = new Map<string, number>();
  for (const question of questions) {
    questionCounts.set(question.quizId, (questionCounts.get(question.quizId) ?? 0) + 1);
  }

  return {
    quizzes: quizzes.map(quiz => ({
      ...quiz,
      questionCount: questionCounts.get(quiz.id) ?? 0,
    })),
    hasMore,
  };
}

export async function getQuiz(id: string) {
  const quiz = await db.select({
    id: quizzesTable.id,
    title: quizzesTable.title,
    description: quizzesTable.description,
    ownerId: quizzesTable.ownerId,
    createdAt: quizzesTable.createdAt,
    updatedAt: quizzesTable.updatedAt,
  }).from(quizzesTable).where(eq(quizzesTable.id, id)).limit(1).then(rows => rows[0]);

  if (!quiz) return null;
  const questions = await db
    .select({
      id: questionsTable.id,
      position: questionsTable.position,
      prompt: questionsTable.prompt,
      explanation: questionsTable.explanation,
    })
    .from(questionsTable)
    .where(eq(questionsTable.quizId, id))
    .orderBy(questionsTable.position);
  const options = await db
    .select({
      id: optionsTable.id,
      questionId: optionsTable.questionId,
      position: optionsTable.position,
      text: optionsTable.text,
    })
    .from(optionsTable)
    .where(inArray(optionsTable.questionId, questions.map(question => question.id)))
    .orderBy(optionsTable.position);
  const optionsByQuestion = new Map<number, typeof options>();
  for (const option of options) {
    const questionOptions = optionsByQuestion.get(option.questionId) ?? [];
    questionOptions.push(option);
    optionsByQuestion.set(option.questionId, questionOptions);
  }

  return {
    ...quiz,
    questions: questions.map(question => ({
      id: question.id,
      position: question.position,
      prompt: question.prompt,
      options: optionsByQuestion.get(question.id) ?? [],
    })),
  };
}

export async function getQuizForEdit(id: string, ownerId: number) {
  const quiz = await getQuiz(id);
  if (!quiz) return { status: "not-found" as const };
  if (quiz.ownerId !== ownerId) return { status: "forbidden" as const };

  const questionIds = quiz.questions.map(question => question.id);
  const [options, explanations] = await Promise.all([
    db.select({
      id: optionsTable.id,
      questionId: optionsTable.questionId,
      isCorrect: optionsTable.isCorrect,
    }).from(optionsTable).where(inArray(optionsTable.questionId, questionIds)),
    db.select({
      id: questionsTable.id,
      explanation: questionsTable.explanation,
    }).from(questionsTable).where(inArray(questionsTable.id, questionIds)),
  ]);
  const correctOptions = new Map(options.map(option => [option.id, option.isCorrect]));
  const explanationsByQuestion = new Map(
    explanations.map(question => [question.id, question.explanation])
  );

  const { ownerId: _ownerId, ...editableQuiz } = quiz;
  return {
    status: "ok" as const,
    quiz: {
      ...editableQuiz,
      questions: quiz.questions.map(question => ({
        ...question,
        explanation: explanationsByQuestion.get(question.id) ?? null,
        options: question.options.map(option => ({
          ...option,
          isCorrect: correctOptions.get(option.id) ?? false,
        })),
      })),
    },
  };
}

export async function submitQuiz(id: string, answers: Record<string, string>) {
  const quiz = await getQuiz(id);
  if (!quiz) return null;

  const questionIds = new Set(quiz.questions.map(question => question.id));
  const answerIds = new Map<number, number>();
  for (const [questionIdText, optionIdText] of Object.entries(answers)) {
    const questionId = Number(questionIdText);
    const optionId = Number(optionIdText);
    if (
      !Number.isSafeInteger(questionId) ||
      !questionIds.has(questionId) ||
      !Number.isSafeInteger(optionId) ||
      optionId <= 0
    ) {
      throw new QuizAnswerError("As respostas enviadas não pertencem a este quiz.");
    }
    answerIds.set(questionId, optionId);
  }

  const correctOptions = await db
    .select({
      id: optionsTable.id,
      questionId: optionsTable.questionId,
      text: optionsTable.text,
      isCorrect: optionsTable.isCorrect,
    })
    .from(optionsTable)
    .where(inArray(optionsTable.questionId, [...questionIds]));
  const optionsByQuestion = new Map<number, typeof correctOptions>();
  for (const option of correctOptions) {
    const questionOptions = optionsByQuestion.get(option.questionId) ?? [];
    questionOptions.push(option);
    optionsByQuestion.set(option.questionId, questionOptions);
  }
  const explanations = await db.select({
    id: questionsTable.id,
    explanation: questionsTable.explanation,
  }).from(questionsTable)
    .where(inArray(questionsTable.id, [...questionIds]));
  const explanationsByQuestion = new Map(
    explanations.map(question => [question.id, question.explanation])
  );

  let score = 0;
  const results = quiz.questions.map(question => {
    const options = optionsByQuestion.get(question.id) ?? [];
    const selectedOptionId = answerIds.get(question.id) ?? null;
    if (
      selectedOptionId !== null &&
      !options.some(option => option.id === selectedOptionId)
    ) {
      throw new QuizAnswerError("Uma alternativa enviada não pertence à pergunta.");
    }
    if (options.some(option => option.id === selectedOptionId && option.isCorrect)) {
      score += 1;
    }

    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedOptionId,
      explanation: explanationsByQuestion.get(question.id) ?? null,
      options: options.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    };
  });

  return {
    score,
    total: quiz.questions.length,
    questions: results,
  };
}

export async function checkQuizAnswer(id: string, questionId: number, optionId: number | null) {
  const question = await db.select({ id: questionsTable.id })
    .from(questionsTable)
    .where(and(eq(questionsTable.id, questionId), eq(questionsTable.quizId, id)))
    .limit(1)
    .then(rows => rows[0]);
  if (!question) return null;

  const options = await db.select({
    id: optionsTable.id,
    isCorrect: optionsTable.isCorrect,
  }).from(optionsTable).where(eq(optionsTable.questionId, question.id));
  const selectedOption = optionId === null
    ? undefined
    : options.find(option => option.id === optionId);
  const correctOption = options.find(option => option.isCorrect);
  if ((optionId !== null && !selectedOption) || !correctOption) {
    throw new QuizAnswerError("A alternativa enviada não pertence à pergunta.");
  }

  return {
    isCorrect: selectedOption?.isCorrect ?? false,
    correctOptionId: correctOption.id,
  };
}

export async function replaceQuiz(id: string, ownerId: number, payload: QuizInputDto) {
  const existing = await db.select({ ownerId: quizzesTable.ownerId })
    .from(quizzesTable)
    .where(eq(quizzesTable.id, id))
    .limit(1)
    .then(rows => rows[0]);
  if (!existing) return "not-found" as const;
  if (existing.ownerId !== ownerId) return "forbidden" as const;

  await db.transaction(async transaction => {
    await transaction.update(quizzesTable)
      .set({
        title: payload.title,
        description: payload.description ?? "",
        updatedAt: new Date(),
      })
      .where(eq(quizzesTable.id, id));
    await transaction.delete(questionsTable).where(eq(questionsTable.quizId, id));
    await insertQuestions(transaction, id, payload.questions);
  });
  return "updated" as const;
}

export async function deleteQuiz(id: string, ownerId: number) {
  const existing = await db.select({ ownerId: quizzesTable.ownerId })
    .from(quizzesTable)
    .where(eq(quizzesTable.id, id))
    .limit(1)
    .then(rows => rows[0]);
  if (!existing) return "not-found" as const;
  if (existing.ownerId !== ownerId) return "forbidden" as const;

  await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
  return "deleted" as const;
}
