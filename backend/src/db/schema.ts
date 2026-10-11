import { integer, pgTable, varchar, text, timestamp, serial, unique, date } from "drizzle-orm/pg-core";

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
})