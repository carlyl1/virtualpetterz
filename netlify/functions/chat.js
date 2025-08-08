exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }
    const { input } = JSON.parse(event.body || '{}')
    if (!input || typeof input !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing input' }) }
    }

    const HF_MODEL_URL = process.env.HF_MODEL_URL
    const HF_API_KEY = process.env.HF_API_KEY

    let output = null
    if (HF_MODEL_URL && HF_API_KEY) {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 15000)
      try {
        const res = await fetch(HF_MODEL_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: input, parameters: { max_new_tokens: 80, temperature: 0.8, return_full_text: false } }),
          signal: controller.signal,
        })
        clearTimeout(id)
        if (res.ok) {
          const data = await res.json()
          output = Array.isArray(data) ? (data[0]?.generated_text || null) : (data?.generated_text || null)
        }
      } catch (_) {
        // fall through to default
      }
    }

    if (!output) {
      output = "I'm your pixel pet! Tell me if you want to feed or play."
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ output })
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'chat failed' }) }
  }
}