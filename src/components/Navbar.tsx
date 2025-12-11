import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BarChart3, Grid3x3, FileText } from 'lucide-react';
import WalletButton from './WalletButton';

interface NavbarProps {
  walletAddress: string | null;
  walletBalance: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  walletAddress,
  walletBalance,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  const location = useLocation();

  return (
    <nav className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Nebula<span className="text-brand-500">Mint</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-dark-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              Mint
            </Link>
            <Link
              to="/gallery"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/gallery'
                  ? 'bg-dark-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Gallery
            </Link>
            <Link
              to="/metrics"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/metrics'
                  ? 'bg-dark-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Metrics
            </Link>
            <Link
              to="/whitepaper"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/whitepaper'
                  ? 'bg-dark-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Whitepaper
            </Link>
          </div>
        </div>
        
        <WalletButton 
          address={walletAddress} 
          balance={walletBalance}
          isConnecting={isConnecting}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </nav>
  );
};

export default Navbar;

