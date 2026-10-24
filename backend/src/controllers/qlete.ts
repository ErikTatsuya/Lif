import type { FastifyReply, FastifyRequest } from "fastify";

import type {
  CheckAnswerBody,
  CheckAnswerResponseDto,
  EditableQuizResponseDto,
  QuizInputDto,
  QuizListQuery,
  QuizListResponseDto,
  QuizParams,
  QuizSubmissionResponseDto,
  PublicQuizResponseDto,
  SubmitAnswersBody,
} from "../dtos/qlete.js";
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
} from "../services/qlete.js";

declare module "fastify" {
  interface FastifyRequest {
    qleteUser?: Awaited<ReturnType<typeof getAuthenticatedUser>>;
  }
}

type OwnedQuizListQuery = {
  page?: number;
};

export async function authenticateQleteUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = await getAuthenticatedUser(request.cookies.auth_token);
  if (!user) {
    return reply.code(401).send({ error: "Autenticação necessária." });
  }
  request.qleteUser = user;
}

export async function getQuizListController(
  request: FastifyRequest<{ Querystring: QuizListQuery }>,
  reply: FastifyReply,
) {
  const page = request.query.page ?? 1;
  const { quizzes, hasMore } = await getQuizList({
    page,
    search: request.query.q?.trim(),
  });
  const response: QuizListResponseDto = { quizzes, page, pageSize: 20, hasMore };
  return reply.send(response);
}

export async function getQuizController(
  request: FastifyRequest<{ Params: QuizParams }>,
  reply: FastifyReply,
) {
  const quiz = await getQuiz(request.params.id);
  if (!quiz) return reply.code(404).send({ error: "Quiz não encontrado." });

  const user = await getAuthenticatedUser(request.cookies.auth_token);
  const { ownerId, ...publicQuiz } = quiz;
  const response: PublicQuizResponseDto = { ...publicQuiz, isOwner: user?.id === ownerId };
  return reply.send(response);
}

export async function submitQuizController(
  request: FastifyRequest<{ Params: QuizParams; Body: SubmitAnswersBody }>,
  reply: FastifyReply,
) {
  try {
    const result = await submitQuiz(request.params.id, request.body);
    if (!result) return reply.code(404).send({ error: "Quiz não encontrado." });
    const response: QuizSubmissionResponseDto = result;
    return reply.send(response);
  } catch (cause) {
    if (cause instanceof QuizAnswerError) {
      return reply.code(400).send({ error: cause.message });
    }
    throw cause;
  }
}

export async function checkQuizAnswerController(
  request: FastifyRequest<{ Params: QuizParams; Body: CheckAnswerBody }>,
  reply: FastifyReply,
) {
  try {
    const result = await checkQuizAnswer(
      request.params.id,
      request.body.questionId,
      request.body.optionId,
    );
    if (!result) return reply.code(404).send({ error: "Pergunta não encontrada." });
    const response: CheckAnswerResponseDto = result;
    return reply.send(response);
  } catch (cause) {
    if (cause instanceof QuizAnswerError) {
      return reply.code(400).send({ error: cause.message });
    }
    throw cause;
  }
}

export async function getMyQuizListController(
  request: FastifyRequest<{ Querystring: OwnedQuizListQuery }>,
  reply: FastifyReply,
) {
  const user = request.qleteUser;
  if (!user) return reply.code(401).send({ error: "Autenticação necessária." });

  const page = request.query.page ?? 1;
  const { quizzes, hasMore } = await getQuizList({ page, ownerId: user.id });
  const response: QuizListResponseDto = { quizzes, page, pageSize: 20, hasMore };
  return reply.send(response);
}

export async function getQuizForEditController(
  request: FastifyRequest<{ Params: QuizParams }>,
  reply: FastifyReply,
) {
  const user = request.qleteUser;
  if (!user) return reply.code(401).send({ error: "Autenticação necessária." });

  const result = await getQuizForEdit(request.params.id, user.id);
  if (result.status === "not-found") {
    return reply.code(404).send({ error: "Quiz não encontrado." });
  }
  if (result.status === "forbidden") {
    return reply.code(403).send({ error: "Você não é o dono deste quiz." });
  }

  const response: EditableQuizResponseDto = result.quiz;
  return reply.send(response);
}

export async function createQuizController(
  request: FastifyRequest<{ Body: QuizInputDto }>,
  reply: FastifyReply,
) {
  const user = request.qleteUser;
  if (!user) return reply.code(401).send({ error: "Autenticação necessária." });

  const id = await createQuiz(user.id, request.body);
  return reply.code(201).send({ id });
}

export async function replaceQuizController(
  request: FastifyRequest<{ Params: QuizParams; Body: QuizInputDto }>,
  reply: FastifyReply,
) {
  const user = request.qleteUser;
  if (!user) return reply.code(401).send({ error: "Autenticação necessária." });

  const result = await replaceQuiz(request.params.id, user.id, request.body);
  if (result === "not-found") {
    return reply.code(404).send({ error: "Quiz não encontrado." });
  }
  if (result === "forbidden") {
    return reply.code(403).send({ error: "Você não é o dono deste quiz." });
  }
  return reply.send({ message: "Quiz atualizado com sucesso." });
}

export async function deleteQuizController(
  request: FastifyRequest<{ Params: QuizParams }>,
  reply: FastifyReply,
) {
  const user = request.qleteUser;
  if (!user) return reply.code(401).send({ error: "Autenticação necessária." });

  const result = await deleteQuiz(request.params.id, user.id);
  if (result === "not-found") {
    return reply.code(404).send({ error: "Quiz não encontrado." });
  }
  if (result === "forbidden") {
    return reply.code(403).send({ error: "Você não é o dono deste quiz." });
  }
  return reply.code(204).send();
}
