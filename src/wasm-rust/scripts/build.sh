#!/bin/bash
cd "$(dirname "$0")/.."
cargo build --target wasm32-unknown-unknown --release
echo "Build complete. Output: target/wasm32-unknown-unknown/release/mathjs_wasm.wasm"
