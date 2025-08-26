#!/usr/bin/env node

/**
 * Build Concatenated Files Script
 * Automatically concatenates JavaScript files for bundling
 */

const fs = require('fs');
const path = require('path');

// File order for the main game bundle
const GAME_FILES = [
    'constants.js',
    'utils.js', 
    'html-builder.js',
    'display-manager.js',
    'managers/storage-manager.js',
    'managers/sound-manager.js',
    'managers/game-manager.js',
    'app.js',
    'app-bridge.js'
];

// File order for the editor bundle
const EDITOR_FILES = [
    'constants.js',
    'utils.js',
    'html-builder.js', 
    'display-manager.js',
    'managers/storage-manager.js',
    'managers/sound-manager.js',
    'managers/game-manager.js',
    'src/editor.js'
];

function concatenateFiles(fileList, outputPath, description) {
    console.log(`🔧 Building ${description}...`);
    
    let concatenatedContent = '';
    let totalSize = 0;
    
    // Add header comment
    concatenatedContent += `// ===== ${description.toUpperCase()} =====\n`;
    concatenatedContent += `// Auto-generated concatenated file\n`;
    concatenatedContent += `// Built on: ${new Date().toISOString()}\n`;
    concatenatedContent += `// Files included: ${fileList.length} files\n\n`;
    
    fileList.forEach((filePath, index) => {
        const fullPath = path.resolve(__dirname, '..', filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Error: File not found: ${filePath}`);
            process.exit(1);
        }
        
        const content = fs.readFileSync(fullPath, 'utf8');
        const fileSize = content.length;
        totalSize += fileSize;
        
        // Add file separator comment
        concatenatedContent += `\n// ===== FILE ${index + 1}/${fileList.length}: ${filePath} (${fileSize} bytes) =====\n`;
        concatenatedContent += content;
        concatenatedContent += '\n';
        
        console.log(`  ✅ ${filePath} (${(fileSize / 1024).toFixed(1)}KB)`);
    });
    
    // Write the concatenated file
    const outputFullPath = path.resolve(__dirname, '..', outputPath);
    fs.writeFileSync(outputFullPath, concatenatedContent, 'utf8');
    
    console.log(`  📦 Output: ${outputPath} (${(totalSize / 1024).toFixed(1)}KB)`);
    console.log(`  ✨ ${description} built successfully!\n`);
}

function main() {
    console.log('🚀 Building concatenated JavaScript files...\n');
    
    // Ensure src directory exists
    const srcDir = path.resolve(__dirname, '..', 'src');
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }
    
    // Build game concatenated file
    concatenateFiles(
        GAME_FILES, 
        'src/game-concatenated.js',
        'Game Bundle'
    );
    
    // Build editor concatenated file  
    concatenateFiles(
        EDITOR_FILES,
        'src/editor-concatenated.js', 
        'Editor Bundle'
    );
    
    console.log('🎉 All concatenated files built successfully!');
    console.log('You can now run: npm run dev or npm run build');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { concatenateFiles, GAME_FILES, EDITOR_FILES }; 