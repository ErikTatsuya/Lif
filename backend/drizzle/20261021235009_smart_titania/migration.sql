CREATE TABLE "options" (
	"id" serial PRIMARY KEY,
	"question_id" integer NOT NULL,
	"position" integer NOT NULL,
	"text" varchar(500) NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	CONSTRAINT "options_question_position_unique" UNIQUE("question_id","position")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY,
	"quiz_id" varchar(8) NOT NULL,
	"position" integer NOT NULL,
	"prompt" varchar(1000) NOT NULL,
	"explanation" varchar(2000),
	CONSTRAINT "questions_quiz_position_unique" UNIQUE("quiz_id","position")
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" varchar(8) PRIMARY KEY,
	"owner_id" integer NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" varchar(2000) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;