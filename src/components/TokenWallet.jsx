import React, { useState, useEffect } from 'react';
import solanaTokens from '../integrations/SolanaTokens';

export default function TokenWallet({ walletPublicKey, walletConnected }) {
  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenRewards, setTokenRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [activeStakes, setActiveStakes] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);

  useEffect(() => {
    if (walletConnected && walletPublicKey) {
      loadWalletData();
    }
  }, [walletConnected, walletPublicKey]);

  const loadWalletData = async () => {
    if (!walletPublicKey) return;
    
    setLoading(true);
    try {
      // Load SOL balance
      const sol = await solanaTokens.getSolBalance(walletPublicKey);
      setSolBalance(sol);
      
      // Load token balance
      const tokens = await solanaTokens.getTokenBalance(walletPublicKey);
      setTokenBalance(tokens);
      
      // Load rewards history
      const rewards = solanaTokens.getSimulatedTokenRewards(walletPublicKey);
      setTokenRewards(rewards);
      
      // Load active stakes
      const stakes = solanaTokens.getActiveStakes(walletPublicKey);
      setActiveStakes(stakes);
      
      // Load user NFTs
      const nfts = solanaTokens.getUserPetNFTs(walletPublicKey);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
    setLoading(false);
  };

  const handleClaimDailyReward = async () => {
    if (!walletPublicKey) return;
    
    try {
      const lastClaim = localStorage.getItem(`ct_daily_claim_${walletPublicKey}`);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (lastClaim && (now - parseInt(lastClaim)) < oneDayMs) {
        alert('Daily reward already claimed! Come back tomorrow.');
        return;
      }
      
      const streak = calculateDailyStreak();
      await solanaTokens.rewardForDailyCheckIn(walletPublicKey, streak);
      localStorage.setItem(`ct_daily_claim_${walletPublicKey}`, now.toString());
      
      // Refresh data
      loadWalletData();
      alert(`Daily reward claimed! +${5 + Math.min(streak - 1, 10)} TAMA tokens`);
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      alert('Failed to claim daily reward');
    }
  };

  const calculateDailyStreak = () => {
    const streakData = localStorage.getItem(`ct_daily_streak_${walletPublicKey}`);
    if (!streakData) return 1;
    
    try {
      const { lastClaimDate, streak } = JSON.parse(streakData);
      const today = new Date().toDateString();
      const lastClaim = new Date(lastClaimDate).toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastClaim === yesterday) {
        // Continue streak
        const newStreak = streak + 1;
        localStorage.setItem(`ct_daily_streak_${walletPublicKey}`, JSON.stringify({
          lastClaimDate: Date.now(),
          streak: newStreak
        }));
        return newStreak;
      } else if (lastClaim === today) {
        // Already claimed today
        return streak;
      } else {
        // Reset streak
        localStorage.setItem(`ct_daily_streak_${walletPublicKey}`, JSON.stringify({
          lastClaimDate: Date.now(),
          streak: 1
        }));
        return 1;
      }
    } catch {
      return 1;
    }
  };

  const handleStakeTokens = async (amount, duration) => {
    if (!walletPublicKey || amount <= 0 || amount > tokenBalance) return;
    
    try {
      await solanaTokens.simulateStakeTokens(walletPublicKey, amount, duration);
      // In a real implementation, tokens would be locked
      alert(`Staked ${amount} TAMA tokens for ${duration}!`);
      loadWalletData();
    } catch (error) {
      console.error('Error staking tokens:', error);
      alert('Failed to stake tokens');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(num < 1 ? 4 : 0);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!walletConnected) {
    return (
      <div className="token-wallet">
        <div className="wallet-status">
          <h3>🔗 Connect Wallet</h3>
          <p>Connect your Phantom wallet to manage tokens and rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-wallet">
      <div className="wallet-header">
        <h2>💰 Token Wallet</h2>
        <button onClick={loadWalletData} disabled={loading} className="refresh-btn">
          {loading ? '⟳' : '↻'} Refresh
        </button>
      </div>

      <div className="wallet-grid">
        <div className="balance-card">
          <div className="balance-header">
            <h3>SOL Balance</h3>
            <div className="balance-amount">{formatNumber(solBalance)} SOL</div>
          </div>
          <div className="balance-usd">
            ≈ ${(solBalance * 150).toFixed(2)} USD
          </div>
        </div>

        <div className="balance-card">
          <div className="balance-header">
            <h3>TAMA Tokens</h3>
            <div className="balance-amount">{formatNumber(tokenBalance)} TAMA</div>
          </div>
          <div className="balance-usd">
            Gaming & Rewards Token
          </div>
        </div>

        <div className="balance-card">
          <div className="balance-header">
            <h3>Pet NFTs</h3>
            <div className="balance-amount">{userNFTs.length}</div>
          </div>
          <div className="balance-usd">
            Collectible Pets
          </div>
        </div>

        <div className="balance-card">
          <div className="balance-header">
            <h3>Active Stakes</h3>
            <div className="balance-amount">{activeStakes.length}</div>
          </div>
          <div className="balance-usd">
            Earning Rewards
          </div>
        </div>
      </div>

      <div className="wallet-actions">
        <button onClick={handleClaimDailyReward} className="btn daily-reward-btn">
          🎁 Claim Daily Reward
        </button>
        
        <button 
          onClick={() => setShowRewards(!showRewards)} 
          className="btn rewards-btn"
        >
          📊 {showRewards ? 'Hide' : 'Show'} Rewards ({tokenRewards.length})
        </button>
      </div>

      {showRewards && (
        <div className="rewards-section">
          <h3>Recent Token Rewards</h3>
          <div className="rewards-list">
            {tokenRewards.slice(0, 10).map((reward, index) => (
              <div key={index} className="reward-item">
                <div className="reward-info">
                  <div className="reward-source">{reward.source.replace('_', ' ')}</div>
                  <div className="reward-date">{formatDate(reward.timestamp)}</div>
                </div>
                <div className="reward-amount">+{reward.amount} TAMA</div>
              </div>
            ))}
            {tokenRewards.length === 0 && (
              <div className="no-rewards">
                No rewards yet. Start playing to earn TAMA tokens!
              </div>
            )}
          </div>
        </div>
      )}

      {userNFTs.length > 0 && (
        <div className="nft-section">
          <h3>Your Pet NFTs</h3>
          <div className="nft-grid">
            {userNFTs.slice(0, 6).map((nft, index) => (
              <div key={nft.id} className="nft-card">
                <div className="nft-image">
                  🦊 {/* Placeholder for NFT image */}
                </div>
                <div className="nft-info">
                  <div className="nft-name">{nft.metadata.name}</div>
                  <div className="nft-rarity">{nft.petData.rarity} {nft.petData.species}</div>
                  <div className="nft-level">Level {nft.petData.level}</div>
                </div>
              </div>
            ))}
            {userNFTs.length > 6 && (
              <div className="nft-card more-nfts">
                <div className="more-count">+{userNFTs.length - 6} more</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeStakes.length > 0 && (
        <div className="staking-section">
          <h3>Active Stakes</h3>
          <div className="stakes-list">
            {activeStakes.map((stake, index) => (
              <div key={index} className="stake-item">
                <div className="stake-info">
                  <div className="stake-amount">{stake.amount} TAMA</div>
                  <div className="stake-duration">{stake.duration} duration</div>
                  <div className="stake-apy">{(stake.apy * 100).toFixed(1)}% APY</div>
                </div>
                <div className="stake-rewards">
                  Expected: +{stake.expectedReturn.toFixed(0)} TAMA
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wallet-info">
        <p>💡 Earn TAMA tokens by winning battles, completing expeditions, and daily check-ins!</p>
        <p>🔒 Future features: Token staking, NFT marketplace, and more rewards!</p>
      </div>
    </div>
  );
}