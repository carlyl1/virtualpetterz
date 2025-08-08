import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ct_theme') || 'neon')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('ct_theme', theme)
  }, [theme])

  return (
    <button onClick={() => setTheme((t) => (t === 'neon' ? 'pastel' : 'neon'))}>
      {theme === 'neon' ? 'Neon' : 'Pastel'}
    </button>
  )
}