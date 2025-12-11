# Deploy NFTLikes Contract

This guide explains how to deploy the NFTLikes contract to Arc Testnet so that all users can see and interact with likes.

## Step 1: Deploy the Contract

The NFTLikes contract has no constructor parameters, so deployment is simple:

```bash
forge create contracts/NFTLikes.sol:NFTLikes \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Or using the deployment script:

```bash
forge script script/DeployLikes.s.sol \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key $PRIVATE_KEY \
  --broadcast
```

## Step 2: Add Contract Address to .env

After deployment, copy the contract address and add it to your `.env` file:

```env
VITE_LIKES_CONTRACT_ADDRESS=0x...your_likes_contract_address...
```

## Step 3: Restart Dev Server

Restart your Vite dev server for the changes to take effect:

```bash
npm run dev
```

## How It Works

- **Like Counts**: Stored on-chain, visible to all users
- **User Likes**: Each user's like status is tracked on-chain
- **Transactions**: Each like/unlike requires a blockchain transaction (small gas fee)
- **Persistence**: All likes are permanent and visible to everyone

## Benefits

✅ All users see the same like counts
✅ Likes are permanent and cannot be lost
✅ Decentralized - no backend server needed
✅ Transparent - all likes are on the blockchain

