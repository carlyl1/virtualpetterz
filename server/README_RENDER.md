Render Single-Service Deploy
============================

This serves both the built frontend and the `/chat` API from one Web Service.

Setup
-----
1) Push repo to GitHub.
2) Create Web Service in Render:
   - Root Directory: `server`
   - Build Command:
     ```
     cd .. && npm ci && npm run build && cd server && npm ci
     ```
   - Start Command: `node server.js`
   - Instance: Free or Starter
3) Environment Variables:
   - `PORT=8787`
   - `HF_MODEL_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2`
   - `HF_API_KEY=hf_...`
4) After deploy: your domain serves the app and `/chat`.

Notes
-----
- Compression, Helmet, and logging are enabled.
- Static assets are cached; `index.html` is no-cache for fast releases.
- If you host the chat separately, use `server/chat.js` and set the frontend `PUBLIC_CHAT_URL` accordingly.