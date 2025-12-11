// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title NFTLikes
 * @dev Simple contract to track likes for NFTs
 * Users can like/unlike NFTs and see total like counts
 */
contract NFTLikes {
    // Mapping from tokenId to like count
    mapping(uint256 => uint256) public likeCounts;
    
    // Mapping from user address to tokenId to whether they liked it
    mapping(address => mapping(uint256 => bool)) public userLikes;
    
    // Events
    event NFTLiked(address indexed user, uint256 indexed tokenId, bool liked);
    
    /**
     * @dev Like an NFT (one-time only, cannot unlike)
     * @param tokenId The token ID to like
     */
    function like(uint256 tokenId) public {
        require(!userLikes[msg.sender][tokenId], "NFT already liked by this user");
        
        // Like: increase count
        likeCounts[tokenId]++;
        userLikes[msg.sender][tokenId] = true;
        
        emit NFTLiked(msg.sender, tokenId, true);
    }
    
    /**
     * @dev Toggle like for an NFT (for backward compatibility, but prevents unliking)
     * @param tokenId The token ID to like
     */
    function toggleLike(uint256 tokenId) public {
        // If already liked, do nothing (prevent unliking)
        if (userLikes[msg.sender][tokenId]) {
            return;
        }
        
        // Like: increase count
        likeCounts[tokenId]++;
        userLikes[msg.sender][tokenId] = true;
        
        emit NFTLiked(msg.sender, tokenId, true);
    }
    
    /**
     * @dev Get like count for an NFT
     * @param tokenId The token ID
     * @return The number of likes
     */
    function getLikeCount(uint256 tokenId) public view returns (uint256) {
        return likeCounts[tokenId];
    }
    
    /**
     * @dev Check if a user has liked an NFT
     * @param user The user address
     * @param tokenId The token ID
     * @return Whether the user has liked the NFT
     */
    function hasUserLiked(address user, uint256 tokenId) public view returns (bool) {
        return userLikes[user][tokenId];
    }
    
    /**
     * @dev Get like counts for multiple NFTs
     * @param tokenIds Array of token IDs
     * @return Array of like counts
     */
    function getLikeCounts(uint256[] memory tokenIds) public view returns (uint256[] memory) {
        uint256[] memory counts = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            counts[i] = likeCounts[tokenIds[i]];
        }
        return counts;
    }
}

