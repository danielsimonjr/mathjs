#!/usr/bin/env python3
"""
Fix implicit 'any' type errors by adding explicit : any annotations
"""
import re
from pathlib import Path
import subprocess

def get_implicit_any_errors():
    """Run tsc and extract files with TS7006 errors"""
    result = subprocess.run(
        ['npx', 'tsc', '--noEmit', '--skipLibCheck'],
        capture_output=True,
        text=True,
        timeout=120
    )

    errors = {}
    for line in result.stderr.split('\n'):
        if 'error TS7006' in line and 'implicitly has an \'any\' type' in line:
            # Extract file path and parameter name
            match = re.match(r'([^(]+)\(\d+,\d+\): error TS7006: Parameter \'([^\']+)\' implicitly', line)
            if match:
                file_path, param_name = match.groups()
                if file_path not in errors:
                    errors[file_path] = []
                errors[file_path].append(param_name)

    return errors

def fix_file(file_path, param_names):
    """Add : any annotations to parameters"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    fixed = 0

    for param in param_names:
        # Pattern: (param) => or (param, => or function(param)
        # Change to: (param: any) => or (param: any, => or function(param: any)
        patterns = [
            (rf'\b({param})\s*([,)])', rf'\1: any\2'),  # param) or param,
            (rf'function\s*\(\s*({param})\s*\)', rf'function(\1: any)'),  # function(param)
        ]

        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                fixed += 1
                break

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return fixed

    return 0

if __name__ == '__main__':
    print("Analyzing TypeScript errors...")
    errors = get_implicit_any_errors()

    print(f"Found {len(errors)} files with implicit 'any' errors")

    total_fixed = 0
    for file_path, params in list(errors.items())[:20]:  # Fix first 20 files
        fixed = fix_file(file_path, params)
        if fixed > 0:
            print(f"Fixed {fixed} parameters in {file_path}")
            total_fixed += fixed

    print(f"\nTotal parameters fixed: {total_fixed}")
