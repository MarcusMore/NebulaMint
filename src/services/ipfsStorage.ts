/**
 * IPFS Storage Service using Pinata HTTP API
 * Uses direct HTTP calls instead of SDK to avoid Node.js polyfill issues
 * 
 * API Documentation: https://docs.pinata.cloud/
 * 
 * Features:
 * - Timeout handling to prevent hanging
 * - Better error messages
 * - API key validation
 * - Direct file upload to IPFS via Pinata HTTP API
 */

/**
 * Create a promise with timeout
 */
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

/**
 * Get Pinata JWT token from environment
 */
const getPinataJWT = (): string => {
  const jwtToken = import.meta.env.VITE_PINATA_JWT;
  
  if (!jwtToken || jwtToken.trim() === '' || jwtToken === 'placeholder-token-until-you-get-real-one') {
    throw new Error(
      'Pinata JWT token is missing or invalid. Please set VITE_PINATA_JWT in your .env file.\n' +
      'Get a free JWT token at: https://www.pinata.cloud/\n' +
      'Then add it to: C:\\Users\\marcu\\OneDrive\\Área de Trabalho\\NFT Converter\\.env'
    );
  }
  
  const trimmedToken = jwtToken.trim();
  
  if (trimmedToken.length < 20) {
    throw new Error(
      `Pinata JWT token appears too short (${trimmedToken.length} characters).\n` +
      `Please ensure you copied the complete JWT token from https://www.pinata.cloud/`
    );
  }
  
  return trimmedToken;
};

/**
 * Convert base64 data URL to File object
 */
const dataURLtoFile = (dataurl: string, filename: string): File => {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    throw new Error(`Failed to convert image data: ${error}`);
  }
};

/**
 * Upload file to Pinata using HTTP API
 * @param file File to upload
 * @returns IPFS CID
 */
const uploadFileToPinata = async (file: File): Promise<string> => {
  const jwtToken = getPinataJWT();
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Add pinata metadata
  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);
  
  // Add pinata options
  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const response = await withTimeout(
      fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: formData,
      }),
      120000, // 2 minutes
      'File upload timed out after 2 minutes. Please check your internet connection and try again.'
    );

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        errorData = { error: errorText };
      }
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Pinata authentication failed: ${errorMessage}\n\n` +
          `Please verify your VITE_PINATA_JWT in your .env file:\n` +
          `1. Get a free JWT token at: https://www.pinata.cloud/\n` +
          `2. Sign in and create a JWT token\n` +
          `3. Update VITE_PINATA_JWT in your .env file\n` +
          `4. Restart your dev server`
        );
      }
      
      throw new Error(`Pinata upload failed: ${errorMessage}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error: any) {
    if (error.message?.includes('timeout')) {
      throw error;
    }
    if (error.message?.includes('authentication') || error.message?.includes('401') || error.message?.includes('403')) {
      throw error;
    }
    throw new Error(`Failed to upload file to Pinata: ${error.message || error}`);
  }
};

/**
 * Upload image to IPFS
 * @param imageData Base64 data URL or File object
 * @param filename Optional filename
 * @returns IPFS CID and URL
 */
export const uploadImageToIPFS = async (
  imageData: string | File,
  filename?: string
): Promise<{ cid: string; url: string }> => {
  try {
    let file: File;
    
    if (typeof imageData === 'string') {
      const name = filename || `nft-image-${Date.now()}.png`;
      file = dataURLtoFile(imageData, name);
    } else {
      file = imageData;
    }
    
    // Validate file size (max 100MB for Pinata free tier)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size exceeds 100MB limit. Please use a smaller image.');
    }
    
    console.log(`Uploading image to IPFS via Pinata HTTP API (${(file.size / 1024).toFixed(2)} KB)...`);
    
    const cid = await uploadFileToPinata(file);
    const url = `ipfs://${cid}`;
    
    console.log(`Image uploaded successfully: ${url}`);
    return { cid, url };
  } catch (error: any) {
    console.error('Error uploading image to IPFS:', error);
    
    if (error.message?.includes('timeout')) {
      throw new Error(error.message);
    }
    if (error.message?.includes('authentication') || error.message?.includes('JWT') || error.message?.includes('token')) {
      throw error;
    }
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error(
        'Network error while uploading to IPFS. Please check your internet connection and try again.'
      );
    }
    
    throw new Error(`Failed to upload image to IPFS: ${error.message || error}`);
  }
};

/**
 * Store complete NFT (image + metadata) on IPFS
 * @param imageData Base64 data URL or File object
 * @param metadata NFT metadata
 * @returns IPFS URL of the metadata
 */
export const storeNFT = async (
  imageData: string | File,
  metadata: {
    name: string;
    description: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  }
): Promise<string> => {
  try {
    let imageFile: File;
    if (typeof imageData === 'string') {
      const name = `nft-image-${Date.now()}.png`;
      imageFile = dataURLtoFile(imageData, name);
    } else {
      imageFile = imageData;
    }
    
    // Validate file size (max 100MB for Pinata)
    if (imageFile.size > 100 * 1024 * 1024) {
      throw new Error('Image size exceeds 100MB limit. Please use a smaller image.');
    }
    
    console.log(`Storing NFT to IPFS via Pinata HTTP API (image: ${(imageFile.size / 1024).toFixed(2)} KB)...`);
    
    // Upload image first
    const imageCID = await uploadFileToPinata(imageFile);
    
    // Create metadata JSON with IPFS reference to the image
    const imageGatewayURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
    const metadataContent = {
      name: metadata.name,
      description: metadata.description,
      image: imageGatewayURL,
      attributes: metadata.attributes || [],
    };
    
    const metadataBlob = new Blob([JSON.stringify(metadataContent, null, 2)], {
      type: 'application/json',
    });
    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json',
    });
    
    // Upload metadata
    const metadataCID = await uploadFileToPinata(metadataFile);
    
    // Return IPFS URI for the metadata
    const metadataURL = `ipfs://${metadataCID}/metadata.json`;
    console.log(`NFT stored successfully: ${metadataURL}`);
    console.log(`  Image CID: ${imageCID}`);
    console.log(`  Metadata CID: ${metadataCID}`);
    return metadataURL;
  } catch (error: any) {
    console.error('Error storing NFT to IPFS:', error);
    
    if (error.message?.includes('timeout')) {
      throw new Error(error.message);
    }
    if (error.message?.includes('authentication') || error.message?.includes('JWT') || error.message?.includes('token')) {
      throw error;
    }
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error(
        'Network error while uploading to IPFS. Please check your internet connection and try again.'
      );
    }
    if (error.message?.includes('size')) {
      throw new Error(error.message);
    }
    
    throw new Error(`Failed to store NFT to IPFS: ${error.message || error}`);
  }
};

/**
 * Get IPFS gateway URL from IPFS URI
 * Tries multiple gateways for better reliability
 */
export const getIPFSGatewayURL = (ipfsUri: string, gatewayIndex: number = 0): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri;
  }
  
  // Extract CID from IPFS URI
  const match = ipfsUri.match(/^ipfs:\/\/([^/]+)(?:\/(.+))?$/);
  if (!match) {
    // Fallback: just remove ipfs:// prefix
    const cid = ipfsUri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  }
  
  const cid = match[1];
  const path = match[2] || '';
  const pathSuffix = path ? '/' + path : '';
  
  // List of IPFS gateways to try (in order of preference)
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}${pathSuffix}`, // Pinata (most reliable)
    `https://ipfs.io/ipfs/${cid}${pathSuffix}`, // Public IPFS gateway
    `https://cloudflare-ipfs.com/ipfs/${cid}${pathSuffix}`, // Cloudflare
    `https://dweb.link/ipfs/${cid}${pathSuffix}`, // Protocol Labs
  ];
  
  // Return the requested gateway (default to first)
  return gateways[gatewayIndex] || gateways[0];
};

/**
 * Try fetching from multiple IPFS gateways
 */
export const fetchFromIPFS = async (ipfsUri: string): Promise<Response | null> => {
  if (!ipfsUri.startsWith('ipfs://')) {
    // Not an IPFS URI, fetch directly
    return fetch(ipfsUri);
  }
  
  // Try multiple gateways
  const gateways = [
    0, // Pinata
    1, // ipfs.io
    2, // Cloudflare
    3, // Protocol Labs
  ];
  
  for (const gatewayIndex of gateways) {
    try {
      const url = getIPFSGatewayURL(ipfsUri, gatewayIndex);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json, image/*, */*',
        },
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      // Try next gateway
      continue;
    }
  }
  
  return null;
};

/**
 * Test Pinata JWT token
 */
export const testAPIKey = async (): Promise<boolean> => {
  try {
    const jwtToken = getPinataJWT();
    
    // Test by checking user info (lightweight endpoint)
    const response = await withTimeout(
      fetch('https://api.pinata.cloud/data/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      }),
      30000, // 30 seconds
      'JWT token test timed out'
    );
    
    return response.ok;
  } catch (error) {
    console.error('JWT token test failed:', error);
    return false;
  }
};
