# NFT.Storage Service Migration Guide

## Important Update

**NFT.Storage Classic was decommissioned on June 30, 2024.**

This means:
- ❌ The JavaScript client library (`nft.storage`) no longer accepts new uploads
- ❌ The old upload API endpoints are no longer available
- ✅ Existing data remains accessible
- ✅ New NFT.Storage service focuses on collection management via HTTP API

## Current Situation

Your API key (`3b9ee7ca.9b362b4ca59647358775afadc345fcd9`) is from the **new NFT.Storage service**, which:
- ✅ Works with the HTTP API for collection management
- ❌ May not work with the JavaScript client library (which uses the old Classic API)

## Solutions

### Option 1: Use Alternative IPFS Service (Recommended)

Switch to a service that still supports direct uploads:

#### Pinata
```bash
npm install pinata-sdk
```

#### Lighthouse
```bash
npm install @lighthouse-web3/sdk
```

#### Web3.Storage
```bash
npm install web3.storage
```

### Option 2: Use NFT.Storage HTTP API for Collection Management

After uploading files via another service, use NFT.Storage HTTP API to:
- Create collections
- Track tokens
- Manage metadata

See `nftStorageAPI.ts` for HTTP API implementation.

### Option 3: Hybrid Approach

1. Upload files using Pinata/Lighthouse/Web3.Storage
2. Get IPFS CID
3. Use NFT.Storage HTTP API to add tokens to collections
4. Mint NFTs on blockchain

## Recommended Migration Path

1. **Short term**: Switch to Pinata for uploads (most similar to NFT.Storage)
2. **Long term**: Use NFT.Storage HTTP API for collection management
3. **Update code**: Replace `ipfsStorage.ts` with Pinata implementation

## Pinata Integration Example

```typescript
import pinataSDK from '@pinata/sdk';

const pinata = pinataSDK({
  pinataJWT: 'YOUR_PINATA_JWT'
});

// Upload file
const result = await pinata.pinFileToIPFS(file);
const ipfsURI = `ipfs://${result.IpfsHash}`;
```

## References

- NFT.Storage HTTP API: https://app.nft.storage/v1/docs/client/http-api
- Pinata: https://www.pinata.cloud/
- Lighthouse: https://www.lighthouse.storage/
- Web3.Storage: https://web3.storage/

