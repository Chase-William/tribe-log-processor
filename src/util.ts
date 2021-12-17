import XRegExp from 'xregexp';
import TribeLog from './tribeLog';

/*
  This constant helps remove small useless strings only containing jibberish.
  These small strings usually occur when \n is falsely detected.
*/
const MIN_CHARACTER_THRESHOLD = 3;
const DIGIT_ZERO_CODE = 48;
const DIGIT_NINE_CODE = 57;
const IN_GAME_DAY_INDEX = 2;
const IN_GAME_HOUR_DAY_INDEX = 3;
const IN_GAME_MINUTE_DAY_INDEX = 4;
const IN_GAME_SECOND_DAY_INDEX = 5;

/**
 * Patches a character to the corresponding string representation of the number. Will
 * return null if the patch fails! Make sure not to pass already valid characters!
 * @param character To be patched to a string representation of the related number.
 * @returns Patched version of the given character.
 */
function tryPatchCharToNum(character: string): string {
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
      return null;
  }
}

/**
 * Patches a given string by replacing letters that are commonly miss-matched with
 * specific numbers. 
 * @param characters String that may contain letters that should be numbers.
 * @returns Number that is the result after possible patching operations.
 */
export default function tryPatchStringToNumber(characters: string): number {
  let character = '';
  let cleaned = '';
  let charCode = -1;
  for (let charIndex = 0; charIndex < characters.length; charIndex++) {
    charCode = characters.charCodeAt(charIndex);
    // Only perform a patch attempt on invalid characters, not within (0 - 9 inclusive)
    if (charCode < DIGIT_ZERO_CODE || charCode > DIGIT_NINE_CODE)
    {
      character = tryPatchCharToNum(characters[charIndex]);
      if (character === null) // Null indicates a patch failure
        return null; // This is critical so return immediately
      cleaned += character;
    }
    else
      cleaned += characters[charIndex];
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

/**
 * Creates TribeLog objects that pass time base validation.
 * @param logs Log lines that will be processed.
 * @returns Array of TribeLog objects that passed time related validations.
 */
export function getTimeInfoFromLogs(logs: string[]): TribeLog[] {
  const regexLogs: TribeLog[] = [];
  let match: RegExpExecArray;
  let contentString: string;
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < logs.length; index++) {
    match = date.exec(logs[index]); // Match the date    
    if (match?.length === 6) {
      // Ark log dates are terminated with a colon and a white space ': ', 
      // hence we can omit it from being saved into the content if it exist
      if (logs[index][match[0].length] === ':') {
        contentString = logs[index].substring(match[0].length + 2);
      } else {
        contentString = logs[index].substring(match[0].length);
      }
      // Create new tribe logs and add them to the tribe log array
      // Also make sure to patch any numbers that got mixed up for letters in the
      // optical character recognition
      const inGameDay = tryPatchStringToNumber(match[IN_GAME_DAY_INDEX]);
      if (inGameDay === null || inGameDay < 0)
        continue; // Next iteration if day failed to be patched
      const inGameHour = tryPatchStringToNumber(match[IN_GAME_HOUR_DAY_INDEX]);
      if (inGameHour === null || inGameHour < 0 || inGameHour > 23)
        continue; // Next iteration if the hour failed to be patched
      const inGameMinute = tryPatchStringToNumber(match[IN_GAME_MINUTE_DAY_INDEX]);
      if (inGameMinute === null || inGameMinute < 0 || inGameMinute > 59)
        continue; // Next iteration if the minute failed to be patched
      const inGameSecond = tryPatchStringToNumber(match[IN_GAME_SECOND_DAY_INDEX]);
      if (inGameSecond === null || inGameSecond < 0 || inGameSecond > 59)
        continue; // Next iteration if the second failed to patched

      regexLogs.push(
        new TribeLog(
          contentString.trim(),
          inGameDay,
          inGameHour,
          inGameMinute,
          inGameSecond
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
export function splitLogs(tribeLogText: string): string[] {
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
        if (refinedLogs.length != 0) // Prevent index out of bounds
          refinedLogs[refinedLogs.length - 1] += clumpOfLogs[i];
      }
    }
  }

  return refinedLogs;
}
