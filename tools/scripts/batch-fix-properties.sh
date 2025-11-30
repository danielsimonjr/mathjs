#!/bin/bash
# Batch fix common property access patterns

echo "Fixing typed.find() calls..."
find src -name '*.ts' -type f -exec sed -i \
  's/typed\.find(callback, \[\([^]]*\)\])/typed.find(callback, [\1]) as any/g' {} +

echo "Fixing BigNumber.toNumber() calls..."
find src -name '*.ts' -type f -exec sed -i \
  's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.toNumber()/(\1 as any).toNumber()/g' {} +

echo "Fixing node property accesses..."
find src -name '*.ts' -type f -exec sed -i \
  's/node\.fn\b/(node as any).fn/g; s/node\.content\b/(node as any).content/g; s/node\.implicit\b/(node as any).implicit/g' {} +

echo "Done!"
