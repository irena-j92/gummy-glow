import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const subscribers = sqliteTable('newsletter_subscribers', {
 email: text('email').primaryKey(),
 consentVersion: text('consent_version').notNull(),
 createdAt: integer('created_at').notNull(),
});
