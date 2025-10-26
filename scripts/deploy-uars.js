import hre from 'hardhat';

async function main() {
  console.log('🚀 Deploying UARS Smart Contracts to Push Chain Testnet...\n');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'PC\n');

  const contracts = {};

  try {
    // 1. Deploy AchievementNFT
    console.log('📜 Deploying AchievementNFT...');
    const AchievementNFT = await hre.ethers.getContractFactory('AchievementNFT');
    const achievementNFT = await AchievementNFT.deploy();
    await achievementNFT.waitForDeployment();
    contracts.achievementNFT = await achievementNFT.getAddress();
    console.log('✅ AchievementNFT deployed to:', contracts.achievementNFT);

    // 2. Deploy ReputationRegistry
    console.log('\n📊 Deploying ReputationRegistry...');
    const ReputationRegistry = await hre.ethers.getContractFactory('ReputationRegistry');
    const reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();
    contracts.reputationRegistry = await reputationRegistry.getAddress();
    console.log('✅ ReputationRegistry deployed to:', contracts.reputationRegistry);

    // 3. Deploy UARSLending
    console.log('\n🏦 Deploying UARSLending...');
    const UARSLending = await hre.ethers.getContractFactory('UARSLending');
    const uarsLending = await UARSLending.deploy(contracts.reputationRegistry);
    await uarsLending.waitForDeployment();
    contracts.uarsLending = await uarsLending.getAddress();
    console.log('✅ UARSLending deployed to:', contracts.uarsLending);

    // 4. Deploy UARSMarketplace
    console.log('\n🛒 Deploying UARSMarketplace...');
    const UARSMarketplace = await hre.ethers.getContractFactory('UARSMarketplace');
    const uarsMarketplace = await UARSMarketplace.deploy(contracts.reputationRegistry);
    await uarsMarketplace.waitForDeployment();
    contracts.uarsMarketplace = await uarsMarketplace.getAddress();
    console.log('✅ UARSMarketplace deployed to:', contracts.uarsMarketplace);

    // 5. Deploy UARSTournament
    console.log('\n🎮 Deploying UARSTournament...');
    const UARSTournament = await hre.ethers.getContractFactory('UARSTournament');
    const uarsTournament = await UARSTournament.deploy(contracts.reputationRegistry);
    await uarsTournament.waitForDeployment();
    contracts.uarsTournament = await uarsTournament.getAddress();
    console.log('✅ UARSTournament deployed to:', contracts.uarsTournament);

    // 6. Initialize contracts
    console.log('\n🔧 Initializing contracts...');
    
    // Add liquidity to lending contract
    const liquidityAmount = hre.ethers.parseEther('0.5'); // 0.5 PC
    await uarsLending.addLiquidity({ value: liquidityAmount });
    console.log('✅ Added 0.5 PC liquidity to UARSLending');

    // Set up demo user profile
    await reputationRegistry.updateUserProfile(
      deployer.address,
      750, // 750 points
      2,   // Gold tier
      true // verified
    );
    console.log('✅ Set up demo user profile (750 points, Gold tier)');

    // Create a demo tournament
    await uarsTournament.createTournament(
      'UARS Demo Tournament',
      100, // entry fee
      1000, // prize pool
      50,  // min reputation
      1    // min tier
    );
    console.log('✅ Created demo tournament');

    console.log('\n🎉 All contracts deployed successfully!');
    console.log('\n📋 Contract Addresses:');
    console.log('=====================================');
    console.log(`AchievementNFT:     ${contracts.achievementNFT}`);
    console.log(`ReputationRegistry: ${contracts.reputationRegistry}`);
    console.log(`UARSLending:        ${contracts.uarsLending}`);
    console.log(`UARSMarketplace:    ${contracts.uarsMarketplace}`);
    console.log(`UARSTournament:     ${contracts.uarsTournament}`);
    console.log('=====================================\n');

    console.log('📝 Update your .env.local file with these addresses:');
    console.log(`NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=${contracts.achievementNFT}`);
    console.log(`NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=${contracts.reputationRegistry}`);
    console.log(`NEXT_PUBLIC_LENDING_ADDRESS=${contracts.uarsLending}`);
    console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${contracts.uarsMarketplace}`);
    console.log(`NEXT_PUBLIC_TOURNAMENT_ADDRESS=${contracts.uarsTournament}\n`);

    console.log('🔍 Verify contracts on Push Chain explorer:');
    console.log(`https://donut.push.network/address/${contracts.uarsLending}`);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
