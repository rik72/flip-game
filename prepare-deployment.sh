#!/bin/bash

# Flipgame Deployment Preparation Script
# This script automates Step 1.1 from the AWS deployment guide

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Flipgame Deployment Preparation Script${NC}"
echo "=============================================="
echo "This script will prepare your files for AWS S3 + CloudFront deployment"
echo ""

# Configuration
DEPLOY_DIR="flipgame-deploy"
SOURCE_DIR="."

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "app.js" ]; then
    echo -e "${RED}❌ Error: This script must be run from the flipgame project root directory${NC}"
    echo "Please navigate to your flipgame project folder and run this script again."
    exit 1
fi

echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
# Remove existing deployment directory if it exists
if [ -d "$DEPLOY_DIR" ]; then
    echo "Removing existing deployment directory..."
    rm -rf "$DEPLOY_DIR"
fi

# Create fresh deployment directory
mkdir -p "$DEPLOY_DIR"
echo -e "${GREEN}✅ Created deployment directory: $DEPLOY_DIR${NC}"

echo ""
echo -e "${YELLOW}📋 Copying necessary files...${NC}"

# Copy main application files
echo "📄 Copying main application files..."
cp index.html "$DEPLOY_DIR/"
cp app.js "$DEPLOY_DIR/"
cp app-bridge.js "$DEPLOY_DIR/"
cp constants.js "$DEPLOY_DIR/"
cp utils.js "$DEPLOY_DIR/"
cp html-builder.js "$DEPLOY_DIR/"
cp display-manager.js "$DEPLOY_DIR/"

# Copy CSS files
echo "🎨 Copying CSS files..."
cp styles.css "$DEPLOY_DIR/"
cp editor_styles.css "$DEPLOY_DIR/" 2>/dev/null || echo "  ⚠️  editor_styles.css not found (optional)"

# Copy HTML files
echo "🌐 Copying HTML files..."
cp editor.html "$DEPLOY_DIR/" 2>/dev/null || echo "  ⚠️  editor.html not found (optional)"

# Copy SVG files
echo "🖼️  Copying SVG files..."
cp favicon.svg "$DEPLOY_DIR/"
cp editor_favicon.svg "$DEPLOY_DIR/" 2>/dev/null || echo "  ⚠️  editor_favicon.svg not found (optional)"

# Copy directories
echo "📁 Copying directories..."
if [ -d "assets" ]; then
    cp -r assets "$DEPLOY_DIR/"
    echo "  ✅ assets/ directory copied"
else
    echo "  ❌ assets/ directory not found"
fi

if [ -d "levels" ]; then
    cp -r levels "$DEPLOY_DIR/"
    echo "  ✅ levels/ directory copied"
else
    echo "  ❌ levels/ directory not found"
fi

if [ -d "managers" ]; then
    cp -r managers "$DEPLOY_DIR/"
    echo "  ✅ managers/ directory copied"
else
    echo "  ❌ managers/ directory not found"
fi

# Copy JSON files (if any in root)
echo "📊 Copying JSON files..."
find . -maxdepth 1 -name "*.json" -not -name "package*.json" -exec cp {} "$DEPLOY_DIR/" \; 2>/dev/null || echo "  ℹ️  No additional JSON files found"

echo ""
echo -e "${YELLOW}🧹 Cleaning up development files...${NC}"

# Remove development files from deployment directory
cd "$DEPLOY_DIR"
rm -f package.json package-lock.json 2>/dev/null || true
rm -f *.md 2>/dev/null || true
rm -f validate-compliance.js 2>/dev/null || true
rm -rf screenshots 2>/dev/null || true
rm -rf node_modules 2>/dev/null || true

# Go back to original directory
cd ..

echo ""
echo -e "${GREEN}✅ Deployment preparation completed!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "=========================="
echo -e "📁 Deployment directory: ${YELLOW}$DEPLOY_DIR${NC}"
echo -e "📄 Files included:"
echo "  • Main application files (HTML, JS, CSS)"
echo "  • Assets directory (CSS, JS, fonts, sounds)"
echo "  • Levels directory (JSON level files)"
echo "  • Managers directory (game managers)"
echo "  • Icons and images (SVG files)"
echo ""
echo -e "🚫 Files excluded:"
echo "  • Development dependencies (node_modules, package.json)"
echo "  • Documentation files (*.md)"
echo "  • Development scripts (validate-compliance.js)"
echo "  • Screenshots directory"
echo ""

# Show deployment directory contents
echo -e "${BLUE}📋 Files ready for upload:${NC}"
echo "=========================="
find "$DEPLOY_DIR" -type f | head -20 | while read file; do
    echo "  📄 $file"
done

if [ $(find "$DEPLOY_DIR" -type f | wc -l) -gt 20 ]; then
    echo "  ... and $(($(find "$DEPLOY_DIR" -type f | wc -l) - 20)) more files"
fi

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "================"
echo "1. 📦 Your files are ready in the '$DEPLOY_DIR' directory"
echo "2. 🌐 Go to AWS S3 Console: https://console.aws.amazon.com/s3/"
echo "   (Make sure to create bucket in eu-west-1 region)"
echo "3. 📤 Upload all files from '$DEPLOY_DIR' to your S3 bucket"
echo "4. 📖 Follow the AWS_DEPLOYMENT_GUIDE.md for the remaining steps"
echo ""
echo -e "${YELLOW}💡 Tip: You can now drag and drop the entire '$DEPLOY_DIR' folder${NC}"
echo "   into the AWS S3 upload interface!"
echo ""
echo -e "${GREEN}🚀 Ready for AWS deployment!${NC}" 