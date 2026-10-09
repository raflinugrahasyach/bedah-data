// Contrast check for Bedah Data tokens (WCAG formula from quality-floor.md).
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const t = { bg: "#f1f5f9", surface: "#f8fafc", field: "#fcfdfe", border: "#d5dde7", borderStrong: "#7c8ba0",
  ink: "#0f172a", muted: "#475569", primary: "#0f766e", primaryHover: "#115e59", primaryTint: "#d9ece9",
  primaryInk: "#0b4f4a", onPrimary: "#f8fafc", danger: "#be123c", dangerTint: "#fce7ec", warn: "#92400e",
  warnTint: "#fdf0cf", success: "#166534", successTint: "#dcf3e4" };

const pairs = [
  ["ink on bg", t.ink, t.bg, 4.5], ["ink on surface", t.ink, t.surface, 4.5], ["ink on field", t.ink, t.field, 4.5],
  ["muted on bg", t.muted, t.bg, 4.5], ["muted on surface", t.muted, t.surface, 4.5], ["muted on field", t.muted, t.field, 4.5],
  ["muted on border (badge neutral ~)", t.muted, t.border, 4.5],
  ["onPrimary on primary", t.onPrimary, t.primary, 4.5], ["onPrimary on primaryHover", t.onPrimary, t.primaryHover, 4.5],
  ["primary text on bg", t.primary, t.bg, 4.5], ["primary text on surface", t.primary, t.surface, 4.5],
  ["primaryInk on primaryTint", t.primaryInk, t.primaryTint, 4.5], ["ink on primaryTint", t.ink, t.primaryTint, 4.5],
  ["danger on surface", t.danger, t.surface, 4.5], ["danger on bg", t.danger, t.bg, 4.5], ["danger on dangerTint", t.danger, t.dangerTint, 4.5],
  ["onPrimary on danger", t.onPrimary, t.danger, 4.5],
  ["warn on warnTint", t.warn, t.warnTint, 4.5], ["success on successTint", t.success, t.successTint, 4.5],
  ["borderStrong on field (UI >=3)", t.borderStrong, t.field, 3], ["borderStrong on surface (UI >=3)", t.borderStrong, t.surface, 3],
  ["primary on bg (UI focus >=3)", t.primary, t.bg, 3],
];
let fail = 0;
for (const [n, a, b, min] of pairs) {
  const r = ratio(a, b); const ok = r >= min; if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}  (min ${min})  ${n}`);
}
console.log(fail ? `${fail} failing` : "all pass");
