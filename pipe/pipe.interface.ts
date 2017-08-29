import { Chunk } from '../timeline/chunk.interface';

export interface IPipe {
  isEligible(): boolean;
  place(timeline: any): void;
}
