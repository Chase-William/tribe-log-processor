import TribeLog from "./tribeLog";
import { splitLogs, getTimeInfoFromLogs } from "./util";

import XRegExp from "xregexp";

export enum LogType {
  Invalid = -2,
  NotSupported = -1,  
  EnemyEntityKilled = 0,
  StructureDestroyedByEnemy,
  DinoStarvedToDeath,
  FriendlyLivingEntityKilled,
  AutoDecayDestroyed
}

export default function getValidLogsFrom(logText: string): TribeLog[] {
  const tribeLogs: TribeLog[] = getTimeInfoFromLogs(
    splitLogs(logText)
  );

  let str = '';
  let currentLog: TribeLog;
  let logType: LogType;
  // At each TribeLog we want get and determine the type of log aka what it means
  for (const log of tribeLogs) {
    currentLog = log;
    str = currentLog.text.trim();
    let match = XRegExp('(?i)^(.?[YyVv]{1}[0Oo]{1}ur)').exec(str);
    if (match !== null) { // Starts with "your" or "Your" or "Vour"      
      str = str.substring(match[0].length).trimStart();      
      match = XRegExp('(?i)(Tribe Killed)').exec(str);
      if (match !== null) { // After 5 character offset, starts with case insensitive "Tribe killed"        
        str = str.substring(match[0].length).trimStart();
        logType = LogType.EnemyEntityKilled; 
      } else { // Starts with matches failed, now try ends with
        match = XRegExp('(?i)(was destroyed.$)').exec(str);
        if (match !== null) { // Ends with "was destroyed!"
          str = str.substring(0, str.length - match[0].length).trimEnd(); 
          logType = LogType.StructureDestroyedByEnemy; 
        } else { // Does not end with "was destroyed!"
          match = XRegExp('(?i)(star?v?ed to dea?th.$)').exec(str);
          if (match !== null) { // Ends with "starved to death!"
            str = str.substring(0, str.length - match[0].length).trimEnd();
            logType = LogType.DinoStarvedToDeath;          
          } else { // Error
            match = XRegExp('(?i)(was killed.$)').exec(str);
            if (match !== null) { // Ends with "was killed!"
              str = str.substring(0, str.length - match[0].length).trimEnd();
              logType = LogType.FriendlyLivingEntityKilled;
            } else {
              match = XRegExp('(?i)(was auto-decay destroyed.$)').exec(str);
              if (match !== null) { // Ends with "auto-decay destroyed"
                str = str.substring(0, str.length - match[0].length).trimEnd();
                logType = LogType.AutoDecayDestroyed;
              } else {
                logType = LogType.Invalid;
              }              
            }
          }
        }
      }    
    } else { // Does not start with "Your"
      logType = LogType.NotSupported;
    }
    currentLog.text = str.trim();
    currentLog.logType = logType;
  }  

  return tribeLogs;
}
