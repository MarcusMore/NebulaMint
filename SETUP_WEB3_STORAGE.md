# Web3.Storage Setup Guide

## Overview

This project uses **Web3.Storage** for IPFS file uploads. Web3.Storage provides free decentralized storage on IPFS.

## Get Your API Token

1. **Sign up at Web3.Storage**
   - Visit: https://web3.storage/
   - Click "Sign up" or "Get started"
   - Create an account (you can use email or GitHub)

2. **Create API Token**
   - After signing in, go to your account dashboard
   - Navigate to "Account" → "Create API Token" (or "API Tokens")
   - Give your token a name (e.g., "Arc NFT Minter")
   - Click "Create" or "Generate"

3. **Copy the Token**
   - The API token will be displayed (it's a long string)
   - **Important**: Copy the ENTIRE token
   - You won't be able to see it again after closing the dialog
   - Store it securely

## Configure Your Project

1. **Update `.env` file**
   - Open your `.env` file in the project root
   - Add or update the following line:
     ```env
     VITE_WEB3_STORAGE_API_KEY=your-api-token-here
     ```
   - Replace `your-api-token-here` with your actual API token
   - **Important**:
     - No quotes around the token
     - No spaces before or after the `=`
     - Make sure there are no line breaks in the token

2. **Restart Dev Server**
   - Stop your current dev server (Ctrl+C)
   - Start it again:
     ```bash
     npm run dev
     ```

## Verify Setup

The app will automatically test your API token when you try to upload a file. If there's an issue, you'll see a clear error message.

## API Token Format

Web3.Storage API tokens are typically:
- Long strings (100+ characters)
- Alphanumeric with special characters
- Unique to your account

## Troubleshooting

### "API token is missing"
- Make sure `VITE_WEB3_STORAGE_API_KEY` is set in your `.env` file
- Restart your dev server after updating `.env`

### "API token appears too short"
- Make sure you copied the ENTIRE token
- Check for any truncation or missing characters

### "Failed to initialize Web3.Storage client"
- Verify your token is correct
- Make sure there are no extra spaces or quotes
- Try generating a new token

### "Unauthorized" or "API Error"
- Your token might be invalid or expired
- Generate a new token and update your `.env` file
- Make sure you're using the correct token (not a different service's token)

## Free Tier Limits

Web3.Storage offers:
- **5 GB** of free storage
- **Free uploads** (no cost for storing files)
- Files are permanently stored on IPFS

## Additional Resources

- Web3.Storage Docs: https://docs.web3.storage/
- Web3.Storage Website: https://web3.storage/
- IPFS Gateway: https://dweb.link/

## Migration from NFT.Storage

If you were previously using NFT.Storage:
1. Get a new API token from Web3.Storage
2. Update `VITE_WEB3_STORAGE_API_KEY` in your `.env` file
3. Remove `VITE_NFT_STORAGE_API_KEY` (if present)
4. Restart your dev server

The code has been updated to use Web3.Storage automatically.

