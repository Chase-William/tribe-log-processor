import { LogType } from "./util";

export default class TribeLog {
  text: string = '';

  logType: LogType;

  inGameDay: number;

  inGameHour: number;

  inGameMinute: number;

  inGameSecond: number;

  realLifeTimeStamp: number;

  sameTimeOccurrences: number;

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

  getTribeLogID(): string {
    return `${this.inGameDay}-${this.inGameHour}-${this.inGameMinute}-${this.inGameSecond}-${this.logType}`;
  }

  /**
   * Compares the date of the calling `TribeLog` to the other given `TribeLog`.
   * Returning -1 means the calling `TribeLog` precedes the other `TribeLog`.
   * Returning 0 means both `TribeLog`s occured at the same date and time.
   * Return 1 means the calling `TribeLog` happened after the other `TribeLog`.
   * @param other TribeLog to be compared to.
   */
  compareDateTo(other: TribeLog): OccurrenceType {
    if (this.inGameDay < other.inGameDay)
      return OccurrenceType.Before; // this happened days before
    else if (this.inGameDay > other.inGameDay)
      return OccurrenceType.After; // this happened days after
    else // this happened on the same day atleast
      if (this.inGameHour < other.inGameHour)
        return OccurrenceType.Before; // this happened hours before
      else if (this.inGameHour > other.inGameHour)
        return OccurrenceType.After; // this happened hours after
      else
        if (this.inGameMinute < other.inGameMinute)
          return OccurrenceType.Before; // this happened minutes before
        else if (this.inGameMinute > other.inGameMinute)
          return OccurrenceType.After; // this happened minutes after
        else
          if (this.inGameSecond < other.inGameSecond)
            return OccurrenceType.Before; // this happened seconds before
          else if (this.inGameSecond > other.inGameSecond)
            return OccurrenceType.After; // this happened minutes after
          else
            return OccurrenceType.SameTime; // this happened at the same time        
  }
}

export enum OccurrenceType {
  Before = -1,
  SameTime = 0,
  After = 1
}