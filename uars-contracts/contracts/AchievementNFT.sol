// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AchievementNFT
 * @dev Universal Achievement NFT Contract for UARS (Universal Achievement Reputation System)
 * Mints achievement badges as NFTs on Push Chain for cross-chain reputation verification
 */

contract AchievementNFT {
    // Achievement structure
    struct Achievement {
        uint256 tokenId;
        string achievementType;
        string name;
        string description;
        string chain;
        uint256 points;
        uint256 timestamp;
        bool verified;
        string metadata;
    }

    // State variables
    uint256 private _tokenIdCounter;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(address => uint256) public reputationScores;
    address public owner;

    // Events
    event AchievementMinted(
        address indexed user,
        uint256 indexed tokenId,
        string achievementType,
        uint256 points,
        string chain
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        _tokenIdCounter = 1;
    }

    /**
     * @dev Mint a new achievement NFT
     * @param user Address of the user receiving the achievement
     * @param achievementType Type of achievement (e.g., "DEFI_MASTER")
     * @param name Achievement name
     * @param description Achievement description
     * @param chain Blockchain where achievement was earned
     * @param points Points awarded for this achievement
     * @param metadata Additional metadata in JSON format
     */
    function mintAchievement(
        address user,
        string memory achievementType,
        string memory name,
        string memory description,
        string memory chain,
        uint256 points,
        string memory metadata
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        Achievement memory newAchievement = Achievement({
            tokenId: tokenId,
            achievementType: achievementType,
            name: name,
            description: description,
            chain: chain,
            points: points,
            timestamp: block.timestamp,
            verified: true,
            metadata: metadata
        });

        achievements[tokenId] = newAchievement;
        userAchievements[user].push(tokenId);

        // Update reputation score
        uint256 oldScore = reputationScores[user];
        uint256 newScore = oldScore + points;
        reputationScores[user] = newScore;

        emit AchievementMinted(user, tokenId, achievementType, points, chain);
        emit ReputationUpdated(user, oldScore, newScore);

        return tokenId;
    }

    /**
     * @dev Get all achievements for a user
     * @param user Address of the user
     * @return Array of achievement token IDs
     */
    function getUserAchievements(address user) public view returns (uint256[] memory) {
        return userAchievements[user];
    }

    /**
     * @dev Get achievement details by token ID
     * @param tokenId Token ID of the achievement
     */
    function getAchievement(uint256 tokenId) public view returns (Achievement memory) {
        return achievements[tokenId];
    }

    /**
     * @dev Get user's total reputation score
     * @param user Address of the user
     * @return Total reputation points
     */
    function getReputationScore(address user) public view returns (uint256) {
        return reputationScores[user];
    }

    /**
     * @dev Manually update reputation score (for cross-chain sync)
     * @param user Address of the user
     * @param newScore New reputation score
     */
    function updateReputationScore(address user, uint256 newScore) public onlyOwner {
        uint256 oldScore = reputationScores[user];
        reputationScores[user] = newScore;
        emit ReputationUpdated(user, oldScore, newScore);
    }

    /**
     * @dev Get achievement count for a user
     * @param user Address of the user
     * @return Number of achievements
     */
    function getAchievementCount(address user) public view returns (uint256) {
        return userAchievements[user].length;
    }

    /**
     * @dev Transfer ownership
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}

