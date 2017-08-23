import { Task } from './task.interface';

export interface Chunk {
  start: number;
  end: number;
  startPressure: number;
  endPressure: number;
  pressure: number;
  task?: Task;
}
