#!/bin/bash

# Script to validate the Electron desktop app build process
# This script tests the complete build workflow without actually creating installers

set -e

echo "=========================================="
echo "CMAnGOS CMS Desktop App Build Validation"
echo "=========================================="
echo ""

# Step 1: Build Backend
echo "Step 1: Building ASP.NET Core Backend..."
cd CMAnGOS-CMS-API.Server
dotnet build -c Release
echo "✓ Backend build successful"
echo ""

# Step 2: Publish Backend for production
echo "Step 2: Publishing Backend for production..."
dotnet publish -c Release -o bin/Release/net8.0/publish
echo "✓ Backend publish successful"
echo ""

# Step 3: Build Frontend
echo "Step 3: Building React Frontend..."
cd ../cmangos-cms-api.client
npm run build
echo "✓ Frontend build successful"
echo ""

# Step 4: Verify build artifacts
echo "Step 4: Verifying build artifacts..."

# Check frontend dist
if [ ! -f "dist/index.html" ]; then
    echo "✗ Frontend build failed: dist/index.html not found"
    exit 1
fi
echo "  ✓ Frontend dist/index.html found"

# Check Electron compilation
if [ ! -f "dist-electron/main.js" ]; then
    echo "✗ Electron compilation failed: dist-electron/main.js not found"
    exit 1
fi
echo "  ✓ Electron dist-electron/main.js found"

if [ ! -f "dist-electron/preload.js" ]; then
    echo "✗ Electron compilation failed: dist-electron/preload.js not found"
    exit 1
fi
echo "  ✓ Electron dist-electron/preload.js found"

# Check backend publish
if [ ! -f "../CMAnGOS-CMS-API.Server/bin/Release/net8.0/publish/CMAnGOS-CMS-API.Server.dll" ]; then
    echo "✗ Backend publish failed: CMAnGOS-CMS-API.Server.dll not found"
    exit 1
fi
echo "  ✓ Backend publish artifacts found"

echo ""
echo "=========================================="
echo "✓ Build Validation Successful!"
echo "=========================================="
echo ""
echo "All build artifacts are ready for packaging."
echo ""
echo "To create distributable packages, run:"
echo "  cd cmangos-cms-api.client"
echo "  npm run electron:build"
echo ""
echo "This will create installers in the 'release' directory."
