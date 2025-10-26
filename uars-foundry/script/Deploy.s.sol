// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {UARSLending} from "../src/UARSLending.sol";

contract DeployScript {
    function run() external returns (address, address) {
        // 1. Deploy ReputationRegistry
        ReputationRegistry reputationRegistry = new ReputationRegistry();
        
        // 2. Deploy UARSLending with ReputationRegistry address
        UARSLending uarsLending = new UARSLending(address(reputationRegistry));
        
        // 3. Add liquidity (0.5 PC)
        uarsLending.addLiquidity{value: 0.5 ether}();
        
        // 4. Set up demo user profile (750 points, Gold tier)
        reputationRegistry.updateUserProfile(msg.sender, 750, 2, true);
        
        return (address(reputationRegistry), address(uarsLending));
    }
}
