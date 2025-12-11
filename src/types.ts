export interface NFTMetadata {
  name: string;
  description: string;
  image: string | null; // Base64 string or URL
  attributes: Array<{ trait_type: string; value: string }>;
}

export interface MintStatus {
  status: 'idle' | 'uploading_ipfs' | 'confirming_tx' | 'success' | 'error';
  txHash?: string;
  tokenId?: string;
  error?: string;
}

