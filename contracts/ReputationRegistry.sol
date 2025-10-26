// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationRegistry
 * @dev Central registry for cross-chain reputation scores and verification
 * Protocols can query this contract to get user reputation data
 */

contract ReputationRegistry {
    // User Profile structure
    struct UserProfile {
        address userAddress;
        uint256 universalScore;
        uint8 tier; // 0=bronze, 1=silver, 2=gold, 3=platinum, 4=diamond
        uint256 lastUpdated;
        bool isVerified;
    }

    // Chain Activity structure
    struct ChainActivity {
        string chainName;
        uint256 chainId;
        uint256 transactionCount;
        uint256 volumeUSD;
        uint256 firstTransaction;
        uint256 lastTransaction;
    }

    // Benefit calculation structure
    struct Benefits {
        uint16 collateralRatio; // In basis points (e.g., 12000 = 120%)
        uint16 interestRate; // In basis points (e.g., 450 = 4.5%)
        uint8 votingMultiplier;
        bool skipTutorials;
        bool premiumAccess;
    }

    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(address => ChainActivity[]) public userChainActivities;
    mapping(address => address[]) public connectedWallets;
    address public owner;

    // Events
    event ProfileUpdated(address indexed user, uint256 universalScore, uint8 tier);
    event ChainActivityAdded(address indexed user, string chainName, uint256 transactionCount);
    event WalletConnected(address indexed mainWallet, address indexed connectedWallet);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Update or create user profile
     */
    function updateUserProfile(
        address user,
        uint256 universalScore,
        uint8 tier,
        bool isVerified
    ) public onlyOwner {
        userProfiles[user] = UserProfile({
            userAddress: user,
            universalScore: universalScore,
            tier: tier,
            lastUpdated: block.timestamp,
            isVerified: isVerified
        });

        emit ProfileUpdated(user, universalScore, tier);
    }

    /**
     * @dev Add chain activity for a user
     */
    function addChainActivity(
        address user,
        string memory chainName,
        uint256 chainId,
        uint256 transactionCount,
        uint256 volumeUSD,
        uint256 firstTransaction,
        uint256 lastTransaction
    ) public onlyOwner {
        ChainActivity memory activity = ChainActivity({
            chainName: chainName,
            chainId: chainId,
            transactionCount: transactionCount,
            volumeUSD: volumeUSD,
            firstTransaction: firstTransaction,
            lastTransaction: lastTransaction
        });

        userChainActivities[user].push(activity);
        emit ChainActivityAdded(user, chainName, transactionCount);
    }

    /**
     * @dev Connect additional wallet to main address
     */
    function connectWallet(address mainWallet, address additionalWallet) public onlyOwner {
        connectedWallets[mainWallet].push(additionalWallet);
        emit WalletConnected(mainWallet, additionalWallet);
    }

    /**
     * @dev Get user profile
     */
    function getUserProfile(address user) public view returns (UserProfile memory) {
        return userProfiles[user];
    }

    /**
     * @dev Get user's chain activities
     */
    function getUserChainActivities(address user) public view returns (ChainActivity[] memory) {
        return userChainActivities[user];
    }

    /**
     * @dev Get connected wallets for a user
     */
    function getConnectedWallets(address user) public view returns (address[] memory) {
        return connectedWallets[user];
    }

    /**
     * @dev Calculate benefits based on user tier
     */
    function calculateBenefits(address user) public view returns (Benefits memory) {
        UserProfile memory profile = userProfiles[user];
        
        Benefits memory benefits;
        
        if (profile.tier == 0) { // Bronze
            benefits = Benefits(15000, 800, 1, false, false); // 150%, 8%
        } else if (profile.tier == 1) { // Silver
            benefits = Benefits(14000, 700, 2, false, false); // 140%, 7%
        } else if (profile.tier == 2) { // Gold
            benefits = Benefits(12000, 500, 3, true, false); // 120%, 5%
        } else if (profile.tier == 3) { // Platinum
            benefits = Benefits(12000, 450, 5, true, true); // 120%, 4.5%
        } else { // Diamond
            benefits = Benefits(11000, 250, 10, true, true); // 110%, 2.5%
        }
        
        return benefits;
    }

    /**
     * @dev Check if user has minimum reputation for access
     */
    function hasMinimumReputation(address user, uint256 minScore) public view returns (bool) {
        return userProfiles[user].universalScore >= minScore;
    }

    /**
     * @dev Get user tier name
     */
    function getTierName(uint8 tier) public pure returns (string memory) {
        if (tier == 0) return "Bronze";
        if (tier == 1) return "Silver";
        if (tier == 2) return "Gold";
        if (tier == 3) return "Platinum";
        if (tier == 4) return "Diamond";
        return "Unknown";
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}

