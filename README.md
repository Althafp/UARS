# UARS - Universal Aggregated Reputation System

A decentralized reputation system built on Push Chain that aggregates user activity across DeFi protocols and social platforms.

## 🌟 Features

### 🎯 Core Features
- **Cross-Chain Reputation Tracking**: Aggregate DeFi activity from multiple protocols
- **Achievement NFTs**: Claimable NFTs based on on-chain activity milestones
- **Twitter/X Integration**: OAuth 2.0 authentication with PKCE
- **Browser Extension**: Real-time reputation display on Twitter profiles
- **Push Chain Integration**: Built on Push Chain testnet

### 🏆 Achievements System
- **Early Adopter**: First 1000 users
- **DeFi Novice**: Complete 1+ transactions
- **DeFi Expert**: Complete 3+ transactions
- **Volume Starter**: $1000+ trading volume

### 🔗 Protocol Integrations
- Lending Protocol Integration
- Real-time activity tracking
- Automated reputation scoring

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity, Foundry
- **Blockchain**: Push Chain (Testnet)
- **Authentication**: Twitter OAuth 2.0 with PKCE
- **Browser Extension**: Chrome/Firefox compatible

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- MetaMask or Pelagus wallet
- Git Bash (for Windows deployment)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Althafp/UARS.git
cd UARS
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file:
```env
# Push Chain RPC
NEXT_PUBLIC_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_CHAIN_ID=42101

# Contract Addresses
NEXT_PUBLIC_LENDING_CONTRACT=0x98CDdEcCc5614A15f0B0E97b2009ABbd71bF2C09
NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=0x198b41D6075D4b87606F2ff82C15f26aC20F1B40

# Twitter OAuth
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/x/callback
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Live Demo

**Production URL**: [https://uars.vercel.app](https://uars.vercel.app)

The live application is deployed on Vercel with full Twitter OAuth integration.

## 🔧 Smart Contract Deployment

### Using Foundry

1. **Navigate to the Foundry directory**
```bash
cd uars-foundry
```

2. **Build contracts**
```bash
forge build
```

3. **Deploy Achievement NFT**
```bash
forge create src/AchievementNFTIntegrated.sol:AchievementNFTIntegrated \
  --rpc-url https://evm.rpc-testnet-donut-node1.push.org/ \
  --chain 42101 \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast
```

4. **Set Lending Contract**
```bash
cast send ACHIEVEMENT_NFT_ADDRESS \
  "setLendingContract(address)" \
  LENDING_CONTRACT_ADDRESS \
  --rpc-url https://evm.rpc-testnet-donut-node1.push.org/ \
  --private-key YOUR_PRIVATE_KEY
```

## 🌐 Browser Extension

### Installation

1. **Navigate to extension directory**
```bash
cd uars-extension
```

2. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `uars-extension` folder

3. **Visit any Twitter/X profile** to see reputation badges!

## 🔐 Twitter OAuth Setup

1. Create a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new app with OAuth 2.0
3. Add callback URL: `http://localhost:3000/api/auth/x/callback`
4. Set scopes: `users.read tweet.read`
5. Copy Client ID and Client Secret to `.env.local`

## 📊 Architecture

```
UARS/
├── app/                    # Next.js pages and API routes
│   ├── api/               # API endpoints
│   ├── achievements/      # Achievement NFT claiming page
│   └── page.tsx          # Landing page
├── components/            # React components
├── contexts/             # React contexts (Wallet, Twitter)
├── uars-foundry/         # Smart contracts
│   └── src/
│       ├── AchievementNFTIntegrated.sol
│       └── LendingContract.sol
├── uars-extension/       # Browser extension
│   ├── manifest.json
│   ├── content.js
│   └── popup.html
└── lib/                  # Utility functions
```

## 🎮 Usage

### Connect Wallet
1. Click "Connect Wallet" in the header
2. Approve MetaMask/Pelagus connection
3. Switch to Push Chain testnet if needed

### Connect Twitter
1. Click "Connect with X"
2. Authorize the app
3. Your Twitter profile will be linked to your wallet

### Claim Achievement NFTs
1. Navigate to `/achievements`
2. View eligible achievements
3. Click "Claim Achievement"
4. Confirm transaction in wallet
5. NFT will be minted to your address

### Use Browser Extension
1. Install the extension
2. Visit any Twitter profile
3. See UARS reputation badge next to username
4. Click badge to view full profile on dashboard

## 🧪 Testing

### Test Smart Contracts
```bash
cd uars-foundry
forge test
```

### Test UI
```bash
npm run build
npm start
```

## 📝 Contract Addresses (Push Chain Testnet)

- **Lending Contract**: `0x98CDdEcCc5614A15f0B0E97b2009ABbd71bF2C09`
- **Achievement NFT**: `0x198b41D6075D4b87606F2ff82C15f26aC20F1B40`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [https://uars.vercel.app](https://uars.vercel.app)
- **GitHub**: [https://github.com/Althafp/UARS](https://github.com/Althafp/UARS)
- **Documentation**: [Wiki](https://github.com/Althafp/UARS/wiki)

## 🙏 Acknowledgments

- Push Chain team for the testnet infrastructure
- Twitter Developer Platform for OAuth 2.0 support
- The open-source community

---

**Built for Push Chain Hackathon 2025** 🚀
