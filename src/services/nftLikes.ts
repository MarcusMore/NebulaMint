import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { getSigner, getProvider } from './arcWallet';

/**
 * NFT Likes Contract Service
 * Interacts with the NFTLikes smart contract on Arc Testnet
 */

// Contract ABI
export const NFT_LIKES_ABI = [
  'function like(uint256 tokenId) public',
  'function toggleLike(uint256 tokenId) public',
  'function getLikeCount(uint256 tokenId) public view returns (uint256)',
  'function hasUserLiked(address user, uint256 tokenId) public view returns (bool)',
  'function getLikeCounts(uint256[] memory tokenIds) public view returns (uint256[])',
  'event NFTLiked(address indexed user, uint256 indexed tokenId, bool liked)',
] as const;

// Contract address - will be set after deployment
const LIKES_CONTRACT_ADDRESS = import.meta.env.VITE_LIKES_CONTRACT_ADDRESS || '';

/**
 * Get read-only provider for likes contract
 */
const getReadOnlyProvider = (): JsonRpcProvider => {
  const rpcUrl = import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  return new JsonRpcProvider(rpcUrl);
};

/**
 * Get the likes contract instance (read-only)
 */
export const getLikesContractReadOnly = (): Contract | null => {
  if (!LIKES_CONTRACT_ADDRESS) {
    console.warn('Likes contract address not configured');
    return null;
  }
  const provider = getReadOnlyProvider();
  return new Contract(LIKES_CONTRACT_ADDRESS, NFT_LIKES_ABI, provider);
};

/**
 * Get the likes contract instance (with signer for write operations)
 */
export const getLikesContract = async (): Promise<Contract | null> => {
  if (!LIKES_CONTRACT_ADDRESS) {
    console.warn('Likes contract address not configured');
    return null;
  }
  try {
    const signer = await getSigner();
    return new Contract(LIKES_CONTRACT_ADDRESS, NFT_LIKES_ABI, signer);
  } catch (error) {
    console.error('Error getting signer for likes contract:', error);
    return null;
  }
};

/**
 * Get like count for an NFT
 * Always fetches from contract (on-chain) so all users see the same count
 * Returns 0 if contract not configured or if fetch fails
 */
export const getLikeCount = async (tokenId: string): Promise<number> => {
  // Always try to fetch from contract first (even if not configured, try anyway)
  if (!LIKES_CONTRACT_ADDRESS) {
    console.warn('Likes contract not configured. Like counts will be 0. Deploy contract to enable shared counts.');
    return 0;
  }
  
  try {
    const contract = getLikesContractReadOnly();
    if (!contract) {
      console.warn('Could not get likes contract. Like counts will be 0.');
      return 0;
    }
    
    const count = await contract.getLikeCount(tokenId);
    return Number(count.toString());
  } catch (error) {
    console.error(`Error getting like count for token ${tokenId}:`, error);
    // Don't fallback to localStorage - return 0 so all users see the same (0)
    return 0;
  }
};

/**
 * Get like counts for multiple NFTs
 * Always fetches from contract (on-chain) so all users see the same counts
 * Returns zeros if contract not configured or if fetch fails
 */
export const getLikeCounts = async (tokenIds: string[]): Promise<Record<string, number>> => {
  // Always try to fetch from contract first (even if not configured, try anyway)
  if (!LIKES_CONTRACT_ADDRESS) {
    console.warn('Likes contract not configured. Like counts will be 0. Deploy contract to enable shared counts.');
    return tokenIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  }
  
  try {
    const contract = getLikesContractReadOnly();
    if (!contract) {
      console.warn('Could not get likes contract. Like counts will be 0.');
      return tokenIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
    }
    
    const tokenIdsBigInt = tokenIds.map(id => BigInt(id));
    const counts = await contract.getLikeCounts(tokenIdsBigInt);
    
    const result: Record<string, number> = {};
    tokenIds.forEach((id, index) => {
      result[id] = Number(counts[index].toString());
    });
    
    return result;
  } catch (error) {
    console.error('Error getting like counts:', error);
    // Don't fallback to localStorage - return zeros so all users see the same (0)
    return tokenIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  }
};

/**
 * Check if current user has liked an NFT
 * Falls back to localStorage if contract not configured
 */
export const hasUserLiked = async (tokenId: string, userAddress?: string): Promise<boolean> => {
  // Check if contract is configured
  if (!LIKES_CONTRACT_ADDRESS) {
    // Fallback to localStorage
    const storageKey = 'nft_likes';
    const savedLikes = localStorage.getItem(storageKey);
    if (savedLikes) {
      try {
        const likes: string[] = JSON.parse(savedLikes);
        return likes.includes(tokenId);
      } catch {
        return false;
      }
    }
    return false;
  }
  
  try {
    const contract = getLikesContractReadOnly();
    if (!contract) {
      // Fallback to localStorage
      const storageKey = 'nft_likes';
      const savedLikes = localStorage.getItem(storageKey);
      if (savedLikes) {
        try {
          const likes: string[] = JSON.parse(savedLikes);
          return likes.includes(tokenId);
        } catch {
          return false;
        }
      }
      return false;
    }
    
    let address = userAddress;
    if (!address) {
      try {
        const signer = await getSigner();
        address = await signer.getAddress();
      } catch {
        // Fallback to localStorage if can't get address
        const storageKey = 'nft_likes';
        const savedLikes = localStorage.getItem(storageKey);
        if (savedLikes) {
          try {
            const likes: string[] = JSON.parse(savedLikes);
            return likes.includes(tokenId);
          } catch {
            return false;
          }
        }
        return false;
      }
    }
    
    if (!address) return false;
    
    const liked = await contract.hasUserLiked(address, tokenId);
    return liked;
  } catch (error) {
    console.error(`Error checking if user liked token ${tokenId}:`, error);
    // Fallback to localStorage
    const storageKey = 'nft_likes';
    const savedLikes = localStorage.getItem(storageKey);
    if (savedLikes) {
      try {
        const likes: string[] = JSON.parse(savedLikes);
        return likes.includes(tokenId);
      } catch {
        return false;
      }
    }
    return false;
  }
};

/**
 * Get current user address
 */
export const getCurrentAddress = async (): Promise<string | null> => {
  try {
    const signer = await getSigner();
    return await signer.getAddress();
  } catch {
    return null;
  }
};

/**
 * Toggle like for an NFT
 * Falls back to localStorage if contract not configured
 * Prevents double-liking (one like per user)
 */
export const toggleLike = async (tokenId: string): Promise<{ success: boolean; newCount: number }> => {
  // Check if contract is configured
  if (!LIKES_CONTRACT_ADDRESS) {
    // Fallback to localStorage
    console.warn('Likes contract not configured, using localStorage fallback');
    return toggleLikeLocalStorage(tokenId);
  }
  
  try {
    const contract = await getLikesContract();
    if (!contract) {
      // Fallback to localStorage
      console.warn('Could not get likes contract, using localStorage fallback');
      return toggleLikeLocalStorage(tokenId);
    }
    
    // Get user address to check if already liked
    let userAddress: string | null = null;
    try {
      const signer = await getSigner();
      userAddress = await signer.getAddress();
    } catch {
      // If can't get address, fallback to localStorage
      console.warn('Could not get user address, using localStorage fallback');
      return toggleLikeLocalStorage(tokenId);
    }
    
    // Check if user already liked (prevent double-liking)
    if (userAddress) {
      const alreadyLiked = await hasUserLiked(tokenId, userAddress);
      if (alreadyLiked) {
        // User already liked, just return current count
        const currentCount = await getLikeCount(tokenId);
        return { success: true, newCount: currentCount };
      }
    }
    
    // Send transaction to like (use like() function, fallback to toggleLike())
    let tx;
    try {
      tx = await contract.like(tokenId);
    } catch {
      // Fallback to toggleLike if like() doesn't exist (backward compatibility)
      tx = await contract.toggleLike(tokenId);
    }
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    // Get updated count
    const newCount = await getLikeCount(tokenId);
    
    return { success: true, newCount };
  } catch (error: any) {
    console.error('Error toggling like on-chain:', error);
    
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('Transaction was rejected by user.');
    }
    
    // If error is "already liked", return current count
    if (error.message?.includes('already liked') || error.message?.includes('NFT already liked')) {
      const currentCount = await getLikeCount(tokenId);
      return { success: true, newCount: currentCount };
    }
    
    // Fallback to localStorage on error
    console.warn('Falling back to localStorage for likes');
    return toggleLikeLocalStorage(tokenId);
  }
};

/**
 * Toggle like using localStorage (fallback)
 * Prevents double-liking (one like per user)
 */
/**
 * Toggle like using localStorage (fallback)
 * Prevents double-liking (one like per user)
 * Note: Counts are NOT stored in localStorage - only user's liked status
 * Counts must come from the contract for all users to see the same numbers
 */
const toggleLikeLocalStorage = (tokenId: string): { success: boolean; newCount: number } => {
  try {
    const likesKey = 'nft_likes';
    
    // Get current likes (only for user's personal status)
    const savedLikes = localStorage.getItem(likesKey);
    const likes: string[] = savedLikes ? JSON.parse(savedLikes) : [];
    
    const isLiked = likes.includes(tokenId);
    
    // Prevent double-liking: if already liked, return 0 (counts come from contract)
    if (isLiked) {
      // Counts should come from contract, but if contract not deployed, return 0
      return { success: true, newCount: 0 };
    }
    
    // Like: add to likes (one-time only)
    // Note: We don't store counts in localStorage - counts must come from contract
    const newLikes = [...likes, tokenId];
    localStorage.setItem(likesKey, JSON.stringify(newLikes));
    
    // Return 0 as count - actual counts should come from contract
    // The UI will refresh and fetch the real count from contract
    return { success: true, newCount: 0 };
  } catch (error) {
    console.error('Error in localStorage fallback:', error);
    throw new Error('Failed to toggle like');
  }
};

