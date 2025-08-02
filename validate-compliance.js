#!/usr/bin/env node

/**
 * Hall of Fame - Compliance Validation Script
 * 
 * This script validates that code changes follow the established
 * architectural rules and patterns defined in .ai-development-rules.md
 */

const fs = require('fs');
const path = require('path');

class ComplianceValidator {
    constructor() {
        this.violations = [];
        this.warnings = [];
        this.moduleFiles = {
            constants: 'constants.js',
            utils: 'utils.js',
            modalManager: 'modal-manager.js',
            htmlBuilder: 'html-builder.js',
            displayManager: 'display-manager.js',
            hallOfFame: 'hall-of-fame.js',
            appBridge: 'app-bridge.js'
        };
    }

    validateCodeCompliance() {
        console.log('🔍 Validating Hall of Fame code compliance...\n');
        
        // Check all required files exist
        for (const [module, file] of Object.entries(this.moduleFiles)) {
            if (!fs.existsSync(file)) {
                this.addViolation('CRITICAL', `${file} file not found`);
                return false;
            }
        }

        // Read all module files
        const moduleContents = {};
        for (const [module, file] of Object.entries(this.moduleFiles)) {
            moduleContents[module] = fs.readFileSync(file, 'utf8');
        }
        
        this.validateArchitecture(moduleContents);
        this.validateZeroDuplication(moduleContents);
        this.validateUtilityUsage(moduleContents);
        this.validateConstants(moduleContents);
        this.validatePatterns(moduleContents);
        this.validateModuleSeparation(moduleContents);
        
        this.reportResults();
        return this.violations.length === 0;
    }

    validateArchitecture(moduleContents) {
        console.log('🏗️  Checking architecture compliance...');
        
        // Check if CONSTANTS exists in constants.js
        if (!moduleContents.constants.includes('const CONSTANTS = {')) {
            this.addViolation('CRITICAL', 'CONSTANTS object not found in constants.js');
        }

        // Check required classes exist in their respective files
        const requiredClasses = {
            utils: 'class Utils',
            modalManager: 'class ModalManager',
            htmlBuilder: 'class HtmlBuilder',
            displayManager: 'class DisplayManager',
            hallOfFame: 'class HallOfFameApp'
        };

        for (const [module, className] of Object.entries(requiredClasses)) {
            if (!moduleContents[module].includes(className)) {
                this.addViolation('CRITICAL', `Missing ${className} in ${this.moduleFiles[module]}`);
            }
        }

        // app.js has been removed as it was redundant after modularization
        
        console.log('   ✓ Architecture validation complete');
    }

    validateZeroDuplication(moduleContents) {
        console.log('🚫 Checking for code duplications...');
        
        // Check for hardcoded alert messages across all files
        let totalHardcodedAlerts = 0;
        for (const [module, content] of Object.entries(moduleContents)) {
            const alertPattern = /alert\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
            let alertMatch;
            const hardcodedAlerts = [];
            
            while ((alertMatch = alertPattern.exec(content)) !== null) {
                hardcodedAlerts.push(alertMatch[1]);
            }
            
            if (hardcodedAlerts.length > 0) {
                totalHardcodedAlerts += hardcodedAlerts.length;
                this.addViolation('HIGH', `Found ${hardcodedAlerts.length} hardcoded alert messages in ${this.moduleFiles[module]}: ${hardcodedAlerts.join(', ')}`);
            }
        }
        
        // Check for duplicated class definitions
        const classDefinitions = {};
        for (const [module, content] of Object.entries(moduleContents)) {
            const classPattern = /class\s+(\w+)/g;
            let match;
            while ((match = classPattern.exec(content)) !== null) {
                const className = match[1];
                if (classDefinitions[className]) {
                    this.addViolation('CRITICAL', `Duplicate class definition: ${className} found in both ${classDefinitions[className]} and ${this.moduleFiles[module]}`);
                } else {
                    classDefinitions[className] = this.moduleFiles[module];
                }
            }
        }
        
        console.log('   ✓ Duplication validation complete');
    }

    validateUtilityUsage(moduleContents) {
        console.log('🔧 Checking utility class usage...');
        
        // Check if Utils.validateName is used for validations across files
        for (const [module, content] of Object.entries(moduleContents)) {
            if (content.includes('if (!name)') && !content.includes('Utils.validateName')) {
                this.addWarning(`Should use Utils.validateName() instead of manual validation in ${this.moduleFiles[module]}`);
            }
        }
        
        // Check if HtmlBuilder is used for common elements
        for (const [module, content] of Object.entries(moduleContents)) {
            if (content.includes('<button class="btn') && !content.includes('HtmlBuilder.createButton')) {
                this.addWarning(`Consider using HtmlBuilder.createButton() for buttons in ${this.moduleFiles[module]}`);
            }
        }
        
        console.log('   ✓ Utility usage validation complete');
    }

    validateConstants(moduleContents) {
        console.log('📋 Checking CONSTANTS usage...');
        
        // Check if CONSTANTS structure is proper in constants.js
        const requiredSections = ['MESSAGES', 'MODAL_TYPES', 'POSITION_POINTS', 'GAME_TYPE_LABELS'];
        
        requiredSections.forEach(section => {
            if (!moduleContents.constants.includes(`${section}:`)) {
                this.addViolation('MEDIUM', `Missing required CONSTANTS section: ${section}`);
            }
        });

        // Check that CONSTANTS is not redefined in other files
        for (const [module, content] of Object.entries(moduleContents)) {
            if (module !== 'constants' && content.includes('const CONSTANTS = {')) {
                this.addViolation('HIGH', `CONSTANTS should not be redefined in ${this.moduleFiles[module]} - they are in constants.js`);
            }
        }
        
        console.log('   ✓ CONSTANTS validation complete');
    }

    validatePatterns(moduleContents) {
        console.log('🎯 Checking pattern compliance...');
        
        // Check for proper error handling in relevant files
        for (const [module, content] of Object.entries(moduleContents)) {
            if (module === 'hallOfFame' || module === 'utils') {
                if (!content.includes('try {') || !content.includes('Utils.validateName')) {
                    this.addWarning(`Ensure proper error handling with try-catch for validations in ${this.moduleFiles[module]}`);
                }
            }
        }
        
        console.log('   ✓ Pattern validation complete');
    }

    validateModuleSeparation(moduleContents) {
        console.log('📦 Checking module separation...');

        // Check that each module contains only its expected content
        const moduleExpectations = {
            constants: ['const CONSTANTS'],
            utils: ['class Utils'],
            modalManager: ['class ModalManager'],
            htmlBuilder: ['class HtmlBuilder'],
            displayManager: ['class DisplayManager'],
            hallOfFame: ['class HallOfFameApp'],
            appBridge: ['let app', 'document.addEventListener', 'function showSection']
        };

        for (const [module, expectations] of Object.entries(moduleExpectations)) {
            const content = moduleContents[module];
            for (const expectation of expectations) {
                if (!content.includes(expectation)) {
                    this.addViolation('MEDIUM', `${this.moduleFiles[module]} should contain: ${expectation}`);
                }
            }
        }

        // Check file sizes are reasonable (not too large)
        for (const [module, file] of Object.entries(this.moduleFiles)) {
            const stats = fs.statSync(file);
            const sizeKB = Math.round(stats.size / 1024);
            
            if (module === 'hallOfFame' && sizeKB > 50) {
                this.addWarning(`${file} is quite large (${sizeKB}KB) - consider further modularization`);
            } else if (module !== 'hallOfFame' && sizeKB > 20) {
                this.addWarning(`${file} is larger than expected (${sizeKB}KB) for a utility module`);
            }
        }

        console.log('   ✓ Module separation validation complete');
    }

    addViolation(level, message) {
        this.violations.push({ level, message });
    }

    addWarning(message) {
        this.warnings.push(message);
    }

    reportResults() {
        console.log('\n📊 COMPLIANCE REPORT');
        console.log('========================');
        
        if (this.violations.length === 0) {
            console.log('✅ ALL COMPLIANCE CHECKS PASSED!');
        } else {
            console.log('❌ COMPLIANCE VIOLATIONS FOUND:');
            this.violations.forEach((violation, index) => {
                console.log(`   ${index + 1}. [${violation.level}] ${violation.message}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }

        console.log('\n📁 Module Structure:');
        for (const [module, file] of Object.entries(this.moduleFiles)) {
            const stats = fs.statSync(file);
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`   ${file}: ${sizeKB}KB`);
        }
        
        console.log('\n📚 For detailed rules, see:');
        console.log('   - .ai-context.md');
        console.log('   - .ai-development-rules.md');
        console.log('   - CODE_INSTRUCTIONS.md');
        
        console.log(`\n🎯 Score: ${this.violations.length === 0 ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
    }
}

// Run validation if script is executed directly
if (require.main === module) {
    const validator = new ComplianceValidator();
    const isCompliant = validator.validateCodeCompliance();
    process.exit(isCompliant ? 0 : 1);
}

module.exports = ComplianceValidator; 