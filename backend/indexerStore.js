const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, 'indexed.json');

function loadStore() {
  try {
    const raw = fs.readFileSync(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { issued: [], lastBlock: 0 };
  }
}

function saveStore(obj) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(obj, null, 2));
}

module.exports = { loadStore, saveStore, OUT_FILE };
