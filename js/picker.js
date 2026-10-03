/* Spinner-based date/time picker widget. DOM only — timestamp math lives in timestamps.js */
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
      get: () => state.mi, set: v => { state.mi = v; }, render: v => String(v).padStart(2, "0") },
    { id: "s", group: timeSpinEl, label: "Second", min: 0, max: () => 59, wrap: true,
      get: () => state.s, set: v => { state.s = v; }, render: v => String(v).padStart(2, "0") }
  ];
  const values = {};

  function clampDay() {
    state.d = Math.min(state.d, daysInMonth(state.y, state.m));
  }

  function nudge(u, dir) {
    let v = u.get() + dir;
    const max = u.max();
    if (v > max) v = u.wrap ? u.min : max;
    if (v < u.min) v = u.wrap ? max : u.min;
    u.set(v);
    clampDay();
    renderAll();
    onChange();
  }

  function bindHold(u, btn, fn) {
    let t1, t2;
    const stop = () => { clearTimeout(t1); clearInterval(t2); };
    btn.addEventListener("pointerdown", e => {
      e.preventDefault();
      fn();
      t1 = setTimeout(() => { t2 = setInterval(fn, 65); }, 420);
      addEventListener("pointerup", stop, { once: true });
      addEventListener("pointercancel", stop, { once: true });
    });
    btn.addEventListener("click", e => { if (e.detail === 0) fn(); });
  }

  function renderAll() {
    UNITS.forEach(u => {
      const v = u.get();
      const val = values[u.id];
      val.textContent = u.render(v);
      val.setAttribute("aria-valuemin", u.min);
      val.setAttribute("aria-valuemax", u.max());
      val.setAttribute("aria-valuenow", v);
      val.setAttribute("aria-valuetext", u.id === "mo" ? MONTHS[v - 1] : String(v));
    });
  }

  UNITS.forEach(u => {
    const box = document.createElement("div");
    box.className = "spin";
    box.innerHTML =
      '<button type="button" class="spin-btn up" aria-label="Increase ' + u.label + '">' + CHEV(true) + "</button>" +
      '<div class="spin-val" role="spinbutton" tabindex="0" aria-label="' + u.label + '"></div>' +
      '<button type="button" class="spin-btn down" aria-label="Decrease ' + u.label + '">' + CHEV(false) + "</button>" +
      '<span class="spin-unit">' + u.label + "</span>";
    u.group.appendChild(box);

    const val = box.querySelector(".spin-val");
    values[u.id] = val;

    bindHold(u, box.querySelector(".up"), () => nudge(u, 1));
    bindHold(u, box.querySelector(".down"), () => nudge(u, -1));

    val.addEventListener("wheel", e => {
      e.preventDefault();
      nudge(u, e.deltaY < 0 ? 1 : -1);
    }, { passive: false });

    val.addEventListener("pointerdown", e => {
      e.preventDefault();
      val.setPointerCapture(e.pointerId);
      const startY = e.clientY;
      let last = 0;
      const move = ev => {
        const total = Math.round((startY - ev.clientY) / 16);
        if (total !== last) { nudge(u, total - last); last = total; }
      };
      const endDrag = () => {
        val.removeEventListener("pointermove", move);
        val.removeEventListener("pointerup", endDrag);
        val.removeEventListener("pointercancel", endDrag);
      };
      val.addEventListener("pointermove", move);
      val.addEventListener("pointerup", endDrag);
      val.addEventListener("pointercancel", endDrag);
    });

    val.addEventListener("keydown", e => {
      const big = e.shiftKey ? 5 : 1;
      if (e.key === "ArrowUp") { e.preventDefault(); nudge(u, big); }
      if (e.key === "ArrowDown") { e.preventDefault(); nudge(u, -big); }
      if (e.key === "Home") { e.preventDefault(); u.set(u.min); clampDay(); renderAll(); onChange(); }
      if (e.key === "End") { e.preventDefault(); u.set(u.max()); clampDay(); renderAll(); onChange(); }
    });
  });

  clampDay();
  renderAll();

  return {
    get() {
      return new Date(state.y, state.m, state.d, state.h, state.mi, state.s);
    },
    setFrom(dateObj) {
      state.y = dateObj.getFullYear();
      state.m = dateObj.getMonth();
      state.d = dateObj.getDate();
      state.h = dateObj.getHours();
      state.mi = dateObj.getMinutes();
      state.s = dateObj.getSeconds();
      clampDay();
      renderAll();
      onChange();
    }
  };
}
