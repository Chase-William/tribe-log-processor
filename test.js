const LogCollectionManager = require('./dist/index');
const fs = require('fs');
const text = fs.readFileSync('./logs.txt', { encoding: 'utf-8' });

const tribeLogColManager = new LogCollectionManager.default(100);
tribeLogColManager.applyLogText(text);
console.log(tribeLogColManager.ValidLogs);
// fs.writeFileSync('results.json', JSON.stringify(tribeLogColManager.ValidLogs));