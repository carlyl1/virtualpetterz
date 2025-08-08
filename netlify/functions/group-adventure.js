// Netlify Function: /group-adventure
// Rooms API (ephemeral in-memory; replace with persistent store later)
// POST /group-adventure { action: 'create', packId }
// POST /group-adventure { action: 'join', roomId, wallet }
// POST /group-adventure { action: 'vote', roomId, wallet, choiceId }
// GET  /group-adventure?roomId=XYZ -> room state

let rooms = new Map()

exports.handler = async (event) => {
  try {
    const method = event.httpMethod
    if (method === 'OPTIONS') return { statusCode: 204, headers: cors() }

    if (method === 'GET') {
      const { roomId } = event.queryStringParameters || {}
      if (!roomId || !rooms.has(roomId)) return json(404, { error: 'not_found' })
      return json(200, rooms.get(roomId))
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const { action } = body
      if (action === 'create') {
        const roomId = Math.random().toString(36).slice(2, 8)
        const nodeId = 'root'
        const expiresAt = Date.now() + 60 * 1000
        const room = { id: roomId, packId: body.packId || 'neon-portal', nodeId, votes: {}, members: [], expiresAt }
        rooms.set(roomId, room)
        return json(200, room)
      }
      if (action === 'join') {
        const { roomId, wallet } = body
        const room = rooms.get(roomId)
        if (!room) return json(404, { error: 'not_found' })
        if (!room.members.includes(wallet)) room.members.push(wallet)
        return json(200, room)
      }
      if (action === 'vote') {
        const { roomId, wallet, choiceId } = body
        const room = rooms.get(roomId)
        if (!room) return json(404, { error: 'not_found' })
        if (Date.now() > room.expiresAt) {
          // Tally and advance to next node
          const tally = {}
          Object.values(room.votes).forEach((c) => { tally[c] = (tally[c] || 0) + 1 })
          const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0]
          // For now, just append choice id to node path
          room.nodeId = winner || room.nodeId
          room.votes = {}
          room.expiresAt = Date.now() + 60 * 1000
        }
        room.votes[wallet] = choiceId
        rooms.set(roomId, room)
        return json(200, room)
      }
      return json(400, { error: 'bad_request' })
    }

    return json(405, { error: 'method_not_allowed' })
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