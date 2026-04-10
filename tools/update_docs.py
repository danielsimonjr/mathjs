"""RLM-powered scan and update of all docs/ files to reflect current library state."""

import sys
import re
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\danie\.claude\skills\rlm\scripts")))
from rlm_query import llm_query_fast

base = Path(r"C:\Users\danie\Dropbox\Github\Mathjs")

# Load all markdown files in docs/
doc_files = {}
for md in sorted(base.glob("docs/**/*.md")):
    rel = md.relative_to(base).as_posix()
    if (
        "plans/" in rel
        or "superpowers/" in rel
        or "sprints/" in rel
        or "roadmap/" in rel
    ):
        continue
    content = md.read_text(encoding="utf-8", errors="replace")
    doc_files[rel] = {"path": md, "content": content, "size": len(content)}

print(f"Scanned {len(doc_files)} doc files")
for f, info in sorted(doc_files.items()):
    print(f"  {f} ({info['size']:,} chars)")

# Current library stats for reference
stats = """CURRENT MATH.JS STATE (as of 2026-04-10):
- 444+ functions across 21 categories
- 9,263 tests passing, 0 failing
- Version 15.6.0
- Categories: Algebra (92), Matrix (50), Numeric (39), Statistics (38),
  Arithmetic (30), Special (26), Trigonometry (25), Signal (20),
  Combinatorics (20), Utils (18), Geometry (14), Probability (12),
  Relational (12), Operators (11), Set (10), Graph (8), Bitwise (7),
  Logical (5), Complex (4), Units (2), Type (1)
- Symbolic CAS: integrate, solve, factor, simplify, fullSimplify,
  derivative, limit, series, taylor, laplace, groebnerBasis, etc.
- Demo app with Tab autocomplete at demo/mathjs-calc/
- Function reference at https://danielsimonjr.github.io/mathjs/
- Build: tsup (dist/), gulp (lib/), from .js entry points
- GitHub Pages auto-deploys docs-site/ via .github/workflows/deploy-docs.yml
"""

# Scan each doc for outdated references
print("\n=== Scanning for outdated content ===")
outdated = []
for rel, info in doc_files.items():
    content = info["content"]
    issues = []

    # Check for outdated function counts
    for m in re.finditer(r"(\d{2,3})\s*(?:functions?|factories)", content):
        count = int(m.group(1))
        if 200 <= count <= 400:
            issues.append(f"Outdated function count: {count}")

    # Check for outdated test counts
    for m in re.finditer(r"(\d{4,5})\s*passing", content):
        count = int(m.group(1))
        if count < 9000:
            issues.append(f"Outdated test count: {count}")

    # Check for old version references
    if "15.3" in content or "15.4" in content or "15.5" in content:
        issues.append("References old version (pre-15.6.0)")

    # Check for missing new categories
    if "graph theory" not in content.lower() and "graph" not in content.lower():
        if (
            "architecture" in rel.lower()
            or "overview" in rel.lower()
            or "component" in rel.lower()
        ):
            issues.append("Missing new domains (graph, signal expansion, etc.)")

    if issues:
        outdated.append((rel, issues))
        print(f"  {rel}:")
        for issue in issues:
            print(f"    - {issue}")

print(f"\n{len(outdated)} files need updates out of {len(doc_files)}")

# Save results for the main agent
results = {"stats": stats, "files": {}}
for rel, issues in outdated:
    results["files"][rel] = {
        "issues": issues,
        "size": doc_files[rel]["size"],
    }

import json

Path("C:/tmp/docs_update_plan.json").write_text(
    json.dumps(results, indent=2), encoding="utf-8"
)
print("\nUpdate plan saved to C:/tmp/docs_update_plan.json")
