import React from 'react'

export default function Terms() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 16, fontSize: 12, lineHeight: 1.6 }}>
      <h2>Terms of Service</h2>
      <p>By using this site you agree to these terms. This is an MVP game provided “as is”. We may update or remove features at any time.</p>
      <ul>
        <li>Privacy: Chat messages may be sent to an AI provider configured by the host. Do not share sensitive information.</li>
        <li>Wallets: Wallet connection is optional and may be simulated in this MVP. Never share your private keys.</li>
        <li>Tokens: In-game tokens are simulated unless explicitly stated otherwise. They have no monetary value.</li>
        <li>Content: You are responsible for your interactions. We reserve the right to restrict abuse.</li>
        <li>Liability: Provided without warranties. Use at your own risk.</li>
        <li>Contact: For questions or issues, see the README or contact the maintainer.</li>
      </ul>
    </div>
  )
}