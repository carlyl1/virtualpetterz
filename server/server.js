const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const fs = require('fs')
const rateLimit = require('express-rate-limit')

const PORT = process.env.PORT || 8787
const HF_MODEL_URL = process.env.HF_MODEL_URL || ''
const HF_API_KEY = process.env.HF_API_KEY || ''
const START_AT = Date.now()

const app = express()
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const chatLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ])
}

async function callHuggingFace(prompt) {
  if (!HF_MODEL_URL || !HF_API_KEY) return null
  const req = fetch(HF_MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 80, temperature: 0.8, return_full_text: false } }),
  })
  const res = await withTimeout(req, 15000)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HF error ${res.status}: ${text}`)
  }
  const data = await res.json()
  const out = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || data?.[0]?.generated_text
  return out || ''
}

app.get('/health', (_req, res) => {
  const mem = process.memoryUsage()
  res.json({ status: 'ok', uptime: process.uptime(), startedAt: new Date(START_AT).toISOString(), version: process.env.VERSION || '1.0.0', memory: { rss: mem.rss, heapUsed: mem.heapUsed } })
})

app.get('/ready', (_req, res) => {
  const distIndex = path.resolve(__dirname, '..', 'dist', 'index.html')
  const hasDist = fs.existsSync(distIndex)
  res.json({ ready: hasDist })
})

app.post('/chat', chatLimiter, async (req, res) => {
  try {
    const input = (req.body?.input || '').toString()
    if (!input) return res.status(400).json({ error: 'missing input' })
    const hf = await callHuggingFace(input).catch(() => null)
    if (hf != null) return res.json({ output: hf })
    return res.json({ output: "I'm your pixel pet! Tell me if you want to feed or play." })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'chat failed' })
  }
})

// Serve the built frontend from ../dist
const distDir = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distDir, { maxAge: '1d', immutable: true }))
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => { console.log(`Crypto Tama server listening on http://localhost:${PORT}`) })