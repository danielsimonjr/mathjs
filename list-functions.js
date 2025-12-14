import fs from 'fs';
const inventory = JSON.parse(fs.readFileSync('ts-inventory.json', 'utf8'));

// Filter to actual function implementations
const functions = inventory.filter(f =>
  (f.file.includes('function\\') || f.file.includes('plain\\number')) &&
  !f.file.includes('embeddedDocs') &&
  !f.file.includes('index.ts')
);

console.log('=== Function files by line count (smallest first) ===');
console.log('Total function files:', functions.length);
console.log('');

functions.slice(0, 50).forEach((f, i) => {
  console.log((i+1).toString().padStart(3) + '.', f.lines.toString().padStart(4), 'lines:', f.status.padEnd(9), f.file);
});
