import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { registrationsTable } from "./registrations";

export const participantsTable = pgTable("participants", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id")
    .notNull()
    .references(() => registrationsTable.id),
  participantName: text("participant_name").notNull(),
  age: integer("age"),
  collegeOrCompany: text("college_or_company"),
  passId: text("pass_id"),
  qrToken: text("qr_token").unique(),
  isUsed: boolean("is_used").notNull().default(false),
});

export const insertParticipantSchema = createInsertSchema(participantsTable).omit({
  id: true,
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participantsTable.$inferSelect;
