#!/usr/bin/env node

/**
 * Test script for level hashing system
 * Verifies that the hashing functions work correctly
 */

const { simpleHash, generateHashSeed, generateLevelFilename } = require('./level-hasher');
const fs = require('fs');
const path = require('path');

function testHashing() {
    console.log('🧪 Testing level hashing system...\n');
    
    // Test 1: Simple hash function
    console.log('Test 1: Simple hash function');
    const testInputs = ['test1', 'test2', 'level_1', 'level_2'];
    testInputs.forEach(input => {
        const hash = simpleHash(input);
        console.log(`  "${input}" → "${hash}" (length: ${hash.length})`);
        if (hash.length !== 6) {
            console.error(`  ❌ Hash length should be 6, got ${hash.length}`);
        }
        if (!/^[a-z0-9]{6}$/.test(hash)) {
            console.error(`  ❌ Hash should only contain lowercase letters and numbers`);
        }
    });
    console.log('');
    
    // Test 2: Level filename generation
    console.log('Test 2: Level filename generation');
    const testSeed = 'abc123';
    for (let i = 1; i <= 10; i++) {
        const filename = generateLevelFilename(i, testSeed);
        console.log(`  Level ${i.toString().padStart(2)} → "${filename}"`);
        if (!filename.startsWith(`level_${i}_`)) {
            console.error(`  ❌ Filename should start with "level_${i}_"`);
        }
        if (!filename.endsWith('.json')) {
            console.error(`  ❌ Filename should end with ".json"`);
        }
    }
    
    // Test 2b: Different seeds should produce different hashes
    console.log('\nTest 2b: Hash distribution with different seeds');
    const seeds = ['abc123', 'def456', 'ghi789', 'xyz999'];
    seeds.forEach(seed => {
        const filename = generateLevelFilename(1, seed);
        console.log(`  Seed "${seed}" → "${filename}"`);
    });
    console.log('');
    
    // Test 3: Hash seed generation (if levels directory exists)
    const levelsDir = path.resolve(__dirname, '..', 'levels');
    if (fs.existsSync(levelsDir)) {
        console.log('Test 3: Hash seed generation');
        try {
            const hashSeed = generateHashSeed(levelsDir);
            console.log(`  Generated hash seed: "${hashSeed}" (length: ${hashSeed.length})`);
            if (hashSeed.length !== 6) {
                console.error(`  ❌ Hash seed length should be 6, got ${hashSeed.length}`);
            }
            if (!/^[a-z0-9]{6}$/.test(hashSeed)) {
                console.error(`  ❌ Hash seed should only contain lowercase letters and numbers`);
            }
        } catch (error) {
            console.error(`  ❌ Error generating hash seed: ${error.message}`);
        }
    } else {
        console.log('Test 3: Skipped (levels directory not found)');
    }
    
    console.log('\n✅ Testing completed!');
}

if (require.main === module) {
    testHashing();
} 