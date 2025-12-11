# How to Set Up NFT.Storage API Key

## Step 1: Get Your API Key

1. Visit https://nft.storage/
2. Sign in or create a free account
3. Go to your account dashboard
4. Click on "API Keys" or "Create API Key"
5. Copy the **entire** API key (it will be very long and start with `eyJ`)

## Step 2: Add to .env File

Open your `.env` file in the project root and add:

```env
VITE_NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweD...your-full-key-here
```

**Important:**
- ✅ No quotes around the key
- ✅ No spaces before or after the `=`
- ✅ Copy the ENTIRE key (it's very long, usually 200+ characters)
- ✅ The key MUST start with `eyJ`

## Step 3: Restart Dev Server

After updating `.env`, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Valid API Key Format

A valid NFT.Storage API key:
- Starts with: `eyJ`
- Is very long (200+ characters)
- Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweD...`

## Invalid API Key Format

Your current key appears to be:
- Starting with: `9735e061.e...`
- This is NOT a valid NFT.Storage API key format

## Troubleshooting

If you still get errors:
1. Make sure you copied the ENTIRE key (no truncation)
2. Check there are no extra spaces in `.env`
3. Verify the key starts with `eyJ`
4. Restart your dev server after changes
5. Clear browser cache if needed

