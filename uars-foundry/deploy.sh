#!/usr/bin/env bash

# UARS Contract Deployment Script for Push Chain
# This script deploys ReputationRegistry and UARSLending contracts

echo "🚀 Deploying UARS Contracts to Push Chain Testnet..."

# Check if private key is provided
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "Please set your private key: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Deploy ReputationRegistry
echo "📊 Deploying ReputationRegistry..."
REPUTATION_REGISTRY=$(forge create src/ReputationRegistry.sol:ReputationRegistry \
  --rpc-url push_testnet \
  --chain 42101 \
  --private-key $PRIVATE_KEY \
  --broadcast | grep "Deployed to:" | cut -d' ' -f3)

if [ -z "$REPUTATION_REGISTRY" ]; then
    echo "❌ Failed to deploy ReputationRegistry"
    exit 1
fi

echo "✅ ReputationRegistry deployed to: $REPUTATION_REGISTRY"

# Deploy UARSLending
echo "🏦 Deploying UARSLending..."
UARS_LENDING=$(forge create src/UARSLending.sol:UARSLending \
  --rpc-url push_testnet \
  --chain 42101 \
  --private-key $PRIVATE_KEY \
  --constructor-args $REPUTATION_REGISTRY \
  --broadcast | grep "Deployed to:" | cut -d' ' -f3)

if [ -z "$UARS_LENDING" ]; then
    echo "❌ Failed to deploy UARSLending"
    exit 1
fi

echo "✅ UARSLending deployed to: $UARS_LENDING"

# Initialize contracts
echo "🔧 Initializing contracts..."

# Add liquidity to UARSLending
echo "Adding 0.5 PC liquidity..."
cast send $UARS_LENDING "addLiquidity()" \
  --rpc-url push_testnet \
  --chain 42101 \
  --private-key $PRIVATE_KEY \
  --value 0.5ether

# Set up demo user profile
echo "Setting up demo user profile..."
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
cast send $REPUTATION_REGISTRY "updateUserProfile(address,uint256,uint8,bool)" \
  $DEPLOYER_ADDRESS 750 2 true \
  --rpc-url push_testnet \
  --chain 42101 \
  --private-key $PRIVATE_KEY

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Contract Addresses:"
echo "====================================="
echo "ReputationRegistry: $REPUTATION_REGISTRY"
echo "UARSLending:        $UARS_LENDING"
echo "====================================="
echo ""
echo "📝 Update your .env.local file with these addresses:"
echo "NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=$REPUTATION_REGISTRY"
echo "NEXT_PUBLIC_LENDING_ADDRESS=$UARS_LENDING"
echo ""
echo "🔍 View contracts on Push Chain explorer:"
echo "https://donut.push.network/address/$UARS_LENDING"

