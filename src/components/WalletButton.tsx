import React from 'react';
import { Loader2, Wallet } from 'lucide-react';

interface WalletButtonProps {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ address, balance, isConnecting, onConnect, onDisconnect }) => {
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatBalance = (bal: string | null): string => {
    if (!bal) return '0.00';
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    if (num === 0) return '0.00';
    if (num < 0.01) return '< 0.01';
    
    // Format with appropriate decimal places
    // For large numbers, show fewer decimals
    if (num >= 1000) {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    return num.toFixed(2);
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        {balance !== null && (
          <div className="bg-dark-800 border border-dark-700 px-3 py-2 rounded-full text-sm">
            <span className="text-gray-400">USDC:</span>
            <span className="text-white font-semibold ml-1">{formatBalance(balance)}</span>
          </div>
        )}
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 bg-brand-900 border border-brand-500/30 text-brand-100 px-4 py-2 rounded-full font-medium hover:bg-brand-800 transition-colors text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {formatAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default WalletButton;

