export interface Plan {
  name: string;
  start: number;
  end: number;
  children: Plan[];
}

export interface PlanAgentInit {
  name: string;
  start: number;
  end: number;
}

export enum BoundName {
  Right,
  Left,
}

export interface IPlanAgent extends PlanAgentInit {
  pushMe(bound: BoundName, power: number): PlanAgentInit;
}
