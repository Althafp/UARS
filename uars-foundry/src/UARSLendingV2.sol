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
    ) external {
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
        public
        view 
        returns (uint256 collateralRatio, uint256 interestRate) 
    {
        UserProfile memory profile = userProfiles[user];
        
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

/**
 * @title UARSLendingV2
 * @dev Complete DeFi lending platform with built-in reputation system
 * FIXED: Removed liquidity requirement, simplified logic
 */
contract UARSLendingV2 {
    ReputationRegistry public reputationRegistry;
    
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 collateral;
        uint256 interestRate;
        uint256 timestamp;
        bool repaid;
    }
    
    Loan[] public loans;
    mapping(address => uint256[]) public userLoans;
    uint256 public totalLiquidity;
    
    event LoanCreated(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 amount,
        uint256 collateral
    );
    
    event LoanRepaid(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 amount
    );
    
    event LiquidityAdded(address indexed provider, uint256 amount);
    
    constructor() {
        reputationRegistry = new ReputationRegistry();
        // Set up default user profile for deployer
        reputationRegistry.updateUserProfile(msg.sender, 750, 2, true);
    }
    
    function borrow(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient contract liquidity");
        
        // Get user's reputation benefits
        (uint256 collateralRatio, uint256 interestRate) = 
            reputationRegistry.calculateBenefits(msg.sender);
        
        // Calculate required collateral based on reputation
        uint256 requiredCollateral = (amount * collateralRatio) / 10000;
        require(msg.value >= requiredCollateral, "Insufficient collateral for your tier");
        
        // Create loan
        uint256 loanId = loans.length;
        loans.push(Loan({
            borrower: msg.sender,
            amount: amount,
            collateral: msg.value,
            interestRate: interestRate,
            timestamp: block.timestamp,
            repaid: false
        }));
        
        userLoans[msg.sender].push(loanId);
        
        // Transfer borrowed amount to user
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit LoanCreated(msg.sender, loanId, amount, msg.value);
    }
    
    function repay(uint256 loanIndex) external payable {
        require(loanIndex < loans.length, "Invalid loan index");
        Loan storage loan = loans[loanIndex];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.repaid, "Loan already repaid");
        
        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        uint256 repayAmount = loan.amount + interest;
        require(msg.value >= repayAmount, "Insufficient repayment amount");
        
        loan.repaid = true;
        
        // Return collateral to borrower
        (bool success, ) = payable(msg.sender).call{value: loan.collateral}("");
        require(success, "Collateral return failed");
        
        emit LoanRepaid(msg.sender, loanIndex, repayAmount);
    }
    
    function addLiquidity() external payable {
        require(msg.value > 0, "Must send PC");
        totalLiquidity += msg.value;
        emit LiquidityAdded(msg.sender, msg.value);
    }
    
    function getBorrowingTerms(address user) 
        external 
        view 
        returns (uint256 collateralRatio, uint256 interestRate) 
    {
        return reputationRegistry.calculateBenefits(user);
    }
    
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        require(loanId < loans.length, "Invalid loan ID");
        return loans[loanId];
    }
    
    function setupDemoUser(address user) external {
        reputationRegistry.updateUserProfile(user, 750, 2, true);
    }
    
    function getReputationRegistry() external view returns (address) {
        return address(reputationRegistry);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Allow contract to receive ETH
    receive() external payable {
        totalLiquidity += msg.value;
        emit LiquidityAdded(msg.sender, msg.value);
    }
}

