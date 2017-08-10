import { IPlanAgent, BoundName, PlanAgentInit } from './plan.interface';

export default class PlanAgent implements IPlanAgent {
  readonly start: number;
  readonly end: number;
  readonly name: string;

  constructor({ start, end, name }: PlanAgentInit) {
    this.start = start;
    this.end = end;
    this.name = name;
  }

  pushMe(bound: BoundName, power: number): PlanAgentInit {
    return this;
  }
}
