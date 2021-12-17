const LogCollectionManager = require('./dist/logCol');
const fs = require('fs');
const text = fs.readFileSync('./logs.txt', { encoding: 'utf-8' });

const tribeLogColManager = new LogCollectionManager.default(100);
console.log(tribeLogColManager)
tribeLogColManager.applyLogText(text);
console.log(tribeLogColManager.ValidLogs);
// fs.writeFileSync('results.json', JSON.stringify(index.default(text)));