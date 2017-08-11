import { PlanAgentInit, BoundName } from './plan.interface';

export interface PushInfo {
  power: number;
  targetName: string;
  bound: BoundName;
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
