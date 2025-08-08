# Solana Tamagotchi Pet Game

An AI-powered, pixel-art Tamagotchi-style pet game with Solana wallet integration. Care for your pet, chat with it, and battle other pets. Built with React + Vite.

## Deploy to Netlify (free)
- Connect your GitHub repo in Netlify → New site from Git.
- Build command: `npm run build`
- Publish directory: `dist`
- Add site environment variables:
  - `HF_MODEL_URL` (e.g., `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2`)
  - `HF_API_KEY` (your `hf_...` token)
  - Optional (frontend): `VITE_OSS_CHAT_URL=/chat` (default route set in `netlify.toml` redirect)
- The serverless function is at `/.netlify/functions/chat` and is exposed as `/chat`.

## Deploy to Render (single service)
This will serve both the built frontend and the `/chat` API from one Render Web Service.

1. Build the frontend locally (or via Render build command):
   ```bash
   npm run build
   ```
2. Push to GitHub. On Render → New Web Service:
   - Root Directory: `server`
   - Build Command: `cd .. && npm ci && npm run build && cd server && npm ci`
   - Start Command: `node server.js`
   - Instance Type: Free
3. Environment Variables:
   - `PORT=8787`
   - `HF_MODEL_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2`
   - `HF_API_KEY=hf_...`
4. After deploy, your site URL hosts both the app and POST `/chat`.

Alternatively, deploy chat-only from `server/chat.js` (see `server/README_RENDER.md`) and host the frontend separately (Vercel/Netlify/Render Static). In that case set `VITE_OSS_CHAT_URL` to the chat URL in your frontend environment.

## Frontend Env
If hosting frontend separately, set:
```
VITE_OSS_CHAT_URL=https://<your-chat-host>/chat
```

## Project Structure
- `src/App.jsx`: Main app (wallet connect, pet UI, chat, routes)
- `src/components/Battle.jsx`: Turn-based battle component
- `src/components/Adventure.jsx`: Adventure UI + mock story
- `src/components/PetSelect.jsx`: Pet selector modal
- `src/components/Shop.jsx`: Shop & inventory (simulated)
- `src/components/Balance.jsx`: SOL balance readout
- `src/App.css`: Pixel look & feel
- `server/server.js`: Express server that serves `/chat` and static `../dist`
- `server/chat.js`: Chat-only proxy (if deployed separately)

## Next Steps
- Real token transactions on Solana for feeding/playing/battles
- Matchmaking + multiplayer battles
- AI-driven adventures with branching outcomes
- Optional NFT minting & trading for pets