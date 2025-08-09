// Solana Token Integration Hooks
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from '@solana/spl-token';

// Environment-configurable token integration
const getTokenConfig = () => {
  const config = {
    // Use environment variables with fallbacks for development
    TOKEN_MINT: import.meta.env.VITE_TOKEN_MINT || '11111111111111111111111111111112',
    RPC_ENDPOINT: import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
    REWARDS_WALLET: import.meta.env.VITE_REWARDS_WALLET || null,
    TOKEN_DECIMALS: parseInt(import.meta.env.VITE_TOKEN_DECIMALS || '9'),
    ENABLED: (import.meta.env.VITE_TOKENS_ENABLED || 'true') === 'true'
  };

  // Validate configuration
  if (config.ENABLED) {
    if (!config.TOKEN_MINT || config.TOKEN_MINT.length < 32) {
      console.warn('⚠️ Invalid or missing TOKEN_MINT configuration. Using simulation mode.');
      config.ENABLED = false;
    }
    
    try {
      new PublicKey(config.TOKEN_MINT);
    } catch (error) {
      console.warn('⚠️ Invalid TOKEN_MINT format:', error.message, '- Using simulation mode.');
      config.ENABLED = false;
    }
  }

  return config;
};

export const CRYPTO_TAMA_TOKEN_MINT = (() => {
  const config = getTokenConfig();
  try {
    return new PublicKey(config.TOKEN_MINT);
  } catch {
    return new PublicKey('11111111111111111111111111111112'); // Fallback
  }
})();

export class SolanaTokenIntegration {
  constructor() {
    this.config = getTokenConfig();
    this.connection = new Connection(this.config.RPC_ENDPOINT, 'confirmed');
    this.isDevMode = process.env.NODE_ENV === 'development';
    this.tokenMint = CRYPTO_TAMA_TOKEN_MINT;
    
    console.log('🔧 Solana Token Integration initialized:', {
      enabled: this.config.ENABLED,
      network: this.config.NETWORK,
      mint: this.config.TOKEN_MINT,
      endpoint: this.config.RPC_ENDPOINT
    });
  }

  getConnection() {
    return this.connection;
  }

  // Check if token integration is enabled
  isEnabled() {
    return this.config.ENABLED;
  }

  // Get configuration info for debugging
  getConfigInfo() {
    return {
      enabled: this.config.ENABLED,
      network: this.config.NETWORK,
      mint: this.config.TOKEN_MINT,
      endpoint: this.config.RPC_ENDPOINT,
      decimals: this.config.TOKEN_DECIMALS
    };
  }

  // Get user's SOL balance
  async getSolBalance(publicKey) {
    try {
      const balance = await this.getConnection().getBalance(new PublicKey(publicKey));
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return 0;
    }
  }

  // Get user's custom token balance
  async getTokenBalance(publicKey, tokenMintAddress = CRYPTO_TAMA_TOKEN_MINT) {
    try {
      const publicKeyObj = new PublicKey(publicKey);
      const tokenMint = new PublicKey(tokenMintAddress);
      
      const associatedTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        publicKeyObj
      );

      const accountInfo = await getAccount(
        this.getConnection(),
        associatedTokenAccount
      );

      return Number(accountInfo.amount);
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        // Fallback to simulated balance if no token account exists
        return this.getTotalTokensEarned(publicKey);
      }
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  // Create token transfer transaction
  async createTokenTransferTransaction(
    fromPublicKey,
    toPublicKey, 
    amount,
    tokenMintAddress = CRYPTO_TAMA_TOKEN_MINT
  ) {
    try {
      const fromPubkey = new PublicKey(fromPublicKey);
      const toPubkey = new PublicKey(toPublicKey);
      const tokenMint = new PublicKey(tokenMintAddress);

      const fromTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        fromPubkey
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        toPubkey
      );

      const transaction = new Transaction();

      // Check if recipient's associated token account exists
      try {
        await getAccount(this.getConnection(), toTokenAccount);
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError) {
          // Create the associated token account for the recipient
          transaction.add(
            createAssociatedTokenAccountInstruction(
              fromPubkey, // payer
              toTokenAccount,
              toPubkey, // owner
              tokenMint
            )
          );
        }
      }

      // Add the transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubkey,
          amount
        )
      );

      const { blockhash } = await this.getConnection().getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      return transaction;
    } catch (error) {
      console.error('Error creating transfer transaction:', error);
      throw error;
    }
  }

  // Reward user with tokens (for development/testing)
  async simulateTokenReward(publicKey, amount, source = 'battle') {
    // This is a simulation for development
    // In production, this would be handled by your token program
    const data = {
      publicKey,
      amount,
      source,
      timestamp: Date.now(),
      txId: `sim_${Math.random().toString(36).substring(7)}`
    };
    
    // Store in localStorage as simulation
    const rewards = JSON.parse(localStorage.getItem('ct_token_rewards') || '[]');
    rewards.push(data);
    localStorage.setItem('ct_token_rewards', JSON.stringify(rewards));
    
    return data;
  }

  // Get user's total token rewards
  getSimulatedTokenRewards(publicKey) {
    try {
      const rewards = JSON.parse(localStorage.getItem('ct_token_rewards') || '[]');
      return rewards.filter(reward => reward.publicKey === publicKey);
    } catch (error) {
      console.error('Error getting simulated rewards:', error);
      return [];
    }
  }

  // Calculate total tokens earned
  getTotalTokensEarned(publicKey) {
    const rewards = this.getSimulatedTokenRewards(publicKey);
    return rewards.reduce((total, reward) => total + reward.amount, 0);
  }

  // Integration with pet activities
  async rewardForBattleWin(publicKey, petId) {
    const baseReward = 10;
    const bonusMultiplier = Math.random() * 0.5 + 1; // 1.0x to 1.5x
    const finalReward = Math.floor(baseReward * bonusMultiplier);
    
    return this.simulateTokenReward(publicKey, finalReward, 'battle_win');
  }

  async rewardForExpeditionSuccess(publicKey, petId, expeditionDifficulty = 1) {
    const baseReward = 15;
    const difficultyMultiplier = expeditionDifficulty;
    const finalReward = Math.floor(baseReward * difficultyMultiplier);
    
    return this.simulateTokenReward(publicKey, finalReward, 'expedition_success');
  }

  async rewardForDailyCheckIn(publicKey, streak = 1) {
    const baseReward = 5;
    const streakBonus = Math.min(streak - 1, 10); // Max 10 bonus
    const finalReward = baseReward + streakBonus;
    
    return this.simulateTokenReward(publicKey, finalReward, 'daily_checkin');
  }

  async rewardForAchievement(publicKey, achievementType) {
    const achievementRewards = {
      'first_pet': 50,
      'first_battle': 25,
      'first_expedition': 30,
      'level_milestone': 20,
      'rare_pet_hatch': 100,
      'legendary_pet_hatch': 500,
      'battle_streak_5': 75,
      'expedition_streak_3': 60,
      'community_participation': 15
    };
    
    const reward = achievementRewards[achievementType] || 10;
    return this.simulateTokenReward(publicKey, reward, `achievement_${achievementType}`);
  }

  // Token staking simulation (for future features)
  async simulateStakeTokens(publicKey, amount, duration = '30d') {
    const stakingData = {
      publicKey,
      amount,
      duration,
      startTime: Date.now(),
      apy: 0.05, // 5% APY
      expectedReturn: amount * 0.05 * (duration === '30d' ? 1/12 : duration === '90d' ? 0.25 : 1),
      status: 'active'
    };
    
    const stakes = JSON.parse(localStorage.getItem('ct_token_stakes') || '[]');
    stakes.push(stakingData);
    localStorage.setItem('ct_token_stakes', JSON.stringify(stakes));
    
    return stakingData;
  }

  // Get user's active stakes
  getActiveStakes(publicKey) {
    try {
      const stakes = JSON.parse(localStorage.getItem('ct_token_stakes') || '[]');
      return stakes.filter(stake => 
        stake.publicKey === publicKey && 
        stake.status === 'active'
      );
    } catch (error) {
      console.error('Error getting active stakes:', error);
      return [];
    }
  }

  // NFT Integration hooks (for pet NFTs)
  async simulatePetNFTMint(publicKey, petData) {
    const nftData = {
      id: `nft_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      owner: publicKey,
      petData: {
        species: petData.species,
        rarity: petData.rarity,
        level: petData.level || 1,
        stats: petData.stats,
        birthdate: Date.now(),
        traits: petData.traits || {}
      },
      metadata: {
        name: `${petData.species} #${Math.floor(Math.random() * 10000)}`,
        description: `A ${petData.rarity} ${petData.species} from Crypto Tamagotchi`,
        image: `https://api.cryptotama.game/pet-images/${petData.species}/${petData.rarity}.png`,
        attributes: [
          { trait_type: 'Species', value: petData.species },
          { trait_type: 'Rarity', value: petData.rarity },
          { trait_type: 'Level', value: petData.level || 1 },
          { trait_type: 'HP', value: petData.stats?.hp || 100 },
          { trait_type: 'Attack', value: petData.stats?.attack || 15 },
          { trait_type: 'Defense', value: petData.stats?.defense || 10 },
          { trait_type: 'Speed', value: petData.stats?.speed || 12 }
        ]
      },
      mintTime: Date.now(),
      txId: `mint_${Math.random().toString(36).substring(7)}`
    };
    
    // Store NFT data
    const nfts = JSON.parse(localStorage.getItem('ct_pet_nfts') || '[]');
    nfts.push(nftData);
    localStorage.setItem('ct_pet_nfts', JSON.stringify(nfts));
    
    return nftData;
  }

  // Get user's pet NFTs
  getUserPetNFTs(publicKey) {
    try {
      const nfts = JSON.parse(localStorage.getItem('ct_pet_nfts') || '[]');
      return nfts.filter(nft => nft.owner === publicKey);
    } catch (error) {
      console.error('Error getting pet NFTs:', error);
      return [];
    }
  }

  // Marketplace simulation (for trading pet NFTs)
  async createMarketplaceListing(publicKey, nftId, price) {
    const listing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      seller: publicKey,
      nftId,
      price,
      currency: 'TAMA', // Custom token
      status: 'active',
      createdAt: Date.now()
    };
    
    const listings = JSON.parse(localStorage.getItem('ct_marketplace_listings') || '[]');
    listings.push(listing);
    localStorage.setItem('ct_marketplace_listings', JSON.stringify(listings));
    
    return listing;
  }

  // Get marketplace listings
  getMarketplaceListings(limit = 20) {
    try {
      const listings = JSON.parse(localStorage.getItem('ct_marketplace_listings') || '[]');
      return listings
        .filter(listing => listing.status === 'active')
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting marketplace listings:', error);
      return [];
    }
  }
}

// Singleton instance
export const solanaTokens = new SolanaTokenIntegration();
export default solanaTokens;