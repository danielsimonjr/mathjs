import fs from 'fs';
import { execSync } from 'child_process';

// Get all TS7006 errors
let errors = '';
try {
  errors = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf-8' });
} catch (e) {
  errors = e.stdout || '';
}
const ts7006Errors = errors.split('\n').filter(line => line.includes('error TS7006'));

// Parse errors to get file locations and parameter names
const errorMap = new Map();

ts7006Errors.forEach(error => {
  const match = error.match(/^(.+?)\((\d+),(\d+)\): error TS7006: Parameter '(.+?)' implicitly has an 'any' type\./);
  if (match) {
    const [, file, line, col, paramName] = match;
    const normalizedFile = file.replace(/\\/g, '/');
    if (!errorMap.has(normalizedFile)) {
      errorMap.set(normalizedFile, []);
    }
    errorMap.get(normalizedFile).push({ line: parseInt(line), col: parseInt(col), paramName });
  } else {
    console.log(`Failed to parse: ${error}`);
  }
});

console.log(`Found ${ts7006Errors.length} TS7006 errors in ${errorMap.size} files`);

// Fix each file
errorMap.forEach((errors, file) => {
  console.log(`\nFixing ${file} (${errors.length} errors)...`);

  let content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // Sort errors by line number in reverse to avoid offset issues
  errors.sort((a, b) => b.line - a.line || b.col - a.col);

  errors.forEach(({ line, col, paramName }) => {
    const lineIndex = line - 1;
    const originalLine = lines[lineIndex];

    // Find parameter and add `: any` type annotation
    // Look for parameter name followed by ) or , or whitespace
    const patterns = [
      new RegExp(`\\b${paramName}\\b(?=\\s*[,)])`),
      new RegExp(`\\b${paramName}\\b(?=\\s*:)`), // already has type, skip
    ];

    let newLine = originalLine;
    const beforeChar = originalLine[col - 1];

    // Check if already has type annotation
    if (originalLine.match(new RegExp(`\\b${paramName}\\s*:`))) {
      console.log(`  Skipping ${paramName} on line ${line} (already has type)`);
      return;
    }

    // Add `: any` after parameter name
    const regex = new RegExp(`(\\b${paramName}\\b)(?=\\s*[,)])`, 'g');
    newLine = originalLine.replace(regex, `$1: any`);

    if (newLine !== originalLine) {
      lines[lineIndex] = newLine;
      console.log(`  Fixed ${paramName} on line ${line}`);
    }
  });

  const newContent = lines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`  Wrote ${file}`);
  }
});

console.log('\nDone! Re-running typecheck...');
try {
  execSync('npx tsc --noEmit 2>&1 | grep "error TS7006" | wc -l', { encoding: 'utf-8', stdio: 'inherit' });
} catch (e) {
  // Ignore - tsc returns non-zero on errors
}
