import React, { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function Balance() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [sol, setSol] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (!connection || !publicKey) return setSol(null)
        const lamports = await connection.getBalance(publicKey)
        if (!active) return
        setSol((lamports / LAMPORTS_PER_SOL).toFixed(3))
      } catch (e) {
        setSol(null)
      }
    }
    load()
  }, [connection, publicKey])

  if (!publicKey) return null
  return (
    <div style={{ fontSize: 10, color: '#b8ffe6', marginBottom: 8 }}>
      SOL: {sol ?? '…'}
    </div>
  )
}