/**
 * Anchor Certificate Service
 * ─────────────────────────────────────────────────────────────
 * Clean service for creating certificates on Solana via Anchor
 * 
 * Program: credence_cert
 * Instruction: create_certificate
 */

import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';

const ANCHOR_CONFIG = {
  network: process.env.REACT_APP_SOLANA_NETWORK || 'devnet',
  rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl('devnet'),
};

let PROGRAM_ID = null;
let IDL_CACHE = null;

/**
 * Get the program ID from environment
 */
function getProgramID() {
  if (!PROGRAM_ID) {
    const programIdStr = process.env.REACT_APP_ANCHOR_PROGRAM_ID;
    if (!programIdStr || programIdStr === '11111111111111111111111111111111') {
      throw new Error('PROGRAM_ID not configured in .env.local');
    }
    PROGRAM_ID = new PublicKey(programIdStr);
  }
  return PROGRAM_ID;
}

/**
 * Load IDL from public folder
 * Applies minimal patches for Anchor compatibility
 */
async function loadIDL() {
  try {
    // Return cached IDL if available
    if (IDL_CACHE) {
      return IDL_CACHE;
    }

    const response = await fetch('/credence_cert.json');
    if (!response.ok) {
      throw new Error('IDL file not found at /credence_cert.json');
    }
    
    const idl = await response.json();
    
    // Compatibility patch for account metadata expected by client runtime
    if (idl.instructions && idl.instructions[0] && idl.instructions[0].accounts) {
      idl.instructions[0].accounts.forEach(acc => {
        if (acc.name === 'certificate' && !acc.size) {
          acc.size = 254;
        }
      });
    }
    
    console.log('✅ IDL loaded successfully');
    
    // Cache the IDL
    IDL_CACHE = idl;
    return idl;
  } catch (err) {
    console.error('❌ Failed to load IDL:', err);
    throw err;
  }
}

/**
 * Get Anchor program instance using official pattern
 */
async function getProgram() {
  try {
    if (!window.solana?.isPhantom) {
      throw new Error('Phantom wallet not installed');
    }

    const connection = new Connection(ANCHOR_CONFIG.rpcUrl, 'confirmed');
    const wallet = window.solana;
    
    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
      commitment: 'confirmed',
    });

    const idl = await loadIDL();
    const programId = getProgramID();
    
    // Initialize Program using official Anchor pattern
    // IDL is passed as-is without any modifications
    const program = new Program(idl, programId, provider);
    
    console.log('✅ Program initialized:', programId.toBase58());
    return program;
  } catch (err) {
    console.error('❌ Failed to initialize program:', err);
    throw err;
  }
}

/**
 * Create a certificate on-chain
 * @param {object} certificateData - { universityName, studentName, studentId, dateOfBirth, ipfsCid }
 * @param {string} userWallet - User's wallet address
 * @returns {Promise<object>} Transaction result with certificatePda
 */
export async function createCertificateViaAnchor(certificateData, userWallet) {
  try {
    // Validate institution name
    const lowerUniName = certificateData.universityName.toLowerCase();
    if (!lowerUniName.includes('university') && !lowerUniName.includes('college')) {
      throw new Error('Institution name must contain "University" or "College"');
    }

    console.log('⛓️  Creating certificate on-chain...');
    const program = await getProgram();
    const user = new PublicKey(userWallet);

    const certificateAccount = Keypair.generate();

    console.log('📝 Certificate Data:');
    console.log('  - Certificate Account:', certificateAccount.publicKey.toBase58());
    console.log('  - University:', certificateData.universityName);
    console.log('  - Student:', certificateData.studentName);

    console.log('📤 Sending transaction...');
    const tx = await program.methods
      .createCertificate(
        certificateData.universityName,
        certificateData.studentName,
        certificateData.studentId,
        certificateData.dateOfBirth,
        certificateData.ipfsCid || ''
      )
      .accounts({
        certificate: certificateAccount.publicKey,
        user,
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      })
      .signers([certificateAccount])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
      });

    console.log('✅ Certificate created successfully');
    console.log('📋 Transaction signature:', tx);
    
    return {
      success: true,
      txSignature: tx,
      certificatePda: certificateAccount.publicKey.toBase58(),
      network: ANCHOR_CONFIG.network,
    };
  } catch (err) {
    console.error('❌ Error creating certificate:', err);
    throw err;
  }
}

/**
 * Fetch certificate data from on-chain
 */
export async function fetchCertificateFromAnchor(certificatePda) {
  try {
    const program = await getProgram();
    const certPubkey = new PublicKey(certificatePda);

    console.log('📖 Fetching certificate...');
    const certificate = await program.account.certificate.fetch(certPubkey);

    console.log('✅ Certificate retrieved');
    return certificate;
  } catch (err) {
    console.error('❌ Failed to fetch certificate:', err);
    throw new Error(`Failed to fetch certificate: ${err.message}`);
  }
}
