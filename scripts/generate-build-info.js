#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateBuildInfo() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const shortTimestamp = now.toISOString().slice(0, 16).replace('T', ' ');
    
    let gitCommit = 'unknown';
    let gitBranch = 'unknown';
    let version = '1.0.0'; // fallback
    
    try {
        gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
        gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
        
        // Try to get the latest git tag
        try {
            const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8', stdio: 'pipe' }).trim();
            if (latestTag) {
                version = latestTag.replace(/^v/, ''); // Remove 'v' prefix if present
            }
        } catch (tagError) {
            console.warn('No git tags found, using fallback version');
            // Fallback to package.json version if no tags exist
            try {
                version = require('../package.json').version || '1.0.0';
            } catch (pkgError) {
                console.warn('Package.json not found, using default version');
            }
        }
    } catch (error) {
        console.warn('Git info not available:', error.message);
    }
    
    const buildType = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    
    // Convert timestamp to katakana sequence (limited to 4 characters)
    const currentTime = Date.now();
    const katakanaChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    let katakanaSequence = '';
    let tempTimestamp = currentTime;
    
    // Generate katakana sequence
    while (tempTimestamp > 0 && katakanaSequence.length < 4) {
        const index = tempTimestamp % katakanaChars.length;
        katakanaSequence = katakanaChars[index] + katakanaSequence;
        tempTimestamp = Math.floor(tempTimestamp / katakanaChars.length);
    }
    
    // Pad with leading katakana if less than 4 characters
    while (katakanaSequence.length < 4) {
        katakanaSequence = katakanaChars[0] + katakanaSequence;
    }
    
    const buildId = `${gitCommit}-${katakanaSequence}`;
    
    const buildInfo = {
        timestamp,
        shortTimestamp,
        gitCommit,
        gitBranch,
        buildType,
        buildId,
        version
    };
    
    // Create build info as both JSON and JS module
    const buildInfoDir = path.join(__dirname, '../src');
    
    // Ensure directory exists
    if (!fs.existsSync(buildInfoDir)) {
        fs.mkdirSync(buildInfoDir, { recursive: true });
    }
    
    // Write JSON file
    fs.writeFileSync(
        path.join(buildInfoDir, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
    );
    
    // Write JS module
    const jsContent = `// Auto-generated build info - do not edit
export const BUILD_INFO = ${JSON.stringify(buildInfo, null, 2)};
`;
    
    fs.writeFileSync(
        path.join(buildInfoDir, 'build-info.js'),
        jsContent
    );
    
    console.log(`✅ Build info generated: ${buildId} (${shortTimestamp}) v${version}`);
    
    return buildInfo;
}

if (require.main === module) {
    generateBuildInfo();
}

module.exports = { generateBuildInfo }; 