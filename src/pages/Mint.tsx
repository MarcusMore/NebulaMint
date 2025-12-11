import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MintStatus } from '../types';
import WalletButton from '../components/WalletButton';
import PreviewCard from '../components/PreviewCard';
import { 
  connectWallet, 
  disconnectWallet, 
  getCurrentAddress, 
  getBalance,
  isWalletInstalled,
  onAccountsChanged,
  onChainChanged
} from '../services/arcWallet';
import { storeNFT } from '../services/ipfsStorage';
import { mintNFT, getMintingFee } from '../services/nftContract';
import { Sparkles, UploadCloud, FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

// Contract address - Update this after deploying your contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// Arc Testnet Explorer URL
const EXPLORER_URL = 'https://testnet.arcscan.app';

const Mint: React.FC = () => {
  // --- State ---
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  
  // Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NFT Data State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageData, setPreviewImageData] = useState<string | File | null>(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  
  // Minting State
  const [mintStatus, setMintStatus] = useState<MintStatus>({ status: 'idle' });
  const [mintingFee, setMintingFee] = useState<string>('0');

  // --- Effects ---
  
  // Function to load wallet balance
  const loadBalance = async (address: string) => {
    try {
      const balance = await getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
      setWalletBalance(null);
    }
  };

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      if (isWalletInstalled()) {
        const address = await getCurrentAddress();
        if (address) {
          setWalletAddress(address);
          await loadBalance(address);
        }
      }
    };
    checkWallet();
    
    // Listen for account changes
    const cleanupAccounts = onAccountsChanged(async (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await loadBalance(accounts[0]);
      } else {
        setWalletAddress(null);
        setWalletBalance(null);
      }
    });
    
    // Listen for chain changes
    const cleanupChain = onChainChanged(() => {
      window.location.reload();
    });
    
    return () => {
      cleanupAccounts();
      cleanupChain();
    };
  }, []);
  
  // Load minting fee on mount and when contract address is available
  useEffect(() => {
    const loadMintingFee = async () => {
      if (CONTRACT_ADDRESS && walletAddress) {
        try {
          const fee = await getMintingFee(CONTRACT_ADDRESS);
          setMintingFee(fee);
        } catch (error) {
          console.error('Error loading minting fee:', error);
        }
      }
    };
    loadMintingFee();
  }, [walletAddress]);

  // --- Handlers ---

  // 1. Wallet Connection
  const handleConnectWallet = useCallback(async () => {
    if (!isWalletInstalled()) {
      alert('Please install MetaMask or another Web3 wallet to continue.');
      window.open('https://metamask.io/', '_blank');
      return;
    }
    
    setIsConnectingWallet(true);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await loadBalance(address);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnectingWallet(false);
    }
  }, []);

  const handleDisconnectWallet = useCallback(() => {
    disconnectWallet();
    setWalletAddress(null);
    setWalletBalance(null);
    setMintStatus({ status: 'idle' });
  }, []);

  // 2. File Upload - Process file (used by both drag-drop and file input)
  const processFile = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, GIF, etc.)');
      return;
    }
    
    setUploadedFile(file);
    setPreviewImageData(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      // Auto-fill name based on filename if empty
      if (!nftName) {
          setNftName(file.name.split('.')[0]);
      }
    };
    reader.readAsDataURL(file);
    // Reset mint status if we change image
    setMintStatus({ status: 'idle' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  // 3. Minting Process
  const handleMint = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!previewImage || !previewImageData) {
      alert("No image to mint!");
      return;
    }
    if (!nftName.trim()) {
      alert("Please provide a name for your NFT.");
      return;
    }
    if (!CONTRACT_ADDRESS) {
      alert("Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your .env file.");
      return;
    }

    try {
      // Step 1: Upload to IPFS
      setMintStatus({ status: 'uploading_ipfs' });
      
      let metadataURI: string;
      try {
        // Store NFT on IPFS (image + metadata)
        metadataURI = await storeNFT(previewImageData, {
          name: nftName.trim(),
          description: nftDescription.trim() || `NFT: ${nftName}`,
          attributes: [
            { trait_type: 'Type', value: 'Image' },
            { trait_type: 'Format', value: uploadedFile?.type || 'image/png' },
          ],
        });
      } catch (ipfsError: any) {
        console.error('IPFS upload error:', ipfsError);
        setMintStatus({ 
          status: 'error', 
          error: `Failed to upload to IPFS: ${ipfsError.message}` 
        });
        return;
      }

      // Step 2: Mint NFT on blockchain
      setMintStatus({ status: 'confirming_tx' });
      
      try {
        const result = await mintNFT(CONTRACT_ADDRESS, metadataURI, mintingFee);
        
        // Step 3: Success
        setMintStatus({ 
          status: 'success', 
          txHash: result.txHash, 
          tokenId: result.tokenId 
        });
        
        // Refresh balance after successful mint
        if (walletAddress) {
          await loadBalance(walletAddress);
        }
      } catch (mintError: any) {
        console.error('Minting error:', mintError);
        setMintStatus({ 
          status: 'error', 
          error: mintError.message || 'Failed to mint NFT. Please try again.' 
        });
      }
    } catch (error: any) {
      console.error('Unexpected error during minting:', error);
      setMintStatus({ 
        status: 'error', 
        error: error.message || 'An unexpected error occurred. Please try again.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-brand-500 selection:text-white pb-20">
      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Header Text */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-100 to-gray-400">
            Upload. Mint. Collect.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Transform your images into NFTs on Arc Testnet. Upload, customize, and mint to the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN: Upload */}
          <div className="space-y-6">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-xl">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <UploadCloud className="text-brand-500" />
                Upload Image
              </h2>

              <div 
                onClick={triggerFileInput}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                  isDragging
                    ? 'border-brand-500 bg-brand-500/10 scale-[1.02]'
                    : 'border-dark-600 hover:bg-dark-700/50 hover:border-brand-500'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                  isDragging
                    ? 'bg-brand-500/20 scale-110'
                    : 'bg-dark-700 group-hover:scale-110'
                }`}>
                  <UploadCloud className={`w-8 h-8 transition-colors ${
                    isDragging
                      ? 'text-brand-400'
                      : 'text-gray-400 group-hover:text-brand-400'
                  }`} />
                </div>
                <p className={`font-medium transition-colors ${
                  isDragging ? 'text-brand-300' : 'text-gray-300'
                }`}>
                  {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Metadata Form */}
            <div className={`bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-xl transition-opacity ${!previewImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <FileText className="text-brand-500" />
                NFT Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    placeholder="e.g., Cosmic Kitty #001"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    placeholder="Describe your NFT..."
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none h-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview & Mint */}
          <div className="lg:sticky lg:top-28 space-y-6">
            <h2 className="text-xl font-display font-bold mb-0 lg:hidden">Preview</h2>
            
            <PreviewCard 
              imageSrc={previewImage} 
              loading={false} 
              altText="Upload an image to see preview"
            />

            {/* Mint Actions */}
            <div className="space-y-4">
              {mintStatus.status === 'idle' && (
                <button
                  onClick={handleMint}
                  disabled={!previewImage || !walletAddress || !nftName}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all text-lg tracking-wide"
                >
                  {!walletAddress ? 'Connect Wallet to Mint' : 'Mint NFT'}
                </button>
              )}

              {/* Status Views */}
              {mintStatus.status !== 'idle' && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   {/* 1. Uploading IPFS */}
                  {mintStatus.status === 'uploading_ipfs' && (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
                      <h3 className="font-bold text-white mb-1">Uploading Metadata</h3>
                      <p className="text-gray-400 text-sm">Pinning assets to IPFS...</p>
                    </div>
                  )}

                  {/* 2. Confirming */}
                  {mintStatus.status === 'confirming_tx' && (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                      <h3 className="font-bold text-white mb-1">Confirming Transaction</h3>
                      <p className="text-gray-400 text-sm">Waiting for blockchain confirmation...</p>
                    </div>
                  )}

                  {/* 3. Success */}
                  {mintStatus.status === 'success' && (
                    <div className="flex flex-col items-center py-2">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl text-white mb-2">Mint Successful!</h3>
                      <p className="text-gray-400 text-center mb-6">
                        Your NFT has been safely minted to the blockchain.
                      </p>
                      
                      <div className="w-full bg-dark-900 rounded-lg p-3 mb-4 flex justify-between items-center text-sm border border-dark-700">
                        <span className="text-gray-500">Token ID</span>
                        <span className="font-mono text-brand-400">#{mintStatus.tokenId}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setMintStatus({ status: 'idle' });
                          setPreviewImage(null);
                          setPreviewImageData(null);
                          setNftName('');
                          setNftDescription('');
                          setUploadedFile(null);
                        }}
                        className="text-white bg-dark-700 hover:bg-dark-600 w-full py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                         Mint Another
                      </button>

                       <a 
                         href={`${EXPLORER_URL}/tx/${mintStatus.txHash}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="mt-4 text-brand-500 text-sm hover:underline flex items-center gap-1 justify-center"
                       >
                        View on Explorer <ExternalLink className="w-3 h-3" />
                       </a>
                    </div>
                  )}
                  
                  {/* 4. Error */}
                  {mintStatus.status === 'error' && (
                    <div className="flex flex-col items-center py-4 text-center">
                       <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-white mb-1">Minting Failed</h3>
                      <p className="text-gray-400 text-sm mb-4">{mintStatus.error || "Something went wrong."}</p>
                      <button 
                        onClick={() => setMintStatus({ status: 'idle' })}
                        className="bg-red-500/10 text-red-400 px-6 py-2 rounded-lg hover:bg-red-500/20"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Mint;

