export function formatNumber(n: number, decimals = 2) {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-' : '') + grouped + (dec ? ',' + dec : '');
}

export function formatMoney(n: number, currency: string) {
  return `${formatNumber(n)} ${currency}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}.`;
}

/** Parsira broj koji može imati decimalni zarez. Vraća null za prazan/nevažeći unos. */
export function parseNum(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function numToText(n: number | null | undefined) {
  if (n == null) return '';
  return String(n).replace('.', ',');
}
