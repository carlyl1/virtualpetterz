# Deploy (Operators)

This document is for operators/maintainers. End‑users should not need this.

## Netlify (Functions + SPA)
- New site from Git
- Build: `npm run build`
- Publish: `dist`
- Functions: `netlify/functions`
- Environment:
  - Model URL for your OSS chat provider
  - Provider API key/token
  - (Optional) Node runtime version (e.g., 20)
- The function is exposed as `/chat` via `netlify.toml`. The app defaults to this route.
- Status: visit `/status` after deploy.

## Render (single service)
- Build locally: `npm run build`
- Render Web Service
  - Root: `server`
  - Build: `cd .. && npm ci && npm run build && cd server && npm ci`
  - Start: `node server.js`
  - Environment: port, model URL, provider API key
- After deploy: site root serves the app; POST `/chat` handled by the server.

## Security Notes
- Do not commit secrets (.env) to the repository
- Provider keys should live only in host environment
- Rate limits and timeouts are enabled in the chat proxy
- Helmet/compression/logging enabled for the server