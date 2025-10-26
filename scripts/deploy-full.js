const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Complete UARS System to Push Chain...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "PC\n");

  if (balance < hre.ethers.parseEther("0.05")) {
    console.log("⚠️  WARNING: Low balance! Get more tokens from https://faucet.push.org/\n");
    console.log("   Recommended: At least 0.1 PC for all deployments\n");
  }

  const contracts = {};

  // 1. Deploy Achievement NFT
  console.log("1️⃣  Deploying AchievementNFT...");
  const AchievementNFT = await hre.ethers.getContractFactory("AchievementNFT");
  const achievementNFT = await AchievementNFT.deploy();
  await achievementNFT.waitForDeployment();
  contracts.achievementNFT = await achievementNFT.getAddress();
  console.log("   ✅ AchievementNFT:", contracts.achievementNFT);

  // 2. Deploy Reputation Registry
  console.log("\n2️⃣  Deploying ReputationRegistry...");
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  contracts.reputationRegistry = await reputationRegistry.getAddress();
  console.log("   ✅ ReputationRegistry:", contracts.reputationRegistry);

  // 3. Deploy Lending Protocol
  console.log("\n3️⃣  Deploying UARSLending...");
  const UARSLending = await hre.ethers.getContractFactory("UARSLending");
  const lending = await UARSLending.deploy(contracts.reputationRegistry);
  await lending.waitForDeployment();
  contracts.lending = await lending.getAddress();
  console.log("   ✅ UARSLending:", contracts.lending);

  // Add initial liquidity
  console.log("   💰 Adding initial liquidity (0.5 PC)...");
  const addLiqTx = await lending.addLiquidity({ value: hre.ethers.parseEther("0.5") });
  await addLiqTx.wait();
  console.log("   ✅ Liquidity added");

  // 4. Deploy NFT Marketplace
  console.log("\n4️⃣  Deploying UARSMarketplace...");
  const UARSMarketplace = await hre.ethers.getContractFactory("UARSMarketplace");
  const marketplace = await UARSMarketplace.deploy(contracts.reputationRegistry);
  await marketplace.waitForDeployment();
  contracts.marketplace = await marketplace.getAddress();
  console.log("   ✅ UARSMarketplace:", contracts.marketplace);

  // 5. Deploy Gaming Tournament
  console.log("\n5️⃣  Deploying UARSTournament...");
  const UARSTournament = await hre.ethers.getContractFactory("UARSTournament");
  const tournament = await UARSTournament.deploy(contracts.reputationRegistry);
  await tournament.waitForDeployment();
  contracts.tournament = await tournament.getAddress();
  console.log("   ✅ UARSTournament:", contracts.tournament);

  // Create demo tournament
  console.log("   🎮 Creating demo tournament...");
  const createTournamentTx = await tournament.createTournament(
    "Cross-Chain Championship",
    hre.ethers.parseEther("0.01"), // 0.01 PC entry fee
    500, // min reputation
    1, // min tier (Silver)
    10, // max participants
    { value: hre.ethers.parseEther("0.1") } // 0.1 PC prize pool
  );
  await createTournamentTx.wait();
  console.log("   ✅ Tournament created (ID: 1)");

  // Setup initial user profile for deployer
  console.log("\n6️⃣  Setting up demo user profile...");
  const setupTx = await reputationRegistry.updateUserProfile(
    deployer.address,
    750, // Universal score
    2, // Gold tier
    true // Verified
  );
  await setupTx.wait();
  console.log("   ✅ Demo profile created (750 points, Gold tier)");

  // Deployment Summary
  console.log("\n" + "=".repeat(70));
  console.log("🎉 COMPLETE UARS SYSTEM DEPLOYED!");
  console.log("=".repeat(70));
  
  console.log("\n📋 Contract Addresses:");
  console.log("   AchievementNFT:     ", contracts.achievementNFT);
  console.log("   ReputationRegistry: ", contracts.reputationRegistry);
  console.log("   UARSLending:        ", contracts.lending);
  console.log("   UARSMarketplace:    ", contracts.marketplace);
  console.log("   UARSTournament:     ", contracts.tournament);

  console.log("\n🔍 View on Explorer:");
  Object.entries(contracts).forEach(([name, address]) => {
    console.log(`   ${name}: https://donut.push.network/address/${address}`);
  });

  console.log("\n⚙️  Update your .env.local file:");
  console.log(`NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=${contracts.achievementNFT}`);
  console.log(`NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=${contracts.reputationRegistry}`);
  console.log(`NEXT_PUBLIC_LENDING_ADDRESS=${contracts.lending}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${contracts.marketplace}`);
  console.log(`NEXT_PUBLIC_TOURNAMENT_ADDRESS=${contracts.tournament}`);

  console.log("\n📊 System Status:");
  console.log("   ✅ Lending pool liquidity: 0.5 PC");
  console.log("   ✅ Demo tournament created");
  console.log("   ✅ Demo user profile setup");

  console.log("\n🎮 Next Steps:");
  console.log("   1. Copy contract addresses to .env.local");
  console.log("   2. Restart your app: npm run dev");
  console.log("   3. Test DeFi borrowing");
  console.log("   4. Test NFT trading");
  console.log("   5. Test tournament joining");

  console.log("\n" + "=".repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });


