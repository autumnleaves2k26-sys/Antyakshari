// artifacts/api-server/src/app.ts
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";

// artifacts/api-server/src/routes/index.ts
import { Router as Router5 } from "express";

// artifacts/api-server/src/routes/health.ts
import { Router } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
var router = Router();
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});
var health_default = router;

// artifacts/api-server/src/routes/registrations.ts
import { Router as Router2 } from "express";
import {
  CreateRegistrationBody,
  GetRegistrationParams,
  UploadPaymentScreenshotParams,
  UploadPaymentScreenshotBody,
  GetRegistrationResponse,
  UploadPaymentScreenshotResponse
} from "@workspace/api-zod";

// artifacts/api-server/src/lib/nanoid.ts
import crypto from "node:crypto";
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function nanoid(size = 8) {
  let result = "";
  const bytes = crypto.randomBytes(size);
  for (const byte of bytes) {
    result += alphabet[byte % alphabet.length];
  }
  return result;
}

// artifacts/api-server/src/lib/supabase.ts
var baseUrl = (process.env.SUPABASE_URL || "https://jjxukcedpahluizzeyge.supabase.co").replace(/\/+$/, "");
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeHVrY2VkcGFobHVpenpleWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyNDY0NiwiZXhwIjoyMDk1MjAwNjQ2fQ.OuKJsGIsbsqopjZc-ryvPyrv3ifhjnBCnlwk8HialOo";
var restBaseUrl = `${baseUrl}/rest/v1`;
var storageBaseUrl = `${baseUrl}/storage/v1`;
var paymentScreenshotBucket = "payment-screenshots";
function encodeEq(value) {
  return `eq.${encodeURIComponent(String(value))}`;
}
function headers(prefer) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...prefer ? { Prefer: prefer } : {}
  };
}
async function request(path, options = {}) {
  const { method = "GET", body, prefer } = options;
  const response = await fetch(`${restBaseUrl}${path}`, {
    method,
    headers: headers(prefer),
    body: body === void 0 ? void 0 : JSON.stringify(body)
  });
  if (!response.ok) {
    const text2 = await response.text();
    if (text2.includes("PGRST205")) {
      throw new Error(
        `Supabase table missing for ${path}. Create the public.registrations and public.participants tables first (see lib/db/migrations/0001_init.sql). Original error: ${text2}`
      );
    }
    throw new Error(`Supabase REST ${method} ${path} failed (${response.status}): ${text2}`);
  }
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
async function ensureStorageBucket(bucketName) {
  const lookup = await fetch(`${storageBaseUrl}/bucket/${bucketName}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });
  if (lookup.ok) {
    return;
  }
  if (lookup.status !== 404) {
    const text2 = await lookup.text();
    throw new Error(`Supabase storage bucket lookup failed (${lookup.status}): ${text2}`);
  }
  const create = await fetch(`${storageBaseUrl}/bucket`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: bucketName,
      name: bucketName,
      public: true
    })
  });
  if (create.ok || create.status === 409) {
    return;
  }
  const text = await create.text();
  throw new Error(`Supabase storage bucket create failed (${create.status}): ${text}`);
}
function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
}
function decodeDataUrl(dataUrl) {
  const base64 = dataUrl.includes("base64,") ? dataUrl.split("base64,").pop() ?? "" : dataUrl;
  return Buffer.from(base64, "base64");
}
function mapRegistration(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    totalPasses: row.total_passes,
    paymentScreenshot: row.payment_screenshot,
    paymentStatus: row.payment_status,
    createdAt: new Date(row.created_at).toISOString()
  };
}
function mapParticipant(row) {
  return {
    id: row.id,
    registrationId: row.registration_id,
    participantName: row.participant_name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    collegeOrCompany: row.college_or_company,
    passId: row.pass_id,
    qrToken: row.qr_token,
    isUsed: Boolean(row.is_used)
  };
}
async function insertRegistration(values) {
  const rows = await request(
    "/registrations?select=*",
    {
      method: "POST",
      prefer: "return=representation",
      body: {
        booking_id: values.bookingId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        total_passes: values.totalPasses,
        payment_status: values.paymentStatus
      }
    }
  );
  return rows[0] ?? null;
}
async function insertParticipants(participants) {
  const rows = await request(
    "/participants?select=*",
    {
      method: "POST",
      prefer: "return=representation",
      body: participants.map((p) => ({
        registration_id: p.registrationId,
        participant_name: p.participantName,
        email: p.email,
        phone: p.phone,
        age: p.age,
        college_or_company: p.collegeOrCompany,
        pass_id: p.passId,
        qr_token: p.qrToken,
        is_used: p.isUsed
      }))
    }
  );
  return rows;
}
async function findRegistrationByBookingId(bookingId) {
  const rows = await request(
    `/registrations?booking_id=${encodeEq(bookingId)}&select=*`
  );
  return rows[0] ?? null;
}
async function updatePaymentScreenshotByBookingId(bookingId, screenshotUrl) {
  const rows = await request(
    `/registrations?booking_id=${encodeEq(bookingId)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { payment_screenshot: screenshotUrl }
    }
  );
  return rows[0] ?? null;
}
async function uploadPaymentScreenshotAndUpdateRegistration(input) {
  await ensureStorageBucket(paymentScreenshotBucket);
  const safeFileName = sanitizeFileName(input.fileName || "payment-screenshot");
  const objectPath = `${input.bookingId}/${Date.now()}-${safeFileName}`;
  const uploaded = await fetch(
    `${storageBaseUrl}/object/${paymentScreenshotBucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": input.mimeType || "application/octet-stream",
        "x-upsert": "true"
      },
      body: decodeDataUrl(input.screenshotData)
    }
  );
  if (!uploaded.ok) {
    const text = await uploaded.text();
    throw new Error(`Supabase storage upload failed (${uploaded.status}): ${text}`);
  }
  const publicUrl = `${baseUrl}/storage/v1/object/public/${paymentScreenshotBucket}/${objectPath}`;
  return updatePaymentScreenshotByBookingId(input.bookingId, publicUrl);
}
async function listParticipantsByRegistrationId(registrationId) {
  return request(
    `/participants?registration_id=${encodeEq(registrationId)}&select=*`
  );
}
async function listRegistrations(paymentStatus) {
  const statusQuery = paymentStatus ? `&payment_status=${encodeEq(paymentStatus)}` : "";
  return request(
    `/registrations?select=*&order=created_at.asc${statusQuery}`
  );
}
async function updateRegistrationStatusById(id, status) {
  const rows = await request(
    `/registrations?id=${encodeEq(id)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { payment_status: status }
    }
  );
  return rows[0] ?? null;
}
async function updateParticipantById(id, values) {
  const payload = {};
  if (values.passId !== void 0) payload.pass_id = values.passId;
  if (values.qrToken !== void 0) payload.qr_token = values.qrToken;
  if (values.isUsed !== void 0) payload.is_used = values.isUsed;
  const rows = await request(
    `/participants?id=${encodeEq(id)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: payload
    }
  );
  return rows[0] ?? null;
}
async function findParticipantByQrToken(token) {
  const rowsByToken = await request(
    `/participants?qr_token=${encodeEq(token)}&select=*`
  );
  if (rowsByToken && rowsByToken.length > 0) {
    return rowsByToken[0];
  }
  const rowsById = await request(
    `/participants?pass_id=${encodeEq(token)}&select=*`
  );
  return rowsById[0] ?? null;
}
async function markParticipantUsedByQrToken(token) {
  const p = await findParticipantByQrToken(token);
  if (!p) return null;
  const rows = await request(
    `/participants?id=${encodeEq(p.id)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { is_used: true }
    }
  );
  return rows[0] ?? null;
}
async function listAllParticipants() {
  return request("/participants?select=*");
}

// artifacts/api-server/src/routes/registrations.ts
var router2 = Router2();
router2.post("/registrations", async (req, res) => {
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
    paymentStatus: "pending"
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
    isUsed: false
  }));
  const insertedParticipants = await insertParticipants(participantInserts);
  req.log.info({ bookingId, registrationId: registration.id }, "Registration created");
  const mappedRegistration = mapRegistration(registration);
  const mappedParticipants = insertedParticipants.map(mapParticipant);
  res.status(201).json({
    ...mappedRegistration,
    participants: mappedParticipants
  });
});
router2.get("/registrations/:bookingId", async (req, res) => {
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
    participants: mappedParticipants
  }));
});
router2.post("/registrations/:bookingId/payment-screenshot", async (req, res) => {
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
    screenshotData: parsed.data.screenshotData
  });
  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }
  const mappedRegistration = mapRegistration(registration);
  res.json(UploadPaymentScreenshotResponse.parse(mappedRegistration));
});
var registrations_default = router2;

// artifacts/api-server/src/routes/admin.ts
import { Router as Router3 } from "express";
import {
  AdminLoginBody,
  ListRegistrationsQueryParams,
  ApproveRegistrationParams,
  RejectRegistrationParams,
  AdminLoginResponse,
  ListRegistrationsResponse,
  ApproveRegistrationResponse,
  RejectRegistrationResponse,
  GetAdminStatsResponse
} from "@workspace/api-zod";
var router3 = Router3();
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "antyakshari2026";
var ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "admin-secret-token-2026";
router3.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json(AdminLoginResponse.parse({ success: true, token: ADMIN_TOKEN }));
});
function requireAdmin(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  const token = auth.slice(7);
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Invalid token" });
    return false;
  }
  return true;
}
router3.get("/admin/registrations", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const params = ListRegistrationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const registrations = await listRegistrations(params.data.status);
  const result = await Promise.all(
    registrations.map(async (reg) => {
      const participants = await listParticipantsByRegistrationId(reg.id);
      const mappedRegistration = mapRegistration(reg);
      const mappedParticipants = participants.map(mapParticipant);
      return {
        ...mappedRegistration,
        participants: mappedParticipants
      };
    })
  );
  res.json(ListRegistrationsResponse.parse(result));
});
router3.post("/admin/registrations/:id/approve", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ApproveRegistrationParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const registration = await updateRegistrationStatusById(params.data.id, "approved");
  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }
  const participants = await listParticipantsByRegistrationId(registration.id);
  let passCounter = 1;
  const updatedParticipants = [];
  for (const participant of participants) {
    if (!participant.pass_id) {
      const passNum = String(passCounter++).padStart(3, "0");
      const passId = `ANT-2026-${passNum}-${nanoid(4)}`;
      const qrToken = nanoid(16).toLowerCase() + "-" + participant.id;
      const updated = await updateParticipantById(participant.id, { passId, qrToken });
      if (!updated) {
        res.status(500).json({ error: "Failed to generate pass" });
        return;
      }
      updatedParticipants.push(mapParticipant(updated));
    } else {
      updatedParticipants.push(mapParticipant(participant));
    }
  }
  req.log.info({ registrationId: registration.id }, "Registration approved, passes generated");
  const mappedRegistration = mapRegistration(registration);
  res.json(ApproveRegistrationResponse.parse({
    ...mappedRegistration,
    participants: updatedParticipants
  }));
});
router3.post("/admin/registrations/:id/reject", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RejectRegistrationParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const registration = await updateRegistrationStatusById(params.data.id, "rejected");
  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }
  const mappedRegistration = mapRegistration(registration);
  res.json(RejectRegistrationResponse.parse(mappedRegistration));
});
router3.get("/admin/stats", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const registrations = await listRegistrations();
  const participants = await listAllParticipants();
  const totalRegistrations = registrations.length;
  const pendingRegistrations = registrations.filter((r) => r.payment_status === "pending").length;
  const approvedRegistrations = registrations.filter((r) => r.payment_status === "approved").length;
  const rejectedRegistrations = registrations.filter((r) => r.payment_status === "rejected").length;
  const totalPasses = registrations.reduce((sum, r) => sum + Number(r.total_passes ?? 0), 0);
  const totalPassesIssued = participants.filter((p) => Boolean(p.pass_id)).length;
  res.json(GetAdminStatsResponse.parse({
    totalRegistrations,
    pendingRegistrations,
    approvedRegistrations,
    rejectedRegistrations,
    totalPasses,
    totalPassesIssued
  }));
});
var admin_default = router3;

// artifacts/api-server/src/routes/passes.ts
import { Router as Router4 } from "express";
import {
  ValidatePassParams,
  MarkPassUsedParams,
  ValidatePassResponse,
  MarkPassUsedResponse
} from "@workspace/api-zod";
var router4 = Router4();
router4.get("/passes/:qrToken/validate", async (req, res) => {
  const rawToken = Array.isArray(req.params.qrToken) ? req.params.qrToken[0] : req.params.qrToken;
  const params = ValidatePassParams.safeParse({ qrToken: rawToken });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const participantRow = await findParticipantByQrToken(params.data.qrToken);
  const participant = participantRow ? mapParticipant(participantRow) : null;
  if (!participant || !participant.passId) {
    res.json(ValidatePassResponse.parse({
      status: "invalid",
      passId: null,
      participantName: null,
      eventName: "Antyakshari",
      eventDate: "31 May 2026",
      isUsed: false
    }));
    return;
  }
  const status = participant.isUsed ? "used" : "valid";
  res.json(ValidatePassResponse.parse({
    status,
    passId: participant.passId,
    participantName: participant.participantName,
    eventName: "Antyakshari",
    eventDate: "31 May 2026",
    isUsed: participant.isUsed
  }));
});
router4.post("/passes/:qrToken/mark-used", async (req, res) => {
  const rawToken = Array.isArray(req.params.qrToken) ? req.params.qrToken[0] : req.params.qrToken;
  const params = MarkPassUsedParams.safeParse({ qrToken: rawToken });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const participantRow = await findParticipantByQrToken(params.data.qrToken);
  const participant = participantRow ? mapParticipant(participantRow) : null;
  if (!participant || !participant.passId) {
    res.json(MarkPassUsedResponse.parse({
      status: "invalid",
      passId: null,
      participantName: null,
      eventName: "Antyakshari",
      eventDate: "31 May 2026",
      isUsed: false
    }));
    return;
  }
  const updatedRow = await markParticipantUsedByQrToken(params.data.qrToken);
  const updated = updatedRow ? mapParticipant(updatedRow) : null;
  if (!updated) {
    res.json(MarkPassUsedResponse.parse({
      status: "invalid",
      passId: null,
      participantName: null,
      eventName: "Antyakshari",
      eventDate: "31 May 2026",
      isUsed: false
    }));
    return;
  }
  req.log.info({ qrToken: params.data.qrToken, passId: participant.passId }, "Pass marked as used");
  res.json(MarkPassUsedResponse.parse({
    status: "used",
    passId: updated.passId,
    participantName: updated.participantName,
    eventName: "Antyakshari",
    eventDate: "31 May 2026",
    isUsed: true
  }));
});
var passes_default = router4;

// artifacts/api-server/src/routes/index.ts
var router5 = Router5();
router5.use(health_default);
router5.use(registrations_default);
router5.use(admin_default);
router5.use(passes_default);
var routes_default = router5;

// artifacts/api-server/src/lib/logger.ts
import pino from "pino";
var isProduction = process.env.NODE_ENV === "production";
var logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']"
  ],
  ...isProduction ? {} : {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  }
});

// artifacts/api-server/src/app.ts
var app = express();
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode
        };
      }
    }
  })
);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api", routes_default);
var app_default = app;

// artifacts/api-server/src/vercel-entry.ts
var vercel_entry_default = app_default;
export {
  vercel_entry_default as default
};
