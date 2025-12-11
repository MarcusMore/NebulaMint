import React, { useState, useCallback, useRef } from 'react';
import { AppMode, NFTMetadata, GenerationConfig, MintStatus } from './types';
import TabSelector from './components/TabSelector';
import WalletButton from './components/WalletButton';
import PreviewCard from './components/PreviewCard';
import { generateNFTImage } from './services/geminiService';
import { Sparkles, UploadCloud, FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  
  // Generation & Upload State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NFT Data State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  
  // Minting State
  const [mintStatus, setMintStatus] = useState<MintStatus>({ status: 'idle' });

  // --- Handlers ---

  // 1. Wallet Simulation
  const handleConnectWallet = useCallback(async () => {
    setIsConnectingWallet(true);
    // Simulate network delay
    setTimeout(() => {
      // Mock address
      const mockAddress = "0x71C...9A21"; 
      setWalletAddress(mockAddress);
      setIsConnectingWallet(false);
    }, 1000);
  }, []);

  const handleDisconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setMintStatus({ status: 'idle' });
  }, []);

  // 2. File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
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
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 3. AI Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setMintStatus({ status: 'idle' });
    
    try {
      const config: GenerationConfig = {
        prompt: prompt,
        aspectRatio: "1:1"
      };
      
      const base64Image = await generateNFTImage(config);
      setPreviewImage(base64Image);
      // Auto-fill description if empty
      if (!nftDescription) {
          setNftDescription(`AI Generated artwork based on prompt: "${prompt}"`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Minting Process (Simulation)
  const handleMint = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!previewImage) {
      alert("No image to mint!");
      return;
    }
    if (!nftName) {
        alert("Please provide a name for your NFT.");
        return;
    }

    // Step 1: Uploading to IPFS
    setMintStatus({ status: 'uploading_ipfs' });
    
    setTimeout(() => {
      // Step 2: Confirming Transaction
      setMintStatus({ status: 'confirming_tx' });
      
      setTimeout(() => {
        // Step 3: Success
        setMintStatus({ 
          status: 'success', 
          txHash: '0x8f3c...7b2a', 
          tokenId: Math.floor(Math.random() * 10000).toString() 
        });
      }, 2000);
    }, 2000);
  };

  // Reset UI when switching modes
  const switchMode = (newMode: AppMode) => {
    setMode(newMode);
    // Optional: clear state or keep it? Keeping it feels better for UX
    setMintStatus({ status: 'idle' });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-brand-500 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Nebula<span className="text-brand-500">Mint</span></span>
          </div>
          <WalletButton 
            address={walletAddress} 
            isConnecting={isConnectingWallet}
            onConnect={handleConnectWallet}
            onDisconnect={handleDisconnectWallet}
          />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Header Text */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-100 to-gray-400">
            Create. Mint. Collect.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Turn your ideas into digital assets. Generate unique art with AI or upload your own creations to the blockchain.
          </p>
        </div>

        <TabSelector currentMode={mode} onSelectMode={switchMode} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN: Input / Generation */}
          <div className="space-y-6">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-xl">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                {mode === AppMode.UPLOAD ? (
                  <>
                    <UploadCloud className="text-brand-500" />
                    Upload Source
                  </>
                ) : (
                  <>
                    <Sparkles className="text-indigo-500" />
                    AI Generation
                  </>
                )}
              </h2>

              {mode === AppMode.UPLOAD ? (
                // Upload Mode UI
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-dark-600 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-dark-700/50 hover:border-brand-500 transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-brand-400" />
                  </div>
                  <p className="font-medium text-gray-300">Click to upload image</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              ) : (
                // Generate Mode UI
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A cyberpunk cat sitting on a neon skyscraper, synthwave style..."
                      className="w-full bg-dark-900 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32"
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-dark-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Dreaming...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Artwork
                      </>
                    )}
                  </button>
                </div>
              )}
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
              loading={isGenerating} 
              altText={mode === AppMode.UPLOAD ? "Upload an image to see preview" : "Enter a prompt to generate preview"}
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
                          setNftName('');
                          setNftDescription('');
                          setPrompt('');
                        }}
                        className="text-white bg-dark-700 hover:bg-dark-600 w-full py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                         Mint Another
                      </button>

                       <a href="#" className="mt-4 text-brand-500 text-sm hover:underline flex items-center gap-1">
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

export default App;