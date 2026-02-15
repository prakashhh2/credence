# Credence - Solana Certificate Issuance & Verification Platform

## Overview

Credence is a blockchain-powered academic certificate verification platform, **now refactored to run on Solana Devnet**. It enables universities to issue tamper-proof digital certificates as NFTs and allows students and employers to verify certificate authenticity.

### Key Features

- 🪙 **NFT-Based Certificates**: Each certificate is minted as a unique NFT on Solana Devnet
- 🔐 **Cryptographic Verification**: SHA-256 hashing ensures document integrity
- 🏫 **University Portal**: Upload certificates and mint NFTs with student metadata
- 👤 **Student Portal**: View and manage your issued certificates
- 🔍 **Verification System**: Verify certificates by mint address with full on-chain metadata
- 📱 **QR Code Integration**: Share certificate verification links via QR codes
- 🟢 **Solana Wallet Support**: Works with Phantom, Solflare, and other Solana wallets
- 🌐 **Devnet Testing**: Easy to test without mainnet costs

## Technology Stack

### Blockchain & Web3
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/wallet-adapter-react** - Multi-wallet support (Phantom, Solflare, etc.)
- **@solana/wallet-adapter-react-ui** - Pre-built wallet UI components
- **@metaplex-foundation/umi** - Metaplex protocol interactions
- **@metaplex-foundation/mpl-token-metadata** - NFT metadata handling
- **@solana/spl-token** - Solana token program integration

### Frontend
- **React 19** - UI framework
- **React Router (Hash-based)** - Client-side routing
- **QRCode.js** - QR code generation

### Storage (Demo)
- **Browser localStorage** - Demo metadata storage
- **Data URLs** - Embedded file storage for testing
- **Extensible for Arweave/IPFS** - Ready for production storage services

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ├─ Admin Portal (Mint Certificates)                           │
│  ├─ Student Portal (View Certificates)                         │
│  ├─ Verify Page (Public Verification)                          │
│  └─ Wallet Integration (Solana Wallet Adapter)                 │
│                                                                 │
├─ Services Layer ─────────────────────────────────────────────────┤
│                                                                 │
│  ├─ solanaBlockchainServices.js (Orchestration)                │
│  ├─ solanaMetaplexService.js (NFT Minting)                     │
│  ├─ solanaService.js (RPC Interactions)                        │
│  └─ storageService.js (Metadata Upload)                        │
│                                                                 │
├─ Solana Devnet ──────────────────────────────────────────────────┤
│                                                                 │
│  ├─ Token Minting Program (SPL Token)                          │
│  ├─ Metadata Program (Metaplex)                                │
│  └─ NFT Metadata PDAs                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- A Solana wallet (Phantom, Solflare, etc.)
- SOL in your Devnet wallet for transactions (request airdrop at https://faucet.solana.com)

### Steps

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd credence
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed (optional - defaults to Devnet RPC)
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   Opens at http://localhost:3000

### Development Scripts

```bash
npm start              # Start dev server
npm run build         # Build for production
npm test              # Run tests
npm run hardhat:*     # Hardhat commands (for reference only - using Solana now)
```

## Usage Guide

### 1. University Portal - Issuing Certificates

1. Navigate to `/#admin`
2. Click **Connect Wallet** (Phantom/Solflare)
3. Fill in certificate details:
   - Student Name
   - University Name
   - Degree Title
   - Issue Date
4. Upload:
   - Certificate file (PDF/image)
   - Student photo (optional)
5. Click **Mint Certificate NFT**
6. Approve transaction in wallet
7. Receive:
   - **Mint Address** - The NFT mint address
   - **Transaction Signature** - Blockchain proof
   - **QR Code** - For easy sharing

### 2. Student Portal - Viewing Certificates

1. Navigate to `/#student`
2. Connect wallet (if not already connected)
3. Enter your certificate's mint address
4. Click **View Certificate**
5. See all certificate metadata, attributes, and blockchain info
6. Links to Solana Explorer for full transparency

### 3. Verification Page - Public Verification

1. Navigate to `/#verify`
2. Enter certificate mint address
3. Click **Verify Certificate**
4. See verification status, attributes, and on-chain metadata
5. View on Solana Explorer for transaction details

**Or use QR code**: Scan the QR from the issuance result - automatically redirects to verify page

## File Structure

```
src/
├── pages/
│   ├── AdminPortal.jsx         # University certificate issuance
│   ├── StudentPortal.jsx       # Student certificate viewing
│   ├── VerifyCertificate.jsx   # Public verification page
│   └── *.css                   # Page styles
│
├── Services/
│   └── solanaBlockchainServices.js  # High-level blockchain orchestration
│
├── web3/
│   ├── solanaService.js        # Solana RPC interactions
│   ├── solanaMetaplexService.js # NFT minting via Metaplex
│   └── storageService.js       # File & metadata storage
│
├── components/
│   └── ui/
│       └── walletButton.js     # Solana wallet adapter UI
│
├── App.js                      # Main router
├── index.js                    # Wallet provider setup
└── styles/                     # Global styles
```

## Certificate Issuance Flow

```
1. User connects Solana wallet
   ↓
2. Fill form: studentName, university, degree, issueDate
   ↓
3. Upload certificate file + photo
   ↓
4. Hash certificate with SHA-256 (in browser)
   ↓
5. Upload files to storage (demo: data URLs)
   ↓
6. Create metadata JSON with attributes
   ↓
7. Upload metadata (demo: localStorage/data URL)
   ↓
8. Mint NFT on Solana via Metaplex
   - Create token mint
   - Create metadata account
   - Sign transaction
   ↓
9. Confirm transaction
   ↓
10. Return: mintAddress, txSignature, QR code
```

## Certificate Verification Flow

```
1. User enters mint address (or scans QR)
   ↓
2. Fetch NFT metadata from Solana RPC
   ↓
3. Display on-chain attributes:
   - Student name
   - Degree title
   - Issue date
   - University
   - Certificate hash (for integrity)
   ↓
4. Show Solana Explorer links for full transparency
```

## Configuration

### Environment Variables (.env.local)

```env
# Solana RPC (defaults to devnet - optional to set)
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

# Storage (for production, add real service credentials)
# REACT_APP_PINATA_API_KEY=...
# REACT_APP_ARWEAVE_ENDPOINT=...

# Frontend URL (for QR codes)
# REACT_APP_FRONTEND_URL=http://localhost:3000
```

### Switching Networks

To use a different Solana cluster (devnet/testnet/mainnet):

1. Edit `src/web3/solanaService.js`:
   ```javascript
   export const SOLANA_NETWORK = 'devnet'; // Change to 'testnet' or 'mainnet-beta'
   ```

2. Update RPC endpoint in `.env.local`

## Important Notes

### Devnet Considerations

- **Free SOL**: Request airdrop at https://faucet.solana.com
- **No Real Value**: Devnet is for testing only
- **Resets**: Devnet may reset periodically (data not permanent)
- **Testing**: Ideal for development and demos

### Demo Storage

Current implementation uses:
- **localStorage** for metadata persistence (browser-only)
- **Data URLs** for file embedding (works for small files)

For production, implement:
- **IPFS/Pinata** for decentralized file storage
- **Arweave** for permanent, immutable storage
- **Bundlr** for bundled Arweave uploads

### Security

- ✅ Client-side SHA-256 hashing (no server needed)
- ✅ NFT ownership via wallet control
- ✅ On-chain metadata immutability
- ✅ QR codes for secure sharing
- ⚠️ Demo uses data URLs (not suitable for large files in production)

## Troubleshooting

### "Wallet not connected"
- Ensure Phantom/Solflare extension is installed
- Click wallet button and approve connection
- Check that wallet is on Devnet network

### "Invalid Solana mint address"
- Verify mint address is correct
- Ensure it's a valid Base58 Solana address
- Check address hasn't been typo'd

### Transaction failures
- Verify wallet has sufficient SOL (~0.5-2 SOL per transaction)
- Check Solana network status at https://status.solana.com
- Try requesting airdrop again
- Check Solana Explorer for error details

### "Metadata not found"
- Demo implementation stores in localStorage
- Clear browser cache if testing in different browser
- Production implementation should use Arweave/IPFS

## Production Checklist

- [ ] Implement permanent storage (Arweave/IPFS)
- [ ] Use mainnet Solana RPC
- [ ] Add backend for issuer verification
- [ ] Implement role-based access control
- [ ] Add certificate revocation mechanism
- [ ] Set up monitoring and error tracking
- [ ] Add certificate expiration logic
- [ ] Implement batch issuance for universities
- [ ] Add audit logging
- [ ] Security audit of smart interactions
- [ ] Rate limiting for verification endpoint
- [ ] HTTPS everywhere
- [ ] Add terms of service and privacy policy

## API Integration (Optional Backend)

The app works entirely on-chain, but can integrate with a backend for:

```javascript
// Examples of optional backend endpoints:
POST /api/admin/authorize     // Verify issuer credentials
POST /api/certificates/issue  // Log certificate issuance
GET /api/certificates/:mint   // Retrieve stored metadata
POST /api/revoke/:mint        # Revoke certificate
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is open source and available under the MIT License.

## Support & Resources

- **Solana Documentation**: https://docs.solana.com
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter
- **Metaplex**: https://www.metaplex.com/
- **Solana Explorer**: https://explorer.solana.com (set cluster to devnet)

## Roadmap

- [ ] Compressed NFTs for lower costs
- [ ] Multiple certificate types (diploma, badge, certification)
- [ ] Certificate bundling for bulk issuance
- [ ] Advanced verification with biometrics
- [ ] Integration with educational institutions
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Certificate expiration and renewal
- [ ] Integration with degree verification services

---

**Built with ❤️ for education on Solana**
