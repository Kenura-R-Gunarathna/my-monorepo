CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`target` int NOT NULL,
	`limit` int NOT NULL,
	`reviewer` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `sync_queue`;