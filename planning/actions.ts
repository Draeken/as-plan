import { PlanAgentInit, Direction } from './plan.interface';

export interface PushInfo {
  power: number;
  targetName: string;
  bound: Direction;
}

export interface SplitInfo {
  legacyName: string;
  newPlans: PlanAgentInit[];
}

export class PushPlans {
  constructor(public pushInfos: PushInfo[]) {}
}

export class InitPlans {
  constructor(public newPlans: PlanAgentInit[]) {}
}

export class SplitPlans {
  constructor(public splitInfos: SplitInfo[]) {}
}

export type PlanningAction = PushPlans | InitPlans | SplitPlans;
