import TribeLog from "./tribeLog";
import { divideIntoIndividualLogs, getTimeRelatedInfoFromLogs } from "./util";

import XRegExp from "xregexp";

export enum LogType {
  InvalidLog = -1,
  EnemyEntityKilled = 0,
  StructureDemolishedByEnemy,
  DinoStarvedToDeath,
  FriendlyLivingEntityKilled,
  AutoDecayDestroyed
}

export default function getValidLogsFrom(logText: string): TribeLog[] {
  const tribeLogs: TribeLog[] = getTimeRelatedInfoFromLogs(
    divideIntoIndividualLogs(logText)
  );

  let str = '';
  let currentLog: TribeLog;
  let logType: LogType;
  // At each index we want get and determine the type of log aka what it means
  for (let logIndex = 0; logIndex < tribeLogs.length; logIndex++) {
    currentLog = tribeLogs[logIndex];
    str = currentLog.text.trim();
    let match = XRegExp('(?i)^(your|Vour)').exec(str);
    console.log(str);
    console.log(match);
    if (match !== null) { // Starts with "your" or "Your" or "Vour"
      
      str = str.substring(match[0].length).trimStart();      
      match = XRegExp('(?i)(Tribe Killed)').exec(str);
      if (match !== null) { // After 5 character offset, starts with case insensitive "Tribe killed"
        console.log(match);
        str = str.substring(match[0].length).trimStart();
        logType = LogType.EnemyEntityKilled; 
      } else { // Starts with matches failed, now try ends with
        match = XRegExp('(?i)(was destroyed.$)').exec(str);
        if (match !== null) { // Ends with "was destroyed!"
          str = str.substring(0, str.length - match[0].length).trimEnd(); 
          logType = LogType.StructureDemolishedByEnemy; 
        } else { // Does not end with "was destroyed!"
          match = XRegExp('(?i)(starved to death.$)').exec(str);
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
                console.log(`Your->!was destroyed->!starved to death->!was killed->was auto-decay destroyed: ${str}`);
                logType = LogType.InvalidLog;
              }              
            }
          }
        }
      }    
    } else { // Does not start with "Your"
      console.log(`\nLog not supported: ${str}`);
      logType = LogType.InvalidLog;
    }
    currentLog.text = str.trim();
    currentLog.logType = logType;
  }  

  return tribeLogs;
}
