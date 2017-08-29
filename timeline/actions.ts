import { IPipe } from '../pipe/pipe.interface';
import { Potentiality } from './potentiality.interface';

export class AddPotentiality {
  constructor(public potentiality: Potentiality) {}
}

export class InitTimeline {
  constructor(public pipes: IPipe[]) {}
}

export class UpdateTimeline {
  constructor(
    public pipe: IPipe,
  ) {}
}

export type PipelineAction = AddPotentiality | UpdateTimeline | InitTimeline;
