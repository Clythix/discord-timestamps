/* Glue: wires the picker, preview, format cards, quick picks and theme switch. */
import { FORMATS, formatFor, toUnix, buildCode, replaceFormat } from "./timestamps.js";
import { createPicker } from "./picker.js";
import { createToast, copyToClipboard, initThemeSwitch } from "./ui.js";

const $ = id => document.getElementById(id);
const LOCALE = navigator.language || "en";

const code = $("code");
const fmtGrid = $("fmtGrid");
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

function update() {
  const style = document.querySelector('input[name="t"]:checked').value;
  const date = picker.get();
  code.value = buildCode(toUnix(date), style);
  $("inlineCode").textContent = code.value;
  $("preview").textContent = formatFor(style, date, LOCALE);
  FORMATS.forEach(f => { fmtEls[f.key].val.textContent = formatFor(f.key, date, LOCALE); });
}

/* ---- quick picks ---- */
document.querySelectorAll("[data-preset]").forEach(btn => {
  btn.addEventListener("click", () => {
    const now = new Date();
    switch (btn.dataset.preset) {
      case "now": picker.setFrom(now); break;
      case "1h": now.setHours(now.getHours() + 1); picker.setFrom(now); break;
      case "tomorrow": now.setDate(now.getDate() + 1); now.setHours(12, 0, 0, 0); picker.setFrom(now); break;
      case "newyear": picker.setFrom(new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0)); break;
    }
  });
});

$("copy").addEventListener("click", () => { update(); copyToClipboard(code.value, showToast); });
$("current").addEventListener("click", () => picker.setFrom(new Date()));
code.addEventListener("click", () => { update(); copyToClipboard(code.value, showToast); });

/* ---- live tick ---- */
setInterval(update, 1000);

/* ---- theme ---- */
initThemeSwitch(document.querySelectorAll("[data-set-theme]"));

update();
