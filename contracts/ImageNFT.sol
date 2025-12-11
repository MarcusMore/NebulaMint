// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ImageNFT
 * @dev ERC-721 NFT contract for minting image-based NFTs on Arc Network
 * Follows Arc Network best practices for EVM-compatible contracts
 */
contract ImageNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Minting fee in USDC (stored with 18 decimals to match native balance)
    // Note: On Arc, native USDC uses 18 decimals, ERC-20 interface uses 6 decimals
    // Since this contract uses msg.value (native balance), we use 18 decimals
    uint256 public mintingFee;
    
    // Events
    event ImageMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param baseURI Base URI for token metadata (typically IPFS gateway)
     * @param _mintingFee Initial minting fee in USDC (18 decimals - native balance format)
     *                    Example: 1 USDC = 1000000000000000000 (18 decimals)
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 _mintingFee
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        mintingFee = _mintingFee;
    }
    
    /**
     * @dev Mint a new NFT with image metadata
     * @param to Address to mint the NFT to
     * @param tokenURI IPFS URI pointing to the NFT metadata JSON
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory tokenURI) 
        public 
        payable 
        returns (uint256) 
    {
        require(msg.value >= mintingFee, "ImageNFT: Insufficient minting fee");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit ImageMinted(to, tokenId, tokenURI, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Get the current token ID counter
     * @return Current token ID
     */
    function currentTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Get total supply of minted NFTs
     * @return Total supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Update minting fee (only owner)
     * @param newFee New minting fee in USDC
     */
    function setMintingFee(uint256 newFee) public onlyOwner {
        mintingFee = newFee;
    }
    
    /**
     * @dev Update base URI (only owner)
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

