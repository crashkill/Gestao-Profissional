#!/bin/bash
set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Check if running in CI environment
if [ -z "$CI" ]; then
  # Local development mode
  echo "🔧 Running in local development mode"
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
  fi
  
  # Build the application
  echo "🔨 Building application..."
  npm run build
  
  # Start preview server
  echo "🌐 Starting preview server..."
  echo "   Press Ctrl+C to stop the preview server"
  echo "   The application will be available at: http://localhost:4173"
  npm run preview
  
  # Ask for confirmation before deploying
  read -p "✅ Build completed. Deploy to production? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled by user"
    exit 0
  fi
  
  # Commit and push changes
  git add .
  git commit -m "chore: update production build"
  git push origin main
  
  echo "🚀 Deployment triggered! Check GitHub Actions for progress."
  echo "   The site will be available at: https://crashkill.github.io/gestao-profissional/"
else
  # CI/CD mode (GitHub Actions)
  echo "🤖 Running in CI/CD mode"
  
  # Build the application
  echo "🔨 Building application..."
  npm run build
  
  # Verify build output
  if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: Build failed - index.html not found in dist/"
    exit 1
  fi
  
  echo "✅ Build completed successfully"
fi

echo "✨ Deployment process completed!"
