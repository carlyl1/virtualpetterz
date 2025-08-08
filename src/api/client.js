export async function getPet(wallet) {
  const res = await fetch(`/.netlify/functions/pet?wallet=${encodeURIComponent(wallet)}`)
  if (!res.ok) throw new Error('pet_get_failed')
  return res.json()
}

export async function savePet(wallet, data) {
  const res = await fetch(`/.netlify/functions/pet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, ...data }),
  })
  if (!res.ok) throw new Error('pet_save_failed')
  return res.json()
}

export async function createGroupAdventure(packId = 'neon-portal') {
  const res = await fetch(`/.netlify/functions/group-adventure`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', packId }),
  })
  if (!res.ok) throw new Error('ga_create_failed')
  return res.json()
}

export async function joinGroupAdventure(roomId, wallet) {
  const res = await fetch(`/.netlify/functions/group-adventure`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'join', roomId, wallet }),
  })
  if (!res.ok) throw new Error('ga_join_failed')
  return res.json()
}

export async function voteGroupAdventure(roomId, wallet, choiceId) {
  const res = await fetch(`/.netlify/functions/group-adventure`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vote', roomId, wallet, choiceId }),
  })
  if (!res.ok) throw new Error('ga_vote_failed')
  return res.json()
}