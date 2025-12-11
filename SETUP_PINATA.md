# Pinata Setup Guide

## Overview

This project uses **Pinata** for IPFS file uploads. Pinata provides reliable decentralized storage on IPFS with a generous free tier.

## Get Your JWT Token

1. **Sign up at Pinata**
   - Visit: https://www.pinata.cloud/
   - Click "Sign up" or "Get started"
   - Create an account (you can use email or GitHub)

2. **Create JWT Token**
   - After signing in, go to your dashboard
   - Navigate to "API Keys" in the sidebar
   - Click "New Key" button
   - Select "JWT" as the key type
   - Give your key a name (e.g., "Arc NFT Minter")
   - Set permissions (you need "pinFileToIPFS" permission)
   - Click "Create Key"

3. **Copy the JWT Token**
   - The JWT token will be displayed (it's a long string starting with "eyJ...")
   - **Important**: Copy the ENTIRE token
   - You won't be able to see it again after closing the dialog
   - Store it securely

## Configure Your Project

1. **Update `.env` file**
   - Open your `.env` file in the project root
   - Add or update the following line:
     ```env
     VITE_PINATA_JWT=your-jwt-token-here
     ```
   - Replace `your-jwt-token-here` with your actual JWT token
   - **Important**:
     - No quotes around the token
     - No spaces before or after the `=`
     - Make sure there are no line breaks in the token

2. **Remove old Web3.Storage key (optional)**
   - You can remove or comment out `VITE_WEB3_STORAGE_API_KEY` if present
   - It's no longer needed

3. **Restart Dev Server**
   - Stop your current dev server (Ctrl+C)
   - Start it again:
     ```bash
     npm run dev
     ```

## Verify Setup

The app will automatically test your JWT token when you try to upload a file. If there's an issue, you'll see a clear error message.

## JWT Token Format

Pinata JWT tokens are:
- Long strings (typically 200+ characters)
- Start with "eyJ" (JWT format)
- Unique to your account
- Required for all API calls

## Free Tier Limits

Pinata offers:
- **1 GB** of free storage
- **100 files** per month
- Fast uploads and reliable service
- No credit card required

## Troubleshooting

### "JWT token is missing"
- Make sure `VITE_PINATA_JWT` is set in your `.env` file
- Restart your dev server after updating `.env`

### "JWT token appears too short"
- Make sure you copied the ENTIRE token
- JWT tokens are typically 200+ characters long
- Check for any truncation or missing characters

### "Failed to initialize Pinata client"
- Verify your token is correct
- Make sure there are no extra spaces or quotes
- Try generating a new JWT token

### "Unauthorized" or "API Error"
- Your JWT token might be invalid or expired
- Generate a new JWT token and update your `.env` file
- Make sure you're using a JWT token, not an API key

### "Permission denied"
- Make sure your JWT token has "pinFileToIPFS" permission
- Check your API key permissions in Pinata dashboard

## Additional Resources

- Pinata Docs: https://docs.pinata.cloud/
- Pinata Website: https://www.pinata.cloud/
- Pinata Gateway: https://gateway.pinata.cloud/

## Migration from Web3.Storage

If you were previously using Web3.Storage:
1. Get a new JWT token from Pinata
2. Update `VITE_PINATA_JWT` in your `.env` file
3. Remove `VITE_WEB3_STORAGE_API_KEY` (optional)
4. Restart your dev server

The code has been updated to use Pinata automatically.

