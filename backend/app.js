const express = require('express');
const multer = require('multer');
const { sha256Buffer } = require('./hash');
const fetch = require('node-fetch');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(express.json());

// Simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// POST /hash - accepts a single file field `file` and returns SHA-256
app.post('/hash', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file missing' });
    const buffer = req.file.buffer;
    const hashHex = sha256Buffer(buffer);
    // Return hex; frontend should convert to bytes32 when calling contract
    return res.json({ sha256: hashHex });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'hashing failed' });
  }
});

// Example helper to upload to Pinata (requires PINATA_API_KEY and PINATA_SECRET env variables)
// This is optional; included as documentation. In production use signed server-side upload or client directly.
app.post('/pinata/pin', upload.single('file'), async (req, res) => {
  try {
    const PINATA_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET = process.env.PINATA_SECRET_KEY;
    if (!PINATA_KEY || !PINATA_SECRET) return res.status(400).json({ error: 'Pinata keys missing in env' });
    if (!req.file) return res.status(400).json({ error: 'file missing' });

    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new (require('form-data'))();
    formData.append('file', req.file.buffer, { filename: req.file.originalname });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_KEY}` // modern Pinata recommends JWT; adjust as appropriate
      },
      body: formData
    });

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'pinata upload failed' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Credence backend running on port ${PORT}`));

// Simple route to return indexed events (populated by scripts/indexer.js)
const { loadStore } = require('./indexerStore');
app.get('/indexed', (req, res) => {
  try {
    const store = loadStore();
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'failed to read indexed data' });
  }
});

// Admin issuance webhook: store record + send email to student (called after on-chain tx confirmed)
const { appendRecord } = require('./storage');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret';

app.post('/admin/issue', async (req, res) => {
  try {
    const { certHash, ipfsHash, studentEmail, issuer, txHash, metadata, signature, message } = req.body;
    if (!certHash || !studentEmail) return res.status(400).json({ error: 'missing certHash or studentEmail' });

    // Authorization: either valid JWT OR a valid issuer signature
    let authorized = false;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      try {
        jwt.verify(token, ADMIN_JWT_SECRET);
        authorized = true;
      } catch (e) {
        // ignore and try signature method
      }
    }

    if (!authorized) {
      // require signature and issuer
      if (!signature || !message || !issuer) return res.status(401).json({ error: 'missing signature/issuer/message' });
      // verify signature recovers issuer
      const { verifyMessage } = require('ethers');
      const recovered = verifyMessage(message, signature);
      if (recovered.toLowerCase() !== issuer.toLowerCase()) {
        return res.status(401).json({ error: 'signature does not match issuer' });
      }

      // optional on-chain check: if CONTRACT_ADDRESS and SEPOLIA_RPC present, verify issuer has role
      const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
      const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
      if (CONTRACT_ADDRESS && SEPOLIA_RPC) {
        try {
          const { ethers } = require('ethers');
          const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
          const abi = ["function isIssuer(address account) view returns (bool)"];
          const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
          const ok = await contract.isIssuer(issuer);
          if (!ok) return res.status(401).json({ error: 'issuer not authorized on-chain' });
        } catch (err) {
          console.warn('on-chain issuer check failed, allowing signature-only auth', err.message);
        }
      }

      authorized = true;
    }

    if (!authorized) return res.status(401).json({ error: 'unauthorized' });

    const record = {
      certHash,
      ipfsHash: ipfsHash || null,
      studentEmail,
      issuer: issuer || null,
      txHash: txHash || null,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    appendRecord(record);

    // Send email if SMTP configured
    const SMTP_HOST = process.env.SMTP_HOST;
    if (SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const verifyLink = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/#verify/${certHash}` : `#verify/${certHash}`;

      const mail = {
        from: process.env.EMAIL_FROM || 'no-reply@credence.app',
        to: studentEmail,
        subject: 'Your certificate has been added to Credence',
        text: `Your certificate has been issued. View: ${verifyLink}\nCertificate hash: ${certHash}`,
        html: `<p>Your certificate has been issued.</p><p>View: <a href="${verifyLink}">${verifyLink}</a></p><p>Hash: <code>${certHash}</code></p>`,
      };

      try {
        await transporter.sendMail(mail);
      } catch (emailErr) {
        console.error('Failed to send email', emailErr);
      }
    }

    return res.json({ ok: true, record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to store/notify' });
  }
});

// Admin login - returns JWT when password matches ADMIN_PASSWORD
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'admin password not configured on server' });
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'invalid password' });
  const token = jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '2h' });
  return res.json({ token });
});
