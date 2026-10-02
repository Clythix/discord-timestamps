(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const code = $("code"), preview = $("preview"), inlineCode = $("inlineCode"),
        copiedNote = $("copiedNote");

  /* ---------- state ---------- */
  const now0 = new Date();
  const state = { y: now0.getFullYear(), m: now0.getMonth(), d: now0.getDate(),
                  h: now0.getHours(), mi: now0.getMinutes(), s: now0.getSeconds() };
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const daysInMonth = () => new Date(state.y, state.m + 1, 0).getDate();

  /* ---------- spinner widget ---------- */
  const UNITS = [
    { id:"d",  group:"dateSpin", label:"Day",   min:1, max:()=>daysInMonth(), wrap:false,
      get:()=>state.d,  set:v=>state.d=v,   render:v=>String(v).padStart(2,"0") },
    { id:"mo", group:"dateSpin", label:"Month", min:1, max:()=>12, wrap:true,
      get:()=>state.m+1, set:v=>state.m=v-1, render:v=>MONTHS[v-1] },
    { id:"y",  group:"dateSpin", label:"Year",  min:1970, max:()=>2100, wrap:false,
      get:()=>state.y,  set:v=>state.y=v,   render:v=>String(v) },
    { id:"h",  group:"timeSpin", label:"Hour",  min:0, max:()=>23, wrap:true,
      get:()=>state.h,  set:v=>state.h=v,   render:v=>String(v).padStart(2,"0") },
    { id:"mi", group:"timeSpin", label:"Minute",min:0, max:()=>59, wrap:true,
      get:()=>state.mi, set:v=>state.mi=v,  render:v=>String(v).padStart(2,"0") },
    { id:"s",  group:"timeSpin", label:"Second",min:0, max:()=>59, wrap:true,
      get:()=>state.s,  set:v=>state.s=v,   render:v=>String(v).padStart(2,"0") }
  ];
  const unitEls = {};

  const CHEV = up =>
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
    (up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6") + '"/></svg>';

  UNITS.forEach(u => {
    const box = document.createElement("div");
    box.className = "spin";
    box.innerHTML =
      '<button type="button" class="spin-btn up" aria-label="Increase ' + u.label + '">' + CHEV(true)  + '</button>' +
      '<div class="spin-val" role="spinbutton" tabindex="0" aria-label="' + u.label + '"></div>' +
      '<button type="button" class="spin-btn down" aria-label="Decrease ' + u.label + '">' + CHEV(false) + '</button>' +
      '<span class="spin-unit">' + u.label + '</span>';
    $(u.group).appendChild(box);
    const el = {
      val: box.querySelector(".spin-val"),
      up: box.querySelector(".up"),
      down: box.querySelector(".down")
    };
    unitEls[u.id] = el;

    function step(dir) {
      let v = u.get() + dir;
      const max = u.max(), min = u.min;
      if (v > max) v = u.wrap ? min : max;
      if (v < min) v = u.wrap ? max : min;
      u.set(v);
      state.d = Math.min(state.d, daysInMonth());
      renderAll(); update();
    }

    function bindHold(btn, fn) {
      let t1, t2;
      const stop = () => { clearTimeout(t1); clearInterval(t2); };
      btn.addEventListener("pointerdown", e => {
        e.preventDefault(); fn();
        t1 = setTimeout(() => { t2 = setInterval(fn, 65); }, 420);
        addEventListener("pointerup", stop, { once:true });
        addEventListener("pointercancel", stop, { once:true });
      });
      btn.addEventListener("click", e => { if (e.detail === 0) fn(); });
    }
    bindHold(el.up,   () => step(1));
    bindHold(el.down, () => step(-1));

    el.val.addEventListener("wheel", e => {
      e.preventDefault();
      step(e.deltaY < 0 ? 1 : -1);
    }, { passive:false });

    el.val.addEventListener("pointerdown", e => {
      e.preventDefault();
      el.val.setPointerCapture(e.pointerId);
      const startY = e.clientY;
      let last = 0;
      const move = ev => {
        const total = Math.round((startY - ev.clientY) / 16);
        if (total !== last) { step(total - last); last = total; }
      };
      const up = () => {
        el.val.removeEventListener("pointermove", move);
        el.val.removeEventListener("pointerup", up);
        el.val.removeEventListener("pointercancel", up);
      };
      el.val.addEventListener("pointermove", move);
      el.val.addEventListener("pointerup", up);
      el.val.addEventListener("pointercancel", up);
    });

    el.val.addEventListener("keydown", e => {
      const big = e.shiftKey ? 5 : 1;
      if (e.key === "ArrowUp")   { e.preventDefault(); step(big); }
      if (e.key === "ArrowDown") { e.preventDefault(); step(-big); }
      if (e.key === "Home")      { e.preventDefault(); u.set(u.min); state.d = Math.min(state.d, daysInMonth()); renderAll(); update(); }
      if (e.key === "End")       { e.preventDefault(); u.set(u.max()); state.d = Math.min(state.d, daysInMonth()); renderAll(); update(); }
    });
  });

  function renderAll() {
    UNITS.forEach(u => {
      const v = u.get();
      const el = unitEls[u.id].val;
      el.textContent = u.render(v);
      el.setAttribute("aria-valuemin", u.min);
      el.setAttribute("aria-valuemax", u.max());
      el.setAttribute("aria-valuenow", v);
      el.setAttribute("aria-valuetext", u.id === "mo" ? MONTHS[v-1] : String(v));
    });
  }

  /* ---------- formatting ---------- */
  const FORMATS = [
    { key:"t", desc:"Short time",        opts:{ timeStyle:"short" } },
    { key:"T", desc:"Long time",         opts:{ timeStyle:"medium" } },
    { key:"d", desc:"Short date",        opts:{ dateStyle:"short" } },
    { key:"D", desc:"Long date",         opts:{ dateStyle:"long" } },
    { key:"f", desc:"Date + short time", opts:{ dateStyle:"long",  timeStyle:"short" } },
    { key:"F", desc:"Full date + time",  opts:{ dateStyle:"full",  timeStyle:"short" } },
    { key:"R", desc:"Relative (live)",   opts:{ numeric:"auto", style:"long" } }
  ];

  const fmtGrid = $("fmtGrid");
  const fmtEls = {};
  FORMATS.forEach(f => {
    const card = document.createElement("div");
    card.className = "fmt-card";
    card.innerHTML =
      '<div class="code-tag">&lt;t:...:' + f.key + '&gt;</div>' +
      '<div class="desc">' + f.desc + '</div>' +
      '<div class="val">—</div>' +
      '<button class="mini-copy" type="button">COPY</button>';
    fmtGrid.appendChild(card);
    fmtEls[f.key] = {
      val: card.querySelector(".val"),
      btn: card.querySelector(".mini-copy"),
      input: document.querySelector('.chip input[value="' + f.key + '"]')
    };
    fmtEls[f.key].btn.addEventListener("click", () =>
      copyText(code.value.replace(/:(\w)>$/, ":" + f.key + ">")));
    fmtEls[f.key].input.addEventListener("change", update);
  });

  const locale = navigator.language || "en";
  const unitSeconds = [
    ["year",31536000],["month",2592000],["week",604800],
    ["day",86400],["hour",3600],["minute",60]
  ];

  function formatFor(key, date) {
    if (key === "R") {
      const rel = new Intl.RelativeTimeFormat(locale, { numeric:"auto" });
      const diff = Math.round((date - new Date()) / 1000);
      if (Math.abs(diff) < 60) return rel.format(diff, "second");
      for (const [unit, secs] of unitSeconds)
        if (Math.abs(diff) >= secs) return rel.format(Math.round(diff / secs), unit);
      return rel.format(diff, "second");
    }
    const f = FORMATS.find(f => f.key === key);
    return new Intl.DateTimeFormat(locale, f.opts).format(date);
  }

  function update() {
    const key = document.querySelector('input[name="t"]:checked').value;
    const date = new Date(state.y, state.m, state.d, state.h, state.mi, state.s);
    const unix = Math.floor(date.getTime() / 1000);
    code.value = "<t:" + unix + ":" + key + ">";
    inlineCode.textContent = code.value;
    preview.textContent = formatFor(key, date);
    FORMATS.forEach(f => { fmtEls[f.key].val.textContent = formatFor(f.key, date); });
  }

  /* ---------- presets / actions ---------- */
  function setFrom(dateObj) {
    state.y = dateObj.getFullYear(); state.m = dateObj.getMonth(); state.d = dateObj.getDate();
    state.h = dateObj.getHours();   state.mi = dateObj.getMinutes(); state.s = dateObj.getSeconds();
    renderAll(); update();
  }
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const now = new Date();
      switch (btn.dataset.preset) {
        case "now": setFrom(now); break;
        case "1h": now.setHours(now.getHours() + 1); setFrom(now); break;
        case "tomorrow": now.setDate(now.getDate() + 1); now.setHours(12, 0, 0, 0); setFrom(now); break;
        case "newyear": setFrom(new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0)); break;
      }
    });
  });

  function copyText(text) {
    const done = ok => {
      copiedNote.textContent = ok ? "Copied to clipboard" : "Copy failed — select the code and press Ctrl/Cmd+C";
      setTimeout(() => { copiedNote.textContent = ""; }, 2500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => done(true)).catch(() => done(fallback(text)));
    } else done(fallback(text));
  }
  function fallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  $("copy").addEventListener("click", () => { update(); copyText(code.value); });
  $("current").addEventListener("click", () => setFrom(new Date()));

  /* ---------- live tick ---------- */
  setInterval(update, 1000);

  /* ---------- theme toggle ---------- */
  const themeBtns = document.querySelectorAll("[data-set-theme]");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("dtg-theme", t); } catch (e) {}
    themeBtns.forEach(b => b.classList.toggle("active", b.dataset.setTheme === t));
  }
  themeBtns.forEach(b => b.addEventListener("click", () => applyTheme(b.dataset.setTheme)));
  applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

  /* ---------- init ---------- */
  renderAll();
  update();
})();
