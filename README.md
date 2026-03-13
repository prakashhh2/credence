# Credence

Minimal setup for the current project (React + Solana Anchor + Pinata).

## Project Description

Credence is a certificate issuance and verification platform.

- Universities issue certificate records on Solana through an Anchor program.
- Certificate files (PDF) are uploaded to IPFS via Pinata.
- The blockchain stores proof metadata (student + certificate data + IPFS CID).
- Anyone with the reference can verify authenticity from on-chain data.

## Data Flow

1. University/Admin fills certificate form in the frontend.
2. PDF is uploaded to Pinata and a CID is returned.
3. Frontend sends certificate metadata + CID to Anchor `create_certificate`.
4. Program writes certificate data into a Solana account.
5. Transaction signature + account address are returned to UI.
6. Verification page reads account data and reconstructs certificate proof.

Short flow:

`UI Form -> Pinata(IPFS CID) -> Anchor RPC -> Solana Account -> Verify/Read`

## Student Portal

The Student Portal is the learner-facing page for certificate access and sharing.

- Connects student wallet (Phantom) to the app.
- Displays issued certificate information and proof metadata.
- Uses on-chain account data + IPFS file reference for verification-ready records.
- Supports downloading/viewing certificate artifacts from IPFS.

Student flow:

`Student opens portal -> Connect wallet -> Load certificate/proof -> View or download`

## Verification

The Verification page allows third parties (employers/institutions) to validate authenticity.

- Accepts certificate reference (hash/account/PDA shown by issuer flow).
- Reads certificate metadata from Solana via Anchor client.
- Confirms data integrity against stored proof fields.
- Resolves the certificate file via IPFS CID when available.

Verification flow:

`Enter certificate reference -> Read on-chain proof -> Match data -> Verify status`

## Project Architecture

### Frontend Layer (React)

- Pages for admin issuance, student view, and verification.
- Wallet connection (Phantom) and transaction submission.
- Reads IDL from `public/credence_cert.json` for Anchor client calls.

### Service Layer (JS)

- IPFS service uploads/retrieves files from Pinata.
- Anchor service initializes provider/program and sends instructions.
- Optional local persistence for UI convenience.

### Blockchain Layer (Anchor Program)

- Rust program `credence_cert` on Solana Devnet.
- Main instruction: `create_certificate`.
- Stores normalized certificate fields and timestamp on-chain.

### Storage Layer

- File content: IPFS (Pinata).
- Immutable proof metadata: Solana account.

## Stack

- Frontend: React
- Chain: Solana Devnet
- Program: Anchor (`credence_cert`)
- Storage: Pinata IPFS

## Program

- Program ID: `7HMYW9c9Hb3SoMfME4hucUDrKi5iWwpD4QeSGeLDUfAf`
- Anchor workspace: `anchor-program/credence_cert`

## Run Frontend

```bash
npm install
npm start
```

## Build & Deploy Program

Run these from the Anchor workspace (not project root):

```bash
cd anchor-program/credence_cert
anchor build
anchor deploy
```

## Check On-Chain IDL

```bash
cd anchor-program/credence_cert
anchor idl fetch 7HMYW9c9Hb3SoMfME4hucUDrKi5iWwpD4QeSGeLDUfAf | jq '.instructions[0].accounts[0]'
```

## Sync Local IDL to Frontend

```bash
cp anchor-program/credence_cert/target/idl/credence_cert.json public/credence_cert.json
```

## Notes

- `anchor build` fails from repo root by design; run it inside `anchor-program/credence_cert`.
- If `anchor deploy` fails on "Failed to initialize IDL", run:

```bash
cd anchor-program/credence_cert
anchor idl close 7HMYW9c9Hb3SoMfME4hucUDrKi5iWwpD4QeSGeLDUfAf
anchor idl init 7HMYW9c9Hb3SoMfME4hucUDrKi5iWwpD4QeSGeLDUfAf --filepath target/idl/credence_cert.json
```
