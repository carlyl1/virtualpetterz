let started = Date.now()

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ ok: true, startedAt: new Date(started).toISOString(), uptime: (Date.now() - started) / 1000 })
  }
}