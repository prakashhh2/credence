# Credence - Blockchain-Powered Academic Certificate Verification

A decentralized platform for issuing, claiming, and verifying academic certificates using blockchain technology and IPFS.

## 🎯 Overview

Credence leverages blockchain to provide:
- **Tamper-proof** certificate issuance
- **Instant verification** for employers
- **Student ownership** via wallet
- **Decentralized storage** via IPFS
- **No intermediaries** - peer-to-peer verification

## ✨ Features

### 🏫 University Portal
- Issue certificates to students
- Upload PDF/Image files (stored on IPFS)
- Generate blockchain proof
- Create shareable QR codes
- Track all issued certificates

### 👨‍🎓 Student Portal
- Claim certificates with your wallet
- View all claimed certificates
- Download proofs
- Share with employers
- Export certificate details

### 🔍 Public Verification
- Verify any certificate (no login needed)
- Check authenticity on blockchain
- View student details
- Download original file
- See claim status

## 🛠️ Tech Stack

**Frontend:**
- React.js - UI framework
- CSS3 - Styling
- ethers.js - Blockchain interaction
- QR Code - Certificate sharing

**Blockchain:**
- Solidity - Smart contracts
- Polygon - Low-cost network
- IPFS/Pinata - Decentralized storage

**DevOps:**
- Node.js - Runtime
- npm - Package manager

## 📋 Project Structure

```
credence/
├── contracts/
│   └── CredenceCertificate.sol    # Smart contract
├── src/
│   ├── pages/                     # Page components
│   │   ├── UniversityPortal.jsx
│   │   ├── StudentPortal.jsx
│   │   └── VerifyCertificate.jsx
│   ├── web3/                      # Blockchain integration
│   │   ├── web3Service.js         # Wallet & contract
│   │   ├── ipfsService.js         # File storage
│   │   └── transactionTracker.js  # History
│   ├── Services/
│   │   └── blockchainServices.js  # Main integration
│   ├── context/
│   │   └── CertificateContext.js  # State management
│   ├── components/
│   │   └── ...                    # UI components
│   └── App.js                     # Main app
├── .env.example                   # Config template
├── QUICK_START.md                 # 30-min setup guide
├── IMPLEMENTATION_GUIDE.md        # Detailed walkthrough
├── DEPLOYMENT_GUIDE.md            # Smart contract deployment
└── PROJECT_SUMMARY.md             # This project overview
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MetaMask browser extension
- Polygon Mumbai testnet access

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/credence.git
cd credence
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env.local**
```bash
cp .env.example .env.local
# Fill in your API keys
```

4. **Start development server**
```bash
npm start
# Opens http://localhost:3000
```

### Next Steps

Follow one of these guides:

- **⚡ 30-min setup?** → Read [QUICK_START.md](QUICK_START.md)
- **📚 Detailed guide?** → Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **⛓️ Deploy contract?** → Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📖 How It Works

### Certificate Issuance Flow
```
University uploads certificate
    ↓
File → IPFS (Pinata)
    ↓
Hash calculated (SHA-256)
    ↓
Hash → Blockchain (Polygon)
    ↓
Student gets QR code + proof
```

### Certificate Verification Flow
```
Student claims certificate
    ↓
Wallet verification
    ↓
Linked to student address
    ↓
Public can verify anytime
```

## 🌐 Network Support

### Testnet (Free Testing)
- **Polygon Mumbai** - Recommended
  - RPC: https://rpc-mumbai.maticvigil.com
  - Chain ID: 80001
  - Get free MATIC: [faucet.polygon.technology](https://faucet.polygon.technology)

### Mainnet (Production)
- **Polygon** - Low gas fees (~$0.01-0.20)
  - RPC: https://polygon-rpc.com
  - Chain ID: 137

### Alternative Networks
- **Arbitrum** - Ultra-low gas
- **Optimism** - Ultra-low gas
- **Ethereum** - High security

## 💰 Gas Costs

| Network | Cost/Tx | Use |
|---------|---------|-----|
| Polygon Mumbai | FREE | Testing |
| Polygon Mainnet | ~$0.05-0.20 | Production |
| Arbitrum | ~$0.001-0.01 | Ultra-cheap |

## 🔐 Smart Contract

### Key Functions

**Issue Certificate**
```solidity
issueCertificate(
  studentName,
  degree,
  issueDate,
  universityName,
  ipfsHash,
  certificateHash,
  metadataURI
)
```

**Claim Certificate**
```solidity
claimCertificate(certificateHash)
```

**Verify Certificate**
```solidity
verifyCertificate(certificateHash)
→ Returns: exists, isClaimed, isRevoked, studentName, degree
```

**Get Details**
```solidity
getCertificateDetails(certificateHash)
→ Returns: Full certificate data
```

See [contracts/CredenceCertificate.sol](contracts/CredenceCertificate.sol) for full contract.

## 📦 Dependencies

### Core
- react@18.2.0
- ethers@6.x
- qrcode@1.x

### Styling
- CSS3 (no CSS framework needed)

### Blockchain
- MetaMask (browser extension)
- Pinata (IPFS gateway)
- Polygon Network

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Network Configuration
REACT_APP_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
REACT_APP_CONTRACT_ADDRESS=0x...

# IPFS Configuration
REACT_APP_PINATA_API_KEY=...
REACT_APP_PINATA_SECRET_KEY=...
```

Get from:
- **Pinata**: [pinata.cloud](https://pinata.cloud)
- **Contract**: Deployed address after deployment

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1920px)
- ✅ Mobile (320px - 768px)

## 🧪 Testing

### Test University Flow
1. Go to University Portal
2. Select university
3. Upload certificate
4. Enter student details
5. Submit
6. Get transaction hash & QR code

### Test Student Flow
1. Go to Student Portal
2. Connect wallet
3. Enter certificate hash
4. Claim certificate
5. View in your list

### Test Verification
1. Go to Verify Certificate
2. Enter any hash
3. See details
4. Access IPFS file

## 🚢 Deployment

### Frontend Deployment

```bash
# Build production
npm run build

# Deploy to Vercel
npm install -g vercel
vercel

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Smart Contract Deployment

Use Remix IDE or Hardhat:
- **Remix** (easiest): [remix.ethereum.org](https://remix.ethereum.org)
- **Hardhat** (advanced): [hardhat.org](https://hardhat.org)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 30-minute setup checklist |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Complete walkthrough |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Contract deployment |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Feature overview |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Polygon** - Low-cost blockchain network
- **Pinata** - IPFS infrastructure
- **Ethers.js** - Blockchain SDK
- **MetaMask** - Wallet provider

## 📞 Support

### Getting Help
- Check documentation in [QUICK_START.md](QUICK_START.md)
- Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- Review contract comments in [contracts/CredenceCertificate.sol](contracts/CredenceCertificate.sol)

### Common Issues
- **MetaMask not connecting** → Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Contract deployment failed** → See troubleshooting section
- **Gas fees too high** → Switch to Polygon or Arbitrum

## 🎯 Roadmap

### v1.0 (Current) ✅
- [x] University Portal
- [x] Student Portal
- [x] Public Verification
- [x] Blockchain integration
- [x] IPFS storage
- [x] QR code generation

### v1.1 (Planned)
- [ ] Bulk certificate upload
- [ ] Dashboard with analytics
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Certificate revocation UI
- [ ] Multi-language support

### v2.0 (Future)
- [ ] Mobile app
- [ ] Employer portal
- [ ] API for integrations
- [ ] Hardware wallet support
- [ ] NFT integration
- [ ] Multi-chain support

## 🔐 Security

### Smart Contract
- Owner-based authorization
- University whitelist
- Immutable blockchain record
- IPFS hash verification

### Frontend
- MetaMask wallet verification
- Secure key storage
- No private keys in code
- HTTPS-only deployment

### Best Practices
- Never share private keys
- Keep .env.local secret
- Verify addresses before sending
- Test on testnet first

## 📊 Statistics

- **Smart Contract**: ~250 lines of Solidity
- **Frontend**: ~1500 lines of React
- **Blockchain Integration**: ~400 lines
- **Total Features**: 8 main features
- **Supported Networks**: 5 networks
- **Mobile Responsive**: Yes
- **Zero Database**: Yes (blockchain only)

## 🎓 Use Cases

### Universities
- Issue tamper-proof certificates
- Reduce credential fraud
- Track issued certificates
- Control certificate distribution

### Students
- Own their credentials
- Share with employers
- Portable across institutions
- Verify authenticity anytime

### Employers
- Verify certificates instantly
- Eliminate fake credentials
- Access original documents
- Confirm student claims

## 💡 Why Blockchain?

✅ **Immutable** - Can't be faked
✅ **Decentralized** - No single point of failure
✅ **Transparent** - Anyone can verify
✅ **Instant** - No intermediaries
✅ **Permanent** - Forever stored
✅ **Cheap** - Polygon costs ~$0.10

## 🌟 Key Features Highlight

- 🎓 **Academic-Focused** - Built for universities
- ⛓️ **Blockchain-Backed** - Cryptographically secure
- 📁 **IPFS Storage** - Decentralized files
- 🔐 **Wallet Integration** - MetaMask support
- 📱 **Mobile-Ready** - Works on all devices
- 🌐 **Multi-Network** - Polygon, Ethereum, Arbitrum
- 💨 **Low Gas** - ~$0.10 per certificate
- 🚀 **Production-Ready** - Deploy today

## 📧 Contact

- **Issues**: Open GitHub issue
- **Email**: Replace with your email
- **Twitter**: Replace with your handle

---

## 🎉 Getting Started

**Ready to launch?** Start here:

1. Read [QUICK_START.md](QUICK_START.md) (5 min)
2. Setup environment (5 min)
3. Deploy contract (10 min)
4. Test app (10 min)
5. **Total: 30 minutes** to working system!

---

**Credence - Trust Academic Credentials** 🚀

*Built with ❤️ for transparent education*
