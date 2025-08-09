// Netlify function for battle validation endpoint
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

    const { battleData, playerStats, opponentStats, result } = JSON.parse(event.body || '{}');
    
    if (!playerStats || !opponentStats || !result) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing battle validation data' })
      };
    }

    // Basic validation logic
    function validateBattleResult(playerStats, opponentStats, result) {
      // Basic sanity checks
      if (result.playerFinalHp < 0 || result.opponentFinalHp < 0) {
        return { valid: false, reason: 'Invalid final HP values' };
      }
      
      // Validate victory condition
      if (result.victory && result.opponentFinalHp > 0) {
        return { valid: false, reason: 'Victory claimed but opponent still has HP' };
      }
      
      if (!result.victory && result.playerFinalHp > 0) {
        return { valid: false, reason: 'Defeat claimed but player still has HP' };
      }
      
      return { valid: true };
    }

    const validation = validateBattleResult(playerStats, opponentStats, result);
    
    if (validation.valid) {
      const rewards = {
        tokens: result.victory ? Math.floor(15 + Math.random() * 10) : 5,
        exp: result.victory ? Math.floor(25 + Math.random() * 15) : 10,
        rating_change: result.victory ? Math.floor(Math.random() * 25) + 15 : -(Math.floor(Math.random() * 15) + 5)
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: true,
          verified: true,
          rewards
        })
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: false,
          reason: validation.reason,
          verified: false
        })
      };
    }

  } catch (error) {
    console.error('Battle validation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Battle validation failed' })
    };
  }
};