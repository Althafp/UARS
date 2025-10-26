#!/bin/bash

# Deploy AchievementNFTIntegrated (independent deployment)

LENDING_ADDRESS="0x98CDdEcCc5614A15f0B0E97b2009ABbd71bF2C09"
RPC_URL="https://evm.rpc-testnet-donut-node1.push.org/"

echo "🚀 Deploying AchievementNFTIntegrated..."

forge create src/AchievementNFTIntegrated.sol:AchievementNFTIntegrated \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the 'Deployed to' address above"
echo "2. Call setLendingContract() with address: $LENDING_ADDRESS"
echo "   (You can do this via BlockScout or cast command)"
echo ""
echo "3. Update your .env.local:"
echo "   NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=<deployed_address>"

