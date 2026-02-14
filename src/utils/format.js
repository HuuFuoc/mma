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
