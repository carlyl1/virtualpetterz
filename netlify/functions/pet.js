// Netlify Function: /pet
// Methods:
// - GET  /pet?wallet=BASE58 -> { traits, state }
// - POST /pet  body: { wallet, state?, traits? } -> { ok: true }
// Storage: Netlify Blobs (fallback to in-memory during local dev)

const isProd = !!process.env.NETLIFY
let store = null
let memory = new Map()

async function getStore() {
  if (store) return store
  try {
    // Lazy import to avoid bundler issues if package not installed locally
    const { getStore } = await import('@netlify/blobs')
    store = getStore('vp-pets')
    return store
  } catch (_e) {
    return null
  }
}

function hashString(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pickWeighted(r, table) {
  const total = table.reduce((s, t) => s + t.w, 0)
  let x = r() * total
  for (const t of table) {
    if (x < t.w) return t.key
    x -= t.w
  }
  return table[table.length - 1].key
}
function generateTraitsFromPubkey(pubkey) {
  const seed = hashString(pubkey || 'guest')
  const rand = mulberry32(seed)
  const species = pickWeighted(rand, [
    { key: 'fox', w: 30 },
    { key: 'bunny', w: 25 },
    { key: 'cat', w: 25 },
    { key: 'duck', w: 10 },
    { key: 'wolf', w: 7 },
    { key: 'robo', w: 2 },
    { key: 'dragon', w: 1 },
  ])
  const palette = pickWeighted(rand, [
    { key: 'neon', w: 60 },
    { key: 'pastel', w: 25 },
    { key: 'dusk', w: 10 },
    { key: 'holo', w: 5 },
  ])
  return { ver: '1', wallet: pubkey || null, species, palette }
}

async function loadJSON(key) {
  const s = await getStore()
  if (s && s.getJSON) {
    return (await s.getJSON(key)) || null
  }
  return memory.get(key) || null
}
async function saveJSON(key, value) {
  const s = await getStore()
  if (s && s.setJSON) {
    await s.setJSON(key, value)
    return
  }
  memory.set(key, value)
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod
    if (method === 'OPTIONS') {
      return { statusCode: 204, headers: cors() }
    }
    if (method === 'GET') {
      const wallet = (event.queryStringParameters && event.queryStringParameters.wallet) || ''
      if (!wallet) return json(400, { error: 'wallet required' })
      const key = `pet:${wallet}`
      let data = await loadJSON(key)
      if (!data) {
        const traits = generateTraitsFromPubkey(wallet)
        data = { traits, state: { tokens: 25, hunger: 65, happiness: 65, updatedAt: Date.now() } }
        await saveJSON(key, data)
      }
      return json(200, data)
    }
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const wallet = body.wallet
      if (!wallet) return json(400, { error: 'wallet required' })
      const key = `pet:${wallet}`
      const prior = (await loadJSON(key)) || {}
      const merged = { traits: prior.traits || body.traits || generateTraitsFromPubkey(wallet), state: { ...(prior.state || {}), ...(body.state || {}) } }
      await saveJSON(key, merged)
      return json(200, { ok: true })
    }
    return json(405, { error: 'method not allowed' })
  } catch (e) {
    return json(500, { error: 'server_error', message: e.message })
  }
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...cors() }, body: JSON.stringify(obj) }
}