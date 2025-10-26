// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title AchievementNFTFinal
 * @dev Simple, working Achievement NFT contract
 * No external dependencies - self-contained
 */
contract AchievementNFTFinal {
    address public owner;
    
    uint256 private _nextTokenId;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(string => bool)) public hasClaimed;
    
    // Track user activity internally
    mapping(address => uint256) public userActivityCount;
    
    struct Achievement {
        string achievementId;
        string name;
        string description;
        uint256 points;
        string rarity;
        uint256 timestamp;
    }
    
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
    
    event ActivityRecorded(address indexed user, uint256 count);
    
    constructor() {
        owner = msg.sender;
        _nextTokenId = 1;
    }
    
    /**
     * @dev Record user activity (called by owner or user)
     * Simulates tracking from lending contract
     */
    function recordActivity(address user) external {
        userActivityCount[user]++;
        emit ActivityRecorded(user, userActivityCount[user]);
    }
    
    /**
     * @dev Claim achievement
     */
    function claimAchievement(string memory achievementId) external returns (uint256) {
        require(!hasClaimed[msg.sender][achievementId], "Already claimed this achievement");
        
        bytes32 id = keccak256(abi.encodePacked(achievementId));
        
        // Early Adopter - always available
        if (id == keccak256(abi.encodePacked("early-adopter"))) {
            return _mint(msg.sender, achievementId, "Early Adopter", "Joined UARS beta", 100, "Legendary");
        }
        
        uint256 activityCount = userActivityCount[msg.sender];
        
        // DeFi Novice - 1 activity
        if (id == keccak256(abi.encodePacked("defi-novice"))) {
            require(activityCount >= 1, "Complete 1 transaction first");
            return _mint(msg.sender, achievementId, "DeFi Novice", "First transaction", 50, "Common");
        }
        
        // DeFi Expert - 3 activities
        if (id == keccak256(abi.encodePacked("defi-expert"))) {
            require(activityCount >= 3, "Complete 3 transactions first");
            return _mint(msg.sender, achievementId, "DeFi Expert", "3 transactions", 200, "Rare");
        }
        
        // DeFi Master - 5 activities
        if (id == keccak256(abi.encodePacked("defi-master"))) {
            require(activityCount >= 5, "Complete 5 transactions first");
            return _mint(msg.sender, achievementId, "DeFi Master", "5 transactions", 300, "Epic");
        }
        
        // Volume Starter - 2 activities
        if (id == keccak256(abi.encodePacked("volume-starter"))) {
            require(activityCount >= 2, "Complete 2 transactions first");
            return _mint(msg.sender, achievementId, "Volume Starter", "0.1 PC volume", 75, "Common");
        }
        
        // Volume Trader - 10 activities
        if (id == keccak256(abi.encodePacked("volume-trader"))) {
            require(activityCount >= 10, "Complete 10 transactions first");
            return _mint(msg.sender, achievementId, "Volume Trader", "1 PC volume", 150, "Rare");
        }
        
        // Consistent User - 3 activities
        if (id == keccak256(abi.encodePacked("consistent-user"))) {
            require(activityCount >= 3, "Complete 3 cycles first");
            return _mint(msg.sender, achievementId, "Consistent User", "3 cycles", 100, "Rare");
        }
        
        // Perfect Record - 5 activities
        if (id == keccak256(abi.encodePacked("perfect-record"))) {
            require(activityCount >= 5, "Complete 5 repayments first");
            return _mint(msg.sender, achievementId, "Perfect Record", "5 repayments", 250, "Epic");
        }
        
        revert("Invalid achievement ID");
    }
    
    function _mint(
        address user,
        string memory achievementId,
        string memory name,
        string memory description,
        uint256 points,
        string memory rarity
    ) internal returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        ownerOf[tokenId] = user;
        balanceOf[user]++;
        
        achievements[tokenId] = Achievement({
            achievementId: achievementId,
            name: name,
            description: description,
            points: points,
            rarity: rarity,
            timestamp: block.timestamp
        });
        
        hasClaimed[user][achievementId] = true;
        
        emit Transfer(address(0), user, tokenId);
        emit AchievementMinted(user, tokenId, achievementId, points);
        
        return tokenId;
    }
    
    function checkEligibility(address user, string memory achievementId) public view returns (bool) {
        bytes32 id = keccak256(abi.encodePacked(achievementId));
        
        if (id == keccak256(abi.encodePacked("early-adopter"))) return true;
        
        uint256 count = userActivityCount[user];
        
        if (id == keccak256(abi.encodePacked("defi-novice"))) return count >= 1;
        if (id == keccak256(abi.encodePacked("defi-expert"))) return count >= 3;
        if (id == keccak256(abi.encodePacked("defi-master"))) return count >= 5;
        if (id == keccak256(abi.encodePacked("volume-starter"))) return count >= 2;
        if (id == keccak256(abi.encodePacked("volume-trader"))) return count >= 10;
        if (id == keccak256(abi.encodePacked("consistent-user"))) return count >= 3;
        if (id == keccak256(abi.encodePacked("perfect-record"))) return count >= 5;
        
        return false;
    }
    
    function getUserActivityCount(address user) external view returns (uint256) {
        return userActivityCount[user];
    }
    
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
    
    function getAchievement(uint256 tokenId) external view returns (Achievement memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return achievements[tokenId];
    }
    
    function hasClaimedAchievement(address user, string memory achievementId) external view returns (bool) {
        return hasClaimed[user][achievementId];
    }
    
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Invalid token");
        Achievement memory ach = achievements[tokenId];
        
        string memory color = "10b981";
        bytes32 r = keccak256(abi.encodePacked(ach.rarity));
        if (r == keccak256(abi.encodePacked("Legendary"))) color = "f59e0b";
        else if (r == keccak256(abi.encodePacked("Epic"))) color = "a855f7";
        else if (r == keccak256(abi.encodePacked("Rare"))) color = "3b82f6";
        
        return string(abi.encodePacked(
            '{"name":"', ach.name,
            '","description":"', ach.description,
            '","image":"https://api.dicebear.com/7.x/shapes/svg?seed=', ach.achievementId, '&backgroundColor=', color,
            '","attributes":[{"trait_type":"Points","value":"', _uint2str(ach.points),
            '"},{"trait_type":"Rarity","value":"', ach.rarity, '"}]}'
        ));
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k--;
            bstr[k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}

