import { PushInfo } from './actions';
import { IPlanAgent, Direction, PlanAgentInit } from './plan.interface';

export default class PlanAgent implements IPlanAgent {
  readonly start: number;
  readonly end: number;
  readonly name: string;

  constructor(
    { start, end, name }: PlanAgentInit,
  ) {
    this.start = start;
    this.end = end;
    this.name = name;
  }

  pushMe(bound: Direction, power: number): PlanAgentInit {
    return {
      start: this.start,
      end: this.end,
      name: this.name,
    };
  }

  getSatisfaction(): number {
    return 1;
  }

  requestAction(planning: IPlanAgent[]): PushInfo {
    const agent = planning.filter(p => p !== this)[0];
    if (!agent) {
      return false;
    }
    const action: PushInfo = { bound: 0, targetName: agent.name, power: 1 };
    return action;
  }
}
