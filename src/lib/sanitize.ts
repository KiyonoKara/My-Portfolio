// Sanitize input for the live demos, and cap length and strip control characters
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F-\\u009F]", "g");

export function clampText(value: string, maxLen: number): string {
  return value.replace(CONTROL_CHARS, "").slice(0, maxLen);
}

// Lowercase, strip control chars, collapse whitespace for single-word lookups
export function normalizeWord(value: string, maxLen = 48): string {
  return clampText(value, maxLen).toLowerCase().replace(/\s+/g, " ").trimStart();
}
