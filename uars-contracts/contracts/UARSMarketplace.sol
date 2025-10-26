// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationRegistry.sol";

/**
 * @title UARSMarketplace
 * @dev NFT Marketplace with reputation-based benefits
 * Higher reputation = lower fees, instant settlement, priority listings
 */
contract UARSMarketplace {
    ReputationRegistry public reputationRegistry;
    
    struct NFTListing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 listedAt;
    }
    
    struct MockNFT {
        uint256 tokenId;
        address owner;
        string name;
        string imageUrl;
    }
    
    mapping(uint256 => NFTListing) public listings;
    mapping(uint256 => MockNFT) public nfts;
    mapping(address => uint256[]) public userNFTs;
    
    uint256 public nextListingId;
    uint256 public nextTokenId;
    uint256 public constant BASE_FEE = 250; // 2.5% in basis points
    
    event NFTMinted(address indexed owner, uint256 tokenId, string name);
    event NFTListed(uint256 indexed listingId, address indexed seller, uint256 price, uint256 fee);
    event NFTSold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price);
    event ReputationPointsEarned(address indexed user, uint256 points, string reason);
    
    constructor(address _reputationRegistry) {
        reputationRegistry = ReputationRegistry(_reputationRegistry);
        nextListingId = 1;
        nextTokenId = 1;
    }
    
    /**
     * @notice Mint a demo NFT for testing
     */
    function mintNFT(string memory name, string memory imageUrl) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        nfts[tokenId] = MockNFT({
            tokenId: tokenId,
            owner: msg.sender,
            name: name,
            imageUrl: imageUrl
        });
        
        userNFTs[msg.sender].push(tokenId);
        
        emit NFTMinted(msg.sender, tokenId, name);
        
        // Award reputation points for minting
        _awardReputationPoints(msg.sender, 25, "NFT Minted");
        
        return tokenId;
    }
    
    /**
     * @notice List NFT for sale with reputation-based fees
     */
    function listNFT(uint256 tokenId, uint256 price) external returns (uint256) {
        require(nfts[tokenId].owner == msg.sender, "Not NFT owner");
        require(price > 0, "Price must be > 0");
        
        // Get user's reputation benefits
        ReputationRegistry.Benefits memory benefits = reputationRegistry.calculateBenefits(msg.sender);
        
        // Calculate fee based on tier (higher tier = lower fee)
        uint256 fee = _calculateFee(msg.sender);
        
        uint256 listingId = nextListingId++;
        listings[listingId] = NFTListing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            active: true,
            listedAt: block.timestamp
        });
        
        // Priority listing for high reputation users
        if (benefits.premiumAccess) {
            // In production, this would place listing at top of marketplace
        }
        
        emit NFTListed(listingId, msg.sender, price, fee);
        
        // Award reputation points for listing
        _awardReputationPoints(msg.sender, 10, "NFT Listed");
        
        return listingId;
    }
    
    /**
     * @notice Buy NFT with reputation-based benefits
     */
    function buyNFT(uint256 listingId) external payable {
        NFTListing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        address seller = listing.seller;
        uint256 tokenId = listing.tokenId;
        uint256 price = listing.price;
        
        // Calculate fees for both parties
        uint256 sellerFee = _calculateFee(seller);
        uint256 buyerFee = _calculateFee(msg.sender);
        
        uint256 totalFee = (price * (sellerFee + buyerFee)) / 10000;
        uint256 sellerReceives = price - totalFee;
        
        // Transfer NFT ownership
        nfts[tokenId].owner = msg.sender;
        listing.active = false;
        
        // Remove from seller's NFTs
        _removeNFTFromUser(seller, tokenId);
        // Add to buyer's NFTs
        userNFTs[msg.sender].push(tokenId);
        
        // Transfer payment to seller
        payable(seller).transfer(sellerReceives);
        
        // Return excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        // Award reputation points for successful trade
        _awardReputationPoints(seller, 75, "NFT Sold");
        _awardReputationPoints(msg.sender, 50, "NFT Purchased");
        
        emit NFTSold(listingId, msg.sender, seller, price);
    }
    
    /**
     * @notice Get marketplace fee based on reputation
     */
    function getMarketplaceFee(address user) external view returns (uint256) {
        return _calculateFee(user);
    }
    
    /**
     * @notice Get all active listings
     */
    function getActiveListings() external view returns (NFTListing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) activeCount++;
        }
        
        NFTListing[] memory activeListings = new NFTListing[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @notice Get user's NFTs
     */
    function getUserNFTs(address user) external view returns (MockNFT[] memory) {
        uint256[] memory tokenIds = userNFTs[user];
        MockNFT[] memory userNFTList = new MockNFT[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            userNFTList[i] = nfts[tokenIds[i]];
        }
        
        return userNFTList;
    }
    
    /**
     * @dev Calculate fee based on user's reputation tier
     */
    function _calculateFee(address user) internal view returns (uint256) {
        ReputationRegistry.UserProfile memory profile = reputationRegistry.getUserProfile(user);
        
        // Fee reduction based on tier
        if (profile.tier == 4) return 50;  // Diamond: 0.5%
        if (profile.tier == 3) return 100; // Platinum: 1.0%
        if (profile.tier == 2) return 150; // Gold: 1.5%
        if (profile.tier == 1) return 200; // Silver: 2.0%
        return BASE_FEE; // Bronze: 2.5%
    }
    
    /**
     * @dev Remove NFT from user's list
     */
    function _removeNFTFromUser(address user, uint256 tokenId) internal {
        uint256[] storage nftList = userNFTs[user];
        for (uint256 i = 0; i < nftList.length; i++) {
            if (nftList[i] == tokenId) {
                nftList[i] = nftList[nftList.length - 1];
                nftList.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Award reputation points
     */
    function _awardReputationPoints(address user, uint256 points, string memory reason) internal {
        emit ReputationPointsEarned(user, points, reason);
    }
}


