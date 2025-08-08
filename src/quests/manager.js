const QUESTS_KEY = 'ct_quests_v1'
const QUESTS_DAY_KEY = 'ct_quests_day'

function todayKey() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
}

const DEFAULT_QUESTS = [
  { id: 'feed_pet', title: 'Feed your pet 3 times', target: 3, reward: 2 },
  { id: 'play_pet', title: 'Play with your pet 3 times', target: 3, reward: 2 },
  { id: 'battle_win', title: 'Win 1 battle', target: 1, reward: 3 },
  { id: 'adventure', title: 'Complete 1 adventure', target: 1, reward: 3 },
]

function loadRaw() {
  try { return JSON.parse(localStorage.getItem(QUESTS_KEY) || '[]') } catch { return [] }
}

function saveRaw(arr) {
  localStorage.setItem(QUESTS_KEY, JSON.stringify(arr))
}

function ensureDaily() {
  const day = localStorage.getItem(QUESTS_DAY_KEY)
  const today = todayKey()
  if (day !== today) {
    const fresh = DEFAULT_QUESTS.map((q) => ({ ...q, progress: 0, claimed: false }))
    saveRaw(fresh)
    localStorage.setItem(QUESTS_DAY_KEY, today)
    return fresh
  }
  const cur = loadRaw()
  if (!Array.isArray(cur) || !cur.length) {
    const fresh = DEFAULT_QUESTS.map((q) => ({ ...q, progress: 0, claimed: false }))
    saveRaw(fresh)
    return fresh
  }
  return cur
}

export function getQuests() {
  return ensureDaily()
}

export function incrementQuest(id, amt = 1) {
  const qs = ensureDaily()
  const idx = qs.findIndex((q) => q.id === id)
  if (idx === -1) return qs
  const q = qs[idx]
  const prog = Math.min(q.target, (q.progress || 0) + amt)
  qs[idx] = { ...q, progress: prog }
  saveRaw(qs)
  return qs
}

export function claimQuest(id) {
  const qs = ensureDaily()
  const idx = qs.findIndex((q) => q.id === id)
  if (idx === -1) return { ok: false, reward: 0, quests: qs }
  const q = qs[idx]
  if (q.claimed || (q.progress || 0) < q.target) return { ok: false, reward: 0, quests: qs }
  qs[idx] = { ...q, claimed: true }
  saveRaw(qs)
  return { ok: true, reward: q.reward, quests: qs }
}