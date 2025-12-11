# IPFS Service Alternatives

## Current Issue

Web3.Storage is currently undergoing maintenance. Check status at: https://status.web3.storage

## Alternative IPFS Services

### Option 1: Pinata (Recommended)
- **Website**: https://www.pinata.cloud/
- **Free Tier**: 1 GB storage, 100 files/month
- **Pros**: 
  - Reliable and stable
  - Easy to use
  - Good documentation
  - Fast uploads
- **Setup**: 
  1. Sign up at https://www.pinata.cloud/
  2. Get your JWT token from dashboard
  3. Update `.env` with `VITE_PINATA_JWT=your-token`

### Option 2: Lighthouse
- **Website**: https://www.lighthouse.storage/
- **Free Tier**: 5 GB storage
- **Pros**: 
  - Decentralized
  - Good free tier
- **Setup**: 
  1. Sign up at https://www.lighthouse.storage/
  2. Get API key
  3. Update `.env` with `VITE_LIGHTHOUSE_API_KEY=your-key`

### Option 3: NFT.Storage (HTTP API)
- **Website**: https://nft.storage/
- **Note**: Classic upload API is deprecated, but HTTP API works for collection management
- **Status**: Limited functionality (collection management only, not direct uploads)

### Option 4: Web3.Storage (Wait for Maintenance)
- **Status**: Currently under maintenance
- **Action**: Wait for service to come back online
- **Check**: https://status.web3.storage

## Quick Migration to Pinata

If you want to switch to Pinata immediately:

1. **Install Pinata SDK**:
   ```bash
   npm install @pinata/sdk
   ```

2. **Get Pinata JWT Token**:
   - Sign up at https://www.pinata.cloud/
   - Go to API Keys section
   - Create new JWT token
   - Copy the token

3. **Update `.env` file**:
   ```env
   VITE_PINATA_JWT=your-pinata-jwt-token
   ```

4. **Code will need to be updated** to use Pinata SDK instead of Web3.Storage

## Recommendation

**For immediate use**: Switch to **Pinata** - it's the most reliable and easiest to set up.

**For long-term**: Consider using **Lighthouse** for better decentralization, or wait for Web3.Storage to come back online.

## Current Status

- ✅ Web3.Storage: Under maintenance
- ✅ Pinata: Available
- ✅ Lighthouse: Available
- ⚠️ NFT.Storage: Limited (HTTP API only)

