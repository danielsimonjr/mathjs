#!/usr/bin/env python3
import re
import subprocess
from collections import defaultdict

# Get all TS7006 errors
result = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True, cwd='.')
errors = [line for line in result.stderr.split('\n') if 'error TS7006' in line]

print(f"Found {len(errors)} TS7006 errors")

# Parse errors by file
file_errors = defaultdict(list)
for error in errors:
    match = re.match(r'^(.+?)\((\d+),(\d+)\): error TS7006: Parameter \'(.+?)\' implicitly has an \'any\' type\.$', error)
    if match:
        file_path, line_num, col_num, param_name = match.groups()
        file_errors[file_path].append({
            'line': int(line_num),
            'col': int(col_num),
            'param': param_name
        })

# Fix each file
for file_path, errors_list in sorted(file_errors.items()):
    print(f"\nFixing {file_path} ({len(errors_list)} errors)...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"  Error reading file: {e}")
        continue

    # Group errors by line
    errors_by_line = defaultdict(list)
    for err in errors_list:
        errors_by_line[err['line']].append(err)

    # Fix each line (in reverse order to preserve line numbers)
    for line_num in sorted(errors_by_line.keys(), reverse=True):
        line_idx = line_num - 1
        if line_idx >= len(lines):
            continue

        line = lines[line_idx]
        params_to_fix = [e['param'] for e in errors_by_line[line_num]]

        # Fix parameters on this line
        for param in params_to_fix:
            # Match parameter name followed by comma, closing paren, or equals
            # but not already followed by colon (type annotation)
            pattern = rf'\b({re.escape(param)})\b(?!\s*:)(?=\s*[,)=])'
            replacement = r'\1: any'
            new_line = re.sub(pattern, replacement, line)

            if new_line != line:
                print(f"  Line {line_num}: {param}")
                line = new_line

        lines[line_idx] = line

    # Write back
    try:
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.writelines(lines)
        print(f"  ✓ Fixed {file_path}")
    except Exception as e:
        print(f"  Error writing file: {e}")

print("\n" + "="*60)
print("Re-checking errors...")
result = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True, cwd='.')
remaining = [line for line in result.stderr.split('\n') if 'error TS7006' in line]
print(f"Remaining TS7006 errors: {len(remaining)}")
