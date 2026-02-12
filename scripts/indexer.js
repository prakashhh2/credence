require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const ABI = [
  "event CertificateIssued(bytes32 indexed certHash, address indexed issuer, uint64 issuedAt, string ipfsHash, string metadataURI)"
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.REACT_APP_CONTRACT_ADDRESS;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC || process.env.INFURA_SEPOLIA_RPC || process.env.ALCHEMY_SEPOLIA_RPC;

if (!CONTRACT_ADDRESS) {
  console.error('Please set CONTRACT_ADDRESS or REACT_APP_CONTRACT_ADDRESS in .env');
  process.exit(1);
}
if (!SEPOLIA_RPC) {
  console.error('Please set SEPOLIA_RPC in .env');
  process.exit(1);
}

let provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
let contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

const OUT_FILE = path.join(__dirname, '..', 'backend', 'indexed.json');

function loadStore() {
  try {
    const raw = fs.readFileSync(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { issued: [] };
  }
}

function saveStore(store) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(store, null, 2));
}

async function syncPastEvents() {
  console.log('Syncing past events...');
  const store = loadStore();
  const fromBlock = store.lastBlock ? store.lastBlock + 1 : 0;
  try {
    const filter = contract.filters.CertificateIssued();
    const events = await contract.queryFilter(filter, fromBlock, 'latest');
    console.log(`Found ${events.length} new events`);
    for (const ev of events) {
      const args = ev.args;
      store.issued.push({
        certHash: args.certHash,
        issuer: args.issuer,
        issuedAt: args.issuedAt.toString(),
        ipfsHash: args.ipfsHash,
        metadataURI: args.metadataURI,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber
      });
      store.lastBlock = ev.blockNumber;
    }
    saveStore(store);
  } catch (err) {
    console.error('syncPastEvents error', err);
  }
}

function startRealtime() {
  console.log('Starting real-time listener...');
  contract.on('CertificateIssued', (certHash, issuer, issuedAt, ipfsHash, metadataURI, event) => {
    try {
      console.log('New CertificateIssued', { certHash, issuer });
      const store = loadStore();
      store.issued.push({
        certHash,
        issuer,
        issuedAt: issuedAt.toString(),
        ipfsHash,
        metadataURI,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
      store.lastBlock = event.blockNumber;
      saveStore(store);
    } catch (err) {
      console.error('Error handling CertificateIssued event', err);
    }
  });
}

// Reconnect/backoff logic
async function ensureProvider() {
  let attempts = 0;
  while (true) {
    try {
      // try a simple call
      await provider.getBlockNumber();
      // reset contract with provider in case provider instance changed
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      return;
    } catch (err) {
      attempts++;
      const delay = Math.min(1000 * 2 ** attempts, 30000);
      console.error(`Provider check failed (attempt ${attempts}). Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      // recreate provider
      provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    }
  }
}

async function main() {
  await ensureProvider();
  await syncPastEvents();
  startRealtime();
  console.log('Indexer running. Ctrl+C to exit.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
