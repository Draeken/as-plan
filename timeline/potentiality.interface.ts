import { IPipe } from '../pipe/pipe.interface';

export interface Potentiality {
  start: number;
  end: number;
  pipe: IPipe;
  name: string;
  potentiel: number;
}

export interface Material {
  start: Date;
  end: Date;
  name: string;
}
