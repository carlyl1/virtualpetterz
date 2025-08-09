// API error handling utilities
const DEFAULT_TIMEOUT = 10000 // 10 seconds
const MAX_RETRIES = 3

class APIError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
  }
}

const withTimeout = (promise, timeout = DEFAULT_TIMEOUT) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}

const retryFetch = async (fetchFn, maxRetries = MAX_RETRIES) => {
  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        throw error
      }
      
      // Exponential backoff: wait 1s, 2s, 4s between retries
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new APIError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      errorText
    )
  }
  
  try {
    return await response.json()
  } catch (error) {
    throw new APIError('Invalid JSON response', response.status, 'PARSE_ERROR')
  }
}

export async function getPet(wallet) {
  if (!wallet || typeof wallet !== 'string') {
    throw new APIError('Invalid wallet address', 400, 'INVALID_WALLET')
  }
  
  return retryFetch(async () => {
    const response = await withTimeout(
      fetch(`/.netlify/functions/pet?wallet=${encodeURIComponent(wallet)}`)
    )
    return handleResponse(response)
  })
}

export async function savePet(wallet, data) {
  if (!wallet || typeof wallet !== 'string') {
    throw new APIError('Invalid wallet address', 400, 'INVALID_WALLET')
  }
  
  if (!data || typeof data !== 'object') {
    throw new APIError('Invalid pet data', 400, 'INVALID_DATA')
  }
  
  return retryFetch(async () => {
    const response = await withTimeout(
      fetch(`/.netlify/functions/pet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, ...data }),
      })
    )
    return handleResponse(response)
  })
}

export async function createGroupAdventure(packId = 'neon-portal') {
  if (!packId || typeof packId !== 'string') {
    throw new APIError('Invalid pack ID', 400, 'INVALID_PACK_ID')
  }
  
  return retryFetch(async () => {
    const response = await withTimeout(
      fetch(`/.netlify/functions/group-adventure`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', packId }),
      })
    )
    return handleResponse(response)
  })
}

export async function joinGroupAdventure(roomId, wallet) {
  if (!roomId || typeof roomId !== 'string') {
    throw new APIError('Invalid room ID', 400, 'INVALID_ROOM_ID')
  }
  if (!wallet || typeof wallet !== 'string') {
    throw new APIError('Invalid wallet address', 400, 'INVALID_WALLET')
  }
  
  return retryFetch(async () => {
    const response = await withTimeout(
      fetch(`/.netlify/functions/group-adventure`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', roomId, wallet }),
      })
    )
    return handleResponse(response)
  })
}

export async function voteGroupAdventure(roomId, wallet, choiceId, nextId) {
  if (!roomId || typeof roomId !== 'string') {
    throw new APIError('Invalid room ID', 400, 'INVALID_ROOM_ID')
  }
  if (!wallet || typeof wallet !== 'string') {
    throw new APIError('Invalid wallet address', 400, 'INVALID_WALLET')
  }
  if (choiceId == null) {
    throw new APIError('Invalid choice ID', 400, 'INVALID_CHOICE_ID')
  }
  
  return retryFetch(async () => {
    const response = await withTimeout(
      fetch(`/.netlify/functions/group-adventure`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', roomId, wallet, choiceId, nextId }),
      })
    )
    return handleResponse(response)
  })
}

// Export APIError class for use in components
export { APIError }