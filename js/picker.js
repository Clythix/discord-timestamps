/* Spinner date/time picker. Values are wall-clock fields —
   timezone conversion lives in timestamps.js, wiring in main.js. */
import { daysInMonth, MONTHS } from "./timestamps.js";

const CHEV = up =>
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
  (up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6") + '"/></svg>';

export function createPicker(dateSpinEl, timeSpinEl, onChange) {
  const now0 = new Date();
  const state = {
    y: now0.getFullYear(),
    m: now0.getMonth(),
    d: now0.getDate(),
    h: now0.getHours(),
    mi: now0.getMinutes(),
    s: now0.getSeconds()
  };

  const UNITS = [
    { id: "d", group: dateSpinEl, label: "Day", min: 1, max: () => daysInMonth(state.y, state.m),
      wrap: false, get: () => state.d, set: v => { state.d = v; }, render: v => String(v).padStart(2, "0") },
    { id: "mo", group: dateSpinEl, label: "Month", min: 1, max: () => 12, wrap: true,
      get: () => state.m + 1, set: v => { state.m = v - 1; }, render: v => MONTHS[v - 1] },
    { id: "y", group: dateSpinEl, label: "Year", min: 1970, max: () => 2100, wrap: false,
      get: () => state.y, set: v => { state.y = v; }, render: v => String(v) },
    { id: "h", group: timeSpinEl, label: "Hour", min: 0, max: () => 23, wrap: true,
      get: () => state.h, set: v => { state.h = v; }, render: v => String(v).padStart(2, "0") },
    { id: "mi", group: timeSpinEl, label: "Minute", min: 0, max: () => 59, wrap: true,
      get: () => state.mi, set: v => { state.mi = v; }, render: v => String(v).pad
