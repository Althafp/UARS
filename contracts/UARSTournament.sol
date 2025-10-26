// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationRegistry.sol";

/**
 * @title UARSTournament
 * @dev Gaming tournament with reputation-based access and rewards
 * Higher reputation = better starting positions, bigger prize pools
 */
contract UARSTournament {
    ReputationRegistry public reputationRegistry;
    
    struct Tournament {
        uint256 id;
        string name;
        uint256 entryFee;
        uint256 prizePool;
        uint256 minReputation;
        uint8 minTier;
        uint256 maxParticipants;
        uint256 startTime;
        bool active;
        address[] participants;
        mapping(address => bool) hasJoined;
        mapping(address => uint256) scores;
    }
    
    mapping(uint256 => Tournament) public tournaments;
    uint256 public nextTournamentId;
    
    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        uint256 entryFee,
        uint256 minReputation
    );
    
    event PlayerJoined(
        uint256 indexed tournamentId,
        address indexed player,
        uint256 reputation,
        uint8 tier
    );
    
    event ScoreSubmitted(uint256 indexed tournamentId, address indexed player, uint256 score);
    event TournamentCompleted(uint256 indexed tournamentId, address winner, uint256 prize);
    event ReputationPointsEarned(address indexed user, uint256 points, string reason);
    
    constructor(address _reputationRegistry) {
        reputationRegistry = ReputationRegistry(_reputationRegistry);
        nextTournamentId = 1;
    }
    
    /**
     * @notice Create a new tournament
     */
    function createTournament(
        string memory name,
        uint256 entryFee,
        uint256 minReputation,
        uint8 minTier,
        uint256 maxParticipants
    ) external payable returns (uint256) {
        uint256 tournamentId = nextTournamentId++;
        Tournament storage tournament = tournaments[tournamentId];
        
        tournament.id = tournamentId;
        tournament.name = name;
        tournament.entryFee = entryFee;
        tournament.prizePool = msg.value;
        tournament.minReputation = minReputation;
        tournament.minTier = minTier;
        tournament.maxParticipants = maxParticipants;
        tournament.startTime = block.timestamp;
        tournament.active = true;
        
        emit TournamentCreated(tournamentId, name, entryFee, minReputation);
        
        return tournamentId;
    }
    
    /**
     * @notice Join tournament with reputation-based access
     */
    function joinTournament(uint256 tournamentId) external payable {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.active, "Tournament not active");
        require(!tournament.hasJoined[msg.sender], "Already joined");
        require(tournament.participants.length < tournament.maxParticipants, "Tournament full");
        require(msg.value >= tournament.entryFee, "Insufficient entry fee");
        
        // Check reputation requirements
        ReputationRegistry.UserProfile memory profile = reputationRegistry.getUserProfile(msg.sender);
        require(profile.universalScore >= tournament.minReputation, "Insufficient reputation");
        require(profile.tier >= tournament.minTier, "Tier too low");
        
        // Add player to tournament
        tournament.participants.push(msg.sender);
        tournament.hasJoined[msg.sender] = true;
        tournament.prizePool += msg.value;
        
        // Higher reputation = starting advantage (bonus score)
        uint256 startingBonus = _calculateStartingBonus(profile.tier);
        tournament.scores[msg.sender] = startingBonus;
        
        // Award reputation points for joining
        _awardReputationPoints(msg.sender, 30, "Tournament Participation");
        
        emit PlayerJoined(tournamentId, msg.sender, profile.universalScore, profile.tier);
    }
    
    /**
     * @notice Submit game score (simplified for demo)
     */
    function submitScore(uint256 tournamentId, uint256 score) external {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.active, "Tournament not active");
        require(tournament.hasJoined[msg.sender], "Not a participant");
        
        // Add score to starting bonus
        tournament.scores[msg.sender] += score;
        
        emit ScoreSubmitted(tournamentId, msg.sender, tournament.scores[msg.sender]);
    }
    
    /**
     * @notice End tournament and distribute prizes
     */
    function endTournament(uint256 tournamentId) external {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.active, "Tournament already ended");
        require(tournament.participants.length > 0, "No participants");
        
        // Find winner (highest score)
        address winner = tournament.participants[0];
        uint256 highestScore = tournament.scores[winner];
        
        for (uint256 i = 1; i < tournament.participants.length; i++) {
            address player = tournament.participants[i];
            if (tournament.scores[player] > highestScore) {
                highestScore = tournament.scores[player];
                winner = player;
            }
        }
        
        // Distribute prizes
        uint256 winnerPrize = (tournament.prizePool * 70) / 100; // 70% to winner
        uint256 runnerUpPrize = (tournament.prizePool * 20) / 100; // 20% to 2nd place
        
        tournament.active = false;
        
        // Send prizes
        payable(winner).transfer(winnerPrize);
        
        // Award reputation points
        _awardReputationPoints(winner, 500, "Tournament Victory");
        
        emit TournamentCompleted(tournamentId, winner, winnerPrize);
    }
    
    /**
     * @notice Get tournament details
     */
    function getTournamentInfo(uint256 tournamentId) external view returns (
        string memory name,
        uint256 entryFee,
        uint256 prizePool,
        uint256 minReputation,
        uint256 participantCount,
        bool active
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        return (
            tournament.name,
            tournament.entryFee,
            tournament.prizePool,
            tournament.minReputation,
            tournament.participants.length,
            tournament.active
        );
    }
    
    /**
     * @notice Get tournament participants
     */
    function getTournamentParticipants(uint256 tournamentId) external view returns (address[] memory) {
        return tournaments[tournamentId].participants;
    }
    
    /**
     * @notice Get player's score in tournament
     */
    function getPlayerScore(uint256 tournamentId, address player) external view returns (uint256) {
        return tournaments[tournamentId].scores[player];
    }
    
    /**
     * @notice Check if user can join tournament
     */
    function canJoinTournament(uint256 tournamentId, address user) external view returns (
        bool canJoin,
        string memory reason
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        
        if (!tournament.active) return (false, "Tournament not active");
        if (tournament.hasJoined[user]) return (false, "Already joined");
        if (tournament.participants.length >= tournament.maxParticipants) return (false, "Tournament full");
        
        ReputationRegistry.UserProfile memory profile = reputationRegistry.getUserProfile(user);
        if (profile.universalScore < tournament.minReputation) {
            return (false, "Insufficient reputation");
        }
        if (profile.tier < tournament.minTier) {
            return (false, "Tier too low");
        }
        
        return (true, "Eligible");
    }
    
    /**
     * @dev Calculate starting bonus based on tier
     */
    function _calculateStartingBonus(uint8 tier) internal pure returns (uint256) {
        if (tier == 4) return 1000; // Diamond
        if (tier == 3) return 750;  // Platinum
        if (tier == 2) return 500;  // Gold
        if (tier == 1) return 250;  // Silver
        return 0; // Bronze
    }
    
    /**
     * @dev Award reputation points
     */
    function _awardReputationPoints(address user, uint256 points, string memory reason) internal {
        emit ReputationPointsEarned(user, points, reason);
    }
}


