exports.handler = async (event) => {
  try {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
    }
    
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Method Not Allowed' })
      }
    }
    
    // Validate request body size
    if (!event.body || event.body.length > 10000) {
      return { 
        statusCode: 400, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'invalid request size' }) 
      }
    }
    
    const { input } = JSON.parse(event.body || '{}')
    
    // Enhanced input validation
    if (!input || typeof input !== 'string') {
      return { 
        statusCode: 400, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'missing input' }) 
      }
    }
    
    if (input.length > 500) {
      return { 
        statusCode: 400, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'input too long' }) 
      }
    }
    
    if (input.trim().length === 0) {
      return { 
        statusCode: 400, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'empty input' }) 
      }
    }
    
    // Basic sanitization - remove potentially harmful content
    const sanitizedInput = input.replace(/[<>]/g, '').trim()
    if (sanitizedInput !== input.trim()) {
      return { 
        statusCode: 400, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'invalid characters in input' }) 
      }
    }

    const RAW_HF_MODEL_URL = process.env.HF_MODEL_URL || ''
    const HF_MODEL_URL = RAW_HF_MODEL_URL.trim().replace(/\/+$/, '')
    const HF_API_KEY = process.env.HF_API_KEY
    const DEBUG = (process.env.DEBUG_CHAT || '') === '1' || (event.queryStringParameters && event.queryStringParameters.debug === '1')

    let output = null
    let lastError = null
    let debugInfo = {
      hasModelUrl: !!HF_MODEL_URL,
      hasApiKey: !!HF_API_KEY,
      modelUrlLength: HF_MODEL_URL ? HF_MODEL_URL.length : 0,
      apiKeyLength: HF_API_KEY ? HF_API_KEY.length : 0,
      input: sanitizedInput,
      attempts: [],
      modelUrlPreview: HF_MODEL_URL ? (HF_MODEL_URL.slice(0, 40) + '…' + HF_MODEL_URL.slice(-20)) : null,
      modelUrlTailCharCodes: HF_MODEL_URL ? HF_MODEL_URL.slice(-3).split('').map((c)=>c.charCodeAt(0)) : []
    }

    if (HF_MODEL_URL && HF_API_KEY) {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 20000)
      try {
        // Attempt A: messages format (some OSS chat backends expect this)
        const payloadA = {
          inputs: [{ role: 'user', content: sanitizedInput }],
          parameters: { max_new_tokens: 160, temperature: 0.8, return_full_text: false }
        }
        let res = await fetch(HF_MODEL_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadA),
          signal: controller.signal,
        })
        
        debugInfo.attempts.push({
          attempt: 'A_messages_format',
          status: res.status,
          ok: res.ok,
          payload: payloadA
        })
        
        if (res.ok) {
          const data = await res.json()
          debugInfo.attempts[debugInfo.attempts.length - 1].responseType = typeof data
          debugInfo.attempts[debugInfo.attempts.length - 1].responseKeys = Object.keys(data || {})
          debugInfo.attempts[debugInfo.attempts.length - 1].responseData = data
          // Handle different response formats from different models
          if (Array.isArray(data)) {
            output = data[0]?.generated_text || data[0]?.text || null
          } else if (data?.generated_text) {
            output = data.generated_text
          } else if (data?.text) {
            output = data.text
          } else if (data?.conversation?.generated_responses?.[0]) {
            output = data.conversation.generated_responses[0]
          }
        } else {
          const errorText = await res.text().catch(() => '')
          lastError = { status: res.status, text: errorText }
          debugInfo.attempts[debugInfo.attempts.length - 1].error = errorText
        }
        // Attempt B: plain text input
        if (!output) {
          const payloadB = { inputs: sanitizedInput, parameters: { max_new_tokens: 160, temperature: 0.8, return_full_text: false } }
          res = await fetch(HF_MODEL_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadB),
            signal: controller.signal,
          })
          
          debugInfo.attempts.push({
            attempt: 'B_plain_text',
            status: res.status,
            ok: res.ok,
            payload: payloadB
          })
          
          if (res.ok) {
            const data = await res.json()
            debugInfo.attempts[debugInfo.attempts.length - 1].responseType = typeof data
            debugInfo.attempts[debugInfo.attempts.length - 1].responseKeys = Object.keys(data || {})
            debugInfo.attempts[debugInfo.attempts.length - 1].responseData = data
            // Handle different response formats from different models
            if (Array.isArray(data)) {
              output = data[0]?.generated_text || data[0]?.text || null
            } else if (data?.generated_text) {
              output = data.generated_text
            } else if (data?.text) {
              output = data.text
            } else if (data?.conversation?.generated_responses?.[0]) {
              output = data.conversation.generated_responses[0]
            }
          } else {
            const errorText = await res.text().catch(() => '')
            lastError = { status: res.status, text: errorText }
            debugInfo.attempts[debugInfo.attempts.length - 1].error = errorText
          }
        }
      } catch (e) {
        lastError = { message: String(e && e.message ? e.message : e) }
        debugInfo.attempts.push({
          attempt: 'exception',
          error: e.message,
          stack: e.stack
        })
      } finally {
        clearTimeout(id)
      }
    } else {
      debugInfo.skippedReason = 'Missing HF_MODEL_URL or HF_API_KEY'
    }

    if (!output) {
      output = "I'm your pixel pet! Tell me if you want to feed or play."
    }

    const body = DEBUG ? { output, debug: debugInfo, lastError } : { output }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(body)
    }
  } catch (e) {
    return { 
      statusCode: 500, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'chat failed' }) 
    }
  }
}