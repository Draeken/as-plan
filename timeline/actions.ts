import { IPipe } from '../pipe/pipe.interface';
import { Potentiality } from './potentiality.interface';

export class AddPotentialities {
  constructor(public potentialities: Potentiality[]) {}
}

export class Materialize {
  constructor(public name: string, public potentialities: Potentiality[]) {}
}

export class InitTimeline {
  constructor(public pipes: IPipe[]) {}
}

export class UpdateTimeline {
  constructor(
    public pipe: IPipe,
  ) {}
}

export type PipelineAction = AddPotentialities | UpdateTimeline | InitTimeline | Materialize;
