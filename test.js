const logger = require('./dist/logger');
const fs = require('fs');
const text = fs.readFileSync('./logs.txt', { encoding: 'utf-8' });

fs.writeFileSync('results.json', JSON.stringify(logger.default(text)));