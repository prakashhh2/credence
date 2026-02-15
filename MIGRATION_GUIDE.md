# Ethereum to Solana Migration Guide

## Summary of Changes

This document outlines all changes made to refactor the Credence platform from Ethereum/Polygon to Solana Devnet.

## Removed Dependencies

All EVM-specific packages have been removed:

```json
- "ethers": "^6.16.0"               // Removed
- "web3modal": (implicit MetaMask)  // Removed
```

These were used for:
- MetaMask wallet connection
- Contract ABI interactions
- Ethers.js provider/signer pattern
- Polygon/Ethereum RPC calls

## Added Dependencies

Solana-specific packages added:

```json
+ "@solana/web3.js": "^1.95.0"
+ "@solana/wallet-adapter-react": "^0.15.35"
+ "@solana/wallet-adapter-react-ui": "^0.16.35"
+ "@solana/wallet-adapter-wallets": "^0.19.32"
+ "@solana/wallet-adapter-base": "^0.9.23"
+ "@solana/spl-token": "^0.4.10"
+ "@metaplex-foundation/umi": "^0.9.0"
+ "@metaplex-foundation/umi-bundle-defaults": "^0.9.0"
+ "@metaplex-foundation/mpl-token-metadata": "^3.0.1"
+ "bs58": "^6.0.0"                 // For Solana address encoding
+ "tweetnacl": "^1.0.3"            // For Solana crypto
```

## File Changes

### New Files Created

#### 1. **src/web3/solanaService.js** ⭐
Replaces Ethereum RPC interactions:
- `getConnection()` - Returns Solana web3.js Connection instance
- `getBalance()` - Get wallet SOL balance
- `requestAirdrop()` - Request devnet SOL (testing only)
- `getTransaction()` - Fetch transaction details
- `confirmTransaction()` - Wait for transaction confirmation
- `formatAddress()` - Format address for display
- `isValidSolanaAddress()` - Validate Solana addresses

**Old Equivalent**: `src/web3/web3Service.js` (ethers.js based)

#### 2. **src/web3/solanaMetaplexService.js** ⭐
NFT minting and metadata:
- `initializeUmi()` - Setup Metaplex/Umi instance
- `mintCertificateNFT()` - Mint certificate as SPL token + metadata
- `fetchNFTMetadata()` - Retrieve on-chain metadata
- `revokeMintAuthority()` - Make NFT immutable

**Old Equivalent**: None (Solana-specific feature)

#### 3. **src/web3/storageService.js** ⭐
File and metadata storage:
- `hashFile()` - SHA-256 hash in browser (Web Crypto API)
- `createMetadataJSON()` - Create NFT metadata structure
- `uploadMetadataJSON()` - Upload metadata (stub implementation)
- `uploadCertificateFile()` - Upload certificate file (stub)
- `uploadStudentPhoto()` - Upload photo (stub)
- `fetchMetadata()` - Retrieve metadata from URL

**Old Equivalent**: `src/web3/ipfsService.js` (Pinata-based)

#### 4. **src/Services/solanaBlockchainServices.js** ⭐
High-level certificate operations:
- `issueCertificateOnSolana()` - Orchestrate full issuance flow
- `verifyCertificateOnSolana()` - Verify certificate by mint address
- `getCertificateDetails()` - Fetch certificate metadata
- `formatMintAddress()` - Format mint for display

**Old Equivalent**: `src/Services/blockchainServices.js` (Ethereum-based)

#### 5. **.env.example** (Updated)
Updated environment template for Solana configuration

#### 6. **SOLANA_REFACTORING_GUIDE.md** 📚
Comprehensive documentation for the new system

### Modified Files

#### **package.json**
- ❌ Removed: `ethers`, `web3modal` dependencies
- ✅ Added: All @solana packages listed above

#### **src/index.js** ⭐⭐
Complete rewrite - wrapper setup:

**Before (Ethers)**:
```jsx
<App />  // Direct render
```

**After (Solana Wallet Adapter)**:
```jsx
<ConnectionProvider endpoint={SOLANA_RPC_URL}>
  <WalletProvider wallets={[PhantomWalletAdapter, SolflareWalletAdapter]}>
    <WalletModalProvider>
      <App />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

#### **src/pages/AdminPortal.jsx** ⭐⭐
Complete refactor - certificate issuance:

**Key Changes**:
- ❌ Removed: `connectWallet()`, `issueCertificateOnChain()` (ethers)
- ✅ Added: `useWallet()`, `useConnection()` hooks
- ✅ Changed: Form inputs (added degreeTitle, universityName)
- ✅ Changed: Blockchain call from contract to `mintCertificateNFT()`
- ✅ Changed: Output now shows mint address instead of tx hash

**Data Flow**:
```
Before: Form → Hash (backend) → IPFS (Pinata) → Contract.issueCertificate()
After:  Form → Hash (browser) → Storage (demo) → Mint NFT (Metaplex)
```

#### **src/pages/VerifyCertificate.jsx** ⭐⭐
Complete refactor - verification:

**Key Changes**:
- ❌ Removed: `verifyCertificateOnBlockchain()` (contract-based)
- ✅ Added: `verifyCertificateOnSolana()` (RPC-based)
- ❌ Removed: Hashing certificate field input
- ✅ Added: Mint address input
- ✅ Changed: Query parameter from hash to mint (e.g., `?mint=...&sig=...`)

**Data Flow**:
```
Before: Enter hash → Call contract → Get stored data
After:  Enter mint → Query RPC → Fetch metadata PDA → Display attributes
```

#### **src/pages/StudentPortal.jsx** ⭐⭐
Complete refactor - student view:

**Key Changes**:
- ❌ Removed: Transaction history/indexer-based lookup
- ✅ Added: Direct mint address input
- ✅ Changed: Display on-chain metadata attributes
- ✅ Changed: Links to Solana Explorer (instead of Polygonscan)

#### **src/components/ui/walletButton.js** ⭐
Complete rewrite - wallet connection:

**Before (MetaMask)**:
```jsx
<button onClick={handleConnect}>Connect MetaMask</button>
```

**After (Wallet Adapter)**:
```jsx
<WalletMultiButton />  // Pre-built multi-wallet UI
```

## Architecture Comparison

### Ethereum/Polygon Architecture
```
Client
  ↓ ethers.js
MetaMask Window.ethereum
  ↓ JSON-RPC
Polygon RPC (https://rpc-mumbai.maticvigil.com)
  ↓
Smart Contract (0xABCD...)
  ├─ issueCertificate()
  ├─ verifyCertificate()
  └─ claimCertificate()

Storage: IPFS (Pinata)
```

### Solana Architecture
```
Client
  ↓ @solana/wallet-adapter
Phantom/Solflare Wallet
  ↓ JSON-RPC
Solana Devnet RPC (https://api.devnet.solana.com)
  ├─ Token Program (SPL Token)
  │  └─ Create mint & token account
  ├─ Metadata Program (Metaplex)
  │  └─ Create metadata PDA
  └─ System Program
     └─ Create accounts

Storage: Demo (localStorage + data URLs)
         Production: Arweave/IPFS
```

## Data Structures Comparison

### Certificate Storage

**Before (Ethereum Contract)**:
```solidity
struct Certificate {
    bytes32 certificateHash;
    address issuer;
    uint64 issuedAt;
    string ipfsHash;
    string metadataURI;
    bool revoked;
    address claimedBy;
    uint64 claimedAt;
}
```

**After (Solana NFT)**:
```json
{
  "name": "Certificate - John Doe",
  "symbol": "CERT",
  "description": "Academic Certificate...",
  "image": "...", // Student photo or cert image
  "attributes": [
    { "trait_type": "Certificate ID", "value": "..." },
    { "trait_type": "Student Name", "value": "..." },
    { "trait_type": "Degree Title", "value": "..." },
    { "trait_type": "University", "value": "..." },
    { "trait_type": "Issue Date", "value": "..." },
    { "trait_type": "Certificate Hash", "value": "..." }
  ],
  "properties": {
    "files": [
      { "uri": "...", "type": "application/pdf" }
    ],
    "creators": [
      { "address": "issuer_pubkey", "verified": true, "share": 100 }
    ]
  }
}
```

## Function Mapping

### Wallet Connection

| Ethereum | Solana |
|----------|--------|
| `connectWallet()` (ethers) | `useWallet()` hook + `WalletMultiButton` |
| `window.ethereum` | Wallet Adapter context |
| `BrowserProvider(window.ethereum)` | `useConnection()` hook |
| `signer.getAddress()` | `publicKey` from hook |

### Certificate Issuance

| Ethereum | Solana |
|----------|--------|
| `issueCertificateOnChain()` | `mintCertificateNFT()` |
| Contract ABI interaction | Metaplex token metadata |
| `transaction.wait()` | `confirmTransaction()` |
| Return: txHash | Return: mintAddress + txSignature |

### Certificate Verification

| Ethereum | Solana |
|----------|--------|
| `verifyCertificateOnBlockchain()` | `verifyCertificateOnSolana()` |
| Contract read: `getCertificate(hash)` | RPC query: fetch metadata PDA |
| Parameter: certificate hash | Parameter: mint address |
| Query path: on-chain storage | Query path: on-chain metadata account |

### Storage

| Ethereum | Solana |
|----------|--------|
| IPFS via Pinata API | Demo: localStorage + data URLs |
| Separate file upload | Embedded in metadata attributes |
| Pinata credentials in .env | (Demo only - extend for production) |

## Migration Checklist

### For Developers

- [x] Updated all dependencies
- [x] Created Solana service layer
- [x] Created Metaplex NFT minting service
- [x] Created storage service
- [x] Created high-level blockchain service
- [x] Updated index.js with wallet providers
- [x] Refactored AdminPortal
- [x] Refactored VerifyCertificate
- [x] Refactored StudentPortal
- [x] Updated wallet button component
- [x] Updated .env template
- [x] Created comprehensive docs

### For Testing

- [ ] Install dependencies: `npm install`
- [ ] Ensure Phantom wallet extension installed
- [ ] Request devnet SOL: https://faucet.solana.com
- [ ] Test Admin Portal issuance flow
- [ ] Test Student Portal viewing
- [ ] Test Public Verification
- [ ] Test QR code generation/scanning
- [ ] Verify Solana Explorer links work
- [ ] Test wallet connection/disconnection
- [ ] Test error handling

### For Production

- [ ] Switch to mainnet RPC endpoint
- [ ] Implement real storage (Arweave/IPFS)
- [ ] Add backend for issuer verification
- [ ] Implement role-based access (only authorized issuers can mint)
- [ ] Add certificate revocation mechanism
- [ ] Set up monitoring/logging
- [ ] Security audit
- [ ] Rate limiting
- [ ] Add privacy policy/ToS
- [ ] Consider compressed NFTs for cost savings

## Common Issues & Solutions

### Issue: "Wallet adapter not found"
**Solution**: Ensure wallet provider wraps the app in index.js

### Issue: "Connection failed to devnet"
**Solution**: Check RPC endpoint in .env.local, verify network status

### Issue: "Insufficient SOL for transaction"
**Solution**: Request devnet airdrop at https://faucet.solana.com

### Issue: "Transaction confirmed but metadata not found"
**Solution**: Metadata PDAs take time to sync; retry verification after a few seconds

### Issue: QR code doesn't verify
**Solution**: Ensure mint address in QR is correct; test by manually entering address

## Performance Comparison

| Metric | Ethereum | Solana |
|--------|----------|--------|
| Transaction cost | ~$2-10 | ~$0.00025 |
| Confirmation time | 15-30s | 4-6s |
| Storage bloat | On-contract | Off-chain metadata |
| NFT standard | ERC-721 | SPL Token + Metadata |
| Wallet UX | Single (MetaMask) | Multi-wallet |

## Notes for Future Development

1. **Compressed NFTs**: Reduce storage footprint using Metaplex compressed NFTs
2. **Batch Issuance**: Add ability to mint multiple certificates in one transaction
3. **Certificate Templates**: Pre-configured templates for different degree types
4. **Revocation System**: Burn or mark certificates as revoked
5. **Expiration**: Add certificate expiration logic
6. **Namespaces**: Create certificate collections per university
7. **API Layer**: Build REST API for third-party integrations
8. **Mobile**: React Native app for certificate viewing
9. **Verification Services**: Integration with third-party verification platforms
10. **Audit Trail**: Complete transaction history and metadata changes

## References

- [Solana Documentation](https://docs.solana.com)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Metaplex Token Metadata](https://github.com/metaplex-foundation/mpl-token-metadata)
- [SPL Token Program](https://spl.solana.com/token)
- [Solana Explorer](https://explorer.solana.com)
- [Anchor Framework](https://github.com/coral-xyz/anchor) (for custom on-chain program)

---

**Migration completed**: Ethereum/Polygon → Solana Devnet ✅
