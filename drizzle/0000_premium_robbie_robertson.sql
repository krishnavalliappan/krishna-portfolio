CREATE TABLE `codex_activity_summary` (
	`id` integer PRIMARY KEY NOT NULL,
	`lifetime_tokens` integer NOT NULL,
	`peak_daily_tokens` integer NOT NULL,
	`current_streak_days` integer NOT NULL,
	`longest_streak_days` integer NOT NULL,
	`collected_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `codex_daily_activity` (
	`date` text PRIMARY KEY NOT NULL,
	`tokens` integer NOT NULL
);
