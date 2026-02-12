# Setup Guide: Granting ISSUER_ROLE

## Problem
Your MetaMask wallet doesn't have `ISSUER_ROLE` granted on the smart contract, so you can't issue certificates.

## Solution
Follow these steps to grant the role to your wallet:

### Step 1: Get Your Wallet Address
1. Open MetaMask
2. Copy your wallet address (starts with `0x`)

### Step 2: Get Your Admin/Owner Private Key
- The wallet that deployed the contract is the admin
- Export the private key from MetaMask (Settings → Security & Privacy → Show Private Key)
- ⚠️ **NEVER share this key publicly**

### Step 3: Update Environment Variables
Edit your `.env` file in the `hardhat-contracts/` directory:

```env
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=<admin_wallet_private_key>
CONTRACT_ADDRESS=<your_deployed_CredenceCertificateV2_address>
ISSUER_ADDRESS=<your_MetaMask_wallet_address>
```

### Step 4: Run the Grant Script
From the `hardhat-contracts/` directory:

```bash
npx hardhat run scripts/grantIssuer.js --network sepolia
```

Expected output:
```
Granting ISSUER_ROLE to: 0x...
Contract: 0x...

Deployer/Admin account: 0x...
✓ Transaction confirmed!
  Hash: 0x...
  Block: 12345678

✓ Verified: 0x... is now an issuer: true
```

### Step 5: Test in the App
1. Refresh your browser
2. Try issuing a certificate
3. Sign the MetaMask transaction
4. Your certificate will be issued!

## Troubleshooting

**"Set CONTRACT_ADDRESS in .env"**
- Make sure you deployed the contract first
- Copy the address from the deployment output
- Add it to `.env`

**"Not authorized to grant role"**
- The account in PRIVATE_KEY must be the contract owner/admin
- Make sure it's the same wallet that deployed the contract

**"Contract at address has no code"**
- Check CONTRACT_ADDRESS is correct
- Check you're on the correct network (Sepolia)

## Revoking Access
To remove issuer role later:
```bash
npx hardhat run scripts/revokeIssuer.js --network sepolia
```
(Create this script if needed)

## Next Steps
- [Back to README](../README.md)
- [Smart Contract Docs](./README.md)
