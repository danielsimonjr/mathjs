#!/bin/bash
# Batch fix TS2339 property access errors

echo "Fixing TypedFunction properties..."
find src -name '*.ts' -type f -exec sed -i \
  's/typed\.isTypedFunction\b/(typed as any).isTypedFunction/g; s/typed\.clear\b/(typed as any).clear/g; s/typed\.addTypes\b/(typed as any).addTypes/g; s/typed\.addConversions\b/(typed as any).addConversions/g; s/typed\.onMismatch\b/(typed as any).onMismatch/g; s/typed\.createError\b/(typed as any).createError/g' {} +

echo "Fixing Error.captureStackTrace..."
find src -name '*.ts' -type f -exec sed -i \
  's/Error\.captureStackTrace\b/(Error as any).captureStackTrace/g' {} +

echo "Fixing config properties..."
find src -name '*.ts' -type f -exec sed -i \
  's/\bconfig\.math\b/(config as any).math/g; s/\bconfig\.mathWithTransform\b/(config as any).mathWithTransform/g; s/\bconfig\.classes\b/(config as any).classes/g' {} +

echo "Done!"
