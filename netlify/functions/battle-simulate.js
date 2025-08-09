// Netlify function for battle simulation endpoint
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

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { player1, player2 } = JSON.parse(event.body || '{}');
    
    if (!player1 || !player2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing player data' })
      };
    }

    // Simple battle simulation
    const player1Power = (player1.stats?.attack || 15) + (player1.stats?.defense || 10);
    const player2Power = (player2.stats?.attack || 15) + (player2.stats?.defense || 10);
    
    // Add some randomness
    const player1Roll = player1Power + Math.random() * 20;
    const player2Roll = player2Power + Math.random() * 20;
    
    const victory = player1Roll > player2Roll;
    const battleDuration = Math.floor(Math.random() * 8) + 3; // 3-10 turns

    const battle = {
      id: `battle_${Date.now()}`,
      player1: { ...player1, id: 'player1' },
      player2: { ...player2, id: 'player2' },
      winner: victory ? 'player1' : 'player2',
      turn: battleDuration,
      status: 'completed',
      history: Array.from({ length: battleDuration }, (_, i) => ({
        turn: i + 1,
        player: i % 2 === 0 ? 'player1' : 'player2',
        action: { type: 'attack', success: Math.random() > 0.3 }
      }))
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        victory,
        battle,
        tokens: victory ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 5) + 5,
        exp: victory ? Math.floor(Math.random() * 15) + 25 : Math.floor(Math.random() * 8) + 10
      })
    };

  } catch (error) {
    console.error('Battle simulation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Battle simulation failed' })
    };
  }
};