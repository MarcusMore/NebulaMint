import React from 'react';
import { Loader2, Wallet } from 'lucide-react';

interface WalletButtonProps {
  address: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ address, isConnecting, onConnect, onDisconnect }) => {
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (address) {
    return (
      <button
        onClick={onDisconnect}
        className="flex items-center gap-2 bg-brand-900 border border-brand-500/30 text-brand-100 px-4 py-2 rounded-full font-medium hover:bg-brand-800 transition-colors text-sm"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {formatAddress(address)}
      </button>
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