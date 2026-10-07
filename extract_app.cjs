const fs = require('fs');

const logPath = "C:\\Users\\devil\\.gemini\\antigravity\\brain\\cd31a973-e9bf-475e-8b2e-74f981113d46\\.system_generated\\logs\\overview.txt";
const destPath = "c:\\Users\\devil\\.gemini\\antigravity\\scratch\\karthik-billing-app\\src\\App.jsx";

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const startTag = "import { useState, useEffect, useRef, useCallback } from \"react\";";
  const startIdx = content.lastIndexOf(startTag);

  if (startIdx !== -1) {
    let code = content.slice(startIdx);
    const endIdx = code.indexOf("</USER_REQUEST>");
    if (endIdx !== -1) {
      code = code.slice(0, endIdx).trim();
    }
    fs.writeFileSync(destPath, code, 'utf8');
    console.log("Successfully extracted App.jsx into CJS format runtime!");
  } else {
    console.log("Could not find start block via indexOf");
  }
} catch (e) {
  console.error("Error reading log:", e);
}
