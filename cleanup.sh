#!/bin/bash

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "✅ Cache cleared!"
echo ""
echo "Now run: npm run dev"
echo ""
echo "The app will start with Webpack (Turbopack disabled)"
