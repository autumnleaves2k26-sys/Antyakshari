import { Router, type IRouter } from "express";
import {
  ValidatePassParams,
  MarkPassUsedParams,
  ValidatePassResponse,
  MarkPassUsedResponse,
} from "@workspace/api-zod";
import {
  findParticipantByQrToken,
  mapParticipant,
  markParticipantUsedByQrToken,
} from "../lib/supabase";

const router: IRouter = Router();

router.get("/passes/:qrToken/validate", async (req, res): Promise<void> => {
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
      isUsed: false,
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
    isUsed: participant.isUsed,
  }));
});

router.post("/passes/:qrToken/mark-used", async (req, res): Promise<void> => {
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
      isUsed: false,
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
      isUsed: false,
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
    isUsed: true,
  }));
});

export default router;
