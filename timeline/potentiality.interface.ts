import { IPipe } from '../pipe/pipe.interface';

export interface Potentiality {
  start: number;
  end: number;
  pipe: IPipe;
  name: string;
}
