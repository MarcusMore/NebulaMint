import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Mint from './pages/Mint';
import Metrics from './pages/Metrics';
import Gallery from './pages/Gallery';
import Whitepaper from './pages/Whitepaper';
import { 
  connectWallet, 
  disconnectWallet, 
  getCurrentAddress, 
  getBalance,
  isWalletInstalled,
  onAccountsChanged,
  onChainChanged
} from './services/arcWallet';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);

  // Function to load wallet balance
  const loadBalance = async (address: string) => {
    try {
      const balance = await getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
      setWalletBalance(null);
    }
  };

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      if (isWalletInstalled()) {
        const address = await getCurrentAddress();
        if (address) {
          setWalletAddress(address);
          await loadBalance(address);
        }
      }
    };
    checkWallet();
    
    // Listen for account changes
    const cleanupAccounts = onAccountsChanged(async (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await loadBalance(accounts[0]);
      } else {
        setWalletAddress(null);
        setWalletBalance(null);
      }
    });
    
    // Listen for chain changes
    const cleanupChain = onChainChanged(() => {
      window.location.reload();
    });
    
    return () => {
      cleanupAccounts();
      cleanupChain();
    };
  }, []);

  // Wallet Connection Handlers
  const handleConnectWallet = useCallback(async () => {
    if (!isWalletInstalled()) {
      alert('Please install MetaMask or another Web3 wallet to continue.');
      window.open('https://metamask.io/', '_blank');
      return;
    }
    
    setIsConnectingWallet(true);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await loadBalance(address);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnectingWallet(false);
    }
  }, []);

  const handleDisconnectWallet = useCallback(() => {
    disconnectWallet();
    setWalletAddress(null);
    setWalletBalance(null);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-brand-500 selection:text-white">
      <Navbar
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isConnecting={isConnectingWallet}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />
      
      <Routes>
        <Route path="/" element={<Mint />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/whitepaper" element={<Whitepaper />} />
      </Routes>
    </div>
  );
};

export default App;
