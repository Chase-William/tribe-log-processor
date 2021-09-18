const logger = require('./dist/logger');
const fs = require('fs');
const text = fs.readFileSync('./logs.txt', { encoding: 'utf-8' });
const phrases= JSON.parse(
  fs.readFileSync('./phrases.json', {
    encoding: 'utf-8',
  })
);
logger.default(text, phrases);