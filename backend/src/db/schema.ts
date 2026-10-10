import { integer, pgTable, varchar, text, timestamp, serial, unique } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const curiosidades = pgTable(
  "curiosidades",
  {
    id: serial("id").primaryKey(),
    mes: integer("mes").notNull(), // 1-12
    dia: integer("dia").notNull(), // 1-31
    titulo: text("titulo").notNull(),
    resumo: text("resumo").notNull(),
    criadoEm: timestamp("criado_em").defaultNow().notNull(),
  },
  (t) => [unique("curiosidades_mes_dia_unique").on(t.mes, t.dia)],
);

export const quizzesTable = pgTable("quizzes", {
})