/**
 * NFT.Storage HTTP API Service
 * Based on: https://app.nft.storage/v1/docs/client/http-api
 * 
 * This service provides collection management and token tracking functionality.
 * For file uploads, we use the JavaScript client library (nft.storage).
 */

const NFT_STORAGE_API_BASE = 'https://preserve.nft.storage/api/v1';

/**
 * Get API key from environment
 */
const getAPIKey = (): string => {
  const apiKey = import.meta.env.VITE_NFT_STORAGE_API_KEY;
  if (!apiKey) {
    throw new Error('NFT.Storage API key is missing. Please set VITE_NFT_STORAGE_API_KEY in your .env file.');
  }
  return apiKey.trim();
};

/**
 * Make authenticated API request
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const apiKey = getAPIKey();
  
  const response = await fetch(`${NFT_STORAGE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NFT.Storage API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Create a collection for tracking NFTs
 * @param collectionName Name of the collection
 * @param contractAddress Contract address (required for EVM chains)
 * @param chainID Chain ID (5042002 for Arc Testnet)
 * @param network Network name (e.g., "Arc Testnet")
 */
export const createCollection = async (
  collectionName: string,
  contractAddress: string,
  chainID: string = '5042002',
  network: string = 'Arc Testnet'
): Promise<string> => {
  try {
    const response = await apiRequest('/collection/create_collection', {
      method: 'POST',
      body: JSON.stringify({
        collectionName,
        contractAddress,
        chainID,
        network,
      }),
    });
    return response.collectionID || 'Collection Created';
  } catch (error: any) {
    console.error('Error creating collection:', error);
    throw new Error(`Failed to create collection: ${error.message || error}`);
  }
};

/**
 * Add tokens to a collection (for tracking minted NFTs)
 * Note: This requires the CID to already be uploaded to IPFS
 * @param collectionID ID of the collection
 * @param tokens Array of {tokenID, cid} objects
 */
export const addTokensToCollection = async (
  collectionID: string,
  tokens: Array<{ tokenID: string; cid: string }>
): Promise<string> => {
  try {
    // Create CSV content
    const csvHeader = 'tokenID,cid\n';
    const csvRows = tokens.map(t => `${t.tokenID},${t.cid}`).join('\n');
    const csvContent = csvHeader + csvRows;
    
    // Create FormData with CSV file
    const formData = new FormData();
    formData.append('collectionID', collectionID);
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'tokens.csv');

    const apiKey = getAPIKey();
    const response = await fetch(`${NFT_STORAGE_API_BASE}/collection/add_tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add tokens: ${response.status} - ${errorText}`);
    }

    return 'Tokens added';
  } catch (error: any) {
    console.error('Error adding tokens to collection:', error);
    throw new Error(`Failed to add tokens to collection: ${error.message || error}`);
  }
};

/**
 * List all collections
 */
export const listCollections = async (): Promise<any[]> => {
  try {
    const response = await apiRequest('/collection/list_collections', {
      method: 'GET',
    });
    return response.collections || [];
  } catch (error: any) {
    console.error('Error listing collections:', error);
    throw new Error(`Failed to list collections: ${error.message || error}`);
  }
};

/**
 * List tokens in a collection
 * @param collectionID ID of the collection
 * @param lastKey Optional: ID of the last fetched token for pagination
 */
export const listTokens = async (
  collectionID: string,
  lastKey?: string
): Promise<{ tokens: any[]; lastKey?: string }> => {
  try {
    const params = new URLSearchParams({ collectionID });
    if (lastKey) {
      params.append('lastKey', lastKey);
    }
    
    const response = await apiRequest(`/collection/list_tokens?${params.toString()}`, {
      method: 'GET',
    });
    return response;
  } catch (error: any) {
    console.error('Error listing tokens:', error);
    throw new Error(`Failed to list tokens: ${error.message || error}`);
  }
};

/**
 * Get deal status for a CID
 * @param cid Content Identifier (IPFS CID)
 */
export const getDealStatus = async (cid: string): Promise<any> => {
  try {
    const response = await fetch(`${NFT_STORAGE_API_BASE}/collection/deal_status?cid=${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to get deal status: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('Error getting deal status:', error);
    throw new Error(`Failed to get deal status: ${error.message || error}`);
  }
};

/**
 * Get user balance
 */
export const getUserBalance = async (): Promise<any> => {
  try {
    const response = await apiRequest('/user/get_balance', {
      method: 'GET',
    });
    return response;
  } catch (error: any) {
    console.error('Error getting user balance:', error);
    throw new Error(`Failed to get user balance: ${error.message || error}`);
  }
};

/**
 * Extract CID from IPFS URI
 */
export const extractCID = (ipfsUri: string): string => {
  if (ipfsUri.startsWith('ipfs://')) {
    return ipfsUri.replace('ipfs://', '');
  }
  return ipfsUri;
};

