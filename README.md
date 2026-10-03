# Discord Timestamp Generator — Clythix

[![CI](https://github.com/Clythix/discord-timestamps/actions/workflows/ci.yml/badge.svg)](https://github.com/Clythix/discord-timestamps/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

A free, Minecraft-themed tool for generating Discord timestamp codes.
Pick a date and time, copy the code, and everyone in Discord sees the moment
in **their own timezone**.

**Live site: [timestamps.clythix.com](https://timestamps.clythix.com/)**

## Features

- Date + time picker with drag, scroll, arrows and keyboard support
- All 7 Discord timestamp formats (`t`, `T`, `d`, `D`, `f`, `F`, `R`)
- Live Discord-style preview and every format shown at once
- Quick picks: Now, +1 hour, Tomorrow, New Year
- Click-to-copy with toast popup
- Dark (Discord × Minecraft) and light (sky) themes, saved between visits
- 100% client-side — no tracking, no backend, nothing leaves your browser

## Tech

Plain HTML/CSS/JS — no framework, no build step, zero runtime dependencies.
The timestamp logic is isolated in `js/timestamps.js` and covered by tests
(`node --test`), with ESLint running in CI on every push.

## Host it yourself

The site is fully static — any static host works.

### Cloudflare Pages (recommended)

1. Fork or clone this repo
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**
3. Framework preset: **None** · Build command: *(empty)* · Build output directory: **`/`** (root)
4. Deploy — done. Add your domain under *Custom domains*.

### Vercel / Netlify

Import the repo, leave the build command empty, set the output directory to the repo root.

### Run locally

Double-clicking `index.html` won't run the ES modules — serve the folder instead:

    npx serve .        # no install needed

Optional tooling (tests + lint only, never shipped to the browser):

    npm install
    npm test
    npm run lint

## Project structure

    ├── index.html            # the page
    ├── css/                  # base (fonts/themes) · layout · components
    ├── js/
    │   ├── timestamps.js     # pure timestamp/format logic (tested)
    │   ├── picker.js         # spinner date/time widget
    │   ├── ui.js             # clipboard, toast, theme switch
    │   └── main.js           # glue
    ├── assets/               # logo + favicon PNGs
    ├── fonts/                # Minecraft fonts
    ├── tests/                # node:test unit tests
    ├── .github/workflows/    # CI (lint + tests)
    ├── _headers              # Cloudflare security + cache headers
    ├── robots.txt · sitemap.xml · favicon.ico
    └── LICENSE · CONTRIBUTING.md

## Notes

- The Minecraft font files are fan-made fonts used here decoratively.
  Minecraft is a trademark of Mojang Studios — this project is not
  affiliated with Mojang, Microsoft, or Discord.

## License

[MIT](./LICENSE)
