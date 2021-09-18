import { applyBestFitForAll, Phrase } from "fuzzy-phrase-classifier";
import TribeLog from "./tribeLog";
import { divideIntoIndividualLogs, getTimeRelatedInfoFromLogs } from "./util";
import fs from 'fs';

export default function getValidLogsFrom(logText: string, phrases: Phrase[]) {
  const tribeLogs: TribeLog[] = getTimeRelatedInfoFromLogs(
    divideIntoIndividualLogs(logText)
  );  

  applyBestFitForAll(tribeLogs, phrases);

  fs.writeFileSync('tribe_logs.json', JSON.stringify(tribeLogs));
}
