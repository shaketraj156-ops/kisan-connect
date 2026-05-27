import fs from 'fs';
import path from 'path';

const componentsDir = path.join('src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace hardcoded white text for headings and text with text-primary variable
  // but avoid touching #fff inside backgrounds or buttons if possible.
  // A safer general replace for inline text colors:
  content = content.replace(/color:\s*['"]#fff['"]/g, "color: 'var(--text-primary)'");
  
  // Replace dark-theme border colors with light theme borders
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, "var(--border-color)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, "var(--border-color)");
  
  fs.writeFileSync(filePath, content);
});

console.log('Patched inline styles for light mode');
