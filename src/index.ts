import TribeLog from './tribeLog';
import { getValidLogsFrom, LogType, logFitsTimeContext } from "./util";

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
    let tribeLogID;
    for(let logIndex = 0; logIndex < logs.length; logIndex++) {
      log = logs[logIndex];
      if (logs[logIndex].logType > LogType.NotSupported) {
        // Only process this log if it hasn't already been accounted for
        tribeLogID = log.getTribeLogID();
        if (!this.ValidLogs.has(tribeLogID)) {
          // Check the log's nearbly logs to see if the time of this logic makes sense
          if (logFitsTimeContext(log, logIndex, logs))          
            this.ValidLogs.set(tribeLogID, log); // Apply valid log to map
        }
      }
    }
  }  
}