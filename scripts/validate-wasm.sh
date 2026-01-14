#!/bin/bash
# Validate AssemblyScript files before WASM compilation
# Usage: ./scripts/validate-wasm.sh

set -e

echo "=== AssemblyScript Pre-Compilation Validation ==="
echo ""

# Step 1: Type check all modules
echo "1. Type checking AssemblyScript modules..."
modules=(
  "src/wasm/complex/operations.ts"
  "src/wasm/geometry/operations.ts"
  "src/wasm/logical/operations.ts"
  "src/wasm/relational/operations.ts"
  "src/wasm/set/operations.ts"
  "src/wasm/special/functions.ts"
  "src/wasm/string/operations.ts"
)

for module in "${modules[@]}"; do
  echo "   Checking $module..."
  npx asc "$module" --config asconfig.json --noEmit 2>&1 | grep -i error || true
done

echo "   Checking full src/wasm/index.ts..."
npx asc src/wasm/index.ts --config asconfig.json --noEmit 2>&1 | grep -v "suboptimal" || echo "   ✓ All type checks passed"

echo ""
echo "2. Building WASM (debug mode for fast iteration)..."
npx asc src/wasm/index.ts --config asconfig.json --target debug 2>&1 | grep -v "suboptimal" || echo "   ✓ Debug build successful"

echo ""
echo "3. Running direct WASM tests..."
npx vitest run test/wasm/unit-tests/wasm/direct-wasm.test.ts 2>&1 | tail -10

echo ""
echo "=== Validation Complete ==="
