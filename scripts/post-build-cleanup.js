#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Post-build cleanup script
 * Empties LEVEL_HASH_SEED in constants.js after build completion
 */

function cleanupConstants() {
  const constantsPath = path.join(__dirname, '..', 'constants.js');
  
  try {
    // Read the constants file
    let content = fs.readFileSync(constantsPath, 'utf8');
    
    // Check if LEVEL_HASH_SEED is already empty
    const currentMatch = content.match(/LEVEL_HASH_SEED:\s*['"`]([^'"`]*)['"`]/);
    
    if (currentMatch && currentMatch[1] === '') {
      console.log('✅ LEVEL_HASH_SEED is already empty in constants.js');
      return;
    }
    
    // Replace LEVEL_HASH_SEED with empty string
    const updatedContent = content.replace(
      /LEVEL_HASH_SEED:\s*['"`][^'"`]*['"`]/,
      "LEVEL_HASH_SEED: ''"
    );
    
    // Write back to file
    fs.writeFileSync(constantsPath, updatedContent, 'utf8');
    
    console.log('✅ LEVEL_HASH_SEED emptied in constants.js');
    
  } catch (error) {
    console.error('❌ Error cleaning up constants.js:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupConstants();
}

module.exports = { cleanupConstants }; 