import type { FastifyInstance } from "fastify";

import {
  authenticateQleteUserController,
  checkQuizAnswerController,
  createQuizController,
  deleteQuizController,
  getMyQuizListController,
  getQuizController,
  getQuizForEditController,
  getQuizListController,
  replaceQuizController,
  submitQuizController,
} from "../controllers/qlete.js";
import {
  checkAnswerResponseSchema,
  checkAnswerSchema,
  createdQuizResponseSchema,
  editableQuizResponseSchema,
  errorResponseSchema,
  ownedQuizListQuerySchema,
  publicQuizResponseSchema,
  quizInputSchema,
  quizListQuerySchema,
  quizListResponseSchema,
  quizParamsSchema,
  quizSubmissionResponseSchema,
  submitAnswersSchema,
  updatedQuizResponseSchema,
} from "../dtos/qlete.js";

export async function qleteRoutes(app: FastifyInstance) {
  app.get("/quizzes", {
    schema: {
      querystring: quizListQuerySchema,
      response: { 200: quizListResponseSchema },
    },
  }, getQuizListController);

  app.get("/quizzes/:id", {
    schema: {
      params: quizParamsSchema,
      response: {
        200: publicQuizResponseSchema,
        404: errorResponseSchema,
      },
    },
  }, getQuizController);

  app.post("/quizzes/:id/submit", {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    schema: {
      params: quizParamsSchema,
      body: submitAnswersSchema,
      response: {
        200: quizSubmissionResponseSchema,
        404: errorResponseSchema,
      },
    },
  }, submitQuizController);

  app.post("/quizzes/:id/check", {
    config: { rateLimit: { max: 120, timeWindow: "1 minute" } },
    schema: {
      params: quizParamsSchema,
      body: checkAnswerSchema,
      response: {
        200: checkAnswerResponseSchema,
        404: errorResponseSchema,
      },
    },
  }, checkQuizAnswerController);

  app.register(async protectedRoutes => {
    protectedRoutes.addHook("preHandler", authenticateQleteUserController);

    protectedRoutes.get("/me/quizzes", {
      schema: {
        querystring: ownedQuizListQuerySchema,
        response: { 200: quizListResponseSchema },
      },
    }, getMyQuizListController);

    protectedRoutes.get("/quizzes/:id/edit", {
      schema: {
        params: quizParamsSchema,
        response: {
          200: editableQuizResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    }, getQuizForEditController);

    protectedRoutes.post("/quizzes", {
      schema: {
        body: quizInputSchema,
        response: { 201: createdQuizResponseSchema },
      },
    }, createQuizController);

    protectedRoutes.post("/quizzes/import", {
      schema: {
        body: quizInputSchema,
        response: { 201: createdQuizResponseSchema },
      },
    }, createQuizController);

    protectedRoutes.put("/quizzes/:id", {
      schema: {
        params: quizParamsSchema,
        body: quizInputSchema,
        response: {
          200: updatedQuizResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    }, replaceQuizController);

    protectedRoutes.delete("/quizzes/:id", {
      schema: {
        params: quizParamsSchema,
        response: {
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    }, deleteQuizController);
  });
}
