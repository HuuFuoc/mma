export const MOCK_API_URL =
  "https://698c789721a248a27361ae3f.mockapi.io/handbags";

export function formatPercentOff(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  const normalized = n > 1 ? n : n * 100;
  return `${Math.round(normalized)}%`;
}

export function getCostNumber(item) {
  const n = Number(item?.cost);
  return Number.isNaN(n) ? 0 : n;
}

export async function fetchHandbags() {
  const res = await fetch(MOCK_API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}
