import React from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import PetDemo from './components/PetDemo'
import AdventurePanel from './components/AdventurePanel'
import Battle from './components/Battle'

export default function App(){
  const wallets = [new PhantomWalletAdapter()];
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={{display:'flex', justifyContent:'center', padding:20}}>
            <div style={{width:420}}>
              <header style={{textAlign:'center', marginBottom:12}}>
                <h1 style={{color:'#00ff99', fontFamily:'"Press Start 2P",monospace'}}>Solana Tamagotchi</h1>
                <div style={{display:'flex', justifyContent:'center', gap:8}}><WalletMultiButton /></div>
              </header>
              <PetDemo />
              <AdventurePanel />
              <hr style={{borderColor:'#222', margin:'16px 0'}}/>
              <Battle />
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
