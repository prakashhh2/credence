const crypto = require('crypto');

/**
 * Compute SHA-256 hash of provided Buffer and return hex string (lowercase)
 */
function sha256Buffer(buffer) {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

module.exports = { sha256Buffer };
