const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function nanoid(size = 8): string {
  let result = "";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    result += alphabet[byte % alphabet.length];
  }
  return result;
}
