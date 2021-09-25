import logger, { LogType } from './index';
import TribeLog, { OccurrenceType } from './tribeLog';

/**
 * A LogCollection class manages the existing logs and new logs integration. It stores
 * unqiue logs and will weed out redundent logs using timestamps to create a normalized collection.
 */
export default class LogCollectionManager {
  MIN_COL_SIZE = 75;

  /**
   * Used to provide some control over counting same time events. For example, if someone
   * blows a ton of structures up at the same time and all this text appears in the same cycle, we can group them.
   * If they appear in different cycles or calls we have no way to know if we have already documented these events 
   * since we are time based. We could try to use context of different events to improve this but that would be complex
   * and very time consuming.
   */
  #cycleCounter = 0;
  /**
   * Contains all the valid logs up to the length specified in the contructor.
   * The term `valid` means the logs have a timestamp and have a known meaning.
   */
  #validLogs = new Map<string, TribeLog>();

  /**
   * Contains all the partially valid logs that could be validiated in another execution.
   * The term `partially valid` means the logs have a timestamp but their meaning could not be determined.
   */
  #invalidLogs = new Map<string, TribeLog>();

  /**
   * Contains all the logs that were marked as unsupported.
   * The term `unsupported` means the logs have a timestamp but they didn't not match what we support.
   */
  #notSupportedLogs = new Map<string, TribeLog>();

  /**
   * Initializes a new instance of the LogCollectionManger class.
   * @param maxValidLen Max length of the *validLogs* collection.
   * @param maxInvalidLen Max length of the *invalidLogs* collection.
   * @param maxNotSupportedLen Max length of the *notSupportedLogs* collection.
   */
  constructor(maxValidLen: number, maxInvalidLen: number, maxNotSupportedLen: number) {
    if (maxValidLen < this.MIN_COL_SIZE || maxInvalidLen < this.MIN_COL_SIZE || maxNotSupportedLen < this.MIN_COL_SIZE) {
      throw new Error("A specified length for a collection inside LogCollectionManager was below the min value.");
    }    
  }

  /**
   * Gets and then applies the logs from the text to the correct collection.
   * @param logText Blob of text to be used as the tribe log source.
   */
  applyLogText(logText: string): void {
    this.applyLogs(logger(logText));
  }

  /**
   * Applies the tribe logs given to the correct collection.
   * @param logs Tribe logs to be applied to the correct collection.
   */
  applyLogs(logs: TribeLog[]): void {    
    let log: TribeLog;
    for(let logIndex = 0; logIndex < logs.length; logIndex++) {
      log = logs[logIndex];
      switch (logs[logIndex].logType) {
        case LogType.Invalid:          
        console.log("Running invalid log")
          this.applyInvalidLog(logs[logIndex]);
          break;
        case LogType.NotSupported:
          console.log("Running not supported log")
          this.applyNotSupportedLog(logs[logIndex]);
          break;
        default:
          console.log("Running valid log")
          // Increment the log occurence if this log has happened quickly multiple times at the same time.
          if (this.#validLogs.has(log.getTribeLogHash())) {
            log.sameTimeOccurrences++;
          } else {
            // Check the log's nearbly logs to see if the time of this logic makes sense
            if (this.doesLogFitItsContext(log, logIndex, logs)) {
              this.applyValidLog(log);
            } else {
              // Invalid log context here
            }
          }
          break;
      }
    }
  }

  /**
   * Checks to see if the log matches the time context before and after it.
   * @param log Log to be compared with.
   * @param index Index of the log.
   * @param srcCol Collection of logs that will be used as the context.
   * @returns True if the given log matches its context, false otherwise.
   */
  doesLogFitItsContext(log: TribeLog, index: number, srcCol: TribeLog[]): boolean {
    let comparePrevResult = OccurrenceType.SameTime; // should be 1 or 0
    let compareNextResult = OccurrenceType.SameTime; // should be -1 or 0
    if (index - 1 > 0) {
      comparePrevResult = log.compareDateTo(srcCol[index - 1]);
    }
    if (index + 1 < srcCol.length) {
      compareNextResult = log.compareDateTo(srcCol[index + 1])
    }
    // Happened at the same time as one of the nearby tribelogs
    if (comparePrevResult === OccurrenceType.SameTime || compareNextResult === OccurrenceType.SameTime)
      return true;
    // Happened after the previous and before the next tribelog
    else if (comparePrevResult ===  OccurrenceType.After && compareNextResult === OccurrenceType.Before)
      return true;
    return false;    
  }

  /**
   * Applies a valid log to the existing *validLogs* collection.
   * @param log Log to be added.
   */
  applyValidLog(log: TribeLog): void {    
    console.log(log);
  }

  /**
   * Applies a invalid log to the existing *invalidLogs* collection.
   * @param log Log to be added.
   */
  applyInvalidLog(log: TribeLog): void {

  }

  /**
   * Applies a not supported log to the *notSupportedLogs* collection.
   * @param log Log to be added.
   */
  applyNotSupportedLog(log: TribeLog): void {
  
  }
}