import { PlanAgentInit, Direction } from './plan.interface';

export interface PushInfo {
  power: number;
  targetName: string;
  bound: Direction;
}

export class PushPlans {
  constructor(public pushInfos: PushInfo[]) {}
}

export class InitPlans {
  constructor(public newPlans: PlanAgentInit[]) {}
}

export class SplitPlan {
  constructor(
    public legacyName: string,
    public newPlans: PlanAgentInit[],
  ) {}
}

export type PlanningAction = PushPlans | InitPlans | SplitPlan;
