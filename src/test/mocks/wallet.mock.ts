import { vi } from 'vitest';

/**
 * Mock wallet provider for testing
 */
export const createMockEthereum = () => {
  const mockAccounts = ['0x1234567890123456789012345678901234567890'];
  
  return {
    request: vi.fn(async ({ method, params }: any) => {
      switch (method) {
        case 'eth_requestAccounts':
          return mockAccounts;
        case 'eth_chainId':
          return '0x4D0A2A'; // Arc Testnet
        case 'eth_accounts':
          return mockAccounts;
        case 'wallet_switchEthereumChain':
          return null;
        case 'wallet_addEthereumChain':
          return null;
        default:
          throw new Error(`Unhandled method: ${method}`);
      }
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
    isMetaMask: true,
  };
};

export const mockProvider = {
  getSigner: vi.fn(() => ({
    getAddress: vi.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
    signMessage: vi.fn(() => Promise.resolve('0xsignature')),
  })),
  getBlockNumber: vi.fn(() => Promise.resolve(1000)),
  getBlock: vi.fn(() => Promise.resolve({ timestamp: Math.floor(Date.now() / 1000) })),
};

export const mockContract = {
  mint: vi.fn(),
  totalSupply: vi.fn(() => Promise.resolve(10)),
  mintingFee: vi.fn(() => Promise.resolve('0')),
  currentTokenId: vi.fn(() => Promise.resolve(10)),
  tokenURI: vi.fn(() => Promise.resolve('ipfs://test')),
  ownerOf: vi.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
  queryFilter: vi.fn(() => Promise.resolve([])),
  filters: {
    ImageMinted: vi.fn(() => ({})),
  },
  interface: {
    parseLog: vi.fn(),
  },
};

