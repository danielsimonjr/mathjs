#!/usr/bin/env python3
"""
Fix factory function parameter types by changing typed interface types to 'any'
"""
import re
from pathlib import Path
import sys

def fix_factory_params(file_path):
    """Replace MathJsStatic and other typed interfaces with 'any' in factory functions"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern: }: MathJsStatic) => {
    content = re.sub(r'}\s*:\s*MathJsStatic\s*\)\s*=>', '}: any) =>', content)

    # Pattern: }: MathJsInstance) => {
    content = re.sub(r'}\s*:\s*MathJsInstance\s*\)\s*=>', '}: any) =>', content)

    # Pattern: ({ typed }: { typed: TypedFunction })
    content = re.sub(r'\(\{\s*typed\s*\}\s*:\s*\{\s*typed:\s*TypedFunction\s*\}\)', '({ typed }: any)', content)

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        # Find all .ts files in src/
        files = list(Path('src').rglob('*.ts'))

    fixed_count = 0
    for file_path in files:
        if fix_factory_params(file_path):
            print(f"Fixed: {file_path}")
            fixed_count += 1

    print(f"\nTotal files fixed: {fixed_count}")
