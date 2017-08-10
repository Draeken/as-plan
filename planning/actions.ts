import { PlanAgentInit, BoundName } from './plan.interface';

export class PushPlan {
  constructor(public power: number, public planName: string, public bound: BoundName) {}
}

export class InitPlan {
  constructor(public newPlan: PlanAgentInit) {}
}

export class SplitPlan {
  constructor(
    public legacyName: string,
    public newPlans: PlanAgentInit[],
  ) {}
}

export type PlanningAction = PushPlan | InitPlan | SplitPlan;
