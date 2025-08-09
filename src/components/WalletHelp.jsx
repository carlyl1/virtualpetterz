import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function WalletHelp({ connected }) {
  const { wallet, connecting, disconnecting } = useWallet()
  const [connectionError, setConnectionError] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)
  
  const hasProvider = typeof window !== 'undefined' && !!window.solana
  
  useEffect(() => {
    // Clear error when connection succeeds
    if (connected) {
      setConnectionError(null)
    }
  }, [connected])
  
  useEffect(() => {
    // Listen for wallet connection errors
    const handleError = (error) => {
      console.error('Wallet connection error:', error)
      setConnectionError(error.message || 'Failed to connect wallet')
    }
    
    if (wallet?.adapter) {
      wallet.adapter.on('error', handleError)
      return () => wallet.adapter.off('error', handleError)
    }
  }, [wallet])
  
  const retryConnection = async () => {
    if (!wallet?.adapter) return
    
    setIsRetrying(true)
    setConnectionError(null)
    
    try {
      await wallet.adapter.connect()
    } catch (error) {
      setConnectionError(error.message || 'Connection failed')
    } finally {
      setIsRetrying(false)
    }
  }
  
  // Don't show anything if connected successfully
  if (connected && !connectionError) return null
  
  // Connection in progress
  if (connecting) {
    return (
      <div style={{ background: '#112', border: '2px solid var(--accent)', borderRadius: 8, padding: 10, color: 'var(--text)', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, border: '2px solid transparent', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span>Connecting wallet...</span>
        </div>
      </div>
    )
  }
  
  // Disconnecting
  if (disconnecting) {
    return (
      <div style={{ background: '#211', border: '2px solid #fa0', borderRadius: 8, padding: 10, color: '#fda', marginTop: 8 }}>
        <div>Disconnecting wallet...</div>
      </div>
    )
  }
  
  // Connection error
  if (connectionError) {
    return (
      <div style={{ background: '#211', border: '2px solid #f44', borderRadius: 8, padding: 10, color: '#fcc', marginTop: 8 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Wallet Connection Error</div>
        <div style={{ fontSize: 12, marginBottom: 8 }}>{connectionError}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            onClick={retryConnection} 
            disabled={isRetrying}
            style={{ 
              background: '#f44', 
              color: '#fff', 
              border: 'none',
              padding: '8px 12px', 
              borderRadius: 4, 
              fontWeight: 'bold', 
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              opacity: isRetrying ? 0.6 : 1
            }}
          >
            {isRetrying ? 'Retrying...' : 'Retry Connection'}
          </button>
          <button 
            onClick={() => setConnectionError(null)}
            style={{ 
              background: 'transparent', 
              color: '#fcc', 
              border: '1px solid #fcc',
              padding: '8px 12px', 
              borderRadius: 4, 
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }
  
  // No provider detected
  if (!hasProvider) {
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
  
  // Provider exists but not connected
  return (
    <div style={{ background: '#112', border: '2px solid var(--accent)', borderRadius: 8, padding: 10, color: 'var(--text)', marginTop: 8 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Wallet not connected</div>
      <div style={{ fontSize: 12, marginBottom: 8 }}>Connect your Phantom wallet to save your pet's progress and unlock all features.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button 
          onClick={retryConnection}
          disabled={isRetrying}
          style={{ 
            background: 'var(--accent)', 
            color: 'var(--bg)', 
            border: 'none',
            padding: '8px 12px', 
            borderRadius: 4, 
            fontWeight: 'bold', 
            cursor: isRetrying ? 'not-allowed' : 'pointer',
            opacity: isRetrying ? 0.6 : 1
          }}
        >
          {isRetrying ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  )
}