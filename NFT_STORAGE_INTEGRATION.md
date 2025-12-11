# NFT.Storage Integration Guide

Based on: https://app.nft.storage/v1/docs/client/http-api

## Architecture Overview

This app uses **two different NFT.Storage services**:

### 1. JavaScript Client Library (`ipfsStorage.ts`)
- **Purpose**: Upload files directly to IPFS
- **Used for**: Storing NFT images and metadata
- **Method**: `client.store()` and `client.storeBlob()`
- **Returns**: IPFS CID and URI

### 2. HTTP API (`nftStorageAPI.ts`)
- **Purpose**: Collection management and token tracking
- **Used for**: Organizing minted NFTs into collections
- **Endpoints**: Create collections, add tokens, list collections
- **Note**: Requires CIDs to already be uploaded (use client library first)

## Current Implementation

### File Upload Flow
1. User uploads image → `storeNFT()` in `ipfsStorage.ts`
2. Uses JavaScript client library to upload to IPFS
3. Returns IPFS URI (e.g., `ipfs://Qm...`)
4. URI is used in smart contract minting

### Collection Management (Optional)
After minting, you can optionally:
1. Create a collection using `createCollection()`
2. Add minted tokens using `addTokensToCollection()`
3. Track and view tokens using `listTokens()`

## API Key Format

NFT.Storage API keys are **JWT tokens** that:
- Start with `eyJ` (base64-encoded JWT header)
- Are 200+ characters long
- Used for both client library and HTTP API
- Get from: https://nft.storage/

## Usage Examples

### Upload NFT (Current Implementation)
```typescript
import { storeNFT } from './services/ipfsStorage';

const metadataURI = await storeNFT(imageFile, {
  name: 'My NFT',
  description: 'Description',
  attributes: [{ trait_type: 'Type', value: 'Image' }]
});
// Returns: ipfs://Qm...
```

### Create Collection (Optional)
```typescript
import { createCollection } from './services/nftStorageAPI';

const collectionID = await createCollection(
  'My NFT Collection',
  '0x...', // Contract address
  '5042002', // Arc Testnet chain ID
  'Arc Testnet'
);
```

### Add Token to Collection (Optional)
```typescript
import { addTokensToCollection, extractCID } from './services/nftStorageAPI';

const cid = extractCID(metadataURI); // Extract CID from ipfs://Qm...
await addTokensToCollection(collectionID, [
  { tokenID: '1', cid: cid }
]);
```

## Why Two Services?

- **Client Library**: Best for direct file uploads (what we need for minting)
- **HTTP API**: Best for collection management and tracking (optional feature)

The HTTP API doesn't have a direct file upload endpoint - it expects CIDs that are already uploaded. So we use:
- Client library → Upload files → Get CID
- HTTP API → Organize CIDs into collections → Track tokens

## Integration Recommendations

### Current (Recommended)
✅ Use JavaScript client library for uploads (already implemented)
✅ Optional: Add HTTP API for collection management

### Alternative (Not Recommended)
❌ Using only HTTP API - would require pre-uploading files separately
❌ Using only client library - works but no collection management

## Next Steps (Optional Enhancement)

To add collection management:
1. After successful mint, extract CID from IPFS URI
2. Create/use a collection for your contract
3. Add token to collection with tokenID and CID
4. Display collection stats in Metrics page

