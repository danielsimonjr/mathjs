#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

root = Path("src/expression/embeddedDocs")
copied = 0

for jsfile in root.rglob("*.js"):
    tsfile = jsfile.with_suffix(".ts")
    if not tsfile.exists():
        shutil.copy2(jsfile, tsfile)
        print(f"Copied: {jsfile.relative_to('src/expression/embeddedDocs')}")
        copied += 1

print(f"\nTotal files copied: {copied}")
