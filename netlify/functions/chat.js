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

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    const DEBUG = (process.env.DEBUG_CHAT || '') === '1' || (event.queryStringParameters && event.queryStringParameters.debug === '1')

    let output = null
    let lastError = null
    let debugInfo = {
      hasGroqKey: !!GROQ_API_KEY,
      groqKeyLength: GROQ_API_KEY ? GROQ_API_KEY.length : 0,
      input: sanitizedInput,
      attempts: []
    }

    if (GROQ_API_KEY) {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 10000)
      try {
        const payload = {
          messages: [{ role: 'user', content: sanitizedInput }],
          model: 'mixtral-8x7b-32768', // Fast and good model
          max_tokens: 150,
          temperature: 0.8
        }
        
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${GROQ_API_KEY}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        
        debugInfo.attempts.push({
          service: 'groq',
          status: res.status,
          ok: res.ok,
          model: 'mixtral-8x7b-32768'
        })
        
        if (res.ok) {
          const data = await res.json()
          debugInfo.attempts[debugInfo.attempts.length - 1].responseData = data
          output = data.choices?.[0]?.message?.content?.trim()
        } else {
          const errorText = await res.text().catch(() => '')
          lastError = { status: res.status, text: errorText }
          debugInfo.attempts[debugInfo.attempts.length - 1].error = errorText
        }
      } catch (e) {
        lastError = { message: String(e && e.message ? e.message : e) }
        debugInfo.attempts.push({
          service: 'groq',
          error: e.message,
          stack: e.stack
        })
      } finally {
        clearTimeout(id)
      }
    } else {
      debugInfo.skippedReason = 'Missing GROQ_API_KEY'
    }

    if (!output) {
      output = "AI service not configured properly. Check GROQ_API_KEY environment variable."
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