CREATE TABLE "quiz_completions" (
	"id" serial PRIMARY KEY,
	"user_id" integer,
	"quiz_id" varchar(8) NOT NULL,
	"temporary_name" varchar(40),
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_completions_user_quiz_unique" UNIQUE("user_id","quiz_id"),
	CONSTRAINT "quiz_completions_temporary_name_unique" UNIQUE("quiz_id","temporary_name")
);
--> statement-breakpoint
ALTER TABLE "quiz_completions" ADD CONSTRAINT "quiz_completions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "quiz_completions" ADD CONSTRAINT "quiz_completions_quiz_id_quizzes_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;
