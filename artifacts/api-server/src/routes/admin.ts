import { Router, type IRouter } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, registrationsTable, participantsTable } from "@workspace/db";
import {
  AdminLoginBody,
  ListRegistrationsQueryParams,
  ApproveRegistrationParams,
  RejectRegistrationParams,
  AdminLoginResponse,
  ListRegistrationsResponse,
  ApproveRegistrationResponse,
  RejectRegistrationResponse,
  GetAdminStatsResponse,
} from "@workspace/api-zod";
import { nanoid } from "../lib/nanoid";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "antyakshari2026";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "admin-secret-token-2026";

router.post("/admin/login", async (req, res): Promise<void> => {
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

function requireAdmin(req: any, res: any): boolean {
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

router.get("/admin/registrations", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = ListRegistrationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(registrationsTable).$dynamic();
  if (params.data.status) {
    query = query.where(eq(registrationsTable.paymentStatus, params.data.status));
  }

  const registrations = await query.orderBy(registrationsTable.createdAt);

  const result = await Promise.all(
    registrations.map(async (reg) => {
      const participants = await db
        .select()
        .from(participantsTable)
        .where(eq(participantsTable.registrationId, reg.id));
      return {
        ...reg,
        createdAt: reg.createdAt.toISOString(),
        participants,
      };
    })
  );

  res.json(ListRegistrationsResponse.parse(result));
});

router.post("/admin/registrations/:id/approve", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ApproveRegistrationParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [registration] = await db
    .update(registrationsTable)
    .set({ paymentStatus: "approved" })
    .where(eq(registrationsTable.id, params.data.id))
    .returning();

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  const participants = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.registrationId, registration.id));

  let passCounter = 1;
  const updatedParticipants = [];

  for (const participant of participants) {
    if (!participant.passId) {
      const passNum = String(passCounter++).padStart(3, "0");
      const passId = `ANT-2026-${passNum}-${nanoid(4)}`;
      const qrToken = nanoid(16).toLowerCase() + "-" + participant.id;

      const [updated] = await db
        .update(participantsTable)
        .set({ passId, qrToken })
        .where(eq(participantsTable.id, participant.id))
        .returning();

      updatedParticipants.push(updated);
    } else {
      updatedParticipants.push(participant);
    }
  }

  req.log.info({ registrationId: registration.id }, "Registration approved, passes generated");

  res.json(ApproveRegistrationResponse.parse({
    ...registration,
    createdAt: registration.createdAt.toISOString(),
    participants: updatedParticipants,
  }));
});

router.post("/admin/registrations/:id/reject", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RejectRegistrationParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [registration] = await db
    .update(registrationsTable)
    .set({ paymentStatus: "rejected" })
    .where(eq(registrationsTable.id, params.data.id))
    .returning();

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.json(RejectRegistrationResponse.parse({
    ...registration,
    createdAt: registration.createdAt.toISOString(),
  }));
});

router.get("/admin/stats", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const [totalResult] = await db
    .select({ count: count() })
    .from(registrationsTable);

  const [pendingResult] = await db
    .select({ count: count() })
    .from(registrationsTable)
    .where(eq(registrationsTable.paymentStatus, "pending"));

  const [approvedResult] = await db
    .select({ count: count() })
    .from(registrationsTable)
    .where(eq(registrationsTable.paymentStatus, "approved"));

  const [rejectedResult] = await db
    .select({ count: count() })
    .from(registrationsTable)
    .where(eq(registrationsTable.paymentStatus, "rejected"));

  const [passesResult] = await db
    .select({ total: sum(registrationsTable.totalPasses) })
    .from(registrationsTable);

  const [issuedResult] = await db
    .select({ count: count() })
    .from(participantsTable)
    .where(sql`${participantsTable.passId} IS NOT NULL`);

  res.json(GetAdminStatsResponse.parse({
    totalRegistrations: totalResult.count,
    pendingRegistrations: pendingResult.count,
    approvedRegistrations: approvedResult.count,
    rejectedRegistrations: rejectedResult.count,
    totalPasses: Number(passesResult.total ?? 0),
    totalPassesIssued: issuedResult.count,
  }));
});

export default router;
