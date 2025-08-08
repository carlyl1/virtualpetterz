const express = require('express')
const cors = require('cors')

// Config via env
const PORT = process.env.PORT || 8787
// Example: https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
const HF_MODEL_URL = process.env.HF_MODEL_URL || ''
const HF_API_KEY = process.env.HF_API_KEY || ''

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

async function callHuggingFace(prompt) {
  if (!HF_MODEL_URL || !HF_API_KEY) {
    return null
  }
  const res = await fetch(HF_MODEL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 80,
        temperature: 0.8,
        return_full_text: false
      }
    })
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HF error ${res.status}: ${text}`)
  }
  const data = await res.json()
  // HF text-generation returns array of objects [{generated_text: "..."}] or similar depending on model
  const out = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || data?.[0]?.generated_text
  return out || ''
}

app.post('/chat', async (req, res) => {
  try {
    const input = (req.body?.input || '').toString()
    if (!input) return res.status(400).json({ error: 'missing input' })

    const hf = await callHuggingFace(input)
    if (hf != null) {
      return res.json({ output: hf })
    }

    // Fallback
    return res.json({ output: "I'm your pixel pet! Tell me if you want to feed or play." })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'chat failed' })
  }
})

app.get('/', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`OSS chat proxy listening on http://localhost:${PORT}`)
})