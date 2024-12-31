const { resolve } = require('path');
const { existsSync } = require('fs');

const filePath = resolve(__dirname, './application.json');

console.log('Testing Metro File Resolver...');
console.log(`Resolved Path: ${filePath}`);
console.log('File Exists:', existsSync(filePath));
