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
    const DEBUG = (process.env.DEBUG_CHAT || '') === '1' || (event.queryStringParameters && event.queryStringParameters.debug === '1')

    let output = null
    let lastError = null

    if (HF_MODEL_URL && HF_API_KEY) {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 20000)
      try {
        // Attempt A: messages format (some OSS chat backends expect this)
        const payloadA = {
          inputs: [{ role: 'user', content: input }],
          parameters: { max_new_tokens: 160, temperature: 0.8, return_full_text: false }
        }
        let res = await fetch(HF_MODEL_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadA),
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          output = Array.isArray(data) ? (data[0]?.generated_text || null) : (data?.generated_text || null)
        } else {
          lastError = { status: res.status, text: await res.text().catch(() => '') }
        }
        // Attempt B: plain text input
        if (!output) {
          res = await fetch(HF_MODEL_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: input, parameters: { max_new_tokens: 160, temperature: 0.8, return_full_text: false } }),
            signal: controller.signal,
          })
          if (res.ok) {
            const data = await res.json()
            output = Array.isArray(data) ? (data[0]?.generated_text || null) : (data?.generated_text || null)
          } else {
            lastError = { status: res.status, text: await res.text().catch(() => '') }
          }
        }
      } catch (e) {
        lastError = { message: String(e && e.message ? e.message : e) }
      } finally {
        clearTimeout(id)
      }
    }

    if (!output) {
      output = "I'm your pixel pet! Tell me if you want to feed or play."
    }

    const body = DEBUG ? { output, debug: { hasModel: !!HF_MODEL_URL, lastError } } : { output }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(body)
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'chat failed' }) }
  }
}