import { PressureChunk } from '../timeline/environment.class';

export interface IPipe {
  isEligible(): boolean;
  place(name: string, env: PressureChunk[]): void;
}
