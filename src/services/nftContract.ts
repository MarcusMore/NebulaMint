import { Contract, parseUnits, formatUnits, Interface, EventLog, JsonRpcProvider } from 'ethers';
import { getSigner, getProvider } from './arcWallet';

/**
 * NFT Contract Service
 * Interacts with the ImageNFT smart contract on Arc Testnet
 */

// Contract ABI
export const IMAGE_NFT_ABI = [
  'function mint(address to, string memory tokenURI) public payable returns (uint256)',
  'function currentTokenId() public view returns (uint256)',
  'function totalSupply() public view returns (uint256)',
  'function tokenURI(uint256 tokenId) public view returns (string memory)',
  'function mintingFee() public view returns (uint256)',
  'event ImageMinted(address indexed to, uint256 indexed tokenId, string tokenURI, uint256 timestamp)',
] as const;

/**
 * Get the contract instance with signer (for write operations)
 */
export const getContract = async (contractAddress: string): Promise<Contract> => {
  const signer = await getSigner();
  return new Contract(contractAddress, IMAGE_NFT_ABI, signer);
};

/**
 * Retry a function with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.status === 429 || error.code === 429 || error.message?.includes('429');
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isLastAttempt) {
        throw error;
      }
      
      if (isRateLimit) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limited (429). Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For other errors, use shorter delay
        const delay = baseDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Max retries exceeded');
};

/**
 * Get a read-only provider (works without wallet connection)
 */
const getReadOnlyProvider = (): JsonRpcProvider => {
  const rpcUrl = import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  return new JsonRpcProvider(rpcUrl);
};

/**
 * Get the contract instance with provider (for read-only operations)
 * This works even without wallet connection
 */
export const getContractReadOnly = (contractAddress: string): Contract => {
  const provider = getReadOnlyProvider();
  return new Contract(contractAddress, IMAGE_NFT_ABI, provider);
};

/**
 * Mint an NFT
 * @param contractAddress Address of the deployed ImageNFT contract
 * @param tokenURI IPFS URI of the NFT metadata
 * @param mintingFee Minting fee in USDC (with 6 decimals)
 * @returns Transaction hash and token ID
 */
export const mintNFT = async (
  contractAddress: string,
  tokenURI: string,
  mintingFee: string = '0'
): Promise<{ txHash: string; tokenId: string }> => {
  try {
    const contract = await getContract(contractAddress);
    const signer = await getSigner();
    const address = await signer.getAddress();
    
    // Convert minting fee to native balance format (18 decimals)
    // Note: On Arc, native USDC (msg.value) uses 18 decimals, while ERC-20 uses 6 decimals
    // The contract compares msg.value (18 decimals) with mintingFee (18 decimals)
    // So we need to convert the fee string to 18 decimals for native balance
    const feeInWei = parseUnits(mintingFee, 18);
    
    // Call the mint function
    const tx = await contract.mint(address, tokenURI, { value: feeInWei });
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Extract token ID from the event
    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'ImageMinted';
      } catch {
        return false;
      }
    });
    
    let tokenId: string;
    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      tokenId = parsed?.args[1].toString() || '0';
    } else {
      // Fallback: get current token ID
      tokenId = (await contract.currentTokenId()).toString();
    }
    
    return {
      txHash: receipt.hash,
      tokenId,
    };
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('Transaction was rejected by user.');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient USDC balance for minting fee.');
    } else if (error.message?.includes('revert')) {
      throw new Error('Transaction failed. Please check your balance and try again.');
    }
    
    throw new Error(`Failed to mint NFT: ${error.message || error}`);
  }
};

/**
 * Get the current minting fee
 * Note: Contract stores fee in 18 decimals (native balance format)
 * We convert to human-readable format for display
 */
export const getMintingFee = async (contractAddress: string): Promise<string> => {
  try {
    const contract = getContractReadOnly(contractAddress);
    const fee = await retryWithBackoff(() => contract.mintingFee());
    // Contract stores fee in 18 decimals (native balance format)
    // formatUnits with 18 decimals gives us the human-readable number
    // Format to 6 decimal places for consistency with USDC display
    const feeHumanReadable = formatUnits(fee, 18);
    return parseFloat(feeHumanReadable).toFixed(6);
  } catch (error: any) {
    if (error.status === 429 || error.code === 429) {
      console.error('Rate limited while getting minting fee');
    }
    console.error('Error getting minting fee:', error);
    return '0';
  }
};

/**
 * Get token URI for a specific token ID
 */
export const getTokenURI = async (
  contractAddress: string,
  tokenId: string
): Promise<string> => {
  try {
    const contract = getContractReadOnly(contractAddress);
    return await contract.tokenURI(tokenId);
  } catch (error) {
    console.error('Error getting token URI:', error);
    throw new Error(`Failed to get token URI: ${error}`);
  }
};

/**
 * Check if contract has code deployed at the address
 */
const hasContractCode = async (contractAddress: string): Promise<{ hasCode: boolean; codeLength: number }> => {
  try {
    const provider = getReadOnlyProvider();
    const code = await retryWithBackoff(() => provider.getCode(contractAddress));
    const hasCode = code !== '0x' && code !== null && code.length > 2;
    const codeLength = code ? code.length : 0;
    console.log(`Contract code check for ${contractAddress}:`, { hasCode, codeLength });
    return { hasCode, codeLength };
  } catch (error: any) {
    if (error.status === 429 || error.code === 429) {
      console.error('Rate limited while checking contract code. Please wait a moment and try again.');
    }
    console.error('Error checking contract code:', error);
    return { hasCode: false, codeLength: 0 };
  }
};

/**
 * Get total supply of minted NFTs
 * Tries totalSupply() first, falls back to currentTokenId() if needed
 */
export const getTotalSupply = async (contractAddress: string): Promise<number> => {
  try {
    if (!contractAddress || contractAddress.trim() === '') {
      console.error('Contract address is empty');
      return 0;
    }
    
    // First, verify the contract has code deployed
    console.log(`Checking contract at address: ${contractAddress}`);
    const codeCheck = await hasContractCode(contractAddress);
    if (!codeCheck.hasCode) {
      console.error(`❌ No contract code found at address: ${contractAddress}`);
      console.error(`   Code length: ${codeCheck.codeLength} bytes`);
      console.error('This usually means:');
      console.error('  1. The contract has not been deployed yet');
      console.error('  2. The contract address in .env is incorrect');
      console.error('  3. You are connected to the wrong network');
      console.error(`  4. Verify on explorer: https://testnet.arcscan.app/address/${contractAddress}`);
      return 0;
    }
    
    console.log(`✅ Contract code found at ${contractAddress} (${codeCheck.codeLength} bytes)`);
    console.log(`   Attempting to call totalSupply()...`);
    const contract = getContractReadOnly(contractAddress);
    
    // Try totalSupply() first
    try {
      console.log(`   Calling totalSupply()...`);
      const supply = await retryWithBackoff(() => contract.totalSupply());
      const supplyNumber = Number(supply.toString());
      console.log(`✅ Total supply fetched successfully: ${supplyNumber}`);
      return supplyNumber;
    } catch (totalSupplyError: any) {
      // Check if it's a rate limit error
      if (totalSupplyError.status === 429 || totalSupplyError.code === 429) {
        console.error('❌ Rate limited (429). Please wait a moment and refresh the page.');
        return 0;
      }
      
      // Fallback to currentTokenId() if totalSupply() fails
      console.warn(`⚠️ totalSupply() failed:`, totalSupplyError.message || totalSupplyError);
      console.log(`   Trying currentTokenId() as fallback...`);
      try {
        const currentId = await retryWithBackoff(() => contract.currentTokenId());
        const currentIdNumber = Number(currentId.toString());
        console.log(`✅ Total supply (via currentTokenId) fetched: ${currentIdNumber}`);
        return currentIdNumber;
      } catch (currentIdError: any) {
        if (currentIdError.status === 429 || currentIdError.code === 429) {
          console.error('❌ Rate limited (429). Please wait a moment and refresh the page.');
          return 0;
        }
        console.error('❌ Both totalSupply() and currentTokenId() failed');
        console.error('   This suggests the contract ABI does not match the deployed contract');
        console.error('');
        console.error('   🔍 DIAGNOSIS:');
        console.error('   The contract exists at this address, but the functions are missing.');
        console.error('   This usually means:');
        console.error('   1. Contract was deployed with OLD/DIFFERENT code');
        console.error('   2. Contract address points to a DIFFERENT contract type');
        console.error('   3. Contract needs to be REDEPLOYED with current code');
        console.error('');
        console.error('   ✅ SOLUTION:');
        console.error('   1. Verify on ArcScan: https://testnet.arcscan.app/address/' + contractAddress);
        console.error('   2. Check if contract has "totalSupply" or "currentTokenId" functions');
        console.error('   3. If missing, redeploy the contract using Foundry');
        console.error('   4. Update VITE_CONTRACT_ADDRESS in .env with new address');
        console.error('');
        console.error('   📋 To redeploy:');
        console.error('   - See DEPLOYMENT.md for instructions');
        console.error('   - Or run: forge create contracts/ImageNFT.sol:ImageNFT --rpc-url $ARC_TESTNET_RPC_URL --private-key $PRIVATE_KEY --constructor-args "ImageNFT" "INFT" "ipfs://" 0');
        throw currentIdError;
      }
    }
  } catch (error: any) {
    console.error('Error getting total supply:', error);
    
    // Provide more specific error information
    if (error.status === 429 || error.code === 429) {
      console.error('❌ Rate limited (429 Too Many Requests)');
      console.error('   The RPC endpoint is rate limiting requests.');
      console.error('   Solutions:');
      console.error('   1. Wait a few seconds and refresh the page');
      console.error('   2. Use a different RPC endpoint (set VITE_ARC_RPC_URL in .env)');
      console.error('   3. Reduce the frequency of metric refreshes');
    } else if (error.code === 'CALL_EXCEPTION') {
      console.error('Contract call failed. Possible reasons:');
      console.error('  1. Contract address is incorrect:', contractAddress);
      console.error('  2. Contract function does not exist');
      console.error('  3. RPC endpoint is not responding correctly');
      console.error('Error details:', error.message || error);
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      console.error('Network error. Check RPC connection.');
    } else if (error.message?.includes('invalid address')) {
      console.error('Invalid contract address format:', contractAddress);
    }
    
    return 0;
  }
};

/**
 * Get owner of a specific token
 */
export const getTokenOwner = async (
  contractAddress: string,
  tokenId: string
): Promise<string> => {
  try {
    const contract = getContractReadOnly(contractAddress);
    return await contract.ownerOf(tokenId);
  } catch (error) {
    console.error('Error getting token owner:', error);
    throw new Error(`Failed to get token owner: ${error}`);
  }
};

/**
 * Get recent mint events
 */
export interface MintEvent {
  tokenId: string;
  to: string;
  tokenURI: string;
  timestamp: number;
  txHash: string;
}

export const getRecentMints = async (
  contractAddress: string,
  limit: number = 20
): Promise<MintEvent[]> => {
  try {
    console.log(`Fetching recent mints from contract: ${contractAddress}`);
    const provider = getReadOnlyProvider();
    const contract = getContractReadOnly(contractAddress);
    
    // Get the current block number with retry
    const currentBlock = await retryWithBackoff(() => provider.getBlockNumber());
    console.log(`Current block: ${currentBlock}`);
    
    // RPC limit: eth_getLogs is limited to 10,000 blocks
    // We'll query in chunks of 9,000 blocks to be safe
    const CHUNK_SIZE = 9000;
    const MAX_BLOCKS_TO_SEARCH = 50000; // Look back up to 50,000 blocks
    const fromBlock = Math.max(0, currentBlock - MAX_BLOCKS_TO_SEARCH);
    
    console.log(`Searching blocks ${fromBlock} to ${currentBlock} in chunks of ${CHUNK_SIZE}`);
    
    // Query in chunks to respect RPC limits
    const filter = contract.filters.ImageMinted();
    const allEvents: any[] = [];
    
    // Start from the most recent blocks and work backwards
    let chunkEnd = currentBlock;
    let chunkStart = Math.max(fromBlock, chunkEnd - CHUNK_SIZE);
    let chunkNumber = 1;
    
    while (chunkStart <= chunkEnd && allEvents.length < limit * 2) {
      // Query this chunk (we get more than limit to ensure we have enough after sorting)
      console.log(`  Querying chunk ${chunkNumber}: blocks ${chunkStart} to ${chunkEnd}`);
      try {
        const chunkEvents = await retryWithBackoff(() => 
          contract.queryFilter(filter, chunkStart, chunkEnd)
        );
        console.log(`    Found ${chunkEvents.length} events in this chunk`);
        allEvents.push(...chunkEvents);
        
        // If we found events and have enough, we can stop early
        if (allEvents.length >= limit) {
          console.log(`  Found enough events (${allEvents.length}), stopping search`);
          break;
        }
      } catch (error: any) {
        console.warn(`  Error querying chunk ${chunkNumber}:`, error.message || error);
        // Continue to next chunk even if this one fails
      }
      
      // Move to next chunk (going backwards)
      chunkEnd = chunkStart - 1;
      chunkStart = Math.max(fromBlock, chunkEnd - CHUNK_SIZE);
      chunkNumber++;
      
      // Safety limit: don't query more than 10 chunks
      if (chunkNumber > 10) {
        console.log(`  Reached chunk limit (10), stopping search`);
        break;
      }
    }
    
    console.log(`Found ${allEvents.length} total mint events across all chunks`);
    
    // Sort by block number (most recent first) and limit
    const sortedEvents = allEvents
      .sort((a, b) => {
        if (a.blockNumber && b.blockNumber) {
          return b.blockNumber - a.blockNumber;
        }
        return 0;
      })
      .slice(0, limit);
    
    console.log(`Processing ${sortedEvents.length} events (limited to ${limit})`);
    
    // Get block timestamps and format events (with retry for block fetching)
    const mintEvents: MintEvent[] = await Promise.all(
      sortedEvents.map(async (event, index) => {
        try {
          const block = await retryWithBackoff(() => provider.getBlock(event.blockNumber || 0));
          const args = event.args as any;
          const mintEvent: MintEvent = {
            tokenId: args[1]?.toString() || '0',
            to: args[0] || '',
            tokenURI: args[2] || '',
            timestamp: block?.timestamp || 0,
            txHash: event.transactionHash || '',
          };
          console.log(`  Event ${index + 1}: Token #${mintEvent.tokenId} minted to ${mintEvent.to.substring(0, 10)}...`);
          return mintEvent;
        } catch (error) {
          console.error(`Error processing event ${index + 1}:`, error);
          // Return a placeholder event if block fetch fails
          const args = event.args as any;
          return {
            tokenId: args[1]?.toString() || '0',
            to: args[0] || '',
            tokenURI: args[2] || '',
            timestamp: 0,
            txHash: event.transactionHash || '',
          };
        }
      })
    );
    
    console.log(`✅ Returning ${mintEvents.length} recent mints`);
    return mintEvents;
  } catch (error: any) {
    if (error.status === 429 || error.code === 429) {
      console.error('❌ Rate limited while getting recent mints');
      return [];
    }
    console.error('❌ Error getting recent mints:', error);
    console.error('   Error details:', error.message || error);
    return [];
  }
};

