import { LogType } from './logger';

export default class TribeLog {
  text: string = '';

  logType: LogType;

  inGameDay: number;

  inGameHour: number;

  inGameMinute: number;

  inGameSecond: number;

  realLifeTimeStamp: number;

  constructor(
    text: string,
    inGameDay: number,
    inGameHour: number,
    inGameMinute: number,
    inGameSecond: number
  ) {
    this.text = text;
    this.inGameDay = inGameDay;
    this.inGameHour = inGameHour;
    this.inGameMinute = inGameMinute;
    this.inGameSecond = inGameSecond;
    this.realLifeTimeStamp = Date.now();
  }
}
