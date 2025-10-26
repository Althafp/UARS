"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { ReputationScore, UserProfile } from '@/lib/types';

interface TwitterProfile {
  username: string;
  displayName: string;
  profileImage: string;
  id: string;
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  reputation: ReputationScore | null;
  twitterProfile: TwitterProfile | null;
  isTwitterConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  connectTwitter: () => Promise<void>;
  disconnectTwitter: () => void;
  refreshReputation: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [twitterProfile, setTwitterProfile] = useState<TwitterProfile | null>(null);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('uars_wallet_address');
    const savedTwitterProfile = localStorage.getItem('uars_twitter_profile');
    
    console.log('🔍 Checking saved connections:', {
      hasWallet: !!savedAddress,
      hasTwitter: !!savedTwitterProfile,
      twitterData: savedTwitterProfile
    });
    
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      fetchReputation(savedAddress);
    }
    
    if (savedTwitterProfile) {
      try {
        const profile = JSON.parse(savedTwitterProfile);
        console.log('✅ Loaded Twitter profile:', profile);
        setTwitterProfile(profile);
        setIsTwitterConnected(true);
        
        // Link Twitter to wallet if both are available
        if (savedAddress && profile.username) {
          linkTwitterToWallet(profile.username, savedAddress);
        }
      } catch (error) {
        console.error('❌ Failed to parse saved Twitter profile:', error);
      }
    }
  }, []);

  // Fetch reputation data from API
  const fetchReputation = async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/reputation?address=${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setReputation(data.data.reputationScore);
      }
    } catch (error) {
      console.error('Failed to fetch reputation:', error);
    }
  };

  // Connect wallet
  const connect = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, check if there's a stored address first
      let walletAddress = localStorage.getItem('uars_wallet_address');
      
      if (!walletAddress) {
        // Check if browser has Web3 wallet (MetaMask, etc.)
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({
              method: 'eth_requestAccounts'
            });
            walletAddress = accounts[0];
          } catch (error) {
            console.log('User rejected wallet connection, using demo wallet');
            // For hackathon demo, generate a wallet if user doesn't have one
            const privateKey = generatePrivateKey();
            const account = privateKeyToAccount(privateKey);
            walletAddress = account.address;
          }
        } else {
          // No Web3 wallet detected, use demo wallet
          // Use a fixed demo address for consistent demo experience
          walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
        }
      }

      // Save to localStorage
      localStorage.setItem('uars_wallet_address', walletAddress);
      
      setAddress(walletAddress);
      setIsConnected(true);
      
      // Fetch reputation data
      await fetchReputation(walletAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    localStorage.removeItem('uars_wallet_address');
    setAddress(null);
    setIsConnected(false);
    setReputation(null);
  };

  // Connect Twitter - redirects to OAuth page
  const connectTwitter = async () => {
    // This is handled by direct redirect to /api/auth/twitter/login
    // The callback will store the profile in localStorage and redirect back
    console.log('Twitter OAuth initiated...');
  };

  // Disconnect Twitter
  const disconnectTwitter = () => {
    localStorage.removeItem('uars_twitter_profile');
    setTwitterProfile(null);
    setIsTwitterConnected(false);
  };

  // Link Twitter account to wallet address
  const linkTwitterToWallet = async (username: string, walletAddress: string) => {
    try {
      await fetch('/api/auth/twitter/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, walletAddress }),
      });
    } catch (error) {
      console.error('Failed to link Twitter to wallet:', error);
    }
  };

  // Refresh reputation data
  const refreshReputation = async () => {
    if (address) {
      await fetchReputation(address);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isLoading,
        reputation,
        twitterProfile,
        isTwitterConnected,
        connect,
        disconnect,
        connectTwitter,
        disconnectTwitter,
        refreshReputation,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

