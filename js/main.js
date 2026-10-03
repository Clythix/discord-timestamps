/* Glue: picker + timezone selector + preview + copy + presets. */
import { FORMATS, formatFor, toUnix, buildCode, replaceFormat, wallTimeToEpochMs, zonedPartsAt } from "./timestamps.js";
import { createPicker } from "./picker.js";
import { createToast, copyToClipboard, initThemeSwitch } from "./ui.js";

const $ = id => document.getElementById(id);
const LOCALE = navigator.language || "en";

const code = $("code"), fmtGrid = $("fmtGrid"),
      tzSelect = $("timeZone"), tzError = $("tzError");
const fmtEls = {};
const showToast = createToast($("toast"));

/* ---- format cards ---- */
FORMATS.forEach(f => {
  const card = document.createElement("div");
  card.className = "fmt-card";
  card.innerHTML =
    '<div class="code-tag">&lt;t:...:' + f.key + "&gt;</div>" +
    '<div class="desc">' + f.desc + "</div>" +
    '<div class="val">—</div>' +
    '<button class="mini-copy" type="button">COPY</button>';
  fmtGrid.appendChild(card);
  fmtEls[f.key] = { val: card.querySelector(".val") };

  document.querySelector('.chip input[value="' + f.key + '"]').addEventListener("change", update);
  card.querySelector(".mini-copy").addEventListener("click", () =>
    copyToClipboard(replaceFormat(code.value, f.key), showToast));
});

const picker = createPicker($("dateSpin"), $("timeSpin"), update);

/* ---- timezone selector ---- */
const offsetFmtCache = new Map();
function offsetLabel(tz) {
  if (!offsetFmtCache.has(tz)) {
    offsetFmtCache.set(tz, new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "shortOffset" }));
  }
  const part = offsetFmtCache.get(tz).formatToParts(new Date()).find(p => p.type === "timeZoneName");
  return (part ? part.value : tz).replace("GMT", "UTC");
}

function fillTimezones() {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let zones;
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = ["UTC", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
      "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
      "America/Sao_Paulo", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo",
      "Asia/Singapore", "Australia/Sydney", "Pacific/Auckland"];
  }
  if (!zones.includes(local)) zones.unshift(local);

  let html = '<option value="local">My local time (' + offsetLabel(local) + ")</option>";
  zones.forEach(tz => {
    html += '<option value="' + tz + '">' + offsetLabel(tz) + " — " + tz + "</option>";
  });
  tzSelect.innerHTML = html;

  let saved = null;
  try { saved = localStorage.getItem("dtg-timezone"); } catch { saved = null; }
  if (saved && (saved === "local" || zones.includes(saved))) tzSelect.value = saved;
}
fillTimezones();
tzSelect.addEventListener("change", () => {
  try { localStorage.setItem("dtg-timezone", tzSelect.value); } catch { /* ignore */ }
  update();
});

/* ---- update ---- */
function update() {
  const style = document.querySelector('input[name="t"]:checked').value;

  let epochMs = null;
  try {
    epochMs = wallTimeToEpochMs(picker.getWallTime(), tzSelect.value);
    tzError.hidden = true;
  } catch {
    tzError.textContent = "That local time does not exist in this time zone (daylight-saving change).";
    tzError.hidden = false;
  }

  if (epochMs === null) {
    code.value = "";
    $("inlineCode").textContent = "—";
    $("preview").textContent = "—";
    FORMATS.forEach(f => { fmtEls[f.key].val.textContent = "—"; });
    return;
  }

  const date = new Date(epochMs);
  code.value = buildCode(toUnix(date), style);
  $("inlineCode").textContent = code.value;
  $("preview").textContent = formatFor(style, date, LOCALE, tzSelect.value);
  FORMATS.forEach(f => { fmtEls[f.key].val.textContent = formatFor(f.key, date, LOCALE, tzSelect.value); });
}

/* ---- presets (wall time in the SELECTED zone) ---- */
document.querySelectorAll("[data-preset]").forEach(btn => {
  btn.addEventListener("click", () => {
    const zone = tzSelect.value;
    const now = new Date();
    switch (btn.dataset.preset) {
      case "now": picker.setWallTime(zonedPartsAt(now, zone)); break;
      case "1h": picker.setWallTime(zonedPartsAt(new Date(now.getTime() + 3600000), zone)); break;
      case "tomorrow": picker.setWallTime(zonedPartsAt(new Date(now.getTime() + 86400000), zone)); break;
      case "newyear": {
        const p = zonedPartsAt(now, zone);
        picker.setWallTime({ year: p.year + 1, month: 1, day: 1, hour: 0, minute: 0, second: 0 });
        break;
      }
    }
  });
});

$("copy").addEventListener("click", () => { update(); copyToClipboard(code.value, showToast); });
$("current").addEventListener("click", () => picker.setWallTime(zonedPartsAt(new Date(), tzSelect.value)));
code.addEventListener("click", () => { update(); copyToClipboard(code.value, showToast); });

/* ---- live tick: only the relative format changes every second ---- */
setInterval(() => {
  if (document.querySelector('input[name="t"]:checked').value === "R") update();
}, 1000);

initThemeSwitch(document.querySelectorAll("[data-set-theme]"));

update();
