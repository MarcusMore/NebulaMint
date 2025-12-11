/**
 * IPFS Storage Service using NFT.Storage HTTP API
 * Alternative implementation using direct HTTP API calls
 * Based on: https://app.nft.storage/v1/docs/client/http-api
 * 
 * Note: The HTTP API is primarily for collection management.
 * For direct file uploads, we'll use the NFT.Storage upload endpoint.
 */

const NFT_STORAGE_UPLOAD_BASE = 'https://api.nft.storage';

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
 * Upload a file directly to NFT.Storage using HTTP API
 * @param file File to upload
 * @returns IPFS CID
 */
export const uploadFileHTTP = async (file: File): Promise<string> => {
  const apiKey = getAPIKey();
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${NFT_STORAGE_UPLOAD_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: await response.text() }));
      throw new Error(`NFT.Storage upload failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.value?.cid || result.cid;
  } catch (error: any) {
    console.error('Error uploading file via HTTP API:', error);
    throw new Error(`Failed to upload file: ${error.message || error}`);
  }
};

/**
 * Store NFT metadata using HTTP API
 * @param imageFile Image file
 * @param metadata NFT metadata
 * @returns IPFS URI
 */
export const storeNFTHTTP = async (
  imageFile: File,
  metadata: {
    name: string;
    description: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  }
): Promise<string> => {
  try {
    // First upload the image
    const imageCID = await uploadFileHTTP(imageFile);
    const imageURI = `ipfs://${imageCID}`;

    // Create metadata JSON
    const metadataJSON = {
      name: metadata.name,
      description: metadata.description,
      image: imageURI,
      attributes: metadata.attributes || [],
    };

    // Convert metadata to Blob
    const metadataBlob = new Blob([JSON.stringify(metadataJSON)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

    // Upload metadata
    const metadataCID = await uploadFileHTTP(metadataFile);
    
    return `ipfs://${metadataCID}`;
  } catch (error: any) {
    console.error('Error storing NFT via HTTP API:', error);
    throw new Error(`Failed to store NFT: ${error.message || error}`);
  }
};
