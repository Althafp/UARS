// Run this with Node.js to create icon files
// Usage: node create-icons.js

const fs = require('fs');
const path = require('path');

// SVG icon template
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <path d="M${size/2} ${size*0.15}L${size*0.6} ${size*0.4}L${size*0.85} ${size*0.45}L${size*0.65} ${size*0.65}L${size*0.7} ${size*0.85}L${size/2} ${size*0.75}L${size*0.3} ${size*0.85}L${size*0.35} ${size*0.65}L${size*0.15} ${size*0.45}L${size*0.4} ${size*0.4}Z" fill="white"/>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create SVG icons
console.log('Creating icon files...');

[16, 48, 128].forEach(size => {
  const svgContent = createSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created icon${size}.svg`);
});

console.log('\n✅ Icons created successfully!');
console.log('\nFor Chrome extension, you can use SVG icons or convert to PNG:');
console.log('1. Open each SVG in a browser');
console.log('2. Take a screenshot and save as PNG');
console.log('3. OR use an online converter: https://cloudconvert.com/svg-to-png');

