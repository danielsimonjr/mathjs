#!/bin/bash
find src/type -name '*.js' -type f | while read jsfile; do
  tsfile="${jsfile%.js}.ts"
  if [ ! -f "$tsfile" ]; then
    echo "$jsfile"
  fi
done
