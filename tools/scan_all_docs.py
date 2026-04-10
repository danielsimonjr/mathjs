"""RLM scan of ALL 108 docs files — identify every outdated reference."""

import sys
import json
import re
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\danie\.claude\skills\rlm\scripts")))
from rlm_query import llm_query_fast

base = Path(r"C:\Users\danie\Dropbox\Github\Mathjs")

# Load ALL doc files
doc_files = []
for md in sorted(base.glob("docs/**/*.md")):
    rel = md.relative_to(base).as_posix()
    content = md.read_text(encoding="utf-8", errors="replace")
    doc_files.append({"path": rel, "content": content, "size": len(content)})

print(f"Total doc files: {len(doc_files)}")
total_chars = sum(d["size"] for d in doc_files)
print(f"Total size: {total_chars:,} chars (~{total_chars // 4:,} tokens)")

# Current state for reference
current_state = """CURRENT MATH.JS STATE (2026-04-10, v15.6.0):
- 444+ functions, 545 factory functions, 21 categories
- 9,263 tests passing, 0 failing
- Algebra/CAS: 92 functions (integrate, solve, factor, fullSimplify, groebnerBasis, laplace, etc.)
- Matrix: 50 (SVD, Cholesky, Jordan, polar decomposition, row reduce, etc.)
- Numeric: 39 (minimize, ODE solvers, B-spline, PCHIP, RBF, Chebyshev approx)
- Statistics: 38 (12 distributions, ANOVA, PCA, chi-square, KS, Shapiro-Wilk)
- Special: 26 (Bessel J/Y/I/K, elliptic K/E, Lambert W, Fresnel, etc.)
- Signal: 20 (FFT, DCT, DST, DWT, spectrogram, filters, Hilbert)
- Combinatorics: 20 (fibonacci, primes, partitions, Jacobi symbol, etc.)
- Geometry: 14 (Delaunay, Voronoi, convex hull, k-d tree, centroid)
- Graph: 8 (Dijkstra, Kruskal, Tarjan, topological sort)
- Build: tsup from .js entry points, gulp for CJS/ESM
- Demo app: demo/mathjs-calc/ with Tab autocomplete
- Docs site: https://danielsimonjr.github.io/mathjs/
- GitHub Pages auto-deploy via .github/workflows/deploy-docs.yml
"""

# Process in batches of 5-6 files using sub-LLM
batch_size = 5
batches = [doc_files[i : i + batch_size] for i in range(0, len(doc_files), batch_size)]

all_updates = []
for batch_idx, batch in enumerate(batches):
    batch_text = ""
    for doc in batch:
        # Truncate large files to first 200 lines
        lines = doc["content"].split("\n")[:200]
        truncated = "\n".join(lines)
        batch_text += (
            f"\n\n=== FILE: {doc['path']} ({doc['size']} chars) ===\n{truncated}\n"
        )

    prompt = f"""You are auditing documentation files for the math.js library. The library has been significantly expanded.

{current_state}

Review these doc files and list EVERY specific outdated reference that needs updating. For each, give:
- FILE: the file path
- LINE_CONTENT: the specific text that's wrong (quote it exactly)
- FIX: what it should say instead

Focus on:
1. Function counts (any number < 444 referring to "total functions" or "factory functions")
2. Category counts (any number < 21 for categories)
3. Test counts (any number < 9000 for "tests passing")
4. Version numbers (15.3.x, 15.4.x, 15.5.x should note 15.6.0 is current)
5. Missing category mentions where categories are listed (graph, signal, geometry, combinatorics, CAS/algebra should be mentioned)
6. Outdated build references (if mentioning .ts entry points instead of .js)
7. Outdated architecture descriptions that don't mention CAS engine, graph theory, etc.
8. URLs pointing to josdejong repo that should also mention danielsimonjr fork

If a file has NO outdated content, output: FILE: <path> — NO_CHANGES_NEEDED

Files to review:
{batch_text}"""

    result = llm_query_fast(prompt, max_tokens=2000)
    if "NO_CHANGES" not in result:
        all_updates.append(f"Batch {batch_idx + 1}/{len(batches)}:\n{result.strip()}")
    print(
        f"Batch {batch_idx + 1}/{len(batches)}: {'clean' if 'NO_CHANGES' in result else 'updates found'}"
    )

# Save all findings
output = "\n\n".join(all_updates)
Path("C:/tmp/all_docs_updates.txt").write_text(output, encoding="utf-8")
print(f"\n{'=' * 60}")
print(f"Batches with updates: {len(all_updates)}/{len(batches)}")
print(f"Full findings saved to C:/tmp/all_docs_updates.txt")
