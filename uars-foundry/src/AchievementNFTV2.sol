// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title AchievementNFTV2
 * @dev Complete Achievement NFT system with proper eligibility tracking
 */
contract AchievementNFTV2 {
    address public owner;
    
    // NFT Storage
    uint256 private _nextTokenId;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(string => bool)) public hasClaimed;
    
    struct Achievement {
        string achievementId;
        string name;
        string description;
        uint256 points;
        string rarity;
        uint256 timestamp;
    }
    
    address public lendingContract;
    
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
    
    event LendingContractSet(address lendingContract);
    
    constructor() {
        owner = msg.sender;
        _nextTokenId = 1;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @dev Set lending contract address
     */
    function setLendingContract(address _lendingContract) external onlyOwner {
        lendingContract = _lendingContract;
        emit LendingContractSet(_lendingContract);
    }
    
    /**
     * @dev Claim achievement with clear error messages
     */
    function claimAchievement(string memory achievementId) external returns (uint256) {
        // Check not already claimed
        require(!hasClaimed[msg.sender][achievementId], "ALREADY_CLAIMED");
        
        bytes32 id = keccak256(abi.encodePacked(achievementId));
        
        // Early Adopter - always available
        if (id == keccak256(abi.encodePacked("early-adopter"))) {
            return _mintAchievement(
                msg.sender,
                achievementId,
                "Early Adopter",
                "Joined UARS beta",
                100,
                "Legendary"
            );
        }
        
        // Get loan count for DeFi achievements
        uint256 loanCount = getLoanCount(msg.sender);
        
        // DeFi Novice - 1 transaction
        if (id == keccak256(abi.encodePacked("defi-novice"))) {
            require(loanCount >= 1, "NEED_1_LOAN");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "DeFi Novice",
                "First DeFi transaction",
                50,
                "Common"
            );
        }
        
        // DeFi Expert - 5 transactions
        if (id == keccak256(abi.encodePacked("defi-expert"))) {
            require(loanCount >= 5, "NEED_5_LOANS");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "DeFi Expert",
                "5 DeFi transactions",
                200,
                "Rare"
            );
        }
        
        // DeFi Master - 10 transactions
        if (id == keccak256(abi.encodePacked("defi-master"))) {
            require(loanCount >= 10, "NEED_10_LOANS");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "DeFi Master",
                "10 DeFi transactions",
                300,
                "Epic"
            );
        }
        
        // Volume Starter - 2 loans
        if (id == keccak256(abi.encodePacked("volume-starter"))) {
            require(loanCount >= 2, "NEED_2_LOANS");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "Volume Starter",
                "0.1 PC volume",
                75,
                "Common"
            );
        }
        
        // Volume Trader - 20 loans
        if (id == keccak256(abi.encodePacked("volume-trader"))) {
            require(loanCount >= 20, "NEED_20_LOANS");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "Volume Trader",
                "1 PC volume",
                150,
                "Rare"
            );
        }
        
        // Consistent User - 6 loans
        if (id == keccak256(abi.encodePacked("consistent-user"))) {
            require(loanCount >= 6, "NEED_6_LOANS");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "Consistent User",
                "3 borrow-repay cycles",
                100,
                "Rare"
            );
        }
        
        // Perfect Record - 10 loans
        if (id == keccak256(abi.encodePacked("perfect-record"))) {
            require(loanCount >= 10, "NEED_10_REPAYS");
            return _mintAchievement(
                msg.sender,
                achievementId,
                "Perfect Record",
                "5 on-time repayments",
                250,
                "Epic"
            );
        }
        
        revert("INVALID_ACHIEVEMENT");
    }
    
    /**
     * @dev Internal mint function
     */
    function _mintAchievement(
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
    
    /**
     * @dev Get loan count from lending contract
     */
    function getLoanCount(address user) public view returns (uint256) {
        if (lendingContract == address(0)) {
            return 0;
        }
        
        // Use low-level staticcall for safety
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
     * @dev Check if user is eligible for an achievement
     */
    function checkEligibility(address user, string memory achievementId) public view returns (bool) {
        bytes32 id = keccak256(abi.encodePacked(achievementId));
        
        // Early Adopter - always available
        if (id == keccak256(abi.encodePacked("early-adopter"))) {
            return true;
        }
        
        uint256 loanCount = getLoanCount(user);
        
        // DeFi achievements
        if (id == keccak256(abi.encodePacked("defi-novice"))) return loanCount >= 1;
        if (id == keccak256(abi.encodePacked("defi-expert"))) return loanCount >= 5;
        if (id == keccak256(abi.encodePacked("defi-master"))) return loanCount >= 10;
        
        // Volume achievements
        if (id == keccak256(abi.encodePacked("volume-starter"))) return loanCount >= 2;
        if (id == keccak256(abi.encodePacked("volume-trader"))) return loanCount >= 20;
        
        // Consistency achievements
        if (id == keccak256(abi.encodePacked("consistent-user"))) return loanCount >= 6;
        if (id == keccak256(abi.encodePacked("perfect-record"))) return loanCount >= 10;
        
        return false;
    }
    
    /**
     * @dev Get all achievements owned by user
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
        require(ownerOf[tokenId] != address(0), "INVALID_TOKEN");
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
     * @dev Get total NFTs minted
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Get token metadata
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "INVALID_TOKEN");
        Achievement memory ach = achievements[tokenId];
        
        string memory imageUrl = string(abi.encodePacked(
            "https://api.dicebear.com/7.x/shapes/svg?seed=",
            ach.achievementId,
            "&backgroundColor=",
            _getColorForRarity(ach.rarity)
        ));
        
        return string(abi.encodePacked(
            '{"name":"',
            ach.name,
            '","description":"',
            ach.description,
            '","image":"',
            imageUrl,
            '","attributes":[{"trait_type":"Points","value":"',
            _uint2str(ach.points),
            '"},{"trait_type":"Rarity","value":"',
            ach.rarity,
            '"}]}'
        ));
    }
    
    /**
     * @dev Get color based on rarity
     */
    function _getColorForRarity(string memory rarity) internal pure returns (string memory) {
        bytes32 r = keccak256(abi.encodePacked(rarity));
        if (r == keccak256(abi.encodePacked("Legendary"))) return "f59e0b";
        if (r == keccak256(abi.encodePacked("Epic"))) return "a855f7";
        if (r == keccak256(abi.encodePacked("Rare"))) return "3b82f6";
        return "10b981"; // Common
    }
    
    /**
     * @dev Convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + _i % 10);
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
