# SMART CONTRACT DEPLOYMENT GUIDE

## Overview

Deploy `CredenceCertificate.sol` to blockchain networks. Two methods provided below.

---

## METHOD 1: REMIX IDE (RECOMMENDED - EASIEST)

### Best for: First-time users, quick deployment

#### Step 1: Open Remix
- Go to [remix.ethereum.org](https://remix.ethereum.org)
- Bookmark this page

#### Step 2: Create Contract File
1. Left panel → File Explorer
2. Click "Create New File" button
3. Name: `CredenceCertificate.sol`
4. Create

#### Step 3: Copy Contract Code
1. Open `contracts/CredenceCertificate.sol` from this project
2. Select all code (Ctrl+A)
3. Copy (Ctrl+C)
4. In Remix, paste into file
5. Save (Ctrl+S)

#### Step 4: Compile
1. Left sidebar → Solidity Compiler icon
2. Select compiler version: `0.8.0` or higher
3. Click "Compile CredenceCertificate.sol"
4. Should see green checkmark ✅

**If error:**
- Check syntax (check comments in contract)
- Click error message for hint
- Google the error

#### Step 5: Deploy
1. Left sidebar → "Deploy & Run Transactions" icon
2. Environment dropdown → Select "Injected Provider - MetaMask"
3. MetaMask will prompt → Approve
4. Check MetaMask is on **Polygon Mumbai**
5. Contract dropdown → Select `CredenceCertificate`
6. Click orange "Deploy" button
7. MetaMask popup → Confirm transaction
8. **Wait 30 seconds for confirmation**

#### Step 6: Get Contract Address
1. Deployment successful! 🎉
2. Scroll down to "Deployed Contracts"
3. Find `CredenceCertificate` address
4. Copy the address (0x...)

#### Step 7: Update Environment
In your project root, create/update `.env.local`:
```
REACT_APP_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
REACT_APP_CONTRACT_ADDRESS=0x... (paste address from step 6)
```

#### Step 8: Verify on Explorer
1. Go to [mumbai.polygonscan.com](https://mumbai.polygonscan.com)
2. Search for your contract address
3. Should see "Credence Certificate" contract
4. Can see all functions available ✅

---

## METHOD 2: HARDHAT (ADVANCED)

### Best for: Experienced developers, local testing

#### Install Hardhat
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

#### Create Deploy Script
File: `scripts/deploy.js`
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying CredenceCertificate...");
  
  const CredenceCertificate = await hre.ethers.getContractFactory("CredenceCertificate");
  const contract = await CredenceCertificate.deploy();
  
  await contract.deployed();
  
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### Configure Network
File: `hardhat.config.js`
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    mumbai: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

#### Deploy
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

---

## NETWORK CONFIGURATIONS

### Polygon Mumbai (Testnet)

**Use for:** Testing (free)

```
Network Name: Polygon Mumbai
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Block Explorer: https://mumbai.polygonscan.com
```

**Get Test MATIC:**
```
https://faucet.polygon.technology
- Enter wallet address
- Select Mumbai
- Request MATIC
- Wait 1-2 minutes
```

### Polygon Mainnet (Production)

**Use for:** Real certificates (paid)

```
Network Name: Polygon Mainnet
RPC URL: https://polygon-rpc.com
Chain ID: 137
Currency Symbol: MATIC
Block Explorer: https://polygonscan.com
```

**Get Real MATIC:**
```
1. Buy MATIC on exchange (Coinbase, Kraken, etc)
2. Send to MetaMask address
3. Deploy same contract to mainnet
```

### Ethereum Sepolia (Alternative Testnet)

```
Network Name: Ethereum Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

Get testnet ETH: [sepoliafaucet.com](https://sepoliafaucet.com)

---

## AUTHORIZATION (One-Time)

After deployment, authorize universities to issue certificates.

### In Remix:

1. Deployed Contracts section
2. Find `CredenceCertificate`
3. Expand functions
4. Find `authorizeIssuer`
5. Enter university wallet address
6. Click `transact`
7. Confirm in MetaMask

### For Multiple Universities:
```solidity
// In Remix console or script:
await contract.authorizeIssuer("0xUniversity1Address");
await contract.authorizeIssuer("0xUniversity2Address");
await contract.authorizeIssuer("0xUniversity3Address");
```

---

## VERIFICATION ON EXPLORER

### Verify Contract on PolygonScan

This allows anyone to see and interact with your contract:

1. Go to your contract on [mumbai.polygonscan.com](https://mumbai.polygonscan.com)
2. Contract → "Verify & Publish"
3. Enter:
   - Compiler version (same as used)
   - License: MIT
   - Contract code (copy from file)
4. Click Verify
5. Check "Contract verified" badge appears

---

## TESTING BEFORE DEPLOYMENT

### Quick Test in Remix:

1. In Remix, Deploy tab
2. After deploy, find contract functions
3. Test: `authorizeIssuer` with your address
4. Test: `issueCertificate` with sample data
5. Test: `verifyCertificate` to check
6. All working? ✅ Ready to deploy

### Gas Estimation:

Before mainnet, check gas costs:

1. In Remix Transactions
2. Click transaction details
3. See "Gas Used"
4. Multiply by current gas price
5. Shows cost in MATIC/ETH

---

## TROUBLESHOOTING DEPLOYMENT

### Error: "MetaMask not connected"
- [ ] Refresh Remix page
- [ ] Click "Connect" button
- [ ] Check MetaMask is open
- [ ] Approve permission popup

### Error: "Wrong Network"
- [ ] Check MetaMask network dropdown
- [ ] Should be "Polygon Mumbai"
- [ ] Switch if needed
- [ ] Retry deploy

### Error: "Insufficient gas"
- [ ] Get more test MATIC from faucet
- [ ] Check balance in MetaMask
- [ ] Increase gas in MetaMask settings
- [ ] Retry

### Error: "Contract already exists"
- [ ] Contract deployed successfully!
- [ ] Copy the address
- [ ] Continue to next steps

### Transaction Pending
- [ ] Wait 30 seconds
- [ ] Check [mumbai.polygonscan.com](https://mumbai.polygonscan.com)
- [ ] Paste tx hash in search
- [ ] See status

### Compiler Version Mismatch
- [ ] Use 0.8.0 or higher
- [ ] In Remix Compiler section
- [ ] Click dropdown
- [ ] Select 0.8.20 or latest 0.8.x

---

## AFTER DEPLOYMENT

### 1. Save Important Info

Create file: `DEPLOYMENT_INFO.md`
```markdown
# Contract Deployment

## Mumbai Testnet
- Contract Address: 0x...
- Deploy Block: 12345
- Deploy Date: 2024-02-11
- Tx Hash: 0x...
- Explorer: https://mumbai.polygonscan.com/address/0x...

## Authorized Universities
- University1: 0x...
- University2: 0x...
```

### 2. Update .env.local

```
REACT_APP_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
REACT_APP_CONTRACT_ADDRESS=0x... (from deployment)
REACT_APP_PINATA_API_KEY=...
REACT_APP_PINATA_SECRET_KEY=...
```

### 3. Test in App

```bash
npm start
# Go to University Portal
# Try uploading certificate
# Should see blockchain tx hash
```

### 4. Verify Everything Works

- [ ] University Portal shows tx hash
- [ ] Transaction appears on PolygonScan
- [ ] Student can claim with cert hash
- [ ] Public verify works

---

## MIGRATION TO MAINNET

When ready for production:

### 1. Get Real MATIC

```
Option A: Buy from Exchange
- Coinbase, Kraken, etc
- Minimum: $10-20 MATIC
- Transfer to MetaMask

Option B: Get from Friend
- Ask someone to send MATIC
- Less than 30 seconds to arrive
```

### 2. Add Mainnet to MetaMask

```
Network Name: Polygon Mainnet
RPC: https://polygon-rpc.com
Chain ID: 137
Currency: MATIC
Explorer: https://polygonscan.com
```

### 3. Deploy to Mainnet

Same process as testnet:
1. Switch MetaMask to Polygon Mainnet
2. Go to Remix
3. Deploy contract
4. Copy new contract address

### 4. Update .env

```
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com
REACT_APP_CONTRACT_ADDRESS=0x... (new mainnet address)
```

---

## COSTS SUMMARY

| Action | Testnet | Mainnet |
|--------|---------|---------|
| Deploy | FREE | $1-5 |
| Issue Cert | FREE | $0.05-0.20 |
| Claim Cert | FREE | $0.05-0.20 |
| Verify | FREE | FREE |

---

## SAFETY CHECKLIST

Before deploying to mainnet:

- [ ] Tested on testnet first
- [ ] No sensitive data in contract
- [ ] All addresses verified
- [ ] Have backup of private key
- [ ] Understand gas costs
- [ ] Know how to manage contract
- [ ] Authorized correct universities
- [ ] Tested claim/verify functions

---

## FINAL STEPS

1. **Deploy to testnet** (10 min) ← You are here
2. **Get MATIC** (5 min)
3. **Setup .env** (2 min)
4. **Test app** (10 min)
5. **Deploy to mainnet** (10 min) ← After testing

---

## NEED HELP?

**Deployment issues:**
- Double-check network in MetaMask
- Check contract address copied correctly
- Try different RPC URL if stuck

**Contract errors:**
- See comments in `CredenceCertificate.sol`
- Check Remix compiler version
- Paste error in Google

**App not connecting:**
- Verify .env.local has contract address
- Check network matches contract
- Reload app (Ctrl+Shift+R)

---

**Ready?** Start with METHOD 1 above! 🚀
