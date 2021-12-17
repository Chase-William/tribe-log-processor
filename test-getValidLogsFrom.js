const index = require('./dist/index');
const fs = require('fs');
const text = fs.readFileSync('./logs.txt', { encoding: 'utf-8' });

fs.writeFileSync('results.json', JSON.stringify(index.default(text)));