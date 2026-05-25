import { db } from "@workspace/db";
import { eq, asc, or } from "drizzle-orm";
import { registrationsTable } from "@workspace/db";
import { participantsTable } from "@workspace/db";

// Keep mapping functions with same return types so we don't break routes
export function mapRegistration(row: any) {
  return {
    id: row.id,
    bookingId: row.bookingId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    totalPasses: row.totalPasses,
    paymentScreenshot: row.paymentScreenshot,
    paymentStatus: row.paymentStatus,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function mapParticipant(row: any) {
  return {
    id: row.id,
    registrationId: row.registrationId,
    participantName: row.participantName,
    email: row.email,
    phone: row.phone,
    age: row.age,
    collegeOrCompany: row.collegeOrCompany,
    passId: row.passId,
    qrToken: row.qrToken,
    isUsed: Boolean(row.isUsed),
  };
}

export async function insertRegistration(values: {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  totalPasses: number;
  paymentStatus: string;
}) {
  const result = await db
    .insert(registrationsTable)
    .values({
      bookingId: values.bookingId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      totalPasses: values.totalPasses,
      paymentStatus: values.paymentStatus,
    })
    .returning();
  return result[0] ?? null;
}

export async function insertParticipants(
  participants: Array<{
    registrationId: number;
    participantName: string;
    email: string | null;
    phone: string | null;
    age: number | null;
    collegeOrCompany: string | null;
    passId: string | null;
    qrToken: string | null;
    isUsed: boolean;
  }>,
) {
  const result = await db
    .insert(participantsTable)
    .values(participants)
    .returning();
  return result;
}

export async function findRegistrationByBookingId(bookingId: string) {
  const result = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.bookingId, bookingId))
    .limit(1);
  return result[0] ?? null;
}

export async function updatePaymentScreenshotByBookingId(
  bookingId: string,
  screenshotUrl: string,
) {
  const result = await db
    .update(registrationsTable)
    .set({ paymentScreenshot: screenshotUrl })
    .where(eq(registrationsTable.bookingId, bookingId))
    .returning();
  return result[0] ?? null;
}

export async function uploadPaymentScreenshotAndUpdateRegistration(input: {
  bookingId: string;
  fileName: string;
  mimeType: string;
  screenshotData: string;
}) {
  return updatePaymentScreenshotByBookingId(input.bookingId, input.screenshotData);
}

export async function listParticipantsByRegistrationId(registrationId: number) {
  return db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.registrationId, registrationId));
}

export async function listRegistrations(paymentStatus?: string) {
  let query = db.select().from(registrationsTable);
  if (paymentStatus) {
    query = query.where(eq(registrationsTable.paymentStatus, paymentStatus)) as any;
  }
  return query.orderBy(asc(registrationsTable.createdAt));
}

export async function updateRegistrationStatusById(id: number, status: string) {
  const result = await db
    .update(registrationsTable)
    .set({ paymentStatus: status })
    .where(eq(registrationsTable.id, id))
    .returning();
  return result[0] ?? null;
}

export async function updateParticipantById(
  id: number,
  values: { passId?: string | null; qrToken?: string | null; isUsed?: boolean },
) {
  const payload: any = {};
  if (values.passId !== undefined) payload.passId = values.passId;
  if (values.qrToken !== undefined) payload.qrToken = values.qrToken;
  if (values.isUsed !== undefined) payload.isUsed = values.isUsed;

  const result = await db
    .update(participantsTable)
    .set(payload)
    .where(eq(participantsTable.id, id))
    .returning();
  return result[0] ?? null;
}

export async function findParticipantByQrToken(token: string) {
  const result = await db
    .select()
    .from(participantsTable)
    .where(or(
      eq(participantsTable.qrToken, token),
      eq(participantsTable.passId, token)
    ))
    .limit(1);
  return result[0] ?? null;
}

export async function markParticipantUsedByQrToken(token: string) {
  const p = await findParticipantByQrToken(token);
  if (!p) return null;

  const result = await db
    .update(participantsTable)
    .set({ isUsed: true })
    .where(eq(participantsTable.id, p.id))
    .returning();
  return result[0] ?? null;
}

export async function listAllParticipants() {
  return db.select().from(participantsTable);
}
