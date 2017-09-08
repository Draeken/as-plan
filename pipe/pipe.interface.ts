import { PressureChunk } from '../timeline/environment.class';

export interface IPipe {
  subPipeCount(): number;
  place(name: string, env: PressureChunk[]): void;
}
