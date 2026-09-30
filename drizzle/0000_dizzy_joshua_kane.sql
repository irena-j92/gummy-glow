CREATE TABLE `newsletter_subscribers` (
	`email` text PRIMARY KEY NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` integer NOT NULL
);
