import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, registrationsTable, participantsTable } from "@workspace/db";
import {
  CreateRegistrationBody,
  GetRegistrationParams,
  UploadPaymentScreenshotParams,
  UploadPaymentScreenshotBody,
  GetRegistrationResponse,
  UploadPaymentScreenshotResponse,
} from "@workspace/api-zod";
import { nanoid } from "../lib/nanoid";

const router: IRouter = Router();

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, totalPasses, participants } = parsed.data;

  const bookingId = "ANT-" + Date.now().toString(36).toUpperCase() + "-" + nanoid(4);

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      bookingId,
      name,
      email,
      phone,
      totalPasses,
      paymentStatus: "pending",
    })
    .returning();

  const participantInserts = participants.map((p) => ({
    registrationId: registration.id,
    participantName: p.participantName,
    age: p.age ?? null,
    collegeOrCompany: p.collegeOrCompany ?? null,
    passId: null,
    qrToken: null,
    isUsed: false,
  }));

  const insertedParticipants = await db
    .insert(participantsTable)
    .values(participantInserts)
    .returning();

  req.log.info({ bookingId, registrationId: registration.id }, "Registration created");

  res.status(201).json({
    ...registration,
    createdAt: registration.createdAt.toISOString(),
    participants: insertedParticipants,
  });
});

router.get("/registrations/:bookingId", async (req, res): Promise<void> => {
  const params = GetRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.bookingId, params.data.bookingId));

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  const participants = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.registrationId, registration.id));

  res.json(GetRegistrationResponse.parse({
    ...registration,
    createdAt: registration.createdAt.toISOString(),
    participants,
  }));
});

router.post("/registrations/:bookingId/payment-screenshot", async (req, res): Promise<void> => {
  const params = UploadPaymentScreenshotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UploadPaymentScreenshotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [registration] = await db
    .update(registrationsTable)
    .set({ paymentScreenshot: parsed.data.screenshotUrl })
    .where(eq(registrationsTable.bookingId, params.data.bookingId))
    .returning();

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.json(UploadPaymentScreenshotResponse.parse({
    ...registration,
    createdAt: registration.createdAt.toISOString(),
  }));
});

export default router;
