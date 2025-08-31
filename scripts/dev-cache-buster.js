#!/usr/bin/env node

/**
 * Development Cache Buster Script
 * 
 * This script helps with development by providing utilities to:
 * 1. Clear browser cache for level files
 * 2. Force reload of specific levels
 * 3. Test level loading without caching issues
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

/**
 * Check if we're in development mode by reading constants.js
 */
function checkDevelopmentMode() {
    try {
        const constantsPath = path.join(__dirname, '..', 'constants.js');
        const constantsContent = fs.readFileSync(constantsPath, 'utf8');
        
        // Check if LEVEL_HASH_SEED is empty (development mode)
        const hashSeedMatch = constantsContent.match(/LEVEL_HASH_SEED:\s*['"`]([^'"`]*)['"`]/);
        if (hashSeedMatch && hashSeedMatch[1] === '') {
            logSuccess('Development mode detected (LEVEL_HASH_SEED is empty)');
            return true;
        } else {
            logWarning('Production mode detected (LEVEL_HASH_SEED is set)');
            return false;
        }
    } catch (error) {
        logError(`Failed to check development mode: ${error.message}`);
        return false;
    }
}

/**
 * List all available level files
 */
function listLevelFiles() {
    try {
        const levelsDir = path.join(__dirname, '..', 'levels');
        const files = fs.readdirSync(levelsDir)
            .filter(file => file.endsWith('.json'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/level_(\d+)/)?.[1] || '0');
                const numB = parseInt(b.match(/level_(\d+)/)?.[1] || '0');
                return numA - numB;
            });
        
        logInfo(`Found ${files.length} level files:`);
        files.forEach(file => {
            const levelNum = file.match(/level_(\d+)/)?.[1];
            log(`  Level ${levelNum}: ${file}`, 'cyan');
        });
        
        return files;
    } catch (error) {
        logError(`Failed to list level files: ${error.message}`);
        return [];
    }
}

/**
 * Validate a specific level file
 */
function validateLevelFile(levelNumber) {
    try {
        const levelPath = path.join(__dirname, '..', 'levels', `level_${levelNumber}.json`);
        
        if (!fs.existsSync(levelPath)) {
            logError(`Level file not found: level_${levelNumber}.json`);
            return false;
        }
        
        const levelContent = fs.readFileSync(levelPath, 'utf8');
        const levelData = JSON.parse(levelContent);
        
        // Basic validation
        if (!levelData.board) {
            logError(`Level ${levelNumber}: Missing 'board' property`);
            return false;
        }
        
        if (!levelData.board.front) {
            logError(`Level ${levelNumber}: Missing 'board.front' property`);
            return false;
        }
        
        if (!Array.isArray(levelData.board.front)) {
            logError(`Level ${levelNumber}: 'board.front' should be an array`);
            return false;
        }
        
        logSuccess(`Level ${levelNumber} is valid`);
        logInfo(`Board size: ${levelData.board.front.length}x${levelData.board.front[0]?.split(' ').length || 0}`);
        
        return true;
    } catch (error) {
        logError(`Failed to validate level ${levelNumber}: ${error.message}`);
        return false;
    }
}

/**
 * Generate cache-busting URL for testing
 */
function generateTestUrl(levelNumber) {
    const timestamp = Date.now();
    const baseUrl = `http://localhost:8080`; // Adjust port as needed
    const url = `${baseUrl}/?level=${levelNumber}&t=${timestamp}`;
    
    logInfo(`Cache-busting test URL for level ${levelNumber}:`);
    log(url, 'cyan');
    
    return url;
}

/**
 * Show usage instructions
 */
function showUsage() {
    log('Development Cache Buster - Usage:', 'bright');
    log('');
    log('Commands:', 'yellow');
    log('  node scripts/dev-cache-buster.js check     - Check development mode');
    log('  node scripts/dev-cache-buster.js list      - List all level files');
    log('  node scripts/dev-cache-buster.js validate <level> - Validate specific level');
    log('  node scripts/dev-cache-buster.js test <level>     - Generate test URL for level');
    log('  node scripts/dev-cache-buster.js help      - Show this help');
    log('');
    log('Examples:', 'yellow');
    log('  node scripts/dev-cache-buster.js validate 5');
    log('  node scripts/dev-cache-buster.js test 3');
    log('');
    log('Tips for development:', 'green');
    log('  1. Use ?level=X URL parameter to test specific levels');
    log('  2. Add &t=timestamp to force cache refresh');
    log('  3. Use browser dev tools to disable cache');
    log('  4. Hard refresh (Ctrl+F5 / Cmd+Shift+R) to clear cache');
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'check':
            checkDevelopmentMode();
            break;
            
        case 'list':
            listLevelFiles();
            break;
            
        case 'validate':
            const levelToValidate = args[1];
            if (!levelToValidate) {
                logError('Please specify a level number');
                log('Usage: node scripts/dev-cache-buster.js validate <level>');
                process.exit(1);
            }
            validateLevelFile(levelToValidate);
            break;
            
        case 'test':
            const levelToTest = args[1];
            if (!levelToTest) {
                logError('Please specify a level number');
                log('Usage: node scripts/dev-cache-buster.js test <level>');
                process.exit(1);
            }
            generateTestUrl(levelToTest);
            break;
            
        case 'help':
        case '--help':
        case '-h':
        default:
            showUsage();
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    checkDevelopmentMode,
    listLevelFiles,
    validateLevelFile,
    generateTestUrl
}; 