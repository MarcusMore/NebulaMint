# Setting Up Contract Address

## Quick Setup

You need to add your deployed contract address to the `.env` file.

### Option 1: If you already have a deployed contract

1. Open the `.env` file in the project root
2. Find the line: `VITE_CONTRACT_ADDRESS=`
3. Add your contract address after the `=` sign:
   ```env
   VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
   ```
4. Save the file
5. Restart your dev server (`npm run dev`)

### Option 2: Deploy a new contract

If you haven't deployed the contract yet, follow these steps:

#### Prerequisites
- Foundry installed ([foundry.paradigm.xyz](https://foundry.paradigm.xyz))
- Arc Testnet USDC from [Circle Faucet](https://faucet.circle.com)
- A wallet with testnet USDC

#### Deploy Steps

1. **Install Foundry** (if not already installed):
   - **Windows:** See [INSTALL_FOUNDRY_WINDOWS.md](./INSTALL_FOUNDRY_WINDOWS.md)
   - **Linux/Mac:** 
     ```bash
     curl -L https://foundry.paradigm.xyz | bash
     foundryup
     ```

2. **Install OpenZeppelin contracts:**
   ```bash
   forge install OpenZeppelin/openzeppelin-contracts --no-commit
   ```

2. **Set up your private key in `.env`:**
   ```env
   ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
   PRIVATE_KEY=0x...your_private_key...
   ```

3. **Compile the contract:**
   ```bash
   forge build
   ```

4. **Deploy to Arc Testnet:**
   ```bash
   forge create contracts/ImageNFT.sol:ImageNFT \
     --rpc-url https://rpc.testnet.arc.network \
     --private-key $PRIVATE_KEY \
     --constructor-args "Arc Image NFTs" "AINFT" "https://ipfs.io/ipfs/" 0 \
     --broadcast
   ```

5. **Copy the deployed address** from the output and add it to `.env`:
   ```env
   VITE_CONTRACT_ADDRESS=0x...deployed_address...
   ```

6. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## Verify Setup

After adding the contract address:
1. Check that `.env` has: `VITE_CONTRACT_ADDRESS=0x...`
2. Restart the dev server
3. The error should be gone!

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md)

