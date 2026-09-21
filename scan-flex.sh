#!/bin/bash
echo "=== Flex Without Wrap ==="
grep -rn "display: 'flex', gap:" src/components/dashboard/ | grep -v "flexWrap" | head -n 20
