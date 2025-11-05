CREATE TABLE `analytics` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`event_name` varchar(255) NOT NULL,
	`event_category` varchar(100),
	`user_id` int,
	`metadata` json,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`role_id` int,
	`is_active` boolean DEFAULT true,
	`phone_number` text,
	`first_name` text,
	`last_name` text,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_system_role` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`resource` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`description` text,
	`category` varchar(50),
	`conditions` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` bigint unsigned NOT NULL,
	`permission_id` bigint unsigned NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`user_id` varchar(36) NOT NULL,
	`permission_id` bigint unsigned NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_permissions_user_id_permission_id_pk` PRIMARY KEY(`user_id`,`permission_id`)
);

--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`operation` varchar(50) NOT NULL,
	`table_name` varchar(100) NOT NULL,
	`record_id` varchar(255) NOT NULL,
	`data` json,
	`synced` boolean DEFAULT false,
	`attempts` int DEFAULT 0,
	`last_error` text,
	`created_at` timestamp DEFAULT (now()),
	`synced_at` timestamp,
	CONSTRAINT `sync_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `event_name_idx` ON `analytics` (`event_name`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `analytics` (`event_category`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `analytics` (`user_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `analytics` (`created_at`);--> statement-breakpoint
CREATE INDEX `resource_action_idx` ON `permissions` (`resource`,`action`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `permissions` (`category`);--> statement-breakpoint
CREATE INDEX `permission_id_idx` ON `role_permissions` (`permission_id`);--> statement-breakpoint
CREATE INDEX `permission_id_idx` ON `user_permissions` (`permission_id`);--> statement-breakpoint
CREATE INDEX `synced_idx` ON `sync_queue` (`synced`);