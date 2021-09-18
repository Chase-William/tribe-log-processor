import { Phraseable } from 'fuzzy-phrase-classifier';

export default class TribeLog implements Phraseable {
  text: string = '';

  score = 0;

  bestFitPhrase = '';

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
