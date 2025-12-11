import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ExternalLink,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Grid3x3,
  Wallet
} from 'lucide-react';
import { getRecentMints, MintEvent } from '../services/nftContract';
import { getIPFSGatewayURL, fetchFromIPFS } from '../services/ipfsStorage';
import { hasUserLiked, toggleLike as toggleLikeOnChain, getCurrentAddress } from '../services/nftLikes';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const EXPLORER_URL = 'https://testnet.arcscan.app';

interface NFTData extends MintEvent {
  imageURL: string | null;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  } | null;
  liked: boolean;
}

const Gallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isTogglingLike, setIsTogglingLike] = useState<string | null>(null);

  // Load user address
  useEffect(() => {
    const loadUserAddress = async () => {
      try {
        const address = await getCurrentAddress();
        setUserAddress(address);
      } catch (error) {
        console.error('Error loading user address:', error);
      }
    };
    loadUserAddress();
  }, []);

  const toggleLike = async (tokenId: string) => {
    if (isTogglingLike) return; // Prevent double-clicks
    
    setIsTogglingLike(tokenId);
    
    try {
      // Toggle like (on-chain or localStorage fallback)
      const result = await toggleLikeOnChain(tokenId);
      
      if (result.success) {
        // Update the NFT in the list
        if (userAddress) {
          const liked = await hasUserLiked(tokenId, userAddress);
          setNfts(prevNfts =>
            prevNfts.map(nft =>
              nft.tokenId === tokenId
                ? { ...nft, liked }
                : nft
            )
          );
        } else {
          // For localStorage fallback, also update liked status
          const storageKey = 'nft_likes';
          const savedLikes = localStorage.getItem(storageKey);
          let liked = false;
          if (savedLikes) {
            try {
              const likes: string[] = JSON.parse(savedLikes);
              liked = likes.includes(tokenId);
            } catch {}
          }
          
          setNfts(prevNfts =>
            prevNfts.map(nft =>
              nft.tokenId === tokenId
                ? { ...nft, liked }
                : nft
            )
          );
        }
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      alert(error.message || 'Failed to toggle like. Please try again.');
    } finally {
      setIsTogglingLike(null);
    }
  };

  const fetchNFTMetadata = async (mint: MintEvent): Promise<NFTData> => {
    let imageURL: string | null = null;
    let metadata: any = null;

    if (mint.tokenURI) {
      try {
        console.log(`Fetching metadata for token ${mint.tokenId}: ${mint.tokenURI}`);
        
        // Extract CID from tokenURI
        const cidMatch = mint.tokenURI.match(/^ipfs:\/\/([^/]+)/);
        const cid = cidMatch ? cidMatch[1] : null;
        
        // Try different path variations
        const pathVariations: string[] = [];
        if (cid) {
          // Try just the CID first (most common)
          pathVariations.push(`ipfs://${cid}`);
          // Try with /metadata.json
          pathVariations.push(`ipfs://${cid}/metadata.json`);
          // Try original path
          if (mint.tokenURI !== `ipfs://${cid}` && mint.tokenURI !== `ipfs://${cid}/metadata.json`) {
            pathVariations.push(mint.tokenURI);
          }
        } else {
          pathVariations.push(mint.tokenURI);
        }
        
        // Try each path variation
        for (const path of pathVariations) {
          try {
            console.log(`  Trying path: ${path}`);
            const response = await fetchFromIPFS(path);
            
            if (response && response.ok) {
              metadata = await response.json();
              console.log(`  Metadata found:`, metadata);
              
              const imgURL = metadata.image || null;
              
              if (imgURL) {
                if (imgURL.startsWith('ipfs://')) {
                  imageURL = getIPFSGatewayURL(imgURL);
                  console.log(`  Image URL (IPFS): ${imageURL}`);
                } else if (imgURL.startsWith('http')) {
                  imageURL = imgURL;
                  console.log(`  Image URL (HTTP): ${imageURL}`);
                } else {
                  // Relative path - try to construct from CID
                  if (cid) {
                    const baseURL = getIPFSGatewayURL(`ipfs://${cid}`);
                    imageURL = `${baseURL}/${imgURL}`;
                    console.log(`  Image URL (relative): ${imageURL}`);
                  }
                }
              } else {
                console.warn(`  No image URL in metadata`);
              }
              
              // Found metadata, break out of loop
              break;
            } else if (response) {
              console.warn(`  Failed to fetch ${path}: ${response.status}`);
            }
          } catch (error) {
            console.warn(`  Error fetching ${path}:`, error);
            continue;
          }
        }
        
        if (!metadata) {
          console.warn(`  Could not fetch metadata for token ${mint.tokenId}`);
        }
      } catch (error) {
        console.error(`Error fetching metadata for token ${mint.tokenId}:`, error);
      }
    } else {
      console.warn(`No tokenURI for token ${mint.tokenId}`);
    }

    // Like data will be fetched in batch later
    return {
      ...mint,
      imageURL,
      metadata,
      liked: false, // Will be set in loadNFTs
    };
  };

  const loadNFTs = async () => {
    if (!CONTRACT_ADDRESS) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      console.log('Loading NFTs from contract:', CONTRACT_ADDRESS);
      
      const mints = await getRecentMints(CONTRACT_ADDRESS, 50); // Load more NFTs for gallery
      console.log(`Found ${mints.length} NFTs`);

      // Fetch metadata for all NFTs
      const nftData = await Promise.all(
        mints.map(mint => fetchNFTMetadata(mint))
      );

      // Fetch user likes for all NFTs
      const tokenIds = mints.map(m => m.tokenId);
      // Check both on-chain (if contract configured) and localStorage (fallback)
      const userLikes: Record<string, boolean> = {};
      
      // Always check likes (works with or without wallet connection for localStorage)
      await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            // If user is connected, check on-chain or localStorage
            // If user not connected, check localStorage only (for fallback mode)
            if (userAddress) {
              userLikes[tokenId] = await hasUserLiked(tokenId, userAddress);
            } else {
              // Check localStorage for fallback mode
              const likesKey = 'nft_likes';
              const savedLikes = localStorage.getItem(likesKey);
              if (savedLikes) {
                try {
                  const likes: string[] = JSON.parse(savedLikes);
                  userLikes[tokenId] = likes.includes(tokenId);
                } catch {
                  userLikes[tokenId] = false;
                }
              } else {
                userLikes[tokenId] = false;
              }
            }
          } catch (error) {
            console.error(`Error checking like for token ${tokenId}:`, error);
            // Fallback to localStorage check
            try {
              const likesKey = 'nft_likes';
              const savedLikes = localStorage.getItem(likesKey);
              if (savedLikes) {
                const likes: string[] = JSON.parse(savedLikes);
                userLikes[tokenId] = likes.includes(tokenId);
              } else {
                userLikes[tokenId] = false;
              }
            } catch {
              userLikes[tokenId] = false;
            }
          }
        })
      );

      // Update NFTs with like data
      const updatedNftData = nftData.map(nft => ({
        ...nft,
        liked: userLikes[nft.tokenId] || false,
      }));

      setNfts(updatedNftData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  // Load NFTs on mount and when user address changes
  useEffect(() => {
    loadNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]); // Reload when user address changes or component mounts

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
                <Grid3x3 className="text-brand-500" />
                NFT Gallery
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Browse and interact with minted NFTs
              </p>
            </div>
            <button
              onClick={loadNFTs}
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-2">No NFTs found</p>
            <p className="text-gray-600 text-sm">Be the first to mint an NFT!</p>
          </div>
        ) : !userAddress ? (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Connect your wallet to like NFTs</p>
            <p className="text-gray-600 text-sm">You can still view NFTs, but need to connect to interact</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.tokenId}
                className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden hover:border-brand-500/50 transition-all group"
              >
                {/* NFT Image */}
                <div className="relative aspect-square bg-dark-900 overflow-hidden">
                  {nft.imageURL ? (
                    <>
                      <img
                        src={nft.imageURL}
                        alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error(`Failed to load image for token ${nft.tokenId}: ${nft.imageURL}`);
                          // Hide the image and show placeholder
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const placeholder = img.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          // Hide placeholder when image loads
                          const placeholder = document.querySelector(`.image-placeholder-${nft.tokenId}`) as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'none';
                          }
                        }}
                      />
                      <div className={`image-placeholder image-placeholder-${nft.tokenId} absolute inset-0 w-full h-full flex items-center justify-center bg-dark-900`} style={{ display: 'none' }}>
                        <ImageIcon className="w-16 h-16 text-gray-600" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-900">
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">No image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Like Button */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-dark-900/80 backdrop-blur-sm rounded-full p-2">
                      <button
                        onClick={() => toggleLike(nft.tokenId)}
                        disabled={isTogglingLike === nft.tokenId || nft.liked}
                        className={`transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          nft.liked
                            ? 'text-red-500 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                        title={nft.liked ? 'Already liked' : !userAddress ? 'Connect wallet to like' : 'Like'}
                      >
                        {isTogglingLike === nft.tokenId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={`w-4 h-4 ${nft.liked ? 'fill-current' : ''}`} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white mb-1">
                        {nft.metadata?.name || `NFT #${nft.tokenId}`}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        Token #{nft.tokenId}
                      </p>
                    </div>
                  </div>

                  {nft.metadata?.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {nft.metadata.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Owner: {formatAddress(nft.to)}</span>
                    <span>{formatDate(nft.timestamp)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`${EXPLORER_URL}/tx/${nft.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 bg-dark-700 hover:bg-dark-600 px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      View Transaction <ExternalLink className="w-3 h-3" />
                    </a>
                    {nft.imageURL && (
                      <a
                        href={nft.imageURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                        title="View Full Image"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;

