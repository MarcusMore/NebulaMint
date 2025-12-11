import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getRecentMints,
  MintEvent 
} from '../services/nftContract';
import { getCurrentAddress } from '../services/arcWallet';
import { getIPFSGatewayURL, fetchFromIPFS } from '../services/ipfsStorage';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const EXPLORER_URL = 'https://testnet.arcscan.app';

interface MetricsData {
  recentMints: MintEvent[];
  loading: boolean;
  lastUpdated: Date | null;
}

const Metrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    recentMints: [],
    loading: true,
    lastUpdated: null,
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nftImages, setNftImages] = useState<Record<string, string>>({});

  const loadMetrics = async () => {
    if (!CONTRACT_ADDRESS) {
      setMetrics(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setRefreshing(true);
      
      console.log('Loading metrics for contract:', CONTRACT_ADDRESS);
      
      // Load metrics with individual error handling to prevent one failure from breaking all
      const [mints, address] = await Promise.allSettled([
        getRecentMints(CONTRACT_ADDRESS, 20),
        getCurrentAddress().catch(() => null),
      ]);

      const mintsValue = mints.status === 'fulfilled' ? mints.value : [];
      const addressValue = address.status === 'fulfilled' ? address.value : null;

      // Log any failures
      if (mints.status === 'rejected') {
        console.error('Failed to load recent mints:', mints.reason);
      }

      console.log('Metrics loaded:', { mints: mintsValue.length });

      setMetrics({
        recentMints: mintsValue,
        loading: false,
        lastUpdated: new Date(),
      });
      
      setWalletAddress(addressValue);

      // Fetch NFT image URLs from metadata
      const imageMap: Record<string, string> = {};
      await Promise.all(
        mintsValue.map(async (mint) => {
          if (mint.tokenURI) {
            try {
              const imageURL = await getNFTImageURL(mint.tokenURI);
              if (imageURL) {
                imageMap[mint.tokenId] = imageURL;
              }
            } catch (error) {
              console.error(`Error fetching image for token ${mint.tokenId}:`, error);
            }
          }
        })
      );
      setNftImages(imageMap);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics(prev => ({ ...prev, loading: false }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 60 seconds (reduced from 30 to avoid rate limits)
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getNFTImageURL = async (tokenURI: string): Promise<string | null> => {
    try {
      if (!tokenURI || tokenURI === '') {
        console.warn('Empty tokenURI');
        return null;
      }
      
      // If it's already a gateway URL, return it
      if (tokenURI.startsWith('http')) {
        return tokenURI;
      }
      
      console.log(`Fetching NFT metadata from IPFS: ${tokenURI}`);
      
      // Try different path formats if the first one fails
      const pathVariations: string[] = [];
      
      // Extract CID from tokenURI
      const cidMatch = tokenURI.match(/^ipfs:\/\/([^/]+)/);
      const cid = cidMatch ? cidMatch[1] : null;
      
      if (cid) {
        // Try just the CID first (most common case - file is at CID root)
        pathVariations.push(`ipfs://${cid}`);
        
        // Try with /metadata.json
        pathVariations.push(`ipfs://${cid}/metadata.json`);
        
        // Try original path (in case it's different)
        if (tokenURI !== `ipfs://${cid}` && tokenURI !== `ipfs://${cid}/metadata.json`) {
          pathVariations.push(tokenURI);
        }
      } else {
        // Fallback to original
        pathVariations.push(tokenURI);
      }
      
      // Try each path variation
      for (const path of pathVariations) {
        console.log(`  Trying path: ${path}`);
        const response = await fetchFromIPFS(path);
        
        if (response && response.ok) {
          try {
            const metadata = await response.json();
            const imageURL = metadata.image || null;
            
            if (!imageURL) {
              console.warn('No image URL found in metadata');
              continue; // Try next variation
            }
            
            console.log(`  Found image URL: ${imageURL}`);
            
            // If image URL is IPFS, convert it to gateway URL
            if (imageURL.startsWith('ipfs://')) {
              const gatewayURL = getIPFSGatewayURL(imageURL);
              console.log(`  Converted to gateway: ${gatewayURL}`);
              return gatewayURL;
            }
            
            // If it's already a full URL, return it
            if (imageURL.startsWith('http')) {
              return imageURL;
            }
            
            // If it's a relative path, try to construct full URL from CID
            if (cidMatch) {
              const baseURL = getIPFSGatewayURL(`ipfs://${cidMatch[1]}`);
              return `${baseURL}/${imageURL}`;
            }
          } catch (parseError) {
            console.warn(`  Failed to parse metadata from ${path}:`, parseError);
            continue; // Try next variation
          }
        } else if (response) {
          console.warn(`  Failed to fetch ${path}: ${response.status} ${response.statusText}`);
        }
      }
      
      console.warn(`Failed to fetch metadata from any path variation for: ${tokenURI}`);
      return null;
    } catch (error: any) {
      console.error('Error fetching NFT image:', error);
      return null;
    }
  };

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Contract address not configured</p>
          <p className="text-gray-600 text-sm">Please set VITE_CONTRACT_ADDRESS in your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white pb-20">
      {/* Header */}
      <div className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="text-brand-500" />
                NFT Metrics
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time statistics and analytics
              </p>
            </div>
            <button
              onClick={loadMetrics}
              disabled={refreshing}
              className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {metrics.loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              {/* Recent Activity */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Recent Mints</h3>
                <p className="text-3xl font-bold text-white">{metrics.recentMints.length}</p>
                <p className="text-gray-500 text-xs mt-2">Last 20 mints</p>
              </div>
            </div>

            {/* Recent Mints Table */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
              <div className="p-6 border-b border-dark-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-brand-500" />
                  Recent Mints
                </h2>
              </div>
              
              {metrics.recentMints.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 mb-2">No mints yet</p>
                  <p className="text-gray-600 text-sm">Be the first to mint an NFT!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Token ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Transaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {metrics.recentMints.map((mint, index) => {
                        const imageURL = nftImages[mint.tokenId] || null;
                        return (
                          <tr key={index} className="hover:bg-dark-900/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-brand-400">#{mint.tokenId}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm text-gray-300">
                                {formatAddress(mint.to)}
                              </span>
                              {walletAddress && mint.to.toLowerCase() === walletAddress.toLowerCase() && (
                                <span className="ml-2 text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {formatDate(mint.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {imageURL ? (
                                <a
                                  href={imageURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-500 hover:text-brand-400 flex items-center gap-1 text-sm transition-colors"
                                  title="View NFT Image"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                  View Image
                                </a>
                              ) : (
                                <span className="text-gray-500 text-sm">Loading...</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={`${EXPLORER_URL}/tx/${mint.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:text-brand-400 flex items-center gap-1 text-sm"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Contract Info */}
            <div className="mt-6 bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-bold mb-4">Contract Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Contract Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-300">
                      {formatAddress(CONTRACT_ADDRESS)}
                    </span>
                    <a
                      href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:text-brand-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {metrics.lastUpdated && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Last Updated</span>
                    <span className="text-gray-300 text-sm">
                      {metrics.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Metrics;

