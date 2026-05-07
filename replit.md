# WeChatPostGPT

AI-assisted WeChat official account article typesetting tool. Inputs a title and body, and generates structured layout decisions and inline-styled HTML ready to paste into the WeChat editor.

## Run & Operate
- Start: `npm start` (workflow `Server` runs `PORT=5000 npm start`)
- Syntax check: `npm run check`
- Env vars (optional, see `.env.example`): `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `PORT`
- AI can also be configured at runtime in the page UI (stored in browser localStorage).

## Stack
- Node.js >=18, no framework — single-file `node:http` server (`server.js`)
- Vanilla HTML/CSS/JS frontend (`index.html`, `styles.css`, `app.js`)

## Where things live
- `server.js` — HTTP server, static file serving, OpenAI API proxy, URL fetcher
- `index.html` / `styles.css` / `app.js` — frontend UI, template library, rendering & copy
- `docs/research.md` — design research notes
- `.env.example` — env var template

## Architecture decisions
- Server binds `0.0.0.0:5000` for Replit preview proxy compatibility.
- API key proxied through backend so it is never exposed to the browser.
- Page-level AI config (localStorage) takes priority over `.env` fallback.
- Uses OpenAI Responses API with structured outputs; falls back to Chat Completions on 404/405.

## Product
Generates layout decisions (analysis, template choice, design tokens) and renders inline-styled HTML for WeChat. Supports 8 built-in templates, template learning from rich text/URL/HTML, image typesetting, and one-click rich-text copy.

## Gotchas
- Frontend must be reached via Replit preview proxy; server already listens on `0.0.0.0`.
- URL learning requires the backend running (browser cannot cross-site fetch).
- Default port in code is 5173; the workflow overrides with `PORT=5000`.

## Pointers
- Workflows skill: `.local/skills/workflows/SKILL.md`
- Deployment skill: `.local/skills/deployment/SKILL.md`
