import React, { useEffect, useMemo, useRef, useState } from 'react'

async function loadPlaylist() {
  try {
    const res = await fetch('/assets/audio/playlist.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('no playlist')
    const list = await res.json()
    if (Array.isArray(list) && list.length) return list
  } catch {}
  // Fallback defaults
  return [
    { title: 'BGM', src: '/assets/audio/bgm.mp3' },
    { title: 'Track 1', src: '/assets/audio/track1.mp3' },
    { title: 'Track 2', src: '/assets/audio/track2.mp3' },
  ]
}

export default function AudioPlayer() {
  const audioRef = useRef(null)
  const [enabled, setEnabled] = useState(() => localStorage.getItem('ct_bgm_enabled') === 'true')
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('ct_bgm_vol') || '0.3'))
  const [tracks, setTracks] = useState([])
  const [idx, setIdx] = useState(() => Number(localStorage.getItem('ct_bgm_idx') || '0'))
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    (async () => setTracks(await loadPlaylist()))()
  }, [])

  useEffect(() => {
    localStorage.setItem('ct_bgm_enabled', String(enabled))
    if (!audioRef.current) return
    if (enabled) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [enabled, idx, tracks])

  useEffect(() => {
    localStorage.setItem('ct_bgm_vol', String(volume))
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    localStorage.setItem('ct_bgm_idx', String(idx))
  }, [idx])

  const current = tracks[idx] || { title: '—', src: '' }

  const onTime = () => {
    const a = audioRef.current
    if (!a || !a.duration) return
    setProgress(a.currentTime / a.duration)
  }

  const seek = (p) => {
    const a = audioRef.current
    if (!a || !a.duration) return
    a.currentTime = Math.max(0, Math.min(a.duration, p * a.duration))
  }

  const prev = () => setIdx((i) => (i - 1 + tracks.length) % tracks.length)
  const next = () => setIdx((i) => (i + 1) % tracks.length)
  const rewind = (sec) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Math.max(0, a.currentTime + sec)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
      <audio
        ref={audioRef}
        src={current.src}
        loop={false}
        preload="auto"
        onEnded={next}
        onTimeUpdate={onTime}
        style={{ display: 'none' }}
      />
      <button onClick={() => setEnabled((e) => !e)}>{enabled ? '⏸' : '▶️'}</button>
      <button onClick={prev}>⏮</button>
      <button onClick={() => rewind(-5)}>⏪ 5s</button>
      <button onClick={() => rewind(5)}>5s ⏩</button>
      <button onClick={next}>⏭</button>
      <div style={{ width: 80 }}>
        <input type="range" min={0} max={1} step={0.01} value={progress} onChange={(e) => seek(Number(e.target.value))} />
      </div>
      <div style={{ width: 80 }}>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
      </div>
      <span style={{ color: '#b8ffe6' }}>{current.title}</span>
    </div>
  )
}