import crypto from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function nanoid(size = 8): string {
  let result = "";
  const bytes = crypto.randomBytes(size);
  for (const byte of bytes) {
    result += alphabet[byte % alphabet.length];
  }
  return result;
}
