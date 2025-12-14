import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.log('Usage: node update-status.js <filepath>');
  process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync('ts-inventory.json', 'utf8'));
const entry = inventory.find(f => f.file.includes(file) || f.file === file);

if (entry) {
  entry.status = 'completed';
  fs.writeFileSync('ts-inventory.json', JSON.stringify(inventory, null, 2));
  console.log('Marked as completed:', entry.file);
} else {
  console.log('File not found:', file);
}
