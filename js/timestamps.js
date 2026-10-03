/* Pure timestamp + format logic. No DOM here — safe to use in tests and Node. */

export const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

export const FORMATS = [
  { key: "t", desc: "Short time", opts: { timeStyle: "short" } },
  { key: "T", desc: "Long time", opts: { timeStyle: "medium" } },
  { key: "d", desc: "Short date", opts: { dateStyle: "short" } },
  { key: "D", desc: "Long date", opts: { dateStyle: "long" } },
  { key: "f", desc: "Date + short time", opts: { dateStyle: "long", timeStyle: "short" } },
  { key: "F", desc: "Full date + time", opts: { dateStyle: "full", timeStyle: "short" } },
  { key: "R", desc: "Relative (live)", opts: { numeric: "auto", style: "long" } }
];

const UNIT_SECONDS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function toUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

export function buildCode(unix, style) {
  return "<t:" + unix + ":" + style + ">";
}

export function replaceFormat(code, style) {
  return code.replace(/:(\w)>$/, ":" + style + ">");
}

export function formatFor(style, date, locale = "en") {
  if (style === "R") {
    const rel = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const diff = Math.round((date.getTime() - Date.now()) / 1000);
    if (Math.abs(diff) < 60) return rel.format(diff, "second");
    for (const [unit, secs] of UNIT_SECONDS) {
      if (Math.abs(diff) >= secs) return rel.format(Math.round(diff / secs), unit);
    }
    return rel.format(diff, "second");
  }
  const fmt = FORMATS.find(f => f.key === style);
  return new Intl.DateTimeFormat(locale, fmt.opts).format(date);
}
