/**
 * Grant ISSUER_ROLE to a wallet address
 * Usage: npx hardhat run scripts/grantIssuer.js --network sepolia
 * 
 * Before running:
 * 1. Set CONTRACT_ADDRESS in .env (deployed CredenceCertificateV2 address)
 * 2. Set PRIVATE_KEY in .env (your admin/owner wallet private key)
 * 3. Set SEPOLIA_RPC in .env
 * 4. Update ISSUER_ADDRESS below to the wallet you want to authorize
 */

const hre = require('hardhat');

async function main() {
  // The wallet address to grant ISSUER_ROLE to
  const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || '0x'; // CHANGE THIS to your wallet
  
  if (!ISSUER_ADDRESS || ISSUER_ADDRESS === '0x') {
    console.error('ERROR: Set ISSUER_ADDRESS in .env or update this script');
    process.exit(1);
  }

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  if (!CONTRACT_ADDRESS) {
    console.error('ERROR: Set CONTRACT_ADDRESS in .env');
    process.exit(1);
  }

  console.log(`\nGranting ISSUER_ROLE to: ${ISSUER_ADDRESS}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}\n`);

  const [admin] = await hre.ethers.getSigners();
  console.log(`Deployer/Admin account: ${admin.address}`);

  const Credence = await hre.ethers.getContractFactory('CredenceCertificateV2');
  const contract = Credence.attach(CONTRACT_ADDRESS);

  try {
    // Grant issuer role
    const tx = await contract.connect(admin).grantIssuer(ISSUER_ADDRESS);
    const receipt = await tx.wait();
    console.log(`✓ Transaction confirmed!`);
    console.log(`  Hash: ${receipt.transactionHash}`);
    console.log(`  Block: ${receipt.blockNumber}`);

    // Verify
    const isIssuer = await contract.isIssuer(ISSUER_ADDRESS);
    console.log(`\n✓ Verified: ${ISSUER_ADDRESS} is now an issuer: ${isIssuer}`);
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
