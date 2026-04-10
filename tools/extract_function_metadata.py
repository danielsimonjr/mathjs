"""Extract metadata from all math.js function files for documentation generation."""

import re
import json
from pathlib import Path

base = Path(r"C:\Users\danie\Dropbox\Github\Mathjs")

# Collect all function implementation files
function_files = []
for js_file in sorted(base.glob("src/function/**/*.js")):
    if ".ts" not in str(js_file) and "transform" not in str(js_file):
        rel = js_file.relative_to(base).as_posix()
        function_files.append((rel, js_file))

# Collect embedded docs
embedded_docs = {}
for doc_file in base.glob("src/expression/embeddedDocs/function/**/*.js"):
    content = doc_file.read_text(encoding="utf-8", errors="replace")
    # Extract the docs object
    name_match = re.search(r"name:\s*'(\w+)'", content)
    cat_match = re.search(r"category:\s*'([^']+)'", content)
    syntax_match = re.search(r"syntax:\s*\[(.*?)\]", content, re.DOTALL)
    desc_match = re.search(r"description:\s*'(.*?)'", content, re.DOTALL)
    examples_match = re.search(r"examples:\s*\[(.*?)\]", content, re.DOTALL)
    seealso_match = re.search(r"seealso:\s*\[(.*?)\]", content, re.DOTALL)

    if name_match:
        name = name_match.group(1)
        embedded_docs[name] = {
            "category": cat_match.group(1) if cat_match else "Unknown",
            "syntax": [s.strip().strip("'\"") for s in syntax_match.group(1).split(",")]
            if syntax_match
            else [],
            "description": desc_match.group(1).strip() if desc_match else "",
            "examples": [
                s.strip().strip("'\"") for s in examples_match.group(1).split(",")
            ]
            if examples_match and examples_match.group(1).strip()
            else [],
            "seealso": [
                s.strip().strip("'\"") for s in seealso_match.group(1).split(",")
            ]
            if seealso_match
            else [],
        }

# Extract JSDoc from implementation files
functions = []
for rel_path, js_file in function_files:
    content = js_file.read_text(encoding="utf-8", errors="replace")

    # Extract factory name
    factory_match = re.search(r"const name = '(\w+)'", content)
    if not factory_match:
        continue
    func_name = factory_match.group(1)

    # Extract category from path
    parts = rel_path.split("/")
    category = parts[2] if len(parts) > 2 else "unknown"

    # Extract dependencies
    deps_match = re.search(r"const dependencies = \[(.*?)\]", content, re.DOTALL)
    dependencies = []
    if deps_match:
        dependencies = [
            d.strip().strip("'\"") for d in deps_match.group(1).split(",") if d.strip()
        ]

    # Extract JSDoc
    jsdoc_match = re.search(r"/\*\*(.*?)\*/", content, re.DOTALL)
    jsdoc = jsdoc_match.group(1) if jsdoc_match else ""

    # Parse JSDoc for description, params, return
    desc_lines = []
    params = []
    returns = ""
    for line in jsdoc.split("\n"):
        line = line.strip().lstrip("* ").strip()
        if line.startswith("@param"):
            param_match = re.match(
                r"@param\s+\{([^}]+)\}\s+(?:\[(\w+)\]|(\w+))\s*(.*)", line
            )
            if param_match:
                ptype = param_match.group(1)
                pname = param_match.group(2) or param_match.group(3)
                pdesc = param_match.group(4).strip()
                params.append({"name": pname, "type": ptype, "description": pdesc})
        elif line.startswith("@return"):
            ret_match = re.match(r"@returns?\s+\{([^}]+)\}\s*(.*)", line)
            if ret_match:
                returns = f"{ret_match.group(1)} — {ret_match.group(2).strip()}"
        elif (
            not line.startswith("@")
            and not line.startswith("Syntax:")
            and not line.startswith("Examples:")
            and not line.startswith("See also:")
            and line
        ):
            desc_lines.append(line)

    description = " ".join(desc_lines[:5]).strip()

    # Extract typed-function signatures
    signatures = re.findall(r"'([^']+)':\s*function", content)

    # Get embedded docs if available
    edoc = embedded_docs.get(func_name, {})

    func_entry = {
        "name": func_name,
        "category": edoc.get("category", category.capitalize()),
        "path": rel_path,
        "description": edoc.get("description", description),
        "syntax": edoc.get("syntax", []),
        "params": params,
        "returns": returns,
        "signatures": signatures,
        "dependencies": dependencies,
        "examples": edoc.get("examples", []),
        "seealso": edoc.get("seealso", []),
    }
    functions.append(func_entry)

# Sort by category then name
functions.sort(key=lambda f: (f["category"], f["name"]))

# Save full JSON
Path("C:/tmp/function_metadata.json").write_text(
    json.dumps(functions, indent=2), encoding="utf-8"
)

# Print summary
categories = {}
for f in functions:
    cat = f["category"]
    categories.setdefault(cat, []).append(f["name"])

print(f"Total functions extracted: {len(functions)}")
print(f"Categories: {len(categories)}")
for cat in sorted(categories.keys()):
    print(
        f"  {cat} ({len(categories[cat])}): {', '.join(categories[cat][:8])}{'...' if len(categories[cat]) > 8 else ''}"
    )
