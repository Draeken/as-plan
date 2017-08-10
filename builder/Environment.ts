import PlanAgent from '../planning/PlanAgent';

export default class Environment {
  private planAgents: PlanAgent[];

  constructor(
    readonly name: string,
    readonly start: number,
    readonly end: number,
  ) {
    this.planAgents.push(new PlanAgent(name, start, end));
  }

}
