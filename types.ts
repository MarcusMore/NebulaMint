export interface NFTMetadata {
  name: string;
  description: string;
  image: string | null; // Base64 string or URL
  attributes: Array<{ trait_type: string; value: string }>;
}

export enum AppMode {
  UPLOAD = 'UPLOAD',
  GENERATE = 'GENERATE'
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9";
}

export interface MintStatus {
  status: 'idle' | 'uploading_ipfs' | 'confirming_tx' | 'success' | 'error';
  txHash?: string;
  tokenId?: string;
  error?: string;
}