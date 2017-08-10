import { IPlanAgent, BoundName, PlanAgentInit } from './plan.interface';

export default class PlanAgent implements IPlanAgent {
  constructor(readonly name: string, private _start: number, private _end: number) {}

  get start() { return this._start; }
  get end() { return this._end; }

  pushMe(bound: BoundName, power: number): PlanAgentInit {
    return this;
  }
}
