#!/usr/bin/env node

/**
 * Update Max Level Script
 * Automatically detects the maximum level from the levels directory
 * and updates the ACTUAL_MAX_LEVEL in constants.js
 */

const fs = require('fs');
const path = require('path');

function detectMaxLevel() {
    const levelsDir = path.resolve(__dirname, '..', 'levels');
    
    if (!fs.existsSync(levelsDir)) {
        console.error('❌ Levels directory not found');
        process.exit(1);
    }
    
    const levelFiles = fs.readdirSync(levelsDir)
        .filter(file => file.startsWith('level_') && file.endsWith('.json'))
        .map(file => {
            const match = file.match(/level_(\d+)\.json/);
            return match ? parseInt(match[1]) : 0;
        })
        .filter(level => level > 0)
        .sort((a, b) => a - b);
    
    if (levelFiles.length === 0) {
        console.error('❌ No level files found in levels directory');
        process.exit(1);
    }
    
    const maxLevel = Math.max(...levelFiles);
    console.log(`🔍 Found ${levelFiles.length} level files: ${levelFiles.join(', ')}`);
    console.log(`📊 Maximum level detected: ${maxLevel}`);
    
    return { maxLevel, levelFiles };
}

function updateConstantsWithMaxLevel(maxLevel) {
    const constantsPath = path.resolve(__dirname, '..', 'constants.js');
    
    if (!fs.existsSync(constantsPath)) {
        console.error('❌ constants.js not found');
        process.exit(1);
    }
    
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Extract current ACTUAL_MAX_LEVEL value
    const currentValueMatch = constantsContent.match(/ACTUAL_MAX_LEVEL:\s*(\d+)/);
    if (!currentValueMatch) {
        console.error('❌ ACTUAL_MAX_LEVEL pattern not found in constants.js');
        process.exit(1);
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
        // Create backup
        const backupPath = constantsPath + '.backup';
        fs.writeFileSync(backupPath, constantsContent, 'utf8');
        console.log(`💾 Backup created: ${backupPath}`);
        
        // Write updated content
        fs.writeFileSync(constantsPath, updatedContent, 'utf8');
        console.log(`✅ Updated ACTUAL_MAX_LEVEL from ${currentValue} to ${maxLevel} in constants.js`);
    } else {
        console.log(`ℹ️  ACTUAL_MAX_LEVEL already set to ${maxLevel}`);
    }
}

function main() {
    console.log('🔧 Updating maximum level in constants.js...\n');
    
    try {
        const { maxLevel, levelFiles } = detectMaxLevel();
        updateConstantsWithMaxLevel(maxLevel);
        
        console.log('\n🎉 Maximum level update completed successfully!');
        console.log(`📋 Level files found: ${levelFiles.length}`);
        console.log(`🏆 Maximum level: ${maxLevel}`);
        
    } catch (error) {
        console.error('❌ Error updating maximum level:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { detectMaxLevel, updateConstantsWithMaxLevel }; 