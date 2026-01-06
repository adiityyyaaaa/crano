#!/bin/bash

# Script to add .js extensions to TypeScript imports for ES modules

echo "Adding .js extensions to imports..."

# Find all .ts files in backend directories and add .js to relative imports
find . -type f \( -path "./controllers/*.ts" -o -path "./middleware/*.ts" -o -path "./models/*.ts" -o -path "./routes/*.ts" -o -path "./services/*.ts" -o -path "./utils/*.ts" -o -name "server.ts" -o -name "db.ts" \) -exec sed -i '' \
  -e "s|from '\./\([^']*\)';|from './\1.js';|g" \
  -e "s|from \"\./\([^\"]*\)\";|from \"./\1.js\";|g" \
  -e "s|from '\.\.\/\([^']*\)';|from '../\1.js';|g" \
  -e "s|from \"\.\.\/\([^\"]*\)\";|from \"../\1.js\";|g" \
  -e "s|\.ts\.js|.js|g" \
  -e "s|\.js\.js|.js|g" \
  {} \;

echo "Done! Extensions added."
