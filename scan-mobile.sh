#!/bin/bash
# Find hardcoded grids without auto-fit/flex wrap
echo "=== Suspicious Grids ==="
grep -rn "gridTemplateColumns: '[^a]*[0-9]*fr" src/components/dashboard/ src/app/ligler/ src/app/magaza/ | grep -v "auto-fit" | grep -v "minmax"
echo "=== Fixed Widths (px) > 300 ==="
grep -rn "width: '[3-9][0-9][0-9]px'" src/components/dashboard/ src/app/ligler/ src/app/magaza/
grep -rn "minWidth: '[3-9][0-9][0-9]px'" src/components/dashboard/ src/app/ligler/ src/app/magaza/
echo "=== Mobile-Unfriendly Tailwind Grids ==="
grep -rn "grid-cols-[2-9]" src/components/dashboard/ src/app/ligler/ src/app/magaza/ | grep -v "md:grid" | grep -v "sm:grid" | grep -v "lg:grid"
