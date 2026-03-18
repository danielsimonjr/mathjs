#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "Building Rust WASM..."
cargo build --target wasm32-unknown-unknown --release

WASM_SRC="target/wasm32-unknown-unknown/release/mathjs_wasm.wasm"
WASM_DST="../../lib/wasm/mathjs.wasm"

# Create output directory if needed
mkdir -p "$(dirname "$WASM_DST")"

# Copy to lib/wasm/ (where WasmLoader expects it)
cp "$WASM_SRC" "$WASM_DST"

# Run wasm-opt if available (optional optimization)
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing with wasm-opt..."
    wasm-opt -O3 --enable-simd "$WASM_DST" -o "$WASM_DST"
fi

echo "Rust WASM build complete: $WASM_DST ($(du -h "$WASM_DST" | cut -f1))"
