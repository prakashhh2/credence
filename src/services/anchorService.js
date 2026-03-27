

import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_ID = new PublicKey(
  process.env.REACT_APP_ANCHOR_PROGRAM_ID ||
  'CWQmifkEM6m8JfMxcc6xCgVhUGtRPEypWA2tATev2KHM'
);

const SOLANA_NETWORK =
  process.env.REACT_APP_SOLANA_NETWORK || 'devnet';

const RPC_URL =
  process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

const CERTIFICATE_SEED = Buffer.from('certificate');


let _idlCache = null;
async function loadIDL() {
  if (_idlCache) return _idlCache;
  const res = await fetch('/credence_cert.json');
  if (!res.ok) throw new Error('Failed to load IDL from /credence_cert.json');
  _idlCache = await res.json();
  return _idlCache;
}


function getProvider() {
  if (!window.solana?.isPhantom) {
    throw new Error('Phantom wallet not found. Please install Phantom.');
  }
  const connection = new Connection(RPC_URL, 'confirmed');
  // Phantom adapter implements the wallet interface expected by AnchorProvider
  const provider = new AnchorProvider(connection, window.solana, {
    preflightCommitment: 'confirmed',
  });
  return provider;
}


async function getProgram() {
  const idl = await loadIDL();
  const provider = getProvider();
  return new Program(idl, provider);
}


function getCertificatePda(certificateHash) {
  const [pda] = PublicKey.findProgramAddressSync(
    [CERTIFICATE_SEED, Buffer.from(certificateHash.slice(0, 32))],
    PROGRAM_ID
  );
  return pda;
}


/**
 * Issue a new certificate on-chain.
 *
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.dateOfBirth       YYYY-MM-DD
 * @param {string} params.universityName
 * @param {number} params.passoutYear
 * @param {string} params.fieldOfStudy
 * @param {string} params.gpa
 * @param {string} params.degreeTitle
 * @param {string} params.studentId
 * @param {string} params.issueDate         YYYY-MM-DD
 * @param {string} params.certificateHash   SHA-256 hex (64 chars)
 * @param {string} params.ipfsCid           Pinata CID
 *
 * @returns {Promise<{ txSignature: string, certificatePda: string }>}
 */
export async function createCertificate({
  studentName,
  dateOfBirth,
  universityName,
  passoutYear,
  fieldOfStudy,
  gpa,
  degreeTitle,
  studentId,
  issueDate,
  certificateHash,
  ipfsCid,
}) {
  if (!certificateHash || certificateHash.length !== 64) {
    throw new Error('Certificate hash must be a 64-character SHA-256 hex string.');
  }

  const program = await getProgram();
  const provider = getProvider();
  const issuerPubkey = provider.wallet.publicKey;

  const certificatePda = getCertificatePda(certificateHash);

  console.log('⛓ Issuing certificate on Solana Devnet...');
  console.log('  PDA:', certificatePda.toBase58());
  console.log('  Issuer:', issuerPubkey.toBase58());

  const txSignature = await program.methods
    .issueCertificate(
      certificateHash,
      studentName,
      dateOfBirth,
      universityName,
      passoutYear,           // u32 — plain JS number is fine
      fieldOfStudy,
      gpa || '',
      degreeTitle,
      studentId,
      issueDate,
      ipfsCid || '',
    )
    .accounts({
      certificate: certificatePda,
      issuer: issuerPubkey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log(' Certificate issued. Tx:', txSignature);

  return {
    txSignature,
    certificatePda: certificatePda.toBase58(),
  };
}

/**
 * Fetch a certificate from the Solana blockchain by its SHA-256 hash.
 *
 * Derives the PDA, then reads the on-chain account data.
 * Returns null (without throwing) if the account does not exist.
 *
 * @param {string} hash  SHA-256 hex string (64 chars)
 * @returns {Promise<Object|null>}
 */
export async function fetchCertificateByHash(hash) {
  if (!hash || hash.trim().length === 0) return null;

  try {
    const program = await getProgram();
    const pda = getCertificatePda(hash.trim());

    console.log('🔍 Fetching certificate from chain. PDA:', pda.toBase58());

    const account = await program.account.certificateAccount.fetch(pda);

    // Map on-chain snake_case fields → camelCase for the frontend
    return {
      hash: account.certificateHash,
      certificateHash: account.certificateHash,
      studentName: account.studentName,
      dateOfBirth: account.dateOfBirth,
      universityName: account.universityName,
      passoutYear: account.passoutYear,
      fieldOfStudy: account.fieldOfStudy,
      gpa: account.gpa,
      degreeTitle: account.degreeTitle,
      studentId: account.studentId,
      issueDate: account.issueDate,
      ipfsCid: account.ipfsCid,
      certificateDocCid: account.ipfsCid,
      issuer: account.issuer.toBase58(),
      issuedAt: account.issuedAt.toNumber() * 1000, // seconds → ms
      revoked: account.revoked,
      certificatePda: pda.toBase58(),
      txSignature: 'On-chain record',
      blockchainStatus: account.revoked ? 'revoked' : 'confirmed',
    };
  } catch (err) {
  
    if (
      err.message?.includes('Account does not exist') ||
      err.message?.includes('AccountNotFound') ||
      err.message?.includes('has no data')
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Revoke an existing certificate.
 * Only callable by the original issuer wallet.
 *
 * @param {string} hash  SHA-256 hex string of the certificate to revoke
 * @returns {Promise<string>}  transaction signature
 */
export async function revokeCertificate(hash) {
  const program = await getProgram();
  const provider = getProvider();
  const issuerPubkey = provider.wallet.publicKey;
  const pda = getCertificatePda(hash);

  console.log(' Revoking certificate. PDA:', pda.toBase58());

  const txSignature = await program.methods
    .revokeCertificate()
    .accounts({
      certificate: pda,
      issuer: issuerPubkey,
    })
    .rpc();

  console.log(' Certificate revoked. Tx:', txSignature);
  return txSignature;
}
