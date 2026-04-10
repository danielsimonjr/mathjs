"""RLM-powered scan of all 106 new implementation files for common bug patterns."""

import sys, json, re
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\danie\.claude\skills\rlm\scripts")))
from rlm_query import llm_query, llm_query_fast

base = Path(r"C:\Users\danie\Dropbox\Github\Mathjs")

# Load all implementation files into memory
impl_files = Path("C:/tmp/new_impl_files.txt").read_text().strip().split("\n")
file_contents = {}
total_chars = 0
for f in impl_files:
    path = base / f
    if path.exists():
        content = path.read_text(encoding="utf-8", errors="replace")
        file_contents[f] = content
        total_chars += len(content)

print(
    f"Loaded {len(file_contents)} files, {total_chars:,} chars (~{total_chars // 4:,} tokens)"
)

# Pattern 1: const/let after return (TDZ bug - caught many in Phase 1)
tdz_issues = []
for fname, content in file_contents.items():
    lines = content.split("\n")
    found_return = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("return typed("):
            found_return = True
        if found_return and re.match(r"\s*(const|let)\s+\w+\s*=", stripped):
            # Check if it's inside a function (which is fine) or at factory level (bug)
            # Simple heuristic: if indentation matches factory level
            tdz_issues.append(f"{fname}:{i + 1}: {stripped[:80]}")

# Pattern 2: Missing iteration limits in while loops
infinite_loop_risks = []
for fname, content in file_contents.items():
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if (
            re.search(r"while\s*\(", line)
            and "maxIter"
            not in content[max(0, content.find(line) - 500) : content.find(line) + 500]
            and "MAX_"
            not in content[max(0, content.find(line) - 500) : content.find(line) + 500]
        ):
            # Check if there's a break or bounded condition
            context = "\n".join(lines[max(0, i - 2) : min(len(lines), i + 10)])
            if (
                "break" not in context
                and "return" not in context
                and "length" not in line
            ):
                infinite_loop_risks.append(f"{fname}:{i + 1}: {line.strip()[:80]}")

# Pattern 3: Division without zero-check
div_zero_risks = []
for fname, content in file_contents.items():
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if "/ 0" not in line and re.search(
            r"/\s*[a-zA-Z_]\w*(?:\s*[)\]])?(?:\s*$|\s*[;,])", line
        ):
            # Too many false positives, skip this pattern
            pass

# Pattern 4: new Array with potentially negative length
array_neg = []
for fname, content in file_contents.items():
    if "new Array(" in content:
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if "new Array(" in line and ".fill(" in line:
                # Check if the argument could be negative
                match = re.search(r"new Array\(([^)]+)\)", line)
                if match and "-" in match.group(1):
                    array_neg.append(f"{fname}:{i + 1}: {line.strip()[:80]}")

# Pattern 5: Missing .js extension in imports
import_ext = []
for fname, content in file_contents.items():
    for m in re.finditer(r"from\s+'([^']+)'", content):
        imp = m.group(1)
        if imp.startswith(".") and not imp.endswith(".js"):
            import_ext.append(f"{fname}: import from '{imp}' missing .js")

print(f"\n=== TDZ Issues (const/let after return) ===")
for x in tdz_issues[:20]:
    print(f"  {x}")
print(f"Total: {len(tdz_issues)}")

print(f"\n=== Potential Infinite Loops ===")
for x in infinite_loop_risks[:20]:
    print(f"  {x}")
print(f"Total: {len(infinite_loop_risks)}")

print(f"\n=== Negative Array Length ===")
for x in array_neg:
    print(f"  {x}")

print(f"\n=== Missing .js Extensions ===")
for x in import_ext:
    print(f"  {x}")

# Now use sub-LLM to scan for deeper issues in batches
# Group files into batches of ~10 for LLM review
batch_size = 8
file_list = list(file_contents.items())
batches = [file_list[i : i + batch_size] for i in range(0, len(file_list), batch_size)]

print(f"\n=== Sub-LLM Deep Scan ({len(batches)} batches of {batch_size}) ===")

all_issues = []
for batch_idx, batch in enumerate(batches):
    batch_text = ""
    for fname, content in batch:
        # Truncate to first 150 lines per file to stay within token limits
        lines = content.split("\n")[:150]
        batch_text += f"\n\n--- {fname} ---\n" + "\n".join(lines)

    prompt = f"""Review these math.js function implementations for bugs. Focus ONLY on:
1. Mathematical correctness errors (wrong formula, wrong constant)
2. Off-by-one errors in loops or array indexing
3. Missing error handling for edge cases (NaN, Infinity, empty arrays, zero)
4. const/let declarations after return statement (temporal dead zone)
5. Potential division by zero

For each issue found, output: FILENAME:LINE: DESCRIPTION
If no issues, output: NO_ISSUES

Files to review:
{batch_text}"""

    result = llm_query_fast(prompt, max_tokens=1500)
    if "NO_ISSUES" not in result.upper():
        all_issues.append(f"Batch {batch_idx}: {result.strip()}")
    print(
        f"  Batch {batch_idx + 1}/{len(batches)}: {'clean' if 'NO_ISSUES' in result.upper() else 'issues found'}"
    )

# Save results
output = "\n\n".join(all_issues)
Path("C:/tmp/review_results.txt").write_text(output, encoding="utf-8")
print(f"\n=== Summary ===")
print(f"Batches with issues: {len(all_issues)}/{len(batches)}")
if all_issues:
    print("\nDetailed findings saved to C:/tmp/review_results.txt")
    print("\n".join(all_issues[:5]))
