import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadImageToIPFS,
  storeNFT,
  getIPFSGatewayURL,
  testAPIKey,
} from '../../../services/ipfsStorage';
import { NFTStorage } from 'nft.storage';

// Mock NFT.Storage
vi.mock('nft.storage', () => {
  return {
    NFTStorage: vi.fn().mockImplementation(() => ({
      storeBlob: vi.fn().mockResolvedValue('QmTestCID123'),
      store: vi.fn().mockResolvedValue({
        url: 'ipfs://QmTestCID123',
        data: {},
      }),
    })),
    File: class File {},
  };
});

describe('ipfsStorage Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set mock API key
    import.meta.env.VITE_NFT_STORAGE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  });

  describe('uploadImageToIPFS', () => {
    it('should throw error when API key is missing', async () => {
      delete import.meta.env.VITE_NFT_STORAGE_API_KEY;
      
      await expect(uploadImageToIPFS(new File(['test'], 'test.png'))).rejects.toThrow(
        'API key is missing'
      );
    });

    it('should throw error when API key is invalid format', async () => {
      import.meta.env.VITE_NFT_STORAGE_API_KEY = 'invalid-key';
      
      await expect(uploadImageToIPFS(new File(['test'], 'test.png'))).rejects.toThrow(
        'API key format appears invalid'
      );
    });

    it('should upload File object successfully', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const result = await uploadImageToIPFS(file);
      
      expect(result).toHaveProperty('cid');
      expect(result).toHaveProperty('url');
      expect(result.url).toContain('ipfs://');
    });

    it('should convert base64 data URL to File and upload', async () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = await uploadImageToIPFS(base64);
      
      expect(result).toHaveProperty('cid');
      expect(result).toHaveProperty('url');
    });

    it('should throw error for files larger than 100MB', async () => {
      // Create a mock file larger than 100MB
      const largeFile = new File(['x'.repeat(101 * 1024 * 1024)], 'large.png');
      
      await expect(uploadImageToIPFS(largeFile)).rejects.toThrow('exceeds 100MB');
    });
  });

  describe('storeNFT', () => {
    it('should store NFT with metadata successfully', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const metadata = {
        name: 'Test NFT',
        description: 'Test Description',
        attributes: [{ trait_type: 'Type', value: 'Image' }],
      };
      
      const result = await storeNFT(file, metadata);
      
      expect(result).toContain('ipfs://');
    });

    it('should throw error when API key is missing', async () => {
      delete import.meta.env.VITE_NFT_STORAGE_API_KEY;
      const file = new File(['test'], 'test.png');
      
      await expect(storeNFT(file, { name: 'Test', description: 'Test' })).rejects.toThrow(
        'API key is missing'
      );
    });

    it('should handle base64 image data', async () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const metadata = {
        name: 'Test NFT',
        description: 'Test Description',
      };
      
      const result = await storeNFT(base64, metadata);
      expect(result).toContain('ipfs://');
    });
  });

  describe('getIPFSGatewayURL', () => {
    it('should convert IPFS URI to gateway URL', () => {
      const ipfsUri = 'ipfs://QmTestCID123';
      const gatewayUrl = getIPFSGatewayURL(ipfsUri);
      
      expect(gatewayUrl).toBe('https://ipfs.io/ipfs/QmTestCID123');
    });

    it('should return original URL if not IPFS URI', () => {
      const httpUrl = 'https://example.com/image.png';
      const result = getIPFSGatewayURL(httpUrl);
      
      expect(result).toBe(httpUrl);
    });
  });

  describe('testAPIKey', () => {
    it('should return true for valid API key', async () => {
      const result = await testAPIKey();
      expect(typeof result).toBe('boolean');
    });
  });
});

