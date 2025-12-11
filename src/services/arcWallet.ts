import { BrowserProvider, JsonRpcSigner, Eip1193Provider, formatUnits, Contract } from 'ethers';

/**
 * Arc Network Wallet Service
 * Based on Arc Network documentation: https://docs.arc.network/arc/references/connect-to-arc
 */

// Arc Testnet configuration (Chain ID: 5042002)
// Based on official Arc docs: https://docs.arc.network/arc/references/connect-to-arc
// Note: MetaMask requires 18 decimals for nativeCurrency, but Arc uses USDC with 6 decimals
// We set 18 here to pass MetaMask validation, but contract interactions use 6 decimals
export const ARC_NETWORK = {
  chainId: '0x4D0A2A', // 5042002 in decimal
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18, // MetaMask requires 18, but actual USDC on Arc has 6 decimals
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
} as const;

// USDC ERC-20 contract address on Arc Testnet
// Source: https://docs.arc.network/arc/references/contract-addresses
export const USDC_CONTRACT_ADDRESS = '0x3600000000000000000000000000000000000000';

// USDC ERC-20 ABI (minimal - just balanceOf)
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
] as const;

let provider: BrowserProvider | null = null;
let signer: JsonRpcSigner | null = null;

/**
 * Check if a Web3 wallet is installed
 */
export const isWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
};

/**
 * Connect to wallet and switch to Arc Testnet
 */
export const connectWallet = async (): Promise<string> => {
  if (!isWalletInstalled()) {
    throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
  }

  const ethereum = (window as any).ethereum as Eip1193Provider;
  
  try {
    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    // Initialize provider and signer
    provider = new BrowserProvider(ethereum);
    signer = await provider.getSigner();
    
    // Switch to Arc Testnet
    await switchToArcNetwork();
    
    const address = await signer.getAddress();
    return address;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request.');
    }
    throw error;
  }
};

/**
 * Switch to Arc Testnet if not already connected
 */
export const switchToArcNetwork = async (): Promise<void> => {
  if (!isWalletInstalled()) {
    throw new Error('No wallet detected.');
  }

  const ethereum = (window as any).ethereum as Eip1193Provider;
  
  try {
    // Check current chain
    const currentChainId = await ethereum.request({ method: 'eth_chainId' });
    
    // Convert to same format for comparison
    const currentChainIdHex = typeof currentChainId === 'string' 
      ? currentChainId.toLowerCase() 
      : `0x${Number(currentChainId).toString(16)}`;
    const targetChainIdHex = ARC_NETWORK.chainId.toLowerCase();
    
    // If already on Arc Testnet (check both possible chain ID formats)
    if (currentChainIdHex === targetChainIdHex || 
        currentChainIdHex === '0x4cef52' || 
        Number(currentChainId) === 5042002) {
      return;
    }

    // Try to switch to Arc Testnet using the correct chain ID
    // Try both possible chain ID formats
    const chainIdsToTry = [ARC_NETWORK.chainId, '0x4cef52'];
    
    let switchSuccess = false;
    for (const chainId of chainIdsToTry) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        switchSuccess = true;
        break;
      } catch (err: any) {
        // If it's not a "chain not found" error, continue to next chain ID
        if (err.code !== 4902 && err.code !== -32603) {
          continue;
        }
      }
    }

    if (switchSuccess) {
      return;
    }

    // If switch failed, try to add the network
    throw { code: 4902 }; // Trigger add network flow
    
  } catch (switchError: any) {
    // Chain not added to wallet (error code 4902) or network already exists with different chain ID
    if (switchError.code === 4902 || switchError.code === -32603 || 
        switchError.message?.includes('same RPC endpoint')) {
      
      // If network already exists, try to find and switch to it
      if (switchError.message?.includes('same RPC endpoint')) {
        // Network exists but with different chain ID - try to switch to existing one
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4cef52' }], // Try the existing chain ID
          });
          return;
        } catch (err: any) {
          // If that fails, user needs to manually switch
          throw new Error(
            'Arc Testnet is already added to your wallet with a different chain ID. ' +
            'Please manually switch to Arc Testnet in MetaMask, or remove the existing network and try again.'
          );
        }
      }

      try {
        // Prepare network params in exact format MetaMask expects
        const networkParams = {
          chainId: ARC_NETWORK.chainId,
          chainName: ARC_NETWORK.chainName,
          nativeCurrency: {
            name: ARC_NETWORK.nativeCurrency.name,
            symbol: ARC_NETWORK.nativeCurrency.symbol,
            decimals: ARC_NETWORK.nativeCurrency.decimals,
          },
          rpcUrls: ARC_NETWORK.rpcUrls,
          blockExplorerUrls: ARC_NETWORK.blockExplorerUrls,
        };

        // Add Arc Testnet to wallet
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkParams],
        });
      } catch (addError: any) {
        console.error('Error adding network:', addError);
        // Provide more detailed error message
        if (addError.code === 4001) {
          throw new Error('User rejected adding Arc Testnet to wallet.');
        }
        if (addError.message?.includes('same RPC endpoint')) {
          throw new Error(
            'Arc Testnet network already exists in your wallet. ' +
            'Please switch to Arc Testnet manually in MetaMask, or remove the existing network first.'
          );
        }
        throw new Error(`Failed to add Arc Testnet to wallet: ${addError.message || 'Unknown error'}`);
      }
    } else if (switchError.code === 4001) {
      // User rejected the switch
      throw new Error('User rejected switching to Arc Testnet.');
    } else {
      // Other error
      throw switchError;
    }
  }
};

/**
 * Get the current connected address
 */
export const getCurrentAddress = async (): Promise<string | null> => {
  if (!isWalletInstalled()) {
    return null;
  }

  try {
    const ethereum = (window as any).ethereum as Eip1193Provider;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    
    if (accounts && accounts.length > 0) {
      if (!provider) {
        provider = new BrowserProvider(ethereum);
      }
      if (!signer) {
        signer = await provider.getSigner();
      }
      return await signer.getAddress();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current address:', error);
    return null;
  }
};

/**
 * Get the signer instance
 */
export const getSigner = async (): Promise<JsonRpcSigner> => {
  if (!signer) {
    const address = await getCurrentAddress();
    if (!address) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
  }
  return signer!;
};

/**
 * Get the provider instance
 */
export const getProvider = (): BrowserProvider => {
  if (!provider) {
    if (!isWalletInstalled()) {
      throw new Error('No wallet detected.');
    }
    const ethereum = (window as any).ethereum as Eip1193Provider;
    provider = new BrowserProvider(ethereum);
  }
  return provider;
};

/**
 * Get account balance in USDC using the ERC-20 contract
 * USDC on Arc has 6 decimals when queried via the ERC-20 interface
 * 
 * On Arc, USDC serves as both native currency and ERC-20 token.
 * The ERC-20 interface (balanceOf) uses 6 decimals and is the correct way
 * to get the USDC balance for display purposes.
 * 
 * Contract address: 0x3600000000000000000000000000000000000000
 */
export const getBalance = async (): Promise<string> => {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();
    const provider = signer.provider;
    
    // Create USDC contract instance
    const usdcContract = new Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider);
    
    // Query balance using ERC-20 balanceOf function
    const balance = await usdcContract.balanceOf(address);
    
    // USDC ERC-20 interface uses 6 decimals
    const balanceFormatted = formatUnits(balance, 6);
    
    return balanceFormatted;
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    throw new Error(`Failed to get USDC balance: ${error}`);
  }
};

/**
 * Listen for account changes
 */
export const onAccountsChanged = (callback: (accounts: string[]) => void): (() => void) => {
  if (!isWalletInstalled()) {
    return () => {};
  }

  const ethereum = (window as any).ethereum as Eip1193Provider;
  
  const handleAccountsChanged = (accounts: string[]) => {
    callback(accounts);
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      provider = new BrowserProvider(ethereum);
      provider.getSigner().then(s => {
        signer = s;
      });
    }
  };

  ethereum.on('accountsChanged', handleAccountsChanged);
  
  return () => {
    ethereum.removeListener('accountsChanged', handleAccountsChanged);
  };
};

/**
 * Listen for chain changes
 */
export const onChainChanged = (callback: (chainId: string) => void): (() => void) => {
  if (!isWalletInstalled()) {
    return () => {};
  }

  const ethereum = (window as any).ethereum as Eip1193Provider;
  
  const handleChainChanged = (chainId: string) => {
    callback(chainId);
    provider = new BrowserProvider(ethereum);
    provider.getSigner().then(s => {
      signer = s;
    });
  };

  ethereum.on('chainChanged', handleChainChanged);
  
  return () => {
    ethereum.removeListener('chainChanged', handleChainChanged);
  };
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = (): void => {
  provider = null;
  signer = null;
};

