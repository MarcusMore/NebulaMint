# Quick Contract Deployment Guide

## Current Status

I've set up everything for you, but Foundry needs to be installed manually due to Windows PowerShell limitations.

## Step-by-Step Instructions

### 1. Install Foundry (One-time setup)

**Option A: Using Git Bash (Easiest)**
1. Right-click in this folder → **"Git Bash Here"**
2. Run these commands:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
3. Close and reopen Git Bash (or run: `source ~/.bashrc`)

**Option B: Verify Foundry is installed**
```bash
forge --version
```

### 2. Set Up Your Private Key

1. Open `.env` file
2. Add your private key:
   ```env
   PRIVATE_KEY=0x...your_private_key_here...
   ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
   ```

**To generate a new wallet (if needed):**
```bash
cast wallet new
```
⚠️ **Keep your private key secure! Never share it!**

### 3. Get Testnet USDC

1. Visit: https://faucet.circle.com
2. Select **Arc Testnet**
3. Request testnet USDC to your wallet address

### 4. Deploy the Contract

**Option A: Use the automated script (once Foundry is installed):**
```powershell
.\deploy-contract.ps1
```

**Option B: Manual deployment:**
```bash
# Install OpenZeppelin (first time only)
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Compile
forge build

# Deploy (replace YOUR_PRIVATE_KEY with your actual key)
forge create contracts/ImageNFT.sol:ImageNFT \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args "Arc Image NFTs" "AINFT" "https://ipfs.io/ipfs/" 0 \
  --broadcast
```

### 5. Add Contract Address to .env

After deployment, copy the contract address from the output and add to `.env`:
```env
VITE_CONTRACT_ADDRESS=0x...your_deployed_address...
```

### 6. Restart Dev Server

```bash
npm run dev
```

## Troubleshooting

- **"forge: command not found"** → Foundry not installed, follow Step 1
- **"PRIVATE_KEY not found"** → Add your private key to `.env`
- **"Insufficient funds"** → Get testnet USDC from Circle Faucet
- **Deployment fails** → Check you're on Arc Testnet and have USDC

## Need Help?

See detailed guides:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [INSTALL_FOUNDRY_WINDOWS.md](./INSTALL_FOUNDRY_WINDOWS.md) - Foundry installation
- [SETUP_CONTRACT.md](./SETUP_CONTRACT.md) - Contract setup

