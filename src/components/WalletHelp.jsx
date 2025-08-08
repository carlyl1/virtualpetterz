import React from 'react'

export default function WalletHelp({ connected }) {
  const hasProvider = typeof window !== 'undefined' && !!window.solana
  if (connected || hasProvider) return null
  return (
    <div style={{ background: '#221', border: '2px solid #f0a', borderRadius: 8, padding: 10, color: '#fbd', marginTop: 8 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Phantom wallet not detected</div>
      <div style={{ fontSize: 12, marginBottom: 8 }}>Install Phantom to connect your Solana wallet and claim your unique pet.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href="https://phantom.app/download" target="_blank" rel="noreferrer" style={{ background: '#f0a', color: '#120', padding: '8px 10px', borderRadius: 6, fontWeight: 'bold', textDecoration: 'none' }}>Get Phantom</a>
        <a href="https://docs.phantom.app/" target="_blank" rel="noreferrer" style={{ background: '#f0a', color: '#120', padding: '8px 10px', borderRadius: 6, fontWeight: 'bold', textDecoration: 'none' }}>Help</a>
      </div>
    </div>
  )
}