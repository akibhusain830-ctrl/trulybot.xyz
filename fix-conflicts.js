const fs = require('fs');
const path = require('path');

function fixConflictsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove merge conflict markers and keep HEAD version
    content = content.replace(/<<<<<<< HEAD\r?\n/g, '');
    content = content.replace(/=======[\s\S]*?>>>>>>> [a-f0-9]+\r?\n/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed conflicts in: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      walkDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<<<<<<<') || content.includes('=======') || content.includes('>>>>>>>')) {
        fixConflictsInFile(fullPath);
      }
    }
  }
}

console.log('Starting conflict resolution...');
walkDirectory('./src');
walkDirectory('./'); // for root files
console.log('Conflict resolution completed!');