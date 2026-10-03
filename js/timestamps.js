/* Pure timestamp + timezone logic. No DOM — safe to use in tests and Node. */

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

/* ---------- timezones ---------- */

const zoneFormatters = new Map();

export function effectiveTimeZone(zone) {
  if (zone !== "local") return zone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function zoneFormatter(zone) {
  if (!zoneFormatters.has(zone)) {
    zoneFormatters.set(zone, new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, calendar: "gregory", numberingSystem: "latn",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }));
  }
  return zoneFormatters.get(zone);
}

function partsAt(instantMs, zone) {
  const parts = zoneFormatter(zone).formatToParts(new Date(instantMs));
  const v = Object.fromEntries(
    parts.filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)])
  );
  return { year: v.year, month: v.month, day: v.day, hour: v.hour, minute: v.minute, second: v.second };
}

/* Wall-clock fields currently shown for `date` in the given zone. */
export function zonedPartsAt(date, selectedZone) {
  return partsAt(date.getTime(), effectiveTimeZone(selectedZone));
}

function wallFieldsToUtcMs(fields) {
  const date = new Date(0);
  date.setUTCFullYear(fields.year, fields.month - 1, fields.day);
  date.setUTCHours(fields.hour, fields.minute, fields.second, 0);
  if (date.getUTCFullYear() !== fields.year || date.getUTCMonth() + 1 !== fields.month ||
      date.getUTCDate() !== fields.day || date.getUTCHours() !== fields.hour ||
      date.getUTCMinutes() !== fields.minute || date.getUTCSeconds() !== fields.second) {
    throw new RangeError("Invalid date or time");
  }
  return date.getTime();
}

function offsetAt(instantMs, zone) {
  return wallFieldsToUtcMs(partsAt(instantMs, zone)) - Math.floor(instantMs / 1000) * 1000;
}

function sameWallTime(a, b) {
  return a.year === b.year && a.month === b.month && a.day === b.day &&
         a.hour === b.hour && a.minute === b.minute && a.second === b.second;
}

/* Convert wall-clock fields in a zone to a real instant (UTC ms).
   Ambiguous (fall-back) times -> earlier instant. Nonexistent (spring-forward) -> throws. */
export function wallTimeToEpochMs(fields, selectedZone) {
  const zone = effectiveTimeZone(selectedZone);
  const wallMs = wallFieldsToUtcMs(fields);

  const firstOffset = offsetAt(wallMs, zone);
  const secondOffset = offsetAt(wallMs - firstOffset, zone);

  const offsets = new Set([firstOffset, secondOffset]);
  for (let hours = -36; hours <= 36; hours += 6) {
    offsets.add(offsetAt(wallMs - secondOffset + hours * 3600000, zone));
  }

  const matches = [...offsets]
    .map(offset => wallMs - offset)
    .filter(instantMs => sameWallTime(partsAt(instantMs, zone), fields))
    .sort((a, b) => a - b);

  if (matches.length === 0) {
    throw new RangeError("That local time does not exist in this time zone (DST change)");
  }
  return matches[0];
}

/* ---------- formatting ---------- */

export function formatFor(style, date, locale = "en", timeZone = "local") {
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
  return new Intl.DateTimeFormat(locale, { ...fmt.opts, timeZone: effectiveTimeZone(timeZone) }).format(date);
}
