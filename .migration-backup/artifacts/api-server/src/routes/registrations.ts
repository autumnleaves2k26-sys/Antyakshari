import { Router, type IRouter } from "express";
import {
  CreateRegistrationBody,
  GetRegistrationParams,
  UploadPaymentScreenshotParams,
  UploadPaymentScreenshotBody,
  GetRegistrationResponse,
  UploadPaymentScreenshotResponse,
} from "@workspace/api-zod";
import { nanoid } from "../lib/nanoid";
import {
  findRegistrationByBookingId,
  insertParticipants,
  insertRegistration,
  listParticipantsByRegistrationId,
  mapParticipant,
  mapRegistration,
  uploadPaymentScreenshotAndUpdateRegistration,
} from "../lib/supabase";

const router: IRouter = Router();

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, totalPasses, participants } = parsed.data;

  const bookingId = "ANT-" + Date.now().toString(36).toUpperCase() + "-" + nanoid(4);

  const registration = await insertRegistration({
    bookingId,
    name,
    email,
    phone,
    totalPasses,
    paymentStatus: "pending",
  });

  if (!registration) {
    res.status(500).json({ error: "Failed to create registration" });
    return;
  }

  const participantInserts = participants.map((p) => ({
    registrationId: registration.id,
    participantName: p.participantName,
    email: p.email,
    phone: p.phone,
    age: null,
    collegeOrCompany: null,
    passId: null,
    qrToken: null,
    isUsed: false,
  }));

  const insertedParticipants = await insertParticipants(participantInserts);

  req.log.info({ bookingId, registrationId: registration.id }, "Registration created");

  const mappedRegistration = mapRegistration(registration);
  const mappedParticipants = insertedParticipants.map(mapParticipant);

  res.status(201).json({
    ...mappedRegistration,
    participants: mappedParticipants,
  });
});

router.get("/registrations/:bookingId", async (req, res): Promise<void> => {
  const params = GetRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const registration = await findRegistrationByBookingId(params.data.bookingId);

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  const participants = await listParticipantsByRegistrationId(registration.id);

  const mappedRegistration = mapRegistration(registration);
  const mappedParticipants = participants.map(mapParticipant);

  res.json(GetRegistrationResponse.parse({
    ...mappedRegistration,
    participants: mappedParticipants,
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

  const registration = await uploadPaymentScreenshotAndUpdateRegistration({
    bookingId: params.data.bookingId,
    fileName: parsed.data.screenshotFileName,
    mimeType: parsed.data.screenshotMimeType,
    screenshotData: parsed.data.screenshotData,
  });

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  const mappedRegistration = mapRegistration(registration);
  res.json(UploadPaymentScreenshotResponse.parse(mappedRegistration));
});

export default router;
