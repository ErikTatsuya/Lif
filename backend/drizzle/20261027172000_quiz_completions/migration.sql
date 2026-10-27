CREATE TABLE "quiz_completions" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"quiz_id" varchar(8) NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_completions_user_quiz_unique" UNIQUE("user_id","quiz_id")
);
--> statement-breakpoint
ALTER TABLE "quiz_completions" ADD CONSTRAINT "quiz_completions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "quiz_completions" ADD CONSTRAINT "quiz_completions_quiz_id_quizzes_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;
