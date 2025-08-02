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
        this.appJsPath = 'app.js';
    }

    validateCodeCompliance() {
        console.log('🔍 Validating Hall of Fame code compliance...\n');
        
        if (!fs.existsSync(this.appJsPath)) {
            this.addViolation('CRITICAL', 'app.js file not found');
            return false;
        }

        const code = fs.readFileSync(this.appJsPath, 'utf8');
        
        this.validateArchitecture(code);
        this.validateZeroDuplication(code);
        this.validateUtilityUsage(code);
        this.validateConstants(code);
        this.validatePatterns(code);
        
        this.reportResults();
        return this.violations.length === 0;
    }

    validateArchitecture(code) {
        console.log('🏗️  Checking architecture compliance...');
        
        // Check class loading order
        const expectedOrder = ['CONSTANTS', 'Utils', 'ModalManager', 'HtmlBuilder', 'DisplayManager', 'HallOfFameApp'];
        const classPattern = /class\s+(\w+)/g;
        const foundClasses = [];
        let match;
        
        while ((match = classPattern.exec(code)) !== null) {
            foundClasses.push(match[1]);
        }
        
        // Check if CONSTANTS exists
        if (!code.includes('const CONSTANTS = {')) {
            this.addViolation('CRITICAL', 'CONSTANTS object not found');
        }
        
        // Check if all required classes exist
        expectedOrder.slice(1).forEach(className => {
            if (!foundClasses.includes(className)) {
                this.addViolation('CRITICAL', `Missing required class: ${className}`);
            }
        });
        
        console.log('   ✓ Architecture validation complete');
    }

    validateZeroDuplication(code) {
        console.log('🚫 Checking for code duplications...');
        
        // Check for hardcoded alert messages
        const alertPattern = /alert\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
        let alertMatch;
        const hardcodedAlerts = [];
        
        while ((alertMatch = alertPattern.exec(code)) !== null) {
            hardcodedAlerts.push(alertMatch[1]);
        }
        
        if (hardcodedAlerts.length > 0) {
            this.addViolation('HIGH', `Found ${hardcodedAlerts.length} hardcoded alert messages: ${hardcodedAlerts.join(', ')}`);
        }
        
        // Check for duplicated validation patterns
        const validatePatterns = [
            /if\s*\(\s*!name\s*\)\s*{[^}]*alert/g,
            /if\s*\(\s*.*\.some\s*\([^)]*name\.toLowerCase/g
        ];
        
        validatePatterns.forEach((pattern, index) => {
            const matches = code.match(pattern);
            if (matches && matches.length > 1) {
                this.addViolation('MEDIUM', `Found duplicated validation pattern ${index + 1}: ${matches.length} occurrences`);
            }
        });
        
        console.log('   ✓ Duplication validation complete');
    }

    validateUtilityUsage(code) {
        console.log('🔧 Checking utility class usage...');
        
        // Check if Utils.validateName is used for validations
        if (code.includes('if (!name)') && !code.includes('Utils.validateName')) {
            this.addWarning('Should use Utils.validateName() instead of manual validation');
        }
        
        // Check if ModalManager.setupModal is used
        if (code.includes('new bootstrap.Modal') && !code.includes('ModalManager.setupModal')) {
            this.addWarning('Should use ModalManager.setupModal() for modal management');
        }
        
        // Check if HtmlBuilder is used for common elements
        if (code.includes('<button class="btn') && !code.includes('HtmlBuilder.createButton')) {
            this.addWarning('Consider using HtmlBuilder.createButton() for buttons');
        }
        
        console.log('   ✓ Utility usage validation complete');
    }

    validateConstants(code) {
        console.log('📋 Checking CONSTANTS usage...');
        
        // Check if CONSTANTS structure is proper
        const requiredSections = ['MESSAGES', 'MODAL_TYPES', 'POSITION_POINTS', 'GAME_TYPE_LABELS'];
        
        requiredSections.forEach(section => {
            if (!code.includes(`${section}:`)) {
                this.addViolation('MEDIUM', `Missing required CONSTANTS section: ${section}`);
            }
        });
        
        console.log('   ✓ CONSTANTS validation complete');
    }

    validatePatterns(code) {
        console.log('🎯 Checking pattern compliance...');
        
        // Check for proper error handling
        if (!code.includes('try {') || !code.includes('Utils.validateName')) {
            this.addWarning('Ensure proper error handling with try-catch for validations');
        }
        
        // Check for consistent naming
        const functionPattern = /function\s+(\w+)/g;
        let funcMatch;
        
        while ((funcMatch = functionPattern.exec(code)) !== null) {
            const funcName = funcMatch[1];
            if (funcName.includes('Modal') && !funcName.includes('show') && !funcName.includes('setup')) {
                this.addWarning(`Function ${funcName} should follow modal naming conventions`);
            }
        }
        
        console.log('   ✓ Pattern validation complete');
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