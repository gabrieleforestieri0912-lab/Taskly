/**
 * Web Crypto API client-side AES-GCM Zero-Knowledge Encryption utility.
 */

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  return new Uint8Array(
    (hex.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
  );
}

export async function encryptText(
  text: string,
  password: string,
): Promise<string> {
  if (!text || !password) return text;
  try {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      enc.encode(text),
    );

    return `E2EE_${toHex(salt)}_${toHex(iv)}_${toHex(
      new Uint8Array(encrypted),
    )}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}

export async function decryptText(
  encryptedText: string,
  password: string,
): Promise<string> {
  if (!encryptedText || !encryptedText.startsWith("E2EE_")) return encryptedText;
  if (!password) return encryptedText;
  try {
    const parts = encryptedText.split("_");
    if (parts.length < 4) return encryptedText;

    const salt = fromHex(parts[1]);
    const iv = fromHex(parts[2]);
    const ciphertext = fromHex(parts[3]);

    const key = await deriveKey(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource,
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("Decryption error:", err);
    throw new Error("password_incorrect");
  }
}
