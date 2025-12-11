# Fix NFT.Storage API Key Issue

## Problem
Your API key is too short (only ~40 characters). NFT.Storage API keys are JWT tokens that are typically **200+ characters long**.

## Current Key (Incomplete)
```
3e36cf07.0e6d07ee0419486f808c1ee5a2ab0213
```
This appears to be truncated or incomplete.

## Solution: Get a Complete API Key

### Step 1: Go to NFT.Storage
1. Visit: https://nft.storage/
2. Sign in to your account (or create one if needed)

### Step 2: Generate API Key
1. Look for the **"API Key"** section in the dashboard navigation
2. Click on it
3. Enter a name for your key (e.g., "Arc NFT Minter")
4. Click **"Generate Key"**

### Step 3: Copy the ENTIRE Key
1. Once generated, the API key will be displayed
2. **IMPORTANT**: Copy the ENTIRE key - it will be very long (200+ characters)
3. The key will look something like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweD...very-long-string-continues...
   ```
   OR it might have a different format, but it will be **very long**

### Step 4: Update .env File
1. Open your `.env` file
2. Find the line: `VITE_NFT_STORAGE_API_KEY=...`
3. Replace it with:
   ```env
   VITE_NFT_STORAGE_API_KEY=your-complete-very-long-api-key-here
   ```
4. **Important**:
   - No quotes around the key
   - No spaces before or after the `=`
   - Copy the ENTIRE key (all 200+ characters)
   - Make sure there are no line breaks

### Step 5: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## How to Verify Your Key is Complete

A complete NFT.Storage API key:
- ✅ Is 200+ characters long
- ✅ May contain dots (.) separating parts
- ✅ Is a single continuous string
- ✅ No spaces or line breaks

Your current key is only ~40 characters, which is definitely incomplete.

## Still Having Issues?

If you've copied the complete key and it's still not working:
1. Check for hidden characters or spaces
2. Try generating a new key
3. Make sure you're copying from the "API Key" section, not another field
4. Verify the key in `.env` matches exactly what you copied

## Reference
- Official docs: https://app.nft.storage/v1/docs/how-to/api-key

