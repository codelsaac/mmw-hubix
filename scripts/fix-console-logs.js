const fs = require('fs');
const path = require('path');

// Files to exclude from console.log replacement
const excludeFiles = [
  'node_modules',
  '.git',
  '.next',
  'scripts',
  'lib/logger.ts', // Keep logger.ts as is
  'prisma/seed.ts' // Keep seed.ts as it's for development
];

// Console patterns to replace
const consolePatterns = [
  { from: /console\.log\(/g, to: 'logger.log(' },
  { from: /console\.error\(/g, to: 'logger.error(' },
  { from: /console\.warn\(/g, to: 'logger.warn(' },
  { from: /console\.info\(/g, to: 'logger.info(' }
];

function shouldExcludeFile(filePath) {
  return excludeFiles.some(exclude => filePath.includes(exclude));
}

function addLoggerImport(content) {
  // Check if logger is already imported
  if (content.includes('import { logger }')) {
    return content;
  }
  
  // Add logger import after other imports
  const importRegex = /(import.*from.*["'].*["'];?\s*\n)/g;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 0) {
    const lastImport = matches[matches.length - 1];
    const lastImportEnd = lastImport.index + lastImport[0].length;
    return content.slice(0, lastImportEnd) + 
           'import { logger } from "@/lib/logger"\n' + 
           content.slice(lastImportEnd);
  }
  
  return 'import { logger } from "@/lib/logger"\n' + content;
}

function processFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if file has console statements
    const hasConsole = /console\.(log|error|warn|info)\(/.test(content);
    if (!hasConsole) {
      return;
    }
    
    // Replace console statements
    consolePatterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    });
    
    // Add logger import if needed
    if (modified && !content.includes('import { logger }')) {
      content = addLoggerImport(content);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed console statements in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

// Start processing from workspace root
const workspaceRoot = path.join(__dirname, '..');
walkDirectory(workspaceRoot);

console.log('Console log replacement completed!');