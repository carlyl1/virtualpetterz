# Solana Tamagotchi Pet Game

An AI‑powered, pixel‑art Tamagotchi‑style pet built with React + Vite. The pet is center‑stage with canvas animations, chat via an OSS LLM proxy, quests, battles, adventures, wallet connect (Solana devnet), and a privacy‑first approach.

## Features
- Canvas pet (idle, walk, sit, wag, curl sleep) with emotes; petting increases happiness
- Chatbox (defaults to Netlify `/.netlify/functions/chat` → Hugging Face Inference)
- Quests (daily tasks, rewards), adventure with cooldown, simple battle with token rewards
- Simulated tokens + shop/inventory, SOL balance readout (devnet)
- Full‑screen layout, bottom action dock, theme toggle (Neon/Pastel)
- Pages: About, Terms, Privacy, Status

## Quick Start (local)
```bash
npm install
npm run dev
# open the URL Vite prints (e.g., http://localhost:5173)
```
Optional: create `.env` with a custom chat URL if you aren’t using Netlify functions locally:
```
VITE_OSS_CHAT_URL=http://localhost:8787/chat
```

To run the production server locally (serves `dist/` and /chat):
```bash
npm run build
cd server
npm install
PORT=8787 node server.js
```

## Environment
- Frontend
  - `VITE_OSS_CHAT_URL` (optional): Chat endpoint. Defaults to `/chat` (Netlify function).
- Server / Netlify Function
  - `HF_MODEL_URL`: e.g. `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2`
  - `HF_API_KEY`: your `hf_...` token (Hugging Face → Settings → Tokens)
  - `PORT` (server only): defaults to `8787`

## Deploy to Netlify (free)
1) New site from Git → select this repo
2) Build settings
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (auto‑detected)
3) Environment variables
   - `HF_MODEL_URL` = your model URL
   - `HF_API_KEY` = your `hf_...` token
   - optional `NODE_VERSION` = `20`
   - optional `VITE_OSS_CHAT_URL` = `/chat` (already the default)
4) Deploy. The function is available at `/.netlify/functions/chat` and is exposed as `/chat` via `netlify.toml`.
5) Verify: visit `/status` to check health and chat reachability.

## Deploy to Render (single service)
This serves both the built frontend and `/chat` from one Web Service.
1) Build the frontend locally or via Render:
```bash
npm run build
```
2) On Render → New Web Service
   - Root Directory: `server`
   - Build Command: `cd .. && npm ci && npm run build && cd server && npm ci`
   - Start Command: `node server.js`
   - Env: `PORT=8787`, `HF_MODEL_URL=...`, `HF_API_KEY=hf_...`
3) After deploy, your URL serves the app and POST `/chat`.

## Pages & Routes
- `/` home (pet, actions, chat)
- `/about` project overview
- `/terms` terms of service (MVP‑friendly)
- `/privacy` privacy notes (no analytics by default; chat proxied)
- `/status` status checks (Netlify function + chat POST)

## Security & Privacy
- No secrets committed; use env vars only
- Chat proxy rate‑limited and 15s timeout by default
- Helmet + compression + logging on the server
- “Keep my email private” recommended for contributors; see `src/pages/Security.md`

## Status & Health
- Netlify: `/.netlify/functions/health` and `/status` page on the frontend
- Server (Render): `GET /health`, `GET /ready`

## Project Structure
- `src/App.jsx` – Main app (wallet connect, pet UI, chat, routes)
- `src/components/*` – Pet canvas, battle, adventure, quests, shop, tokens, etc.
- `src/pages/*` – About, Terms, Privacy, Status, Security notes
- `server/server.js` – Express server for `/chat` and static `../dist`
- `netlify/functions/*` – Serverless functions for Netlify (`chat`, `health`)
- `netlify.toml` – Build config, redirects, and SPA fallback for React Router

## Roadmap
- On‑chain token flows (feed/play/battle/adventure) on Solana
- Matchmaking + multiplayer battles
- Adventure stories with richer AI branching dialogs
- Optional NFT minting/trading for pets

## License
MIT (or your preferred license). If adding a license, place it at the repo root as `LICENSE`.