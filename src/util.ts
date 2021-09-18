import XRegExp from 'xregexp';
import TribeLog from './tribeLog';

/*
  This constant helps remove small useless strings only containing jibberish.
  These small strings usually occur when \n is falsely detected.
*/
const MIN_CHARACTER_THRESHOLD = 3;

function getCharToNum(character: string): string {
  // OoQIiLlJjBSsZz
  switch (character) {
    case 'O':
    case 'o':
    case 'Q': // 0
      return '0';
    case 'I':
    case 'i':
    case 'L':
    case 'l':
    case 'J':
    case 'j': // 1
      return '1';
    case 'B': // 8
      return '8';
    case 'S':
    case 's': // 5
      return '5';
    case 'Z':
    case 'z': // 2
      return '2';
    default:
      return character;
    // throw new Error(
    //   'Character not support for string to number conversion within patchStringsToNumbers?!?'
    // );
  }
}

export default function patchStringsToNumbers(toBeNumber: string): number {
  let cleaned = '';
  // TODO create a better implementation... a lot of unnessesary checks in getCharToNum calls...
  // eslint-disable-next-line no-plusplus
  for (let charIndex = 0; charIndex < toBeNumber.length; charIndex++) {
    cleaned += getCharToNum(toBeNumber[charIndex]);
  }
  return parseInt(cleaned, 10);
}

/**
 * Finds the following with some level of flexibility:
 * 'Day' or 'Dav' -- OCR makes mistakes
 * '00000' Number of days and is also the current day
 * '00' Hour
 * '00' Minute
 * '00' Second
 */
const date = XRegExp(
  `([Dayv]{3})[^^]{1,5}(?<day>[OoQIiLlJjBSsZz0-9]{5})[^^]{1,2}(?<hour>[OoQIiLlJjBSsZz0-9]{2})[^^]{0,2}(?<minute>[OoQIiLlJjBSsZz0-9]{2})[^^]{0,2}(?<second>[OoQIiLlJjBSsZz0-9]{2})`
);

export function getTimeRelatedInfoFromLogs(logs: string[]): TribeLog[] {
  const regexLogs: TribeLog[] = [];
  let match: RegExpExecArray;
  let contentString: string;
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < logs.length; index++) {
    match = date.exec(logs[index]);
    if (match?.length === 6) {
      if (logs[index][match[0].length] === ':') {
        contentString = logs[index].substring(match[0].length + 1);
      } else {
        contentString = logs[index].substring(match[0].length);
      }

      regexLogs.push(
        new TribeLog(
          contentString.trim(),
          patchStringsToNumbers(match[2]),
          patchStringsToNumbers(match[3]),
          patchStringsToNumbers(match[4]),
          patchStringsToNumbers(match[5])
        )
      );
    } else {
      console.log(`Log Index: ${index} was invalid: ${logs[index]}`);
    }
  }
  return regexLogs;
}

/**
 * Breaks a blob of text into individual lines via \n and then some cleaning thresholds.
 * @param tribeLogText Input blob of text.
 * @returns Individual lines of text that should be logs.
 */
export function divideIntoIndividualLogs(tribeLogText: string): string[] {
  const clumpOfLogs: string[] = tribeLogText.split('\n');
  const refinedLogs: string[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < clumpOfLogs.length; i++) {
    if (
      clumpOfLogs[i] !== '' && // Remove empty strings
      clumpOfLogs[i].length > MIN_CHARACTER_THRESHOLD // Remove small strings (usually jibberish)
    ) {
      // Using Day | Dav presence to tell us when to insert new or append
      if (
        clumpOfLogs[i].startsWith('Day') ||
        clumpOfLogs[i].startsWith('Dav') // Required because this is an often miss-spelling
      ) {
        // Move valid lines into new array
        refinedLogs.push(clumpOfLogs[i]);
      } else {
        // eslint-disable-next-line no-continue
        if (refinedLogs.length === 0) continue; // No index out of bounds
        refinedLogs[refinedLogs.length - 1] += clumpOfLogs[i];
      }
    }
  }

  return refinedLogs;
}
