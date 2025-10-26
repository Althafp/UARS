// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title ReputationRegistry
 * @dev Stores and manages user reputation profiles and benefits
 */
contract ReputationRegistry {
    address public owner;
    
    struct UserProfile {
        uint256 universalScore;
        uint8 tier;
        uint256 lastUpdated;
        bool isVerified;
    }
    
    mapping(address => UserProfile) public userProfiles;
    
    event ProfileUpdated(address indexed user, uint256 score, uint8 tier);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function updateUserProfile(
        address user,
        uint256 score,
        uint8 tier,
        bool verified
    ) external onlyOwner {
        userProfiles[user] = UserProfile({
            universalScore: score,
            tier: tier,
            lastUpdated: block.timestamp,
            isVerified: verified
        });
        
        emit ProfileUpdated(user, score, tier);
    }
    
    function getUserProfile(address user) 
        external 
        view 
        returns (
            uint256 universalScore,
            uint8 tier,
            uint256 lastUpdated,
            bool isVerified
        ) 
    {
        UserProfile memory profile = userProfiles[user];
        return (
            profile.universalScore,
            profile.tier,
            profile.lastUpdated,
            profile.isVerified
        );
    }
    
    function calculateBenefits(address user) 
        external 
        view 
        returns (uint256 collateralRatio, uint256 interestRate) 
    {
        UserProfile memory profile = userProfiles[user];
        
        // Tier-based benefits
        // Tier 0 (Basic): 150% collateral, 8% interest
        // Tier 1 (Bronze): 150% collateral, 8% interest
        // Tier 2 (Gold): 120% collateral, 5% interest
        // Tier 3 (Platinum): 120% collateral, 4.5% interest
        // Tier 4 (Diamond): 110% collateral, 2.5% interest
        
        if (profile.tier == 0 || profile.tier == 1) {
            return (15000, 800); // 150%, 8%
        } else if (profile.tier == 2) {
            return (12000, 500); // 120%, 5%
        } else if (profile.tier == 3) {
            return (12000, 450); // 120%, 4.5%
        } else {
            return (11000, 250); // 110%, 2.5%
        }
    }
}
