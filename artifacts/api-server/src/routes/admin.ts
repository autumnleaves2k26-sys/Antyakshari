import { Router, type IRouter } from "express";
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
import {
  listAllParticipants,
  listRegistrations,
  listParticipantsByRegistrationId,
  mapParticipant,
  mapRegistration,
  updateParticipantById,
  updateRegistrationStatusById,
} from "../lib/supabase";

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

  const registrations = await listRegistrations(params.data.status);

  const result = await Promise.all(
    registrations.map(async (reg) => {
      const participants = await listParticipantsByRegistrationId(reg.id);
      const mappedRegistration = mapRegistration(reg);
      const mappedParticipants = participants.map(mapParticipant);
      return {
        ...mappedRegistration,
        participants: mappedParticipants,
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

  const registration = await updateRegistrationStatusById(params.data.id, "rejected");

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  const mappedRegistration = mapRegistration(registration);
  res.json(RejectRegistrationResponse.parse(mappedRegistration));
});

router.get("/admin/stats", async (req, res): Promise<void> => {
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
    totalPassesIssued,
  }));
});

export default router;
