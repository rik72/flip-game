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

function detectMaxLevel() {
    const levelsDir = path.resolve(__dirname, '..', 'levels');
    const levelFiles = fs.readdirSync(levelsDir)
        .filter(file => file.startsWith('level_') && file.endsWith('.json'))
        .map(file => {
            const match = file.match(/level_(\d+)\.json/);
            return match ? parseInt(match[1]) : 0;
        })
        .filter(level => level > 0);
    
    const maxLevel = Math.max(...levelFiles);
    console.log(`🔍 Detected ${levelFiles.length} level files, max level: ${maxLevel}`);
    return maxLevel;
}

function updateConstantsWithMaxLevel(maxLevel) {
    const constantsPath = path.resolve(__dirname, '..', 'constants.js');
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Extract current ACTUAL_MAX_LEVEL value
    const currentValueMatch = constantsContent.match(/ACTUAL_MAX_LEVEL:\s*(\d+)/);
    if (!currentValueMatch) {
        console.error('❌ ACTUAL_MAX_LEVEL pattern not found in constants.js');
        return;
    }
    
    const currentValue = parseInt(currentValueMatch[1]);
    
    // Check if the value actually needs to change
    if (currentValue === maxLevel) {
        console.log(`ℹ️  ACTUAL_MAX_LEVEL already set to ${maxLevel} - no update needed`);
        return;
    }
    
    // Update the ACTUAL_MAX_LEVEL line
    const pattern = /ACTUAL_MAX_LEVEL:\s*\d+,?\s*\/\/\s*Actual final level of the game(?:\s*\(auto-detected\))*/;
    const updatedContent = constantsContent.replace(
        pattern,
        `ACTUAL_MAX_LEVEL: ${maxLevel}, // Actual final level of the game`
    );
    
    if (constantsContent !== updatedContent) {
        fs.writeFileSync(constantsPath, updatedContent, 'utf8');
        console.log(`✅ Updated ACTUAL_MAX_LEVEL from ${currentValue} to ${maxLevel} in constants.js`);
    } else {
        console.log(`ℹ️  ACTUAL_MAX_LEVEL already set to ${maxLevel}`);
    }
}

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
    
    // Auto-detect and update max level
    const maxLevel = detectMaxLevel();
    updateConstantsWithMaxLevel(maxLevel);
    
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

module.exports = { concatenateFiles, GAME_FILES, EDITOR_FILES, detectMaxLevel, updateConstantsWithMaxLevel }; 