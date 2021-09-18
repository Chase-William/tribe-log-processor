import TribeLog from "./tribeLog";
import { divideIntoIndividualLogs, getTimeRelatedInfoFromLogs } from "./util";

import XRegExp from "xregexp";

export enum LogType {
  InvalidLog = -1,
  EnemyEntityKilled = 0,
  StructureDemolishedByEnemy,
  DinoStarvedToDeath,
}

export default function getValidLogsFrom(logText: string): TribeLog[] {
  const tribeLogs: TribeLog[] = getTimeRelatedInfoFromLogs(
    divideIntoIndividualLogs(logText)
  );

  let regex = XRegExp('([Yyour]{4,5})');

  let str = '';
  let currentLog: TribeLog;
  let logType: LogType;
  // At each index we want get and determine the type of log aka what it means
  for (let logIndex = 0; logIndex < tribeLogs.length; logIndex++) {
    currentLog = tribeLogs[logIndex];
    str = currentLog.text;
    let match = regex.exec(str);    
    if (match !== null) { // Starts with "Your"
      str = str.substring(match[0].length);      
      match = XRegExp('([Ttribe RKkilled]{13})').exec(str);
      if (match !== null) { // Starts with "Your tribe killed"
        str = str.substring(match[0].length);
        logType = LogType.EnemyEntityKilled; 
      } else { // Does not start with "Your tribe killed"
        match = XRegExp('([was destroyed!]{15}$)').exec(str);
        if (match !== null) { // Ends with "was destroyed!"
          str = str.substring(0, str.length - match[0].length); 
          logType = LogType.StructureDemolishedByEnemy; 
        } else { // Does not end with "was destroyed!"
          match = XRegExp('([starved todeath!]{12,18}$)').exec(str);
          if (match !== null) { // Ends with "starved to death!"
            str = str.substring(0, str.length - match[0].length);
            logType = LogType.DinoStarvedToDeath;          
          } else { // Error
            console.log(`Your->!was destroyed->!starved to death: ${str}`);
            logType = LogType.InvalidLog;
          }
        }
      }    
    } else { // Does not start with "Your"
      console.log(`Some other log not supported: ${str}`);
      logType = LogType.InvalidLog;
    }
    currentLog.text = str.trim();
    currentLog.logType = logType;
  }  

  return tribeLogs;
}
