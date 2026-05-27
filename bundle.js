import fs from 'fs';
import path from 'path';

const files = [
  'src/App.jsx',
  'src/index.css',
  'src/utils/mockData.js',
  'src/components/AuthPortal.jsx',
  'src/components/SellerDashboard.jsx',
  'src/components/BuyerDashboard.jsx',
  'src/components/ChatSystem.jsx',
  'src/components/Navbar.jsx'
];

let markdown = '# KisanConnect Complete Source Code\n\n';

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    markdown += `## ${file}\n\`\`\`${file.endsWith('.css') ? 'css' : file.endsWith('.js') ? 'javascript' : 'jsx'}\n${content}\n\`\`\`\n\n`;
  } catch (err) {
    console.error('Error reading file:', file);
  }
});

// Create artifact in the user's brain directory
const outPath = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\b71abfdb-c4e4-4e1a-b79c-f3cbec672580\\source_code_bundle.md';
fs.writeFileSync(outPath, markdown);
console.log('Successfully bundled to', outPath);
