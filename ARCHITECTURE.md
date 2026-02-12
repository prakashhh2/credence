**Credence — Architecture & Data Flow (Hash-based certificate model)**

Overview
--------
This document describes a clean, production-ready architecture for Credence, a certificate verification system that stores only SHA-256 certificate hashes on-chain while keeping full certificate files off-chain (IPFS, S3, etc.). The design emphasizes security, scalability, and simple governance for authorized university issuers.

High-level requirements satisfied
- Hash-based model (NOT NFTs)
- Only SHA-256 certificate hash on-chain (bytes32)
- Full certificate PDF stored off-chain
- Only authorized university wallets can issue
- Students can view certificates by wallet address (via on-chain lookup + off-chain metadata)
- Verifiers compare uploaded file hash against blockchain

Folder layout (recommended)
---------------------------
credence/
├── contracts/                    # Solidity contracts
│   ├── CredenceCertificate.sol   # original / compatibility
│   └── CredenceCertificateV2.sol # production-ready OpenZeppelin contract
├── scripts/                      # Hardhat deploy scripts
│   └── deploy.js
├── backend/                      # Node.js backend helpers
│   ├── app.js                    # Express hashing + optional IPFS endpoints
│   ├── hash.js                   # hashing utilities
│   └── package.json
├── src/                          # React frontend
│   ├── web3/                     # web3 helpers and contract wrappers
│   ├── components/
│   └── pages/
├── hardhat.config.js
├── package.json                   # monorepo commands (optional)
├── ARCHITECTURE.md
└── README.md

Component responsibilities
--------------------------
- Frontend (React): UI for University Portal, Student Portal, Verifier Portal.
  - University Portal: connect wallet, compute hash (via backend or client), call contract.issueCertificate(certHash, ipfsHash, metadataURI)
  - Student Portal: view certificates by wallet address (query contract or indexer)
  - Verifier Portal: upload file -> compute SHA-256 -> compare to on-chain presence and details

- Backend (Node.js): lightweight helper service to compute file SHA-256 reliably on server, optionally pin to IPFS (Pinata, Web3.storage), and provide signed upload tokens in some workflows.
  - Benefits: avoids client-side subtle/compat issues with file hashing, can enforce size limits, and centralize IPFS upload credentials.

- Smart Contract (Solidity): minimal on-chain registry that stores bytes32 SHA-256, issuer address, timestamp, IPFS reference, and revoked flag. Uses OpenZeppelin AccessControl for role-based issuers.
  - Only store what must be on-chain: 32-byte hash and minimal metadata.
  - Off-chain metadata / JSON returned via `metadataURI` when present.

Security & Governance
---------------------
- Roles:
  - DEFAULT_ADMIN_ROLE: multisig (Gnosis Safe recommended) — manages issuer roles and revocations.
  - ISSUER_ROLE: single-signature university wallets or a university-managed multisig address.

- Issuance policy:
  - Use server-side checks (university admin portal) to authorize issuer wallets.
  - Prefer multisig admin for DEFAULT_ADMIN_ROLE in production.

- Key handling:
  - Never store private keys in frontend or public repos.
  - For automated issuance, use an HSM or secure server with restricted access; prefer the wallet-based flow where universities issue from their own wallet.

Data flow (detailed)
--------------------
1. University prepares certificate PDF (frontend or internal system).
2. University uploads file to backend `POST /hash` (optional) or computes client-side SHA-256.
   - Backend returns hex SHA-256 (lowercase). Frontend may display and use hex.
3. (Optional) Upload full certificate to IPFS (Pinata / Web3.storage) and obtain `ipfsHash`.
4. University wallet (MetaMask or multisig) calls `issueCertificate(certHashBytes32, ipfsHash, metadataURI)` on the deployed contract.
   - Only wallets with `ISSUER_ROLE` can call successfully.
5. Contract emits `CertificateIssued` event. Off-chain indexer (optional) listens and indexes full certificate metadata for fast queries.
6. Student later uses Student Portal to query their wallet address or supply a certificate file / hash to verify.
7. Verifier uploads a certificate file to the Verifier Portal; frontend computes SHA-256 (or calls backend) and compares bytes32 against contract `exists` or `getCertificate`.

Frontend examples
-----------------
- Connect wallet using `ethers.js`.
- Convert hex SHA-256 into `bytes32` for the contract: `ethers.utils.hexlify(ethers.utils.zeroPad('0x' + hexSha256, 32))` or `ethers.utils.hexZeroPad('0x'+hex, 32)`.

Best practices
--------------
- Use `bytes32` on-chain for compact storage and cheaper gas.
- Use `IPFS` CIDs for off-chain file storage; keep on-chain reference as `ipfsHash` string.
- Use server-side signing for any automated issuance flows; prefer wallet-issued transactions for decentralized trust.

Scalability notes
-----------------
- On-chain registry is minimal; heavy usage should rely on off-chain indexers for search and listing (The Graph or a simple ElasticSearch indexed from events).
- For bulk issuance, consider batching hashes into merkle roots on-chain and store a single root to save gas; keep mapping from certHash->proof off-chain.

Next steps
----------
- Deploy `CredenceCertificateV2` to Sepolia using Hardhat.
- Provide a small indexer script to listen to `CertificateIssued` events and store metadata for the Student Portal.
- Harden backend with rate limiting, auth, and signed upload tokens for IPFS.

