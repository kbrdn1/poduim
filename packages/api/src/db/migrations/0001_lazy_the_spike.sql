ALTER TABLE `matches` MODIFY COLUMN `created_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `matches` MODIFY COLUMN `updated_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `teams` MODIFY COLUMN `created_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `teams` MODIFY COLUMN `updated_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `tournament_subscriptions` MODIFY COLUMN `created_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `tournaments` MODIFY COLUMN `created_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `tournaments` MODIFY COLUMN `updated_at` datetime DEFAULT '2025-12-13 21:36:11.351';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `created_at` datetime DEFAULT '2025-12-13 21:36:11.350';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `updated_at` datetime DEFAULT '2025-12-13 21:36:11.350';--> statement-breakpoint
ALTER TABLE `users` ADD `accepted_terms_at` datetime;