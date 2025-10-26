// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title AchievementNFT
 * @dev Mints achievement NFTs based on real on-chain activity
 * Integrates with UARSLending to track DeFi achievements
 */
contract AchievementNFT {
    address public owner;
    
    // NFT Storage
    uint256 private _nextTokenId;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(string => bool)) public hasClaimed;
    
    // Achievement metadata
    struct Achievement {
        string achievementId;
        string name;
        string description;
        uint256 points;
        string rarity;
        uint256 timestamp;
        string imageUrl;
    }
    
    // Reference to lending contract (can be set after deployment)
    address public lendingContract;

    // Events
    event AchievementMinted(
        address indexed user,
        uint256 indexed tokenId,
        string achievementId,
        uint256 points
    );
    
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    
    event LendingContractSet(address indexed lendingContract);
    
    constructor() {
        owner = msg.sender;
        _nextTokenId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @dev Set lending contract address (can be called after deployment)
     */
    function setLendingContract(address _lendingContract) external onlyOwner {
        lendingContract = _lendingContract;
        emit LendingContractSet(_lendingContract);
    }
    
    /**
     * @dev Claim and mint an achievement NFT
     */
    function claimAchievement(string memory achievementId) external returns (uint256) {
        require(!hasClaimed[msg.sender][achievementId], "Already claimed");
        require(checkEligibility(msg.sender, achievementId), "Not eligible");
        
        uint256 tokenId = _nextTokenId++;
        
        // Get achievement data
        (
        string memory name,
        string memory description,
        uint256 points,
            string memory rarity,
            string memory imageUrl
        ) = getAchievementData(achievementId);
        
        // Mint NFT
        ownerOf[tokenId] = msg.sender;
        balanceOf[msg.sender]++;
        
        // Store achievement data
        achievements[tokenId] = Achievement({
            achievementId: achievementId,
            name: name,
            description: description,
            points: points,
            rarity: rarity,
            timestamp: block.timestamp,
            imageUrl: imageUrl
        });
        
        // Mark as claimed
        hasClaimed[msg.sender][achievementId] = true;
        
        emit Transfer(address(0), msg.sender, tokenId);
        emit AchievementMinted(msg.sender, tokenId, achievementId, points);

        return tokenId;
    }

    /**
     * @dev Check if user is eligible for an achievement
     */
    function checkEligibility(address user, string memory achievementId) public view returns (bool) {
        // Get user's loan count from lending contract
        uint256 loanCount = getLoanCount(user);
        
        // Check eligibility based on achievement type
        bytes32 id = keccak256(abi.encodePacked(achievementId));
        
        // DeFi Achievements
        if (id == keccak256(abi.encodePacked("defi-novice"))) {
            return loanCount >= 1;
        }
        if (id == keccak256(abi.encodePacked("defi-expert"))) {
            return loanCount >= 5;
        }
        if (id == keccak256(abi.encodePacked("defi-master"))) {
            return loanCount >= 10;
        }
        
        // Volume Achievements
        if (id == keccak256(abi.encodePacked("volume-starter"))) {
            return loanCount >= 2; // ~0.1 PC volume (0.05 * 2)
        }
        if (id == keccak256(abi.encodePacked("volume-trader"))) {
            return loanCount >= 20; // ~1 PC volume
        }
        
        // Consistency Achievements
        if (id == keccak256(abi.encodePacked("consistent-user"))) {
            return loanCount >= 6; // 3 complete cycles (borrow + repay)
        }
        if (id == keccak256(abi.encodePacked("perfect-record"))) {
            return loanCount >= 10; // 5 repayments
        }
        
        // Special Achievements (always available)
        if (id == keccak256(abi.encodePacked("early-adopter"))) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Get loan count from lending contract
     */
    function getLoanCount(address user) public view returns (uint256) {
        if (lendingContract == address(0)) {
            return 0; // No lending contract set yet
        }
        
        (bool success, bytes memory data) = lendingContract.staticcall(
            abi.encodeWithSignature("getUserLoans(address)", user)
        );
        
        if (success && data.length > 0) {
            uint256[] memory loans = abi.decode(data, (uint256[]));
            return loans.length;
        }
        
        return 0;
    }
    
    /**
     * @dev Get achievement metadata
     */
    function getAchievementData(string memory achievementId) 
        public 
        pure 
        returns (
            string memory name,
            string memory description,
            uint256 points,
            string memory rarity,
            string memory imageUrl
        ) 
    {
        bytes32 id = keccak256(abi.encodePacked(achievementId));
        
        // DeFi Achievements
        if (id == keccak256(abi.encodePacked("defi-novice"))) {
            return (
                "DeFi Novice",
                "Completed first DeFi transaction on UARS",
                50,
                "Common",
                "https://api.dicebear.com/7.x/shapes/svg?seed=defi-novice&backgroundColor=10b981"
            );
        }
        if (id == keccak256(abi.encodePacked("defi-expert"))) {
            return (
                "DeFi Expert",
                "Completed 5 DeFi transactions on UARS",
                200,
                "Rare",
                "https://api.dicebear.com/7.x/shapes/svg?seed=defi-expert&backgroundColor=3b82f6"
            );
        }
        if (id == keccak256(abi.encodePacked("defi-master"))) {
            return (
                "DeFi Master",
                "Completed 10 DeFi transactions on UARS",
                300,
                "Epic",
                "https://api.dicebear.com/7.x/shapes/svg?seed=defi-master&backgroundColor=a855f7"
            );
        }
        
        // Volume Achievements
        if (id == keccak256(abi.encodePacked("volume-starter"))) {
            return (
                "Volume Starter",
                "Reached 0.1 PC total trading volume",
                75,
                "Common",
                "https://api.dicebear.com/7.x/shapes/svg?seed=volume-starter&backgroundColor=06b6d4"
            );
        }
        if (id == keccak256(abi.encodePacked("volume-trader"))) {
            return (
                "Volume Trader",
                "Reached 1 PC total trading volume",
                150,
                "Rare",
                "https://api.dicebear.com/7.x/shapes/svg?seed=volume-trader&backgroundColor=6366f1"
            );
        }
        
        // Consistency Achievements
        if (id == keccak256(abi.encodePacked("consistent-user"))) {
            return (
                "Consistent User",
                "Completed 3 borrow-repay cycles",
                100,
                "Rare",
                "https://api.dicebear.com/7.x/shapes/svg?seed=consistent-user&backgroundColor=eab308"
            );
        }
        if (id == keccak256(abi.encodePacked("perfect-record"))) {
            return (
                "Perfect Record",
                "Repaid 5 loans on time",
                250,
                "Epic",
                "https://api.dicebear.com/7.x/shapes/svg?seed=perfect-record&backgroundColor=22c55e"
            );
        }
        
        // Special Achievement
        if (id == keccak256(abi.encodePacked("early-adopter"))) {
            return (
                "Early Adopter",
                "Joined UARS during beta phase",
                100,
                "Legendary",
                "https://api.dicebear.com/7.x/shapes/svg?seed=early-adopter&backgroundColor=f59e0b"
            );
        }
        
        return ("Unknown", "Unknown achievement", 0, "Common", "");
    }
    
    /**
     * @dev Get user's claimed achievements
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf[user];
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 counter = 0;
        
        for (uint256 i = 1; i < _nextTokenId && counter < balance; i++) {
            if (ownerOf[i] == user) {
                tokenIds[counter] = i;
                counter++;
            }
        }
        
        return tokenIds;
    }

    /**
     * @dev Get achievement details by token ID
     */
    function getAchievement(uint256 tokenId) external view returns (Achievement memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return achievements[tokenId];
    }

    /**
     * @dev Check if user has claimed specific achievement
     */
    function hasClaimedAchievement(address user, string memory achievementId) 
        external 
        view 
        returns (bool) 
    {
        return hasClaimed[user][achievementId];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Token URI for metadata
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        
        Achievement memory achievement = achievements[tokenId];
        
        // Return JSON metadata
        return string(abi.encodePacked(
            '{"name":"',
            achievement.name,
            '","description":"',
            achievement.description,
            '","image":"',
            achievement.imageUrl,
            '","attributes":[',
                '{"trait_type":"Points","value":"',
                uint2str(achievement.points),
                '"},',
                '{"trait_type":"Rarity","value":"',
                achievement.rarity,
                '"},',
                '{"trait_type":"Timestamp","value":"',
                uint2str(achievement.timestamp),
                '"}',
            ']}'
        ));
    }
    
    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}
