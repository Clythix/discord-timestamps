<div align="center">
  <img src="assets/timestamps.png" alt="Discord Timestamp Generator" width="90">
  <h1>Discord Timestamp Generator</h1>
  <p>Pick a date and time, copy the code — everyone in Discord sees the
  moment in <b>their own timezone</b>. Minecraft-themed, 100% client-side.</p>
  <p><b>Live site: <a href="https://timestamps.clythix.com/">timestamps.clythix.com</a></b></p>
</div>

## Features

- Date + time picker with drag, scroll, arrows and keyboard support
- All 7 Discord timestamp formats (`t`, `T`, `d`, `D`, `f`, `F`, `R`)
- Live Discord-style preview and every format shown at once
- Quick picks: Now, +1 hour, Tomorrow, New Year
- Click-to-copy with toast popup
- Dark (Discord × Minecraft) and light (sky) themes, saved between visits
- No tracking, no backend — nothing leaves your browser

## Host it yourself

The site is fully static — any static host works. On
**[Cloudflare Pages](https://dash.cloudflare.com/)**: connect the repo,
framework preset **None**, build command empty, output directory **`/`**, deploy.

Works the same on Vercel or Netlify: empty build command, repo root as output.

## Run locally

Double-clicking `index.html` won't run the ES modules — serve the folder instead:

    npx serve .        # no install needed

Optional tooling (tests + lint only, never shipped to the browser):

    npm install
    npm test
    npm run lint

## License

[MIT](./LICENSE) — free to use, modify and share. The one condition: keep the
copyright notice, so credit stays with the code.

Not affiliated with Mojang, Minecraft, or Discord.

---

<div align="center">
  © 2026 <a href="https://clythix.com/">Clythix</a><br>
  <a href="https://github.com/Clythix/discord-timestamps/actions/workflows/ci.yml"><img src="https://github.com/Clythix/discord-timestamps/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT"></a>
</div>
