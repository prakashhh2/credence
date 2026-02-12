const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, 'records.json');

function loadRecords() {
  try {
    const raw = fs.readFileSync(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { records: [] };
  }
}

function saveRecords(obj) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(obj, null, 2));
}

function appendRecord(record) {
  const store = loadRecords();
  store.records.push(record);
  saveRecords(store);
}

module.exports = { loadRecords, saveRecords, appendRecord, OUT_FILE };
