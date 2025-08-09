// Netlify function for leaderboard endpoint
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

    // Mock leaderboard data for production
    const mockLeaderboard = [
      { id: '1', name: 'CryptoMaster', wins: 45, losses: 12, rating: 1456 },
      { id: '2', name: 'PixelWarrior', wins: 38, losses: 15, rating: 1389 },
      { id: '3', name: 'TokenHunter', wins: 42, losses: 20, rating: 1345 },
      { id: '4', name: 'NFTChampion', wins: 35, losses: 18, rating: 1298 },
      { id: '5', name: 'BlockchainBoss', wins: 29, losses: 14, rating: 1267 },
      { id: '6', name: 'DeFiLegend', wins: 31, losses: 19, rating: 1234 },
      { id: '7', name: 'MetaGamer', wins: 27, losses: 16, rating: 1201 },
      { id: '8', name: 'CoinCollector', wins: 24, losses: 15, rating: 1189 },
      { id: '9', name: 'SmartContract', wins: 22, losses: 13, rating: 1176 },
      { id: '10', name: 'Web3Warrior', wins: 20, losses: 12, rating: 1156 }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockLeaderboard)
    };

  } catch (error) {
    console.error('Leaderboard function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Leaderboard fetch failed' })
    };
  }
};