/* Clipboard, toast popup and theme switching. */

export function createToast(toastEl) {
  let timer;
  return function showToast(msg, ok) {
    toastEl.textContent = msg;
    toastEl.style.background = ok === false ? "#c0392b" : "";
    toastEl.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toastEl.classList.remove("show"), 1600);
  };
}

export function copyToClipboard(text, showToast) {
  const done = ok => showToast(ok ? "COPIED" : "COPY FAILED — press Ctrl/Cmd+C", ok);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => done(true)).catch(() => done(fallbackCopy(text)));
  } else {
    done(fallbackCopy(text));
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

export function initThemeSwitch(buttons) {
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  applyTheme(current, buttons);
  buttons.forEach(b => b.addEventListener("click", () => applyTheme(b.dataset.setTheme, buttons)));
}

function applyTheme(t, buttons) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("dtg-theme", t); } catch { /* storage unavailable */ }
  buttons.forEach(b => b.classList.toggle("active", b.dataset.setTheme === t));
}
