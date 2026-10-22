import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { getAuthenticatedUser } from "../services/auth.js";
import {
  checkQuizAnswer,
  createQuiz,
  deleteQuiz,
  getQuiz,
  getQuizForEdit,
  getQuizList,
  QuizAnswerError,
  replaceQuiz,
  submitQuiz,
  type QuizPayload,
} from "../services/qlete.js";

type QuizParams = { id: string };
type QuizListQuery = { q?: string; page?: string };
type SubmitBody = Record<string, string>;
type CheckAnswerBody = { questionId: number; optionId: number | null };

declare module "fastify" {
  interface FastifyRequest {
    qleteUser?: Awaited<ReturnType<typeof getAuthenticatedUser>>;
  }
}

const quizPayloadSchema = {
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

const submitBodySchema = {
  type: "object",
  maxProperties: 100,
  propertyNames: { pattern: "^[1-9][0-9]*$" },
  additionalProperties: { type: "string", minLength: 1, maxLength: 12 },
} as const;

const checkAnswerBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["questionId"],
  properties: {
    questionId: { type: "integer", minimum: 1 },
    optionId: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
  },
} as const;

function quizIdSchema() {
  return {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", pattern: "^[A-Za-z0-9_-]{8}$" } },
  } as const;
}

function sendOwnershipResult(
  result: "not-found" | "forbidden" | "updated" | "deleted",
  reply: FastifyReply
) {
  if (result === "not-found") return reply.code(404).send({ error: "Quiz não encontrado." });
  if (result === "forbidden") return reply.code(403).send({ error: "Você não é o dono deste quiz." });
  if (result === "deleted") return reply.code(204).send();
  return reply.send({ message: "Quiz atualizado com sucesso." });
}

export async function qleteRoutes(app: FastifyInstance) {
  app.get<{ Querystring: QuizListQuery }>("/quizzes", {
    schema: {
      querystring: {
        type: "object",
        additionalProperties: false,
        properties: {
          q: { type: "string", maxLength: 100 },
          page: { type: "string", pattern: "^[1-9][0-9]{0,5}$" },
        },
      },
    },
  }, async (request, reply) => {
    const page = Number(request.query.page ?? "1");
    const { quizzes, hasMore } = await getQuizList({ page, search: request.query.q?.trim() });
    return reply.send({ quizzes, page, pageSize: 20, hasMore });
  });

  app.get<{ Params: QuizParams }>("/quizzes/:id", {
    schema: { params: quizIdSchema() },
  }, async (request, reply) => {
    const quiz = await getQuiz(request.params.id);
    if (!quiz) return reply.code(404).send({ error: "Quiz não encontrado." });
    const user = await getAuthenticatedUser(request.cookies.auth_token);
    const { ownerId, ...publicQuiz } = quiz;
    return reply.send({ ...publicQuiz, isOwner: user?.id === ownerId });
  });

  app.post<{ Params: QuizParams; Body: SubmitBody }>("/quizzes/:id/submit", {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    schema: {
      params: quizIdSchema(),
      body: submitBodySchema,
    },
  }, async (request, reply) => {
    try {
      const result = await submitQuiz(request.params.id, request.body);
      if (!result) return reply.code(404).send({ error: "Quiz não encontrado." });
      return reply.send(result);
    } catch (cause) {
      if (cause instanceof QuizAnswerError) {
        return reply.code(400).send({ error: cause.message });
      }
      throw cause;
    }
  });

  app.post<{ Params: QuizParams; Body: CheckAnswerBody }>("/quizzes/:id/check", {
    config: { rateLimit: { max: 120, timeWindow: "1 minute" } },
    schema: {
      params: quizIdSchema(),
      body: checkAnswerBodySchema,
    },
  }, async (request, reply) => {
    try {
      const result = await checkQuizAnswer(
        request.params.id,
        request.body.questionId,
        request.body.optionId,
      );
      if (!result) return reply.code(404).send({ error: "Pergunta não encontrada." });
      return reply.send(result);
    } catch (cause) {
      if (cause instanceof QuizAnswerError) {
        return reply.code(400).send({ error: cause.message });
      }
      throw cause;
    }
  });

  app.register(async protectedRoutes => {
    protectedRoutes.addHook("preHandler", async (request, reply) => {
      const user = await getAuthenticatedUser(request.cookies.auth_token);
      if (!user) {
        return reply.code(401).send({ error: "Autenticação necessária." });
      }
      request.qleteUser = user;
    });

    protectedRoutes.get<{ Querystring: { page?: string } }>("/me/quizzes", {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: { page: { type: "string", pattern: "^[1-9][0-9]{0,5}$" } },
        },
      },
    }, async (request, reply) => {
      const user = request.qleteUser;
      if (!user) return reply.code(401).send({ error: "Autenticação necessária." });
      const page = Number(request.query.page ?? "1");
      const { quizzes, hasMore } = await getQuizList({ page, ownerId: user.id });
      return reply.send({ quizzes, page, pageSize: 20, hasMore });
    });

    protectedRoutes.get<{ Params: QuizParams }>("/quizzes/:id/edit", {
      schema: { params: quizIdSchema() },
    }, async (request, reply) => {
      const user = request.qleteUser;
      if (!user) return reply.code(401).send({ error: "Autenticação necessária." });
      const quiz = await getQuizForEdit(request.params.id);
      if (!quiz) return reply.code(404).send({ error: "Quiz não encontrado." });
      if (quiz.ownerId !== user.id) {
        return reply.code(403).send({ error: "Você não é o dono deste quiz." });
      }
      const { ownerId: _ownerId, ...editableQuiz } = quiz;
      return reply.send(editableQuiz);
    });

    protectedRoutes.post<{ Body: QuizPayload }>("/quizzes", {
      schema: { body: quizPayloadSchema },
    }, async (request, reply) => {
      const user = request.qleteUser;
      if (!user) return reply.code(401).send({ error: "Autenticação necessária." });
      const id = await createQuiz(user.id, request.body);
      return reply.code(201).send({ id });
    });

    protectedRoutes.post<{ Body: QuizPayload }>("/quizzes/import", {
      schema: { body: quizPayloadSchema },
    }, async (request, reply) => {
      const user = request.qleteUser;
      if (!user) return reply.code(401).send({ error: "Autenticação necessária." });
      const id = await createQuiz(user.id, request.body);
      return reply.code(201).send({ id });
    });

    protectedRoutes.put<{ Params: QuizParams; Body: QuizPayload }>("/quizzes/:id", {
      schema: { params: quizIdSchema(), body: quizPayloadSchema },
    }, async (request, reply) => {
      const user = request.qleteUser;
      if (!user) return reply.code(401).send({ error: "Autenticação necessária." });
      const result = await replaceQuiz(request.params.id, user.id, request.body);
      return sendOwnershipResult(result, reply);
    });

    protectedRoutes.delete<{ Params: QuizParams }>("/quizzes/:id", {
      schema: { params: quizIdSchema() },
    }, async (request, reply) => {
      const user = request.qleteUser;
      if (!user) return reply.code(401).send({ error: "Autenticação necessária." });
      const result = await deleteQuiz(request.params.id, user.id);
      return sendOwnershipResult(result, reply);
    });
  });
}
