import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { inArray } from "drizzle-orm";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test("Qlete permissions and public answer privacy", { skip: !testDatabaseUrl }, async context => {
  if (!testDatabaseUrl) return;
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET = `qlete-test-${randomUUID()}`;

  const [{ default: Fastify }, { default: cookies }, { default: rateLimit }, { db }, schema, users, auth, routes] =
    await Promise.all([
      import("fastify"),
      import("@fastify/cookie"),
      import("@fastify/rate-limit"),
      import("../db/index.js"),
      import("../db/schema.js"),
      import("../services/user.js"),
      import("../services/auth.js"),
      import("./qlete.js"),
    ]);

  const app = Fastify();
  const userIds: number[] = [];
  await app.register(cookies);
  await app.register(rateLimit);
  await app.register(routes.qleteRoutes, { prefix: "/qlete" });

  context.after(async () => {
    await app.close();
    if (userIds.length) {
      await db.delete(schema.usersTable).where(inArray(schema.usersTable.id, userIds));
    }
  });

  const suffix = randomUUID();
  const password = "Qlete-test-password-123";
  const owner = await users.createUser({
    username: `qlete_owner_${suffix}`,
    name: "Qlete owner",
    email: `qlete-owner-${suffix}@example.test`,
    password,
  });
  const other = await users.createUser({
    username: `qlete_other_${suffix}`,
    name: "Qlete other",
    email: `qlete-other-${suffix}@example.test`,
    password,
  });
  assert.ok(owner);
  assert.ok(other);
  userIds.push(owner.id, other.id);

  const ownerLogin = await auth.login({ username: owner.username, password });
  const otherLogin = await auth.login({ username: other.username, password });
  assert.ok(ownerLogin);
  assert.ok(otherLogin);
  await app.ready();

  const payload = {
    title: "Teste de permissões",
    questions: [{
      prompt: "Qual opção está correta?",
      explanation: "É a primeira.",
      options: [
        { text: "Correta", isCorrect: true },
        { text: "Incorreta", isCorrect: false },
      ],
    }],
  };

  const anonymousCreate = await app.inject({
    method: "POST",
    url: "/qlete/quizzes",
    payload,
  });
  assert.equal(anonymousCreate.statusCode, 401);

  const created = await app.inject({
    method: "POST",
    url: "/qlete/quizzes/import",
    headers: { cookie: `auth_token=${ownerLogin.token}` },
    payload,
  });
  assert.equal(created.statusCode, 201);
  const quizId = created.json<{ id: string }>().id;

  const publicQuiz = await app.inject({
    method: "GET",
    url: `/qlete/quizzes/${quizId}`,
  });
  assert.equal(publicQuiz.statusCode, 200);
  assert.equal(publicQuiz.body.includes("is_correct"), false);
  assert.equal(publicQuiz.body.includes("isCorrect"), false);
  const publicQuestion = publicQuiz.json<{
    questions: Array<{ id: number; options: Array<{ id: number }> }>;
  }>().questions[0];
  assert.ok(publicQuestion);
  const [correctOption, incorrectOption] = publicQuestion.options;
  assert.ok(correctOption);
  assert.ok(incorrectOption);

  const correctCheck = await app.inject({
    method: "POST",
    url: `/qlete/quizzes/${quizId}/check`,
    payload: { questionId: publicQuestion.id, optionId: correctOption.id },
  });
  assert.equal(correctCheck.statusCode, 200);
  assert.deepEqual(correctCheck.json(), {
    isCorrect: true,
    correctOptionId: correctOption.id,
  });

  const incorrectCheck = await app.inject({
    method: "POST",
    url: `/qlete/quizzes/${quizId}/check`,
    payload: { questionId: publicQuestion.id, optionId: incorrectOption.id },
  });
  assert.equal(incorrectCheck.statusCode, 200);
  assert.deepEqual(incorrectCheck.json(), {
    isCorrect: false,
    correctOptionId: correctOption.id,
  });

  const unansweredCheck = await app.inject({
    method: "POST",
    url: `/qlete/quizzes/${quizId}/check`,
    payload: { questionId: publicQuestion.id, optionId: null },
  });
  assert.equal(unansweredCheck.statusCode, 200);
  assert.deepEqual(unansweredCheck.json(), {
    isCorrect: false,
    correctOptionId: correctOption.id,
  });

  const otherHeaders = { cookie: `auth_token=${otherLogin.token}` };
  const forbiddenEdit = await app.inject({
    method: "PUT",
    url: `/qlete/quizzes/${quizId}`,
    headers: otherHeaders,
    payload,
  });
  assert.equal(forbiddenEdit.statusCode, 403);

  const forbiddenDelete = await app.inject({
    method: "DELETE",
    url: `/qlete/quizzes/${quizId}`,
    headers: otherHeaders,
  });
  assert.equal(forbiddenDelete.statusCode, 403);

  const forbiddenEditView = await app.inject({
    method: "GET",
    url: `/qlete/quizzes/${quizId}/edit`,
    headers: otherHeaders,
  });
  assert.equal(forbiddenEditView.statusCode, 403);

  const ownerEditView = await app.inject({
    method: "GET",
    url: `/qlete/quizzes/${quizId}/edit`,
    headers: { cookie: `auth_token=${ownerLogin.token}` },
  });
  assert.equal(ownerEditView.statusCode, 200);
  assert.equal(ownerEditView.json().questions[0].options[0].isCorrect, true);
});
