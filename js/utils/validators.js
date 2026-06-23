export function required(value, message) {
  if (!String(value ?? "").trim()) {
    throw new Error(message);
  }
}
