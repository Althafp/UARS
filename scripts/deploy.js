const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying UARS contracts to Push Chain Donut Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "PC\n");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance! Get testnet tokens from https://faucet.push.org/\n");
  }

  // Deploy AchievementNFT
  console.log("📦 Deploying AchievementNFT...");
  const AchievementNFT = await hre.ethers.getContractFactory("AchievementNFT");
  const achievementNFT = await AchievementNFT.deploy();
  await achievementNFT.waitForDeployment();
  const achievementNFTAddress = await achievementNFT.getAddress();
  console.log("✅ AchievementNFT deployed to:", achievementNFTAddress);

  // Deploy ReputationRegistry
  console.log("\n📦 Deploying ReputationRegistry...");
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationRegistryAddress = await reputationRegistry.getAddress();
  console.log("✅ ReputationRegistry deployed to:", reputationRegistryAddress);

  // Deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   AchievementNFT:", achievementNFTAddress);
  console.log("   ReputationRegistry:", reputationRegistryAddress);
  console.log("\n🔍 View on Explorer:");
  console.log("   https://donut.push.network/address/" + achievementNFTAddress);
  console.log("   https://donut.push.network/address/" + reputationRegistryAddress);
  console.log("\n⚙️  Update your .env.local file:");
  console.log("   NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=" + achievementNFTAddress);
  console.log("   NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=" + reputationRegistryAddress);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

