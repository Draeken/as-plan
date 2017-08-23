import { IPipe } from './pipe.interface';

export class InitTimeline {
  constructor(public pipes: IPipe[]) {}
}

export class UpdateTimeline {
  constructor(
    public pipe: IPipe,
  ) {}
}

export type TimelineAction = UpdateTimeline | InitTimeline;
