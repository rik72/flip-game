#!/usr/bin/env node

/**
 * Watch and Concatenate Script
 * Watches source files and automatically runs concatenation when they change
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Files to watch (same as in build-concatenated.js)
const WATCH_FILES = [
    'constants.js',
    'utils.js',
    'html-builder.js',
    'display-manager.js',
    'managers/storage-manager.js',
    'managers/sound-manager.js',
    'managers/game-manager.js',
    'app.js',
    'app-bridge.js',
    'src/editor.js'
];

let isConcatenating = false;
let pendingConcatenation = false;

function runConcatenation() {
    if (isConcatenating) {
        pendingConcatenation = true;
        return;
    }
    
    isConcatenating = true;
    console.log('🔄 Source files changed, running concatenation...');
    
    exec('npm run concat', (error, stdout, stderr) => {
        isConcatenating = false;
        
        if (error) {
            console.error('❌ Concatenation failed:', error);
            return;
        }
        
        console.log('✅ Concatenation completed');
        
        if (pendingConcatenation) {
            pendingConcatenation = false;
            setTimeout(runConcatenation, 100);
        }
    });
}

function watchFiles() {
    console.log('👀 Watching source files for changes...');
    console.log('📁 Files being watched:');
    WATCH_FILES.forEach(file => console.log(`   - ${file}`));
    console.log('');
    
    WATCH_FILES.forEach(filePath => {
        const fullPath = path.resolve(__dirname, '..', filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Warning: File not found: ${filePath}`);
            return;
        }
        
        fs.watch(fullPath, (eventType, filename) => {
            if (eventType === 'change') {
                console.log(`📝 ${filePath} changed`);
                runConcatenation();
            }
        });
    });
}

// Run if called directly
if (require.main === module) {
    watchFiles();
}

module.exports = { watchFiles, WATCH_FILES }; 