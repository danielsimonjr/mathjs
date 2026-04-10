"""Generate a static documentation site for math.js functions."""

import json
from pathlib import Path
from datetime import datetime

metadata = json.loads(Path("C:/tmp/function_metadata.json").read_text(encoding="utf-8"))
docs_dir = Path(r"C:\Users\danie\Dropbox\Github\Mathjs\docs-site")
docs_dir.mkdir(exist_ok=True)
(docs_dir / "functions").mkdir(exist_ok=True)

# Group by category
categories = {}
for f in metadata:
    cat = f["category"]
    categories.setdefault(cat, []).append(f)

# Category descriptions
cat_descriptions = {
    "Algebra": "Symbolic algebra, CAS operations, polynomial manipulation, equation solving, simplification",
    "Arithmetic": "Basic arithmetic operations and scalar math functions",
    "Bitwise": "Bitwise logical operations on integers",
    "Combinatorics": "Number theory, combinatorial functions, prime numbers, sequences",
    "Complex": "Complex number operations",
    "Geometry": "Computational geometry, distances, coordinate transforms, polygons",
    "Graph": "Graph theory algorithms — shortest path, spanning trees, connectivity",
    "Logical": "Boolean logic operations",
    "Matrix": "Matrix operations, decompositions, linear algebra",
    "Numeric": "Numerical methods — integration, optimization, interpolation, ODE solvers",
    "Operators": "Overloaded arithmetic operators for mixed types",
    "Probability": "Probability functions, random numbers, combinatorial counting",
    "Relational": "Comparison and equality operations",
    "Set": "Set theory operations",
    "Signal": "Signal processing — FFT, filters, transforms, wavelets",
    "Special": "Special mathematical functions — Bessel, elliptic, integral functions",
    "Statistics": "Statistical analysis, distributions, hypothesis testing, regression",
    "Trigonometry": "Trigonometric and hyperbolic functions",
    "Type": "Type conversion and range functions",
    "Units": "Unit conversion operations",
    "Utils": "Utility functions for type checking and formatting",
}


# Generate index.html
def escape_html(s):
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Math.js Function Reference</title>
<style>
:root {{
  --bg: #0d1117; --surface: #161b22; --border: #30363d;
  --text: #e6edf3; --text2: #8b949e; --accent: #58a6ff;
  --green: #3fb950; --purple: #bc8cff; --orange: #d29922;
  --pink: #f778ba; --red: #f85149;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }}
.container {{ max-width: 1200px; margin: 0 auto; padding: 2rem; }}
header {{ border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2rem; }}
h1 {{ font-size: 2rem; font-weight: 600; }}
h1 span {{ color: var(--accent); }}
.subtitle {{ color: var(--text2); margin-top: 0.5rem; }}
.stats {{ display: flex; gap: 2rem; margin-top: 1rem; flex-wrap: wrap; }}
.stat {{ background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem 1.5rem; }}
.stat-value {{ font-size: 1.5rem; font-weight: 700; color: var(--accent); }}
.stat-label {{ font-size: 0.85rem; color: var(--text2); }}
.search-box {{ width: 100%; padding: 0.75rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 1rem; margin: 1.5rem 0; }}
.search-box:focus {{ outline: none; border-color: var(--accent); }}
.categories {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }}
.cat-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; transition: border-color 0.2s; }}
.cat-card:hover {{ border-color: var(--accent); }}
.cat-card a {{ color: var(--text); text-decoration: none; }}
.cat-title {{ font-size: 1.1rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }}
.cat-count {{ background: var(--accent); color: var(--bg); font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 12px; font-weight: 700; }}
.cat-desc {{ color: var(--text2); font-size: 0.85rem; margin-top: 0.5rem; }}
.cat-funcs {{ color: var(--text2); font-size: 0.8rem; margin-top: 0.75rem; font-family: monospace; }}
footer {{ margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--text2); font-size: 0.85rem; text-align: center; }}
a {{ color: var(--accent); }}
</style>
</head>
<body>
<div class="container">
<header>
  <h1><span>math.js</span> Function Reference</h1>
  <p class="subtitle">Complete API reference for all mathematical functions — types, parameters, algorithms, and examples.</p>
  <div class="stats">
    <div class="stat"><div class="stat-value">{len(metadata)}</div><div class="stat-label">Functions</div></div>
    <div class="stat"><div class="stat-value">{len(categories)}</div><div class="stat-label">Categories</div></div>
    <div class="stat"><div class="stat-value">9,263</div><div class="stat-label">Tests Passing</div></div>
    <div class="stat"><div class="stat-value">v15.6.0</div><div class="stat-label">Version</div></div>
  </div>
</header>

<input type="text" class="search-box" id="search" placeholder="Search functions... (e.g. besselJ, integrate, shortestPath)" oninput="filterCards()">

<div class="categories" id="categories">
"""

for cat in sorted(categories.keys()):
    funcs = categories[cat]
    desc = cat_descriptions.get(cat, "")
    func_names = ", ".join(f["name"] for f in funcs[:12])
    if len(funcs) > 12:
        func_names += f", ... (+{len(funcs) - 12} more)"
    index_html += f"""  <div class="cat-card" data-names="{" ".join(f["name"] for f in funcs)}">
    <a href="functions/{cat.lower()}.html">
      <div class="cat-title">{escape_html(cat)} <span class="cat-count">{len(funcs)}</span></div>
      <div class="cat-desc">{escape_html(desc)}</div>
      <div class="cat-funcs">{escape_html(func_names)}</div>
    </a>
  </div>
"""

index_html += f"""</div>

<footer>
  <p>Generated {datetime.now().strftime("%Y-%m-%d")} · <a href="https://github.com/danielsimonjr/mathjs">GitHub</a> · <a href="https://mathjs.org">mathjs.org</a></p>
</footer>
</div>

<script>
function filterCards() {{
  const q = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('.cat-card').forEach(card => {{
    const names = card.dataset.names.toLowerCase();
    card.style.display = (!q || names.includes(q)) ? '' : 'none';
  }});
}}
</script>
</body>
</html>"""

(docs_dir / "index.html").write_text(index_html, encoding="utf-8")
print(f"Generated index.html")

# Generate per-category pages
for cat in sorted(categories.keys()):
    funcs = categories[cat]
    desc = cat_descriptions.get(cat, "")

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{cat} — Math.js Reference</title>
<style>
:root {{
  --bg: #0d1117; --surface: #161b22; --border: #30363d;
  --text: #e6edf3; --text2: #8b949e; --accent: #58a6ff;
  --green: #3fb950; --purple: #bc8cff; --orange: #d29922;
  --pink: #f778ba; --red: #f85149; --code-bg: #1c2128;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }}
.container {{ max-width: 960px; margin: 0 auto; padding: 2rem; }}
header {{ border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 2rem; }}
h1 {{ font-size: 1.75rem; font-weight: 600; }}
h1 span {{ color: var(--accent); }}
.breadcrumb {{ font-size: 0.85rem; color: var(--text2); margin-bottom: 0.5rem; }}
.breadcrumb a {{ color: var(--accent); text-decoration: none; }}
.cat-desc {{ color: var(--text2); margin-top: 0.5rem; }}
.search-box {{ width: 100%; padding: 0.6rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.95rem; margin: 1rem 0; }}
.search-box:focus {{ outline: none; border-color: var(--accent); }}
.func-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }}
.func-card:target {{ border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }}
.func-name {{ font-size: 1.15rem; font-weight: 700; color: var(--accent); font-family: monospace; }}
.func-desc {{ margin: 0.5rem 0; color: var(--text); }}
.func-section {{ margin-top: 0.75rem; }}
.func-section-title {{ font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text2); letter-spacing: 0.05em; margin-bottom: 0.25rem; }}
.param-table {{ width: 100%; border-collapse: collapse; font-size: 0.9rem; }}
.param-table th {{ text-align: left; padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--border); color: var(--text2); font-weight: 600; }}
.param-table td {{ padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--border); }}
.param-name {{ font-family: monospace; color: var(--orange); }}
.param-type {{ font-family: monospace; color: var(--purple); font-size: 0.85rem; }}
code {{ background: var(--code-bg); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9rem; }}
.signatures {{ font-family: monospace; color: var(--green); font-size: 0.85rem; }}
.example {{ background: var(--code-bg); padding: 0.5rem 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; margin-top: 0.25rem; color: var(--green); }}
.seealso {{ margin-top: 0.5rem; font-size: 0.85rem; }}
.seealso a {{ color: var(--accent); text-decoration: none; margin-right: 0.75rem; }}
.seealso a:hover {{ text-decoration: underline; }}
a {{ color: var(--accent); }}
footer {{ margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--text2); font-size: 0.85rem; text-align: center; }}
</style>
</head>
<body>
<div class="container">
<header>
  <div class="breadcrumb"><a href="../index.html">math.js Reference</a> &rsaquo; {cat}</div>
  <h1><span>{cat}</span> Functions ({len(funcs)})</h1>
  <p class="cat-desc">{escape_html(desc)}</p>
</header>

<input type="text" class="search-box" id="search" placeholder="Filter {cat.lower()} functions..." oninput="filterFuncs()">
"""

    for f in funcs:
        page += f"""<div class="func-card" id="{f["name"]}" data-name="{f["name"].lower()}">
  <div class="func-name">{escape_html(f["name"])}</div>
  <div class="func-desc">{escape_html(f["description"][:300])}</div>
"""
        # Syntax
        if f["syntax"]:
            page += f"""  <div class="func-section">
    <div class="func-section-title">Syntax</div>
    <div class="example">{escape_html(" | ".join(f["syntax"][:3]))}</div>
  </div>
"""
        # Signatures
        if f["signatures"]:
            page += f"""  <div class="func-section">
    <div class="func-section-title">Type Signatures</div>
    <div class="signatures">{escape_html(", ".join(f["signatures"][:6]))}</div>
  </div>
"""
        # Parameters
        if f["params"]:
            page += """  <div class="func-section">
    <div class="func-section-title">Parameters</div>
    <table class="param-table">
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
"""
            for p in f["params"]:
                page += f"""      <tr><td class="param-name">{escape_html(p["name"])}</td><td class="param-type">{escape_html(p["type"])}</td><td>{escape_html(p["description"])}</td></tr>
"""
            page += "    </table>\n  </div>\n"

        # Returns
        if f["returns"]:
            page += f"""  <div class="func-section">
    <div class="func-section-title">Returns</div>
    <div><code>{escape_html(f["returns"])}</code></div>
  </div>
"""
        # Examples
        if f["examples"]:
            page += """  <div class="func-section">
    <div class="func-section-title">Examples</div>
    <div class="example">"""
            page += "<br>".join(escape_html(ex) for ex in f["examples"][:5])
            page += "</div>\n  </div>\n"

        # See also
        if f["seealso"]:
            page += """  <div class="func-section seealso">
    <div class="func-section-title">See Also</div>
"""
            for sa in f["seealso"]:
                sa = sa.strip()
                if sa:
                    page += f'    <a href="#{sa}">{sa}</a>\n'
            page += "  </div>\n"

        page += "</div>\n\n"

    page += f"""
<footer>
  <p><a href="../index.html">&larr; Back to Index</a> · Generated {datetime.now().strftime("%Y-%m-%d")}</p>
</footer>
</div>

<script>
function filterFuncs() {{
  const q = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('.func-card').forEach(card => {{
    card.style.display = (!q || card.dataset.name.includes(q)) ? '' : 'none';
  }});
}}
</script>
</body>
</html>"""

    (docs_dir / "functions" / f"{cat.lower()}.html").write_text(page, encoding="utf-8")
    print(f"  Generated {cat.lower()}.html ({len(funcs)} functions)")

print(f"\nDocs site generated at {docs_dir}")
print(f"Total: {len(metadata)} functions across {len(categories)} categories")
