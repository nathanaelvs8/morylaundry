// config/db-json.js
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");

// Pastikan folder data ada
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper: Baca JSON
function readJSON(fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
    return [];
  }
  const data = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: Tulis JSON
function writeJSON(fileName, data) {
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Helper: Generate ID otomatis
function getNextId(data) {
  if (data.length === 0) return 1;
  return Math.max(...data.map((item) => item.id || 0)) + 1;
}

module.exports = { readJSON, writeJSON, getNextId };
