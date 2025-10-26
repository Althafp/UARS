const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔗 Interacting with UARS contracts on Push Chain...\n");

  const achievementNFTAddress = process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS;
  const reputationRegistryAddress = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS;

  if (!achievementNFTAddress || !reputationRegistryAddress) {
    console.error("❌ Contract addresses not found in .env.local");
    console.error("Please deploy contracts first or set addresses in .env.local");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Interacting with account:", signer.address);

  // Connect to contracts
  const AchievementNFT = await hre.ethers.getContractAt("AchievementNFT", achievementNFTAddress);
  const ReputationRegistry = await hre.ethers.getContractAt("ReputationRegistry", reputationRegistryAddress);

  console.log("\n1️⃣  Minting Sample Achievement...");
  const tx1 = await AchievementNFT.mintAchievement(
    signer.address,
    "DEFI_MASTER",
    "DeFi Master",
    "Provided $50K+ liquidity with zero liquidations",
    "Ethereum",
    250,
    JSON.stringify({ volume: "50000", liquidations: 0 })
  );
  await tx1.wait();
  console.log("   ✅ Achievement minted! TX:", tx1.hash);

  console.log("\n2️⃣  Checking Reputation Score...");
  const score = await AchievementNFT.getReputationScore(signer.address);
  console.log("   📊 Current Score:", score.toString(), "points");

  console.log("\n3️⃣  Getting Achievement Count...");
  const count = await AchievementNFT.getAchievementCount(signer.address);
  console.log("   🏆 Total Achievements:", count.toString());

  console.log("\n4️⃣  Updating Reputation Registry...");
  const tier = score >= 900 ? 4 : score >= 800 ? 3 : score >= 650 ? 2 : score >= 500 ? 1 : 0;
  const tx2 = await ReputationRegistry.updateUserProfile(
    signer.address,
    score,
    tier,
    true
  );
  await tx2.wait();
  console.log("   ✅ Registry updated! TX:", tx2.hash);

  console.log("\n5️⃣  Getting User Profile...");
  const profile = await ReputationRegistry.getUserProfile(signer.address);
  console.log("   👤 User Address:", profile.userAddress);
  console.log("   📊 Universal Score:", profile.universalScore.toString());
  console.log("   🎖️  Tier:", ["Bronze", "Silver", "Gold", "Platinum", "Diamond"][profile.tier]);
  console.log("   ✅ Verified:", profile.isVerified);

  console.log("\n6️⃣  Calculating Benefits...");
  const benefits = await ReputationRegistry.calculateBenefits(signer.address);
  console.log("   💰 Collateral Ratio:", benefits.collateralRatio.toString() / 100, "%");
  console.log("   📈 Interest Rate:", benefits.interestRate.toString() / 100, "%");
  console.log("   🗳️  Voting Multiplier:", benefits.votingMultiplier.toString() + "x");
  console.log("   🎮 Skip Tutorials:", benefits.skipTutorials);
  console.log("   ⭐ Premium Access:", benefits.premiumAccess);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Interaction complete!");
  console.log("=".repeat(60));
  console.log("\n🔍 View your achievements:");
  console.log("   https://donut.push.network/address/" + achievementNFTAddress);
  console.log("\n📊 Check your profile:");
  console.log("   https://donut.push.network/address/" + reputationRegistryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });

