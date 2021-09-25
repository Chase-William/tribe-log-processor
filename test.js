const logCol = require('./dist/logCol');
const fs = require('fs');
const text = fs.readFileSync('./logs.txt', { encoding: 'utf-8' });

const logManager = new logCol.default(100, 100, 100);
logManager.applyLogText(text);
// fs.writeFileSync('results.json', JSON.stringify(logger.default(text)));