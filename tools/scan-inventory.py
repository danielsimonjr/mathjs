#!/usr/bin/env python3
"""
Full codebase inventory scanner for math.js reorg planning.
Outputs: tools/codebase-inventory.json + console report
"""

import os, re, json
from pathlib import Path
from collections import defaultdict

ROOT = Path(".")
SRC = ROOT / "src"

inventory = {
    "metadata": {"generated": "2026-04-03", "root": str(ROOT.resolve())},
    "summary": {},
    "files": [],
    "duplicates": {"js_ts_pairs": [], "as_rust_pairs": [], "conflicted_copies": []},
    "categories": {},
}

# Scan all files
all_files = []
for p in sorted(ROOT.rglob("*")):
    if p.is_dir():
        continue
    rel = str(p.relative_to(ROOT)).replace(os.sep, "/")
    if any(
        skip in rel
        for skip in [
            "node_modules/",
            ".git/",
            "/target/",
            "dist/",
            "lib/cjs/",
            "lib/esm/",
            "coverage/",
            "lib/browser/",
            ".dropboxignore",
        ]
    ):
        continue
    all_files.append((rel, p))

print(f"Total files found: {len(all_files)}")

# Categorize
by_ext = defaultdict(int)
by_dir = defaultdict(int)
conflicted = []
source_files = []
wasm_as_files = []
wasm_rust_files = []
test_files = []
doc_files = []
demo_files = []
config_files = []
other_files = []

for rel, p in all_files:
    ext = p.suffix.lower()
    by_ext[ext] += 1
    top_dir = rel.split("/")[0] if "/" in rel else "."
    by_dir[top_dir] += 1

    size = p.stat().st_size
    is_conflicted = "conflicted" in rel

    entry = {
        "path": rel,
        "ext": ext,
        "size": size,
        "lines": 0,
        "conflicted": is_conflicted,
    }

    if ext in (
        ".js",
        ".ts",
        ".rs",
        ".json",
        ".md",
        ".css",
        ".html",
        ".mjs",
        ".cjs",
        ".py",
        ".sh",
    ):
        try:
            entry["lines"] = sum(1 for _ in open(p, encoding="utf-8", errors="replace"))
        except:
            pass

    if is_conflicted:
        conflicted.append(entry)
        continue

    if rel.startswith("src/wasm-rust/"):
        entry["category"] = "wasm-rust"
        wasm_rust_files.append(entry)
    elif rel.startswith("src/wasm/"):
        entry["category"] = "wasm-as"
        wasm_as_files.append(entry)
    elif rel.startswith("src/"):
        entry["category"] = "source"
        source_files.append(entry)
    elif rel.startswith("test/"):
        entry["category"] = "test"
        test_files.append(entry)
    elif rel.startswith("docs/") or (ext == ".md" and "/" not in rel):
        entry["category"] = "docs"
        doc_files.append(entry)
    elif rel.startswith("demo/"):
        entry["category"] = "demo"
        demo_files.append(entry)
    else:
        entry["category"] = "other"
        other_files.append(entry)

    inventory["files"].append(entry)

# Detect JS/TS pairs
js_set = {e["path"] for e in source_files if e["ext"] == ".js"}
ts_set = {e["path"] for e in source_files if e["ext"] == ".ts"}
js_ts_pairs = []
for js in sorted(js_set):
    ts = js.rsplit(".js", 1)[0] + ".ts"
    if ts in ts_set:
        js_ts_pairs.append({"js": js, "ts": ts})

# Detect AS/Rust pairs
as_mods = set()
for e in wasm_as_files:
    if e["ext"] == ".ts":
        mod = e["path"].replace("src/wasm/", "").replace(".ts", "")
        as_mods.add(mod)

rust_mods = set()
for e in wasm_rust_files:
    if e["ext"] == ".rs":
        mod = (
            e["path"]
            .replace("src/wasm-rust/crates/mathjs-wasm/src/", "")
            .replace(".rs", "")
        )
        rust_mods.add(mod)

as_rust_pairs = []
for am in sorted(as_mods):
    for rm in rust_mods:
        if rm == am or rm.replace("_", "/") == am or am.replace("/", "_") == rm:
            as_rust_pairs.append(
                {"as": "src/wasm/" + am + ".ts", "rust": "wasm-rust/" + rm + ".rs"}
            )
            break

inventory["duplicates"]["js_ts_pairs"] = js_ts_pairs
inventory["duplicates"]["as_rust_pairs"] = as_rust_pairs
inventory["duplicates"]["conflicted_copies"] = [c["path"] for c in conflicted]

# Source categories
src_cats = defaultdict(lambda: {"js": 0, "ts": 0, "lines": 0})
for e in source_files:
    parts = e["path"].replace("src/", "").split("/")
    cat = parts[0] if len(parts) > 1 else "."
    lang = "ts" if e["ext"] == ".ts" else "js"
    src_cats[cat][lang] += 1
    src_cats[cat]["lines"] += e["lines"]

inventory["categories"] = dict(src_cats)

# Summary
s = {
    "total_files": len(all_files),
    "conflicted_copies": len(conflicted),
    "files_excl_conflicts": len(all_files) - len(conflicted),
    "source": len(source_files),
    "source_js": sum(1 for e in source_files if e["ext"] == ".js"),
    "source_ts": sum(1 for e in source_files if e["ext"] == ".ts"),
    "wasm_as": len(wasm_as_files),
    "wasm_rust": len(wasm_rust_files),
    "tests": len(test_files),
    "docs": len(doc_files),
    "demo": len(demo_files),
    "other": len(other_files),
    "js_ts_pairs": len(js_ts_pairs),
    "as_rust_pairs": len(as_rust_pairs),
    "extensions": dict(sorted(by_ext.items(), key=lambda x: -x[1])[:20]),
    "top_dirs": dict(sorted(by_dir.items(), key=lambda x: -x[1])[:15]),
}
inventory["summary"] = s

# Print report
print(f"\n{'=' * 70}")
print(f" CODEBASE INVENTORY — math.js")
print(f"{'=' * 70}")
print(f"\n FILES")
print(f"   Total scanned:        {s['total_files']}")
print(f"   Dropbox conflicts:    {s['conflicted_copies']}")
print(f"   Clean files:          {s['files_excl_conflicts']}")
print(f"\n BREAKDOWN")
print(
    f"   Source (src/):        {s['source']}  ({s['source_js']} JS, {s['source_ts']} TS)"
)
print(f"   WASM AS (src/wasm/):  {s['wasm_as']}")
print(f"   WASM Rust:            {s['wasm_rust']}")
print(f"   Tests (test/):        {s['tests']}")
print(f"   Docs:                 {s['docs']}")
print(f"   Demo (ISE):           {s['demo']}")
print(f"   Other:                {s['other']}")
print(f"\n DUPLICATES")
print(f"   JS/TS pairs:          {s['js_ts_pairs']}")
print(f"   AS/Rust pairs:        {s['as_rust_pairs']}")
print(f"   Dropbox conflicts:    {s['conflicted_copies']}")
print(f"\n TOP EXTENSIONS")
for ext, count in list(s["extensions"].items())[:10]:
    print(f"   {ext:>8}: {count}")
print(f"\n SOURCE CATEGORIES (src/)")
for cat in sorted(src_cats):
    c = src_cats[cat]
    print(f"   {cat:<30} {c['js']:>4} JS  {c['ts']:>4} TS  {c['lines']:>7,} lines")

# Save
out_path = "tools/codebase-inventory.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(inventory, f, indent=2, default=str)
print(f"\nSaved: {out_path}")
