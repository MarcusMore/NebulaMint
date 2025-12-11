import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

const Whitepaper: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-white pb-20">
      {/* Header */}
      <div className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">NebulaMint Whitepaper</h1>
              <p className="text-gray-400 text-sm mt-1">Technical Documentation & Vision</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="prose prose-invert prose-lg max-w-none">
          
          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">Executive Summary</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              NebulaMint is a decentralized application (DApp) built on the Arc Network that enables users to 
              transform digital images into non-fungible tokens (NFTs) on the blockchain. By leveraging Arc's 
              sub-second finality and EVM compatibility, NebulaMint provides a seamless, cost-effective platform 
              for NFT creation, storage, and interaction.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The platform combines IPFS for decentralized storage, on-chain interaction features, and a modern 
              web interface to create an accessible NFT minting experience. Built with security, scalability, and 
              user experience in mind, NebulaMint aims to democratize NFT creation on the Arc Network.
            </p>
          </section>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">1. Introduction</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">1.1 Background</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              The NFT market has experienced explosive growth, but many platforms suffer from high gas fees, 
              slow transaction times, and complex user experiences. Arc Network addresses these challenges 
              with its deterministic sub-second finality and native USDC support, making it an ideal platform 
              for NFT applications.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">1.2 Mission</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              NebulaMint's mission is to provide a simple, fast, and affordable platform for NFT creation on 
              Arc Network. We aim to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Lower barriers to entry for NFT creation</li>
              <li>Ensure permanent, decentralized storage of NFT assets</li>
              <li>Enable social interaction through on-chain features</li>
              <li>Provide transparent, verifiable NFT ownership</li>
            </ul>
          </section>

          {/* Technical Architecture */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">2. Technical Architecture</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Blockchain Layer</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              NebulaMint is built on <strong>Arc Testnet</strong>, an EVM-compatible blockchain with:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Chain ID:</strong> 5042002</li>
              <li><strong>Native Token:</strong> USDC (18 decimals for native balance, 6 decimals for ERC-20)</li>
              <li><strong>Finality:</strong> Deterministic sub-second</li>
              <li><strong>RPC Endpoint:</strong> https://rpc.testnet.arc.network</li>
              <li><strong>Explorer:</strong> https://testnet.arcscan.app</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Smart Contracts</h3>
            
            <div className="bg-dark-800 rounded-lg p-6 mb-4 border border-dark-700">
              <h4 className="text-lg font-semibold mb-3 text-brand-300">ImageNFT Contract</h4>
              <p className="text-gray-300 mb-3">
                The core ERC-721 contract that handles NFT minting and management:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li><strong>Standard:</strong> ERC-721 with URI Storage extension</li>
                <li><strong>Features:</strong> Configurable minting fee, owner controls</li>
                <li><strong>Functions:</strong> mint(), totalSupply(), tokenURI(), setMintingFee()</li>
                <li><strong>Events:</strong> ImageMinted(address, uint256, string, uint256)</li>
              </ul>
            </div>

            <div className="bg-dark-800 rounded-lg p-6 mb-4 border border-dark-700">
              <h4 className="text-lg font-semibold mb-3 text-brand-300">NFTLikes Contract</h4>
              <p className="text-gray-300 mb-3">
                A separate contract for on-chain social interaction:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li><strong>Purpose:</strong> Store like counts and user likes on-chain</li>
                <li><strong>Features:</strong> One like per user per NFT, batch queries</li>
                <li><strong>Functions:</strong> like(), getLikeCount(), hasUserLiked()</li>
                <li><strong>Events:</strong> NFTLiked(address, uint256, bool)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Storage Layer</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              NebulaMint uses <strong>IPFS (InterPlanetary File System)</strong> via <strong>Pinata</strong> for 
              decentralized storage:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Images are uploaded to IPFS and receive a Content Identifier (CID)</li>
              <li>Metadata JSON files reference the image CID</li>
              <li>Multiple IPFS gateways ensure content availability</li>
              <li>Storage is permanent and censorship-resistant</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Frontend Architecture</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Built with modern web technologies:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Framework:</strong> React 19 with TypeScript</li>
              <li><strong>Build Tool:</strong> Vite</li>
              <li><strong>Styling:</strong> Tailwind CSS</li>
              <li><strong>Web3 Library:</strong> ethers.js v6</li>
              <li><strong>Routing:</strong> React Router DOM</li>
            </ul>
          </section>

          {/* Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">3. Features</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 NFT Minting</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Drag-and-drop image upload</li>
              <li>Automatic IPFS storage</li>
              <li>Metadata creation (name, description, attributes)</li>
              <li>Configurable minting fees</li>
              <li>Real-time transaction status</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Gallery & Discovery</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Grid view of all minted NFTs</li>
              <li>IPFS image loading with fallback gateways</li>
              <li>Metadata display</li>
              <li>Transaction links to block explorer</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Social Features</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>On-chain likes (one per user per NFT)</li>
              <li>Like status persistence</li>
              <li>Shared like counts across all users</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Analytics</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Recent mints dashboard</li>
              <li>Contract statistics</li>
              <li>Transaction history</li>
            </ul>
          </section>

          {/* Use Cases */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">4. Use Cases</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <h4 className="text-lg font-semibold mb-2 text-brand-300">Digital Art</h4>
                <p className="text-gray-300 text-sm">
                  Artists can mint their digital artwork as NFTs, ensuring provenance and ownership on the blockchain.
                </p>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <h4 className="text-lg font-semibold mb-2 text-brand-300">Collectibles</h4>
                <p className="text-gray-300 text-sm">
                  Create unique collectible items with metadata attributes for gaming, trading, or display purposes.
                </p>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <h4 className="text-lg font-semibold mb-2 text-brand-300">Memorabilia</h4>
                <p className="text-gray-300 text-sm">
                  Preserve important moments, achievements, or memories as verifiable NFTs on the blockchain.
                </p>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <h4 className="text-lg font-semibold mb-2 text-brand-300">Proof of Ownership</h4>
                <p className="text-gray-300 text-sm">
                  Establish verifiable ownership of digital assets with transparent, immutable records.
                </p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">5. Security Considerations</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Smart Contract Security</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Uses battle-tested OpenZeppelin contracts</li>
              <li>Implements standard ERC-721 with proven security patterns</li>
              <li>Owner-only functions for critical operations</li>
              <li>Input validation and overflow protection</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Storage Security</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>IPFS provides decentralized, censorship-resistant storage</li>
              <li>Content addressing ensures data integrity</li>
              <li>Multiple gateway fallbacks prevent single points of failure</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 User Security</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>Private keys never leave user's wallet</li>
              <li>All transactions require explicit user approval</li>
              <li>No central authority controls user assets</li>
              <li>Environment variables properly scoped (VITE_ prefix)</li>
            </ul>
          </section>

          {/* Roadmap */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">6. Roadmap</h2>
            
            <div className="space-y-4">
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 text-sm font-bold">✓</span>
                  </div>
                  <h4 className="text-lg font-semibold text-brand-300">Phase 1: Core Functionality (Completed)</h4>
                </div>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-11 text-sm">
                  <li>NFT minting with IPFS storage</li>
                  <li>Gallery view</li>
                  <li>Wallet integration</li>
                  <li>Metrics dashboard</li>
                </ul>
              </div>

              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 text-sm font-bold">✓</span>
                  </div>
                  <h4 className="text-lg font-semibold text-brand-300">Phase 2: Social Features (Completed)</h4>
                </div>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-11 text-sm">
                  <li>On-chain likes system</li>
                  <li>One-time like per user</li>
                  <li>Shared like counts</li>
                </ul>
              </div>

              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 opacity-75">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <span className="text-brand-500 text-sm font-bold">→</span>
                  </div>
                  <h4 className="text-lg font-semibold text-brand-300">Phase 3: Future Enhancements</h4>
                </div>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-11 text-sm">
                  <li>NFT marketplace integration</li>
                  <li>Advanced filtering and search</li>
                  <li>Collection creation</li>
                  <li>Royalty system</li>
                  <li>Multi-chain support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">7. Technical Specifications</h2>
            
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4 text-brand-300">Contract Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Solidity Version</p>
                  <p className="text-gray-300 font-mono">^0.8.30</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">ERC Standard</p>
                  <p className="text-gray-300 font-mono">ERC-721</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">License</p>
                  <p className="text-gray-300 font-mono">MIT</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Network</p>
                  <p className="text-gray-300 font-mono">Arc Testnet</p>
                </div>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">8. Conclusion</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              NebulaMint represents a step forward in making NFT creation accessible, fast, and affordable. 
              By leveraging Arc Network's unique capabilities and IPFS for decentralized storage, we've created 
              a platform that combines the best of blockchain technology with a user-friendly experience.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              As the NFT ecosystem continues to evolve, NebulaMint will adapt and grow, adding new features 
              and capabilities while maintaining our core principles of decentralization, transparency, and 
              user empowerment.
            </p>
            <p className="text-gray-300 leading-relaxed">
              We invite developers, artists, and enthusiasts to join us in building the future of digital 
              ownership on Arc Network.
            </p>
          </section>

          {/* Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-400">9. Resources</h2>
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://arc.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-2"
                  >
                    Arc Network Documentation <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://docs.openzeppelin.com/contracts" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-2"
                  >
                    OpenZeppelin Contracts <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://docs.ipfs.tech" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-2"
                  >
                    IPFS Documentation <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.pinata.cloud" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-2"
                  >
                    Pinata IPFS Service <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://testnet.arcscan.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-2"
                  >
                    Arc Testnet Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-dark-700 pt-8 mt-12 text-center">
            <p className="text-gray-400 text-sm mb-2">
              NebulaMint Whitepaper v1.0
            </p>
            <p className="text-gray-500 text-xs">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Whitepaper;

