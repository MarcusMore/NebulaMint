# Deployment Guide

Deploy the ImageNFT contract to Arc Testnet following the [official Arc deployment tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc).

## Prerequisites

1. **Foundry** - Install from [foundry.paradigm.xyz](https://foundry.paradigm.xyz)
2. **Arc Testnet USDC** - Get from [Circle Faucet](https://faucet.circle.com)
3. **Private Key** - A wallet with testnet USDC

## Step 1: Install Foundry

### Windows (PowerShell):
**Option 1 - Using Git Bash (Recommended):**
1. Install Git for Windows: https://git-scm.com/download/win
2. Open Git Bash in your project directory
3. Run:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

**Option 2 - Using Scoop:**
```powershell
# Install Scoop first
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Foundry
scoop install foundry
```

### Linux/Mac:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Verify installation:**
```bash
forge --version
```

> **Note:** For detailed Windows installation instructions, see [INSTALL_FOUNDRY_WINDOWS.md](./INSTALL_FOUNDRY_WINDOWS.md)

## Step 2: Install Dependencies

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

## Step 3: Set Up Environment

Create `.env` file:

```env
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
PRIVATE_KEY=0x...your_private_key...
```

Generate a wallet if needed:
```bash
cast wallet new
```

## Step 4: Get Testnet USDC

Visit [Circle Faucet](https://faucet.circle.com), select **Arc Testnet**, and request testnet USDC.

## Step 5: Compile Contract

```bash
forge build
```

## Step 6: Deploy Contract

```bash
forge create contracts/ImageNFT.sol:ImageNFT \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args "Arc Image NFTs" "AINFT" "https://ipfs.io/ipfs/" 0 \
  --broadcast
```

Constructor parameters:
- `"Arc Image NFTs"` - Collection name
- `"AINFT"` - Collection symbol
- `"https://ipfs.io/ipfs/"` - Base URI for metadata
- `0` - Minting fee (0 for testnet)

## Step 7: Add Contract Address

Copy the deployed address and add to `.env`:

```env
VITE_CONTRACT_ADDRESS=0x...your_contract_address...
```

## Verify Deployment

1. Check transaction on [Arc Explorer](https://testnet.arcscan.app)
2. Verify contract functions work:
   ```bash
   cast call $VITE_CONTRACT_ADDRESS "totalSupply()(uint256)" \
     --rpc-url $ARC_TESTNET_RPC_URL
   ```

## Next Steps

1. Restart your dev server: `npm run dev`
2. Connect your wallet to Arc Testnet
3. Upload an image and mint your first NFT!

