import React from 'react'

export default function Privacy() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 16, fontSize: 12, lineHeight: 1.6 }}>
      <h2>Privacy</h2>
      <p>We aim for a privacy-first experience. This MVP uses a configurable chat proxy. Depending on hosting, chat text may be relayed to an AI provider (e.g., Hugging Face Inference). We do not store chat logs server-side beyond transient processing.</p>
      <ul>
        <li>Wallets: We never request your private key. Wallet extensions handle signing.</li>
        <li>Analytics: None enabled by default in the MVP.</li>
        <li>Data retention: No persistent personal data is stored by default.</li>
      </ul>
    </div>
  )
}