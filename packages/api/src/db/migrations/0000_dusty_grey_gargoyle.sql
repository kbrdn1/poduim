CREATE TABLE `matches` (
	`id` varchar(36) NOT NULL,
	`tournament_id` varchar(36) NOT NULL,
	`home_team_id` varchar(36) NOT NULL,
	`away_team_id` varchar(36) NOT NULL,
	`home_score` int,
	`away_score` int,
	`round` int DEFAULT 1,
	`match_number` int DEFAULT 1,
	`status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
	`scheduled_at` datetime,
	`played_at` datetime,
	`created_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	`updated_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`tournament_id` varchar(36) NOT NULL,
	`created_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	`updated_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournament_subscriptions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`tournament_id` varchar(36) NOT NULL,
	`notify_on_match` boolean DEFAULT true,
	`notify_on_result` boolean DEFAULT true,
	`created_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	CONSTRAINT `tournament_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`date` datetime NOT NULL,
	`status` enum('draft','registration','in_progress','completed','cancelled') DEFAULT 'draft',
	`created_by` varchar(36),
	`created_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	`updated_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`username` varchar(50) NOT NULL,
	`first_name` varchar(100),
	`last_name` varchar(100),
	`role` enum('admin','viewer') DEFAULT 'viewer',
	`is_active` boolean DEFAULT true,
	`last_login_at` datetime,
	`created_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	`updated_at` datetime DEFAULT '2025-12-13 15:12:49.299',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
