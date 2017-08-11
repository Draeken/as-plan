export interface Plan {
  readonly name: string;
  readonly start: number;
  readonly end: number;
  readonly children: Plan[];
}

export interface PlanAgentInit {
  readonly name: string;
  readonly start: number;
  readonly end: number;
}

export enum BoundName {
  Right,
  Left,
}

export interface IPlanAgent extends PlanAgentInit {
  pushMe(bound: BoundName, power: number): PlanAgentInit;
  getSatisfaction(): number;
}
