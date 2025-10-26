// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationRegistry.sol";

/**
 * @title UARSLending
 * @dev DeFi Lending protocol with reputation-based rates
 * Users can borrow with better rates based on their UARS reputation
 */
contract UARSLending {
    ReputationRegistry public reputationRegistry;
    
    struct Loan {
        address borrower;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 collateralRatio; // in basis points (e.g., 15000 = 150%)
        uint256 interestRate; // annual rate in basis points (e.g., 800 = 8%)
        uint256 startTime;
        bool active;
    }
    
    mapping(address => Loan[]) public userLoans;
    mapping(address => uint256) public totalCollateral;
    uint256 public totalLiquidity;
    
    event LoanCreated(
        address indexed borrower,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 collateralRatio,
        uint256 interestRate
    );
    
    event LoanRepaid(address indexed borrower, uint256 loanIndex, uint256 repaymentAmount);
    event ReputationPointsEarned(address indexed user, uint256 points, string reason);
    
    constructor(address _reputationRegistry) {
        reputationRegistry = ReputationRegistry(_reputationRegistry);
    }
    
    // Add liquidity to the pool
    function addLiquidity() external payable {
        require(msg.value > 0, "Must send PC tokens");
        totalLiquidity += msg.value;
    }
    
    /**
     * @notice Borrow with reputation-based rates
     * @dev Better reputation = lower collateral requirement & interest rate
     */
    function borrow(uint256 borrowAmount) external payable returns (uint256) {
        require(msg.value > 0, "Must provide collateral");
        require(borrowAmount > 0, "Borrow amount must be > 0");
        require(borrowAmount <= totalLiquidity, "Insufficient liquidity");
        
        // Get user's reputation benefits
        ReputationRegistry.Benefits memory benefits = reputationRegistry.calculateBenefits(msg.sender);
        
        uint256 requiredCollateral = (borrowAmount * benefits.collateralRatio) / 10000;
        require(msg.value >= requiredCollateral, "Insufficient collateral");
        
        // Create loan
        Loan memory newLoan = Loan({
            borrower: msg.sender,
            collateralAmount: msg.value,
            borrowedAmount: borrowAmount,
            collateralRatio: benefits.collateralRatio,
            interestRate: benefits.interestRate,
            startTime: block.timestamp,
            active: true
        });
        
        userLoans[msg.sender].push(newLoan);
        totalCollateral[msg.sender] += msg.value;
        totalLiquidity -= borrowAmount;
        
        // Transfer borrowed amount
        payable(msg.sender).transfer(borrowAmount);
        
        // Award reputation points for borrowing
        _awardReputationPoints(msg.sender, 50, "DeFi Borrowing");
        
        emit LoanCreated(
            msg.sender,
            msg.value,
            borrowAmount,
            benefits.collateralRatio,
            benefits.interestRate
        );
        
        return userLoans[msg.sender].length - 1;
    }
    
    /**
     * @notice Repay loan with interest
     */
    function repay(uint256 loanIndex) external payable {
        require(loanIndex < userLoans[msg.sender].length, "Invalid loan index");
        Loan storage loan = userLoans[msg.sender][loanIndex];
        require(loan.active, "Loan not active");
        
        // Calculate interest
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.borrowedAmount * loan.interestRate * timeElapsed) / (10000 * 365 days);
        uint256 totalRepayment = loan.borrowedAmount + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment amount");
        
        // Mark loan as repaid
        loan.active = false;
        totalLiquidity += msg.value;
        
        // Return collateral
        uint256 collateralToReturn = loan.collateralAmount;
        totalCollateral[msg.sender] -= collateralToReturn;
        payable(msg.sender).transfer(collateralToReturn);
        
        // Award reputation points for on-time repayment
        _awardReputationPoints(msg.sender, 100, "On-Time Loan Repayment");
        
        // Return excess payment
        if (msg.value > totalRepayment) {
            payable(msg.sender).transfer(msg.value - totalRepayment);
        }
        
        emit LoanRepaid(msg.sender, loanIndex, msg.value);
    }
    
    /**
     * @notice Get user's active loans
     */
    function getUserLoans(address user) external view returns (Loan[] memory) {
        return userLoans[user];
    }
    
    /**
     * @notice Get borrowing terms based on reputation
     */
    function getBorrowingTerms(address user) external view returns (
        uint256 collateralRatio,
        uint256 interestRate,
        string memory tier
    ) {
        ReputationRegistry.Benefits memory benefits = reputationRegistry.calculateBenefits(user);
        ReputationRegistry.UserProfile memory profile = reputationRegistry.getUserProfile(user);
        
        return (
            benefits.collateralRatio,
            benefits.interestRate,
            reputationRegistry.getTierName(profile.tier)
        );
    }
    
    /**
     * @dev Internal function to award reputation points
     */
    function _awardReputationPoints(address user, uint256 points, string memory reason) internal {
        // In production, this would call AchievementNFT to mint achievement
        emit ReputationPointsEarned(user, points, reason);
    }
    
    // Withdraw liquidity (owner only for demo)
    function withdrawLiquidity(uint256 amount) external {
        require(amount <= totalLiquidity, "Insufficient liquidity");
        totalLiquidity -= amount;
        payable(msg.sender).transfer(amount);
    }
}


