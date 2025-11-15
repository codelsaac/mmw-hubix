#!/usr/bin/env node

/**
 * Quality Check Script for MMW Hubix
 * Runs essential checks to ensure code quality before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MMW Hubix Quality Check Starting...\n');

const checks = [
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    critical: true
  },
  {
    name: 'Production Build',
    command: 'npx next build',
    critical: true
  }
];

// Optional checks (non-critical)
const optionalChecks = [
  {
    name: 'ESLint Check',
    command: 'npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 5',
    critical: false
  }
];

let allPassed = true;
const results = [];

// Run critical checks
for (const check of checks) {
  console.log(`🔍 Running: ${check.name}...`);
  
  try {
    execSync(check.command, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${check.name}: PASSED\n`);
    results.push({ name: check.name, status: 'PASSED', critical: check.critical });
  } catch (error) {
    console.log(`❌ ${check.name}: FAILED`);
    console.log(`Error: ${error.message}\n`);
    results.push({ name: check.name, status: 'FAILED', critical: check.critical, error: error.message });
    
    if (check.critical) {
      allPassed = false;
    }
  }
}

// Run optional checks
console.log('🔍 Running Optional Checks...\n');
for (const check of optionalChecks) {
  console.log(`🔍 Running: ${check.name}...`);
  
  try {
    execSync(check.command, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${check.name}: PASSED\n`);
    results.push({ name: check.name, status: 'PASSED', critical: check.critical });
  } catch (error) {
    console.log(`⚠️  ${check.name}: FAILED (Non-critical)`);
    console.log(`Note: ${error.message}\n`);
    results.push({ name: check.name, status: 'FAILED', critical: check.critical, error: error.message });
  }
}

// Check for common issues
console.log('🔍 Running Additional Checks...\n');

// Check for function exports in API routes
const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  const apiFiles = getAllFiles(apiDir, '.ts');
  let hasApiExports = false;
  
  for (const file of apiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('export function') && !content.includes('export async function GET') && 
        !content.includes('export async function POST') && !content.includes('export async function PATCH') &&
        !content.includes('export async function DELETE') && !content.includes('export async function PUT')) {
      console.log(`⚠️  Warning: Potential function export in API route: ${file}`);
      hasApiExports = true;
    }
  }
  
  if (!hasApiExports) {
    console.log('✅ API Route Exports: No problematic exports found');
  }
}

// Check for missing error handling
console.log('✅ Error Handling: Manual review recommended');

// Summary
console.log('\n📊 Quality Check Summary:');
console.log('========================');

results.forEach(result => {
  const status = result.status === 'PASSED' ? '✅' : '❌';
  const critical = result.critical ? ' (CRITICAL)' : '';
  console.log(`${status} ${result.name}${critical}`);
});

if (allPassed) {
  console.log('\n🎉 All critical checks passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('\n🚨 Critical checks failed! Please fix issues before deployment.');
  process.exit(1);
}

function getAllFiles(dir, ext) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}
