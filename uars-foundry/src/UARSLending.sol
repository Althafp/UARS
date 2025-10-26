// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title UARSLending
 * @dev DeFi lending protocol with reputation-based rates
 */

interface IReputationRegistry {
    function getUserProfile(address user) 
        external 
        view 
        returns (
            uint256 universalScore,
            uint8 tier,
            uint256 lastUpdated,
            bool isVerified
        );
    
    function calculateBenefits(address user) 
        external 
        view 
        returns (uint256 collateralRatio, uint256 interestRate);
}

contract UARSLending {
    IReputationRegistry public reputationRegistry;
    
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
    
    constructor(address _reputationRegistry) {
        reputationRegistry = IReputationRegistry(_reputationRegistry);
    }
    
    function borrow(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= (amount * 120) / 100, "Insufficient collateral");
        
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
        payable(msg.sender).transfer(amount);
        
        emit LoanCreated(msg.sender, loanId, amount, msg.value);
    }
    
    function repay(uint256 loanIndex) external payable {
        require(loanIndex < loans.length, "Invalid loan index");
        Loan storage loan = loans[loanIndex];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.repaid, "Loan already repaid");
        
        uint256 repayAmount = loan.amount + ((loan.amount * loan.interestRate) / 10000);
        require(msg.value >= repayAmount, "Insufficient repayment amount");
        
        loan.repaid = true;
        
        // Return collateral to borrower
        payable(msg.sender).transfer(loan.collateral);
        
        emit LoanRepaid(msg.sender, loanIndex, repayAmount);
    }
    
    function addLiquidity() external payable {
        require(msg.value > 0, "Must send ETH");
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
        return loans[loanId];
    }
}
