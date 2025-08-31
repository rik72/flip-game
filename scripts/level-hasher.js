#!/usr/bin/env node

/**
 * Level Hasher Script
 * Generates hashed filenames for level files to prevent caching and make them harder to guess
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Improved hash function that generates a 6-character alphanumeric hash
 * @param {string} input - Input string to hash
 * @returns {string} - 6-character hash [a-z0-9]
 */
function simpleHash(input) {
    // Use a more sophisticated hash algorithm for better distribution
    let hash1 = 0x811c9dc5; // FNV-1a hash prime
    let hash2 = 0x1505;     // FNV-1a hash offset basis
    
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash1 = (hash1 ^ char) * 0x01000193; // FNV-1a multiplication
        hash2 = (hash2 ^ char) * 0x01000193;
        hash1 = hash1 >>> 0; // Keep as 32-bit unsigned
        hash2 = hash2 >>> 0;
    }
    
    // Combine both hashes for better distribution
    const combinedHash = (hash1 << 16) | (hash2 & 0xffff);
    const positiveHash = Math.abs(combinedHash);
    
    // Use a larger character set and better distribution
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Generate each character using different parts of the hash
    for (let i = 0; i < 6; i++) {
        // Use different bit positions for each character
        const shift = (i * 5) % 32;
        const charIndex = (positiveHash >> shift) & 0x1f; // 5 bits = 0-31
        result += chars[charIndex % chars.length];
    }
    
    return result;
}

/**
 * Generate hash seed from all level files
 * @param {string} levelsDir - Path to levels directory
 * @returns {string} - Hash seed
 */
function generateHashSeed(levelsDir) {
    const levelFiles = fs.readdirSync(levelsDir)
        .filter(file => file.startsWith('level_') && file.endsWith('.json'))
        .sort(); // Sort for consistent ordering
    
    let combinedContent = '';
    
    levelFiles.forEach(file => {
        const filePath = path.join(levelsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        // Include file size and modification time for additional entropy
        combinedContent += content + stats.size + stats.mtime.getTime();
    });
    
    // Add build timestamp and random entropy for additional uniqueness
    const timestamp = new Date().toISOString();
    const randomEntropy = Math.random().toString(36).substring(2, 15);
    combinedContent += timestamp + randomEntropy;
    
    return simpleHash(combinedContent);
}

/**
 * Generate hashed filename for a level
 * @param {number} levelNumber - Level number
 * @param {string} hashSeed - Hash seed
 * @returns {string} - Hashed filename
 */
function generateLevelFilename(levelNumber, hashSeed) {
    const content = `${levelNumber}_${hashSeed}`;
    const hash = simpleHash(content);
    return `level_${levelNumber}_${hash}.json`;
}

/**
 * Process level files: generate hashed names and copy to dist
 * @param {string} sourceDir - Source levels directory
 * @param {string} distDir - Destination directory (dist/levels)
 * @param {string} hashSeed - Hash seed
 */
function processLevelFiles(sourceDir, distDir, hashSeed) {
    console.log('🔧 Processing level files with hash seed:', hashSeed);
    
    // Clean dist/levels directory first
    if (fs.existsSync(distDir)) {
        console.log('  🧹 Cleaning dist/levels directory...');
        const files = fs.readdirSync(distDir);
        files.forEach(file => {
            const filePath = path.join(distDir, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                console.log(`    🗑️  Removed: ${file}`);
            }
        });
    } else {
        // Ensure dist directory exists
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    const levelFiles = fs.readdirSync(sourceDir)
        .filter(file => file.startsWith('level_') && file.endsWith('.json'))
        .sort();
    
    let processedCount = 0;
    
    levelFiles.forEach(file => {
        const match = file.match(/level_(\d+)\.json/);
        if (!match) return;
        
        const levelNumber = parseInt(match[1]);
        const hashedFilename = generateLevelFilename(levelNumber, hashSeed);
        
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(distDir, hashedFilename);
        
        // Copy file with hashed name
        fs.copyFileSync(sourcePath, destPath);
        
        console.log(`  ✅ Level ${levelNumber}: ${file} → ${hashedFilename}`);
        processedCount++;
    });
    
    console.log(`📦 Processed ${processedCount} level files`);
    return processedCount;
}

/**
 * Update constants.js with hash seed
 * @param {string} constantsPath - Path to constants.js
 * @param {string} hashSeed - Hash seed to add
 */
function updateConstantsWithHashSeed(constantsPath, hashSeed) {
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Check if LEVEL_HASH_SEED already exists
    const existingPattern = /LEVEL_HASH_SEED:\s*['"`][^'"`]*['"`],?\s*\/\/\s*Hash seed for level filename generation/;
    
    if (existingPattern.test(constantsContent)) {
        // Update existing hash seed
        const updatedContent = constantsContent.replace(
            existingPattern,
            `LEVEL_HASH_SEED: '${hashSeed}', // Hash seed for level filename generation`
        );
        fs.writeFileSync(constantsPath, updatedContent, 'utf8');
        console.log(`✅ Updated existing LEVEL_HASH_SEED to: ${hashSeed}`);
    } else {
        // Add new hash seed after ACTUAL_MAX_LEVEL
        const insertPattern = /(ACTUAL_MAX_LEVEL:\s*\d+,?\s*\/\/\s*Actual final level of the game.*?)(\n\s*\/\/\s*Development:)/;
        const replacement = `$1\n\t\tLEVEL_HASH_SEED: '${hashSeed}', // Hash seed for level filename generation$2`;
        
        const updatedContent = constantsContent.replace(insertPattern, replacement);
        fs.writeFileSync(constantsPath, updatedContent, 'utf8');
        console.log(`✅ Added LEVEL_HASH_SEED: ${hashSeed}`);
    }
}

/**
 * Main function
 */
function main() {
    console.log('🚀 Level hashing system starting...\n');
    
    const projectRoot = path.resolve(__dirname, '..');
    const sourceLevelsDir = path.join(projectRoot, 'levels');
    const distLevelsDir = path.join(projectRoot, 'dist', 'levels');
    const constantsPath = path.join(projectRoot, 'constants.js');
    
    // Check if source levels directory exists
    if (!fs.existsSync(sourceLevelsDir)) {
        console.error('❌ Source levels directory not found:', sourceLevelsDir);
        process.exit(1);
    }
    
    // Generate hash seed from all level files
    const hashSeed = generateHashSeed(sourceLevelsDir);
    console.log(`🔑 Generated hash seed: ${hashSeed}\n`);
    
    // Process level files (copy with hashed names to dist)
    const processedCount = processLevelFiles(sourceLevelsDir, distLevelsDir, hashSeed);
    
    if (processedCount > 0) {
        // Update constants.js with hash seed
        updateConstantsWithHashSeed(constantsPath, hashSeed);
        console.log('\n🎉 Level hashing completed successfully!');
    } else {
        console.log('\n⚠️  No level files found to process');
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    simpleHash,
    generateHashSeed,
    generateLevelFilename,
    processLevelFiles,
    updateConstantsWithHashSeed
}; 