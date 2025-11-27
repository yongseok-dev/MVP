// src/db.js
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function getFilePath(fileName) {
  return path.join(DATA_DIR, fileName);
}

// JSON 파일 읽기 (없으면 [] 반환)
function readJson(fileName) {
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const text = fs.readFileSync(filePath, "utf-8");

  if (!text.trim()) {
    return [];
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ JSON 파싱 오류: ${filePath}`, e);
    return [];
  }
}

// JSON 파일 쓰기 (pretty print)
function writeJson(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
  readJson,
  writeJson,
};
