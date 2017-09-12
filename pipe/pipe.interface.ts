import { Observable } from 'rxjs/Observable';

import { PressureChunk } from '../timeline/environment.class';
import { Potentiality } from '../timeline/potentiality.interface';

export interface IPipe {
  subPipeCount(): number;
  place(name: string, env: PressureChunk[]): void;
  getPotentiel(): Observable<Potentiality[]>;
}
