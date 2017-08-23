import { Chunk } from './chunk.interface';

export interface IPipe {
  isEligible(): boolean;
  getChunks(): Chunk[];
  place(timeline: Chunk[]): void;
}
