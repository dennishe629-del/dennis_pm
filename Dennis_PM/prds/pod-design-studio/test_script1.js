const fs = require('fs');
const content = fs.readFileSync('ShipSage_POD_Design_Studio_Demo_v1.html', 'utf8');

// Extract first script content
const firstScriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (firstScriptMatch) {
  const scriptContent = firstScriptMatch[1];
  
  // Try to find syntax errors by parsing
  try {
    // Remove comments and strings to make brace matching easier
    let simplified = scriptContent
      .replace(/\/\/.*$/gm, '')  // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')  // Replace strings
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")  // Replace strings
      .replace(/`(?:[^`\\]|\\.)*`/g, '``'); // Replace template literals
    
    // Count braces in simplified version
    let depth = 0;
    let maxDepth = 0;
    let lineNum = 1;
    let charIndex = 0;
    
    for (const char of simplified) {
      if (char === '\n') lineNum++;
      if (char === '{') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === '}') {
        depth--;
        if (depth < 0) {
          console.log('ERROR: Extra closing brace at line ~' + lineNum);
          // Show context
          const lines = scriptContent.split('\n');
          console.log('Context:');
          for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 2); i++) {
            console.log((i+1) + ': ' + lines[i].substring(0, 100));
          }
          depth = 0; // Reset
        }
      }
      charIndex++;
    }
    
    if (depth > 0) {
      console.log('WARNING: ' + depth + ' unclosed braces at end of script');
    } else if (depth === 0) {
      console.log('Braces are balanced!');
    }
    
  } catch (e) {
    console.log('Error during analysis:', e.message);
  }
}
