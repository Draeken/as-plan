import { Observable } from 'rxjs/Observable';

import { Potentiality } from './potentiality.interface';
import { BoundConfig } from '../builder/Builder';

export interface PressureChunk {
  start: number;
  end: number;
  pressure: number;
}

interface EnvConfig extends BoundConfig {

}

interface PressurePoint {
  time: number;
  pressureDiff: number;
}

export class Environment {
  static readonly infinity = 9999;
  static isFinite = (num: number) => { return num < Environment.infinity; };

  constructor(stateFn: Observable<Potentiality[]>, private boundConfig: EnvConfig) {
    stateFn.subscribe(this.handleNewPotentialities.bind(this));
  }

  private handleNewPotentialities(pots: Potentiality[]): void {
    debugger;
    const filtered = pots.filter(p => Environment.isFinite(p.potentiel));
    if (!filtered.length) { return; }
    const toPlace = filtered.reduce((r1, r2) => r1.potentiel > r2.potentiel ? r1 : r2);
    const pressureEnv = this.computePressureEnvironment(pots);
    toPlace.pipe.place(toPlace.name, pressureEnv);
  }

  private computePressureEnvironment(pots: Potentiality[]): PressureChunk[] {
    const pressurePoints: PressurePoint[] = pots
      .map(p => [
        { time: p.start, pressureDiff: p.potentiel },
        { time: p.end, pressureDiff: -p.potentiel },
      ])
      .reduce((a, b) => a.concat(b))
      .sort((a, b) => a.time - b.time);
    const result: PressureChunk[] = [];
    let chunk: PressureChunk = {
      start: this.boundConfig.startMin,
      end: this.boundConfig.endMax,
      pressure: 0,
    };
    pressurePoints.forEach((pp) => {
      const newPressure = chunk.pressure += pp.pressureDiff;
      if (chunk.start === pp.time) {
        chunk.pressure = newPressure;
        return;
      }
      chunk.end = pp.time;
      result.push({ ...chunk });
      chunk = {
        start: pp.time,
        pressure: newPressure,
        end: this.boundConfig.endMax,
      };
    });

    return result;
  }
}
