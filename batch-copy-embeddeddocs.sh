#!/bin/bash
cd src/expression/embeddedDocs/function
for dir in */; do
  cd "$dir"
  for f in *.js; do
    if [ -f "$f" ]; then
      ts="${f%.js}.ts"
      if [ ! -f "$ts" ]; then
        cp "$f" "$ts"
        echo "Copied: $dir$f -> $ts"
      fi
    fi
  done
  cd ..
done
