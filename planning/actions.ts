import Environment from '../builder/Environment';

export class PushPlan {
  constructor(public power: number, public planName: string) {}
}

export class InitPlan {
  constructor(public environment: Environment) {}
}

export class SplitPlan {
  constructor(
    public legacyName: string,
    public newNames: string[],
    public environment: Environment,
  ) {}
}

export type PlanningAction = PushPlan | InitPlan | SplitPlan;
