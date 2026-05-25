type RegistrationRow = {
  id: number;
  booking_id: string;
  name: string;
  email: string;
  phone: string;
  total_passes: number;
  payment_screenshot: string | null;
  payment_status: string;
  created_at: string;
};

type ParticipantRow = {
  id: number;
  registration_id: number;
  participant_name: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  college_or_company: string | null;
  pass_id: string | null;
  qr_token: string | null;
  is_used: boolean;
};

const baseUrl = (process.env.SUPABASE_URL || "https://jjxukcedpahluizzeyge.supabase.co").replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeHVrY2VkcGFobHVpenpleWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyNDY0NiwiZXhwIjoyMDk1MjAwNjQ2fQ.OuKJsGIsbsqopjZc-ryvPyrv3ifhjnBCnlwk8HialOo";

const restBaseUrl = `${baseUrl}/rest/v1`;
const storageBaseUrl = `${baseUrl}/storage/v1`;

const paymentScreenshotBucket = "payment-screenshots";

function encodeEq(value: string | number): string {
  return `eq.${encodeURIComponent(String(value))}`;
}

function headers(prefer?: string): Record<string, string> {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
    prefer?: string;
  } = {},
): Promise<T> {
  const { method = "GET", body, prefer } = options;
  const response = await fetch(`${restBaseUrl}${path}`, {
    method,
    headers: headers(prefer),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    if (text.includes("PGRST205")) {
      throw new Error(
        `Supabase table missing for ${path}. Create the public.registrations and public.participants tables first (see lib/db/migrations/0001_init.sql). Original error: ${text}`,
      );
    }
    throw new Error(`Supabase REST ${method} ${path} failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function ensureStorageBucket(bucketName: string) {
  const lookup = await fetch(`${storageBaseUrl}/bucket/${bucketName}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (lookup.ok) {
    return;
  }

  if (lookup.status !== 404) {
    const text = await lookup.text();
    throw new Error(`Supabase storage bucket lookup failed (${lookup.status}): ${text}`);
  }

  const create = await fetch(`${storageBaseUrl}/bucket`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucketName,
      name: bucketName,
      public: true,
    }),
  });

  if (create.ok || create.status === 409) {
    return;
  }

  const text = await create.text();
  throw new Error(`Supabase storage bucket create failed (${create.status}): ${text}`);
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function decodeDataUrl(dataUrl: string) {
  const base64 = dataUrl.includes("base64,") ? dataUrl.split("base64,").pop() ?? "" : dataUrl;
  return Buffer.from(base64, "base64");
}

export function mapRegistration(row: RegistrationRow) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    totalPasses: row.total_passes,
    paymentScreenshot: row.payment_screenshot,
    paymentStatus: row.payment_status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function mapParticipant(row: ParticipantRow) {
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
    isUsed: Boolean(row.is_used),
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
  const rows = await request<RegistrationRow[]>(
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
        payment_status: values.paymentStatus,
      },
    },
  );

  return rows[0] ?? null;
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
  const rows = await request<ParticipantRow[]>(
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
        is_used: p.isUsed,
      })),
    },
  );

  return rows;
}

export async function findRegistrationByBookingId(bookingId: string) {
  const rows = await request<RegistrationRow[]>(
    `/registrations?booking_id=${encodeEq(bookingId)}&select=*`,
  );
  return rows[0] ?? null;
}

export async function updatePaymentScreenshotByBookingId(
  bookingId: string,
  screenshotUrl: string,
) {
  const rows = await request<RegistrationRow[]>(
    `/registrations?booking_id=${encodeEq(bookingId)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { payment_screenshot: screenshotUrl },
    },
  );

  return rows[0] ?? null;
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
  return request<ParticipantRow[]>(
    `/participants?registration_id=${encodeEq(registrationId)}&select=*`,
  );
}

export async function listRegistrations(paymentStatus?: string) {
  const statusQuery = paymentStatus
    ? `&payment_status=${encodeEq(paymentStatus)}`
    : "";
  return request<RegistrationRow[]>(
    `/registrations?select=*&order=created_at.asc${statusQuery}`,
  );
}

export async function updateRegistrationStatusById(id: number, status: string) {
  const rows = await request<RegistrationRow[]>(
    `/registrations?id=${encodeEq(id)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { payment_status: status },
    },
  );

  return rows[0] ?? null;
}

export async function updateParticipantById(
  id: number,
  values: { passId?: string | null; qrToken?: string | null; isUsed?: boolean },
) {
  const payload: Record<string, unknown> = {};
  if (values.passId !== undefined) payload.pass_id = values.passId;
  if (values.qrToken !== undefined) payload.qr_token = values.qrToken;
  if (values.isUsed !== undefined) payload.is_used = values.isUsed;

  const rows = await request<ParticipantRow[]>(
    `/participants?id=${encodeEq(id)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: payload,
    },
  );

  return rows[0] ?? null;
}

export async function findParticipantByQrToken(token: string) {
  const rowsByToken = await request<ParticipantRow[]>(
    `/participants?qr_token=${encodeEq(token)}&select=*`,
  );
  if (rowsByToken && rowsByToken.length > 0) {
    return rowsByToken[0];
  }

  const rowsById = await request<ParticipantRow[]>(
    `/participants?pass_id=${encodeEq(token)}&select=*`,
  );
  return rowsById[0] ?? null;
}

export async function markParticipantUsedByQrToken(token: string) {
  const p = await findParticipantByQrToken(token);
  if (!p) return null;

  const rows = await request<ParticipantRow[]>(
    `/participants?id=${encodeEq(p.id)}&select=*`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { is_used: true },
    },
  );

  return rows[0] ?? null;
}

export async function listAllParticipants() {
  return request<ParticipantRow[]>("/participants?select=*");
}
