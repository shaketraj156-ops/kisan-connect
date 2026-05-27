import fs from 'fs';
import path from 'path';

const bundlePath = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\b71abfdb-c4e4-4e1a-b79c-f3cbec672580\\source_code_bundle.md';
const content = fs.readFileSync(bundlePath, 'utf8');

const regex = /## (src\/.*?)\n```[a-z]*\n([\s\S]*?)\n```/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const filePath = match[1];
  const fileContent = match[2];
  
  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.resolve(filePath), fileContent);
  console.log('Successfully restored:', filePath);
}
