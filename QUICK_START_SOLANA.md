# Quick Start - Solana Credence

Get the Solana-based certificate platform running in minutes!

## 🚀 Super Quick Start (5 minutes)

### 1. Setup
```bash
npm install
npm start
```
Opens http://localhost:3000

### 2. Get SOL on Devnet
Visit https://faucet.solana.com and paste your wallet address (Phantom, Solflare, etc.)

### 3. Issue a Certificate
1. Go to http://localhost:3000/#admin
2. Click "Connect Wallet"
3. Fill form:
   - Student Name: "Alice Smith"
   - University: "Stanford University"
   - Degree: "Bachelor of Science in Computer Science"
   - Issue Date: Today
4. Upload any PDF or image file
5. Click "Mint Certificate NFT"
6. Approve transaction in wallet
7. **Copy the mint address!**

### 4. Verify the Certificate
1. Go to http://localhost:3000/#verify
2. Paste the mint address
3. Click "Verify Certificate"
4. See your certificate on-chain! 🎉

### 5. Student View
1. Go to http://localhost:3000/#student
2. Paste the mint address
3. View certificate details

## 📋 Requirements

- Node.js 16+
- npm/yarn
- Phantom, Solflare, or other Solana wallet
- ~0.5 SOL on Devnet (request free airdrop)

## 🔧 Configuration (Optional)

Create `.env.local`:
```env
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
REACT_APP_DEBUG=true
```

**Default uses Devnet (no config needed)**

## 📁 Key Files

- `src/pages/AdminPortal.jsx` - Issue certificates
- `src/pages/VerifyCertificate.jsx` - Verify certificates
- `src/pages/StudentPortal.jsx` - View certificates
- `src/web3/solanaService.js` - Solana RPC
- `src/Services/solanaBlockchainServices.js` - Orchestration

## 🐛 Troubleshooting

**"Wallet not connected"**
- Check Phantom/Solflare extension is installed
- Click wallet button to connect
- Ensure it's on Devnet network

**"Not enough SOL"**
- Request airdrop: https://faucet.solana.com
- Wait a few minutes, try again

**"Invalid mint address"**
- Paste the full mint address from issuance result
- Must be valid Base58 format

**"Metadata not found"**
- Wait 10-30 seconds for confirmation
- Refresh page and try again

## 📖 Documentation

- `SOLANA_REFACTORING_GUIDE.md` - Full system overview
- `MIGRATION_GUIDE.md` - Ethereum → Solana changes
- `QUICK_START.md` - This file

## 🌐 Useful Links

- **Solana Explorer**: https://explorer.solana.com (set to Devnet)
- **Solana Faucet**: https://faucet.solana.com
- **Phantom Wallet**: https://phantom.app
- **Docs**: https://docs.solana.com

## ✨ What's Happening Under the Hood

```
Admin Portal (Issue)
  ↓ Form + Files
  ↓ Compute SHA-256 hash (browser)
  ↓ Upload to storage (demo: localStorage)
  ↓ Create metadata JSON
  ↓ Mint NFT via Metaplex
  ↓ Get mint address + tx signature
  ↓ Generate QR code
  
Student Portal (View)
  ↓ Enter mint address
  ↓ Query Solana RPC
  ↓ Fetch metadata PDA
  ↓ Display certificate
  
Verify Page (Public)
  ↓ Enter mint address (or scan QR)
  ↓ Fetch NFT metadata
  ↓ Verify on-chain ✓
  ↓ Show details + Explorer links
```

## 🎯 Common Workflow

```
1. Admin: Issue certificate → Get mint address
2. Share: Send mint address or QR code to student
3. Student: View in Student Portal by entering mint
4. Anyone: Verify in Verify page (public, no login)
```

## 💡 Tips

- Save mint address for later reference
- Use QR code for easy sharing
- Check Solana Explorer for full transaction details
- Demo uses localStorage (browser-specific)
- For production, implement Arweave/IPFS storage

## 🚀 Next Steps

- Read `SOLANA_REFACTORING_GUIDE.md` for full details
- Check `MIGRATION_GUIDE.md` to understand Ethereum → Solana changes
- Explore source code in `src/` folder
- Test different wallets (Phantom, Solflare, Ledger)
- Try batch issuance (coming soon)

## ❓ Questions?

Check the docs:
- `SOLANA_REFACTORING_GUIDE.md` - Architecture & features
- `MIGRATION_GUIDE.md` - What changed & why
- Code comments in `src/web3/` and `src/Services/`

---

**Ready? Let's go! 🎓**

```bash
npm install && npm start
# Open http://localhost:3000/#admin
```

**Built with ❤️ on Solana**
