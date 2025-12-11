# NebulaMint

A decentralized NFT minting DApp built on **Arc Testnet** that allows users to upload images and mint them as ERC-721 NFTs. Features include IPFS storage, on-chain likes, and a beautiful gallery interface.

<div align="center">
  <img src="https://img.shields.io/badge/Blockchain-Arc%20Testnet-blue" alt="Arc Testnet" />
  <img src="https://img.shields.io/badge/Standard-ERC--721-green" alt="ERC-721" />
  <img src="https://img.shields.io/badge/Framework-React%20%2B%20Vite-purple" alt="React + Vite" />
  <img src="https://img.shields.io/badge/Storage-IPFS%20%28Pinata%29-orange" alt="IPFS" />
</div>

## ✨ Features

- **🖼️ Image Upload & Mint**: Upload images and mint them as NFTs on Arc Testnet
- **📦 IPFS Storage**: Images and metadata stored permanently on IPFS via Pinata
- **❤️ On-Chain Likes**: Like NFTs with on-chain storage (one like per user)
- **🖼️ Gallery View**: Browse all minted NFTs in a beautiful grid layout
- **📊 Metrics Dashboard**: View recent mints and contract statistics
- **💼 Wallet Integration**: Connect MetaMask or any Web3 wallet
- **🌐 Arc Testnet**: Built for Arc Network with USDC as native gas token

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MetaMask** or compatible Web3 wallet
- **Arc Testnet USDC** (get from [Circle Faucet](https://faucet.circle.com))
- **Pinata Account** (for IPFS storage - [Sign up free](https://www.pinata.cloud/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "NFT Converter"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Pinata IPFS Storage (Required)
   VITE_PINATA_JWT=your_pinata_jwt_token_here
   
   # Contract Address (Required after deployment)
   VITE_CONTRACT_ADDRESS=0x...
   
   # Likes Contract Address (Optional - for on-chain likes)
   VITE_LIKES_CONTRACT_ADDRESS=0x...
   
   # Optional: Custom RPC URL
   VITE_ARC_RPC_URL=https://rpc.testnet.arc.network
   
   # For contract deployment (not exposed to frontend)
   ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
   PRIVATE_KEY=0x...your_private_key...
   ```

4. **Get your Pinata JWT Token**
   - Sign up at [Pinata](https://www.pinata.cloud/)
   - Go to API Keys → New Key → JWT
   - Copy the JWT token and add it to `.env` as `VITE_PINATA_JWT`

5. **Deploy the Smart Contract**
   
   See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions, or use the automated script:
   ```powershell
   .\deploy-contract.ps1
   ```
   
   After deployment, update `VITE_CONTRACT_ADDRESS` in your `.env` file.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Connect your MetaMask wallet
   - Switch to Arc Testnet (Chain ID: 5042002)
   - Start minting NFTs!

## 📁 Project Structure

```
├── contracts/              # Smart contracts (Solidity)
│   ├── ImageNFT.sol       # Main ERC-721 NFT contract
│   └── NFTLikes.sol        # On-chain likes contract
├── src/
│   ├── components/        # React components
│   │   ├── Navbar.tsx     # Navigation bar
│   │   ├── WalletButton.tsx # Wallet connection button
│   │   └── PreviewCard.tsx # Image preview card
│   ├── pages/             # Page components
│   │   ├── Mint.tsx       # NFT minting page
│   │   ├── Gallery.tsx    # NFT gallery page
│   │   └── Metrics.tsx    # Metrics dashboard
│   ├── services/          # Service modules
│   │   ├── arcWallet.ts   # Wallet & network integration
│   │   ├── ipfsStorage.ts # IPFS storage (Pinata)
│   │   ├── nftContract.ts # NFT contract interaction
│   │   └── nftLikes.ts    # Likes contract interaction
│   └── App.tsx            # Main app component
├── script/                 # Deployment scripts
│   ├── Deploy.s.sol       # Foundry deployment script
│   └── DeployLikes.s.sol  # Likes contract deployment
└── deploy-contract.ps1    # PowerShell deployment script
```

## 🔧 Configuration

### Arc Testnet Details

- **Chain ID**: `5042002`
- **RPC URL**: `https://rpc.testnet.arc.network`
- **Explorer**: `https://testnet.arcscan.app`
- **Native Token**: USDC (18 decimals for native balance, 6 decimals for ERC-20)

### Smart Contracts

#### ImageNFT Contract
- **Standard**: ERC-721
- **Features**: Minting with IPFS metadata, configurable minting fee
- **Functions**: `mint()`, `totalSupply()`, `tokenURI()`, `mintingFee()`

#### NFTLikes Contract
- **Features**: On-chain like storage, one like per user per NFT
- **Functions**: `like()`, `getLikeCount()`, `hasUserLiked()`

## 📖 Usage

### Minting an NFT

1. Navigate to the **Mint** page
2. Upload an image (drag & drop or click to select)
3. Enter NFT name and description
4. Click **Mint NFT**
5. Approve the transaction in MetaMask
6. Wait for confirmation
7. View your NFT in the **Gallery**

### Viewing NFTs

- **Gallery**: Browse all minted NFTs in a grid layout
- **Metrics**: View recent mints and contract statistics
- Click on any NFT to view details and like it

### Liking NFTs

- Click the heart icon on any NFT in the Gallery
- Each user can like an NFT only once
- Likes are stored on-chain (if contract deployed) or in localStorage (fallback)

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: ethers.js v6
- **Storage**: Pinata (IPFS)
- **Smart Contracts**: Solidity (OpenZeppelin)
- **Deployment**: Foundry

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Smart contract deployment guide
- [DEPLOY_LIKES_CONTRACT.md](./DEPLOY_LIKES_CONTRACT.md) - Likes contract deployment
- [SETUP_IPFS_KEY.md](./SETUP_IPFS_KEY.md) - IPFS/Pinata setup guide

## 🔒 Security Notes

- **Never commit your `.env` file** - it contains sensitive keys
- **Private keys** should never be exposed to the frontend
- **Testnet only** - This is configured for Arc Testnet, not mainnet
- **Pinata JWT** is exposed to frontend (required for IPFS uploads)

## 🌐 Network Information

### Adding Arc Testnet to MetaMask

The app will automatically prompt you to add Arc Testnet, or add it manually:

- **Network Name**: Arc Testnet
- **RPC URL**: `https://rpc.testnet.arc.network`
- **Chain ID**: `5042002`
- **Currency Symbol**: USDC
- **Block Explorer**: `https://testnet.arcscan.app`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Arc Network](https://arc.network/) - Blockchain infrastructure
- [OpenZeppelin](https://www.openzeppelin.com/) - Smart contract libraries
- [Pinata](https://www.pinata.cloud/) - IPFS storage
- [Foundry](https://book.getfoundry.sh/) - Development toolkit

---

**Built with ❤️ for the Arc Network ecosystem**
