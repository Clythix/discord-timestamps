import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FORMATS, MONTHS, daysInMonth, toUnix, buildCode, replaceFormat,
  formatFor, wallTimeToEpochMs
} from "../js/timestamps.js";

test("all 7 Discord format keys exist", () => {
  assert.deepEqual(FORMATS.map(f => f.key).sort(), ["D", "F", "R", "T", "d", "f", "t"]);
});

test("MONTHS has 12 three-letter entries", () => {
  assert.equal(MONTHS.length, 12);
  MONTHS.forEach(m => assert.equal(m.length, 3));
});

test("daysInMonth handles leap years and short months", () => {
  assert.equal(daysInMonth(2024, 1), 29);
  assert.equal(daysInMonth(2023, 1), 28);
  assert.equal(daysInMonth(2000, 1), 29);
  assert.equal(daysInMonth(1900, 1), 28);
  assert.equal(daysInMonth(2026, 1), 28);
  assert.equal(daysInMonth(2026, 3), 30);
});

test("toUnix converts milliseconds to seconds", () => {
  assert.equal(toUnix(new Date(0)), 0);
  assert.equal(toUnix(new Date(86400000)), 86400);
  assert.equal(toUnix(new Date(1790958030000)), 1790958030);
});

test("buildCode builds a valid Discord tag", () => {
  assert.equal(buildCode(1790958030, "F"), "<t:1790958030:F>");
  assert.equal(buildCode(0, "R"), "<t:0:R>");
});

test("replaceFormat swaps the style letter safely", () => {
  assert.equal(replaceFormat("<t:100:t>", "F"), "<t:100:F>");
  assert.equal(replaceFormat("<t:100:R>", "d"), "<t:100:d>");
  assert.equal(replaceFormat("<t:100:RR>", "F"), "<t:100:RR>");
});

test("relative format uses the closest unit (en)", () => {
  const futureMinutes = formatFor("R", new Date(Date.now() + 2 * 60000), "en");
  assert.equal(futureMinutes, "in 2 minutes");

  const futureHours = formatFor("R", new Date(Date.now() + 3 * 3600000), "en");
  assert.equal(futureHours, "in 3 hours");

  const pastDays = formatFor("R", new Date(Date.now() - 2 * 86400000), "en");
  assert.equal(pastDays, "2 days ago");
});

test("relative format uses natural words (en)", () => {
  assert.equal(formatFor("R", new Date(Date.now()), "en"), "now");
  assert.equal(formatFor("R", new Date(Date.now() - 86400000), "en"), "yesterday");
});

test("fixed date formats return non-empty strings (en)", () => {
  const date = new Date(2026, 4, 17, 12, 0, 0);
  ["t", "T", "d", "D", "f", "F"].forEach(key => {
    assert.equal(typeof formatFor(key, date, "en"), "string");
    assert.ok(formatFor(key, date, "en").length > 0);
  });
});

test("wall time in New York (winter) converts to UTC", () => {
  const ms = wallTimeToEpochMs({ year: 2024, month: 1, day: 15, hour: 12, minute: 0, second: 0 }, "America/New_York");
  assert.equal(ms, Date.UTC(2024, 0, 15, 17, 0, 0));
});

test("wall time in New York (summer DST) converts to UTC", () => {
  const ms = wallTimeToEpochMs({ year: 2024, month: 7, day: 15, hour: 12, minute: 0, second: 0 }, "America/New_York");
  assert.equal(ms, Date.UTC(2024, 6, 15, 16, 0, 0));
});

test("wall time in Kolkata keeps the 30-minute offset", () => {
  const ms = wallTimeToEpochMs({ year: 2024, month: 1, day: 15, hour: 12, minute: 0, second: 7 }, "Asia/Kolkata");
  assert.equal(ms, Date.UTC(2024, 0, 15, 6, 30, 7));
});

test("spring-forward nonexistent time throws", () => {
  assert.throws(() =>
    wallTimeToEpochMs({ year: 2024, month: 3, day: 10, hour: 2, minute: 30, second: 0 }, "America/New_York"));
});

test("fall-back ambiguous time picks the earlier instant", () => {
  const ms = wallTimeToEpochMs({ year: 2024, month: 11, day: 3, hour: 1, minute: 30, second: 0 }, "America/New_York");
  assert.equal(ms, Date.UTC(2024, 10, 3, 5, 30, 0));
});

test("invalid calendar date throws", () => {
  assert.throws(() =>
    wallTimeToEpochMs({ year: 2024, month: 2, day: 30, hour: 0, minute: 0, second: 0 }, "UTC"));
});

test("formatFor respects the requested time zone", () => {
  const date = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
  assert.equal(formatFor("t", date, "en-GB", "Asia/Kolkata"), "17:30");
});
