type AuthState = {
  userId: string;
  orgId: string;
  role: string;
};

// localStorage key
const KEY = "edms:auth";

export function saveAuth(s: AuthState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

// simple hex encoder for ArrayBuffer
function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(input: string) {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // fallback: return raw (not secure) — only for static demo
    return input;
  }
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}
