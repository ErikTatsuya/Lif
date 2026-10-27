import { boolean, integer, pgTable, varchar, text, timestamp, serial, unique, date } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
})

export const quizzesTable = pgTable("quizzes", {
  id: varchar({ length: 8 }).primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar({ length: 160 }).notNull(),
  description: varchar({ length: 2000 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: serial().primaryKey(),
  quizId: varchar("quiz_id", { length: 8 }).notNull().references(() => quizzesTable.id, { onDelete: "cascade" }),
  position: integer().notNull(),
  prompt: varchar({ length: 1000 }).notNull(),
  explanation: varchar({ length: 2000 }),
}, table => [
  unique("questions_quiz_position_unique").on(table.quizId, table.position),
]);

export const optionsTable = pgTable("options", {
  id: serial().primaryKey(),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  position: integer().notNull(),
  text: varchar({ length: 500 }).notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
}, table => [
  unique("options_question_position_unique").on(table.questionId, table.position),
]);

export const quizScoresTable = pgTable("quiz_scores", {
  id: serial().primaryKey(),
  quizId: varchar("quiz_id", { length: 8 })
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  score: integer().notNull(),
  total: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});