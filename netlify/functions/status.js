// Netlify function for API status endpoint
exports.handler = async (event, context) => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    // Return mock server status for production
    const status = {
      status: 'online',
      players: Math.floor(Math.random() * 50) + 10, // Mock player count
      battles: Math.floor(Math.random() * 20),
      adventures: Math.floor(Math.random() * 15),
      uptime: Math.floor(Date.now() / 1000),
      hasSocketIO: false // No WebSocket in serverless
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(status)
    };

  } catch (error) {
    console.error('Status function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Status check failed' })
    };
  }
};