import getValidLogsFrom, { LogType } from './index';
import TribeLog, { OccurrenceType } from './tribeLog';

/**
 * A LogCollection class manages the existing logs and new logs integration. It stores
 * unqiue logs and will weed out redundent logs using timestamps to create a normalized collection.
 */
export default class LogCollectionManager {
  MIN_COL_SIZE = 75;

  /**
   * Contains all the valid logs up to the length specified in the contructor.
   * The term `valid` means the logs have a timestamp and have a known meaning.
   */
  ValidLogs = new Map<string, TribeLog>();

  /**
   * Initializes a new instance of the LogCollectionManger class.
   * @param maxValidLen Max length of the *validLogs* collection.
   * @param maxInvalidLen Max length of the *invalidLogs* collection.
   * @param maxNotSupportedLen Max length of the *notSupportedLogs* collection.
   */
  constructor(maxValidLen: number) {
    if (maxValidLen < this.MIN_COL_SIZE) {
      throw new Error("A specified length for a collection inside LogCollectionManager was below the min value.");
    }    
  }

  /**
   * Gets and then applies the logs from the text to the correct collection.
   * @param logText Blob of text to be used as the tribe log source.
   */
  applyLogText(logText: string): void {
    this.applyLogs(getValidLogsFrom(logText));
  }

  /**
   * Applies the tribe logs given to the correct collection.
   * @param logs Tribe logs to be applied to the correct collection.
   */
  applyLogs(logs: TribeLog[]): void {    
    let log: TribeLog;
    for(let logIndex = 0; logIndex < logs.length; logIndex++) {
      log = logs[logIndex];
      if (logs[logIndex].logType > LogType.NotSupported) {
        // Only process this log if it hasn't already been accounted for
        if (!this.ValidLogs.has(log.getTribeLogID())) {
          // Check the log's nearbly logs to see if the time of this logic makes sense
          if (this.logFitsTimeContext(log, logIndex, logs))
            this.applyValidLog(log); // Apply
        }
      }
    }
  }

  /**
   * Checks to see if the timestamp on this log makes sense according to the ones around it.
   * @param log Log to be compared with.
   * @param index Index of the log.
   * @param srcCol Collection of logs that will be used as the context.
   * @returns True if the given log matches its context, false otherwise.
   */
  logFitsTimeContext(log: TribeLog, index: number, srcCol: TribeLog[]): boolean {
    let prev = OccurrenceType.SameTime; // should be 1 or 0
    let next = OccurrenceType.SameTime; // should be -1 or 0
    if (index - 1 > 0) {
      prev = log.compareDateTo(srcCol[index - 1]);
    }
    if (index + 1 < srcCol.length) {
      next = log.compareDateTo(srcCol[index + 1])
    }    
    if (
        prev === OccurrenceType.SameTime || // Happened at the sametime as the previous
        next === OccurrenceType.SameTime || // Happened at the sametime as the next
        // (Descending order) make sure the previous log happened after this and the next happened before        
        (prev === OccurrenceType.After && next === OccurrenceType.Before)
      )
      return true;    
    return false;    
  }

  /**
   * Applies a valid log to the existing *validLogs* collection.
   * @param log Log to be added.
   */
  applyValidLog(log: TribeLog): void {    
    this.ValidLogs.set(log.getTribeLogID(), log);
  }
}