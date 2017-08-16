import { PushInfo } from './actions';
import { IPlanAgent, Direction, PlanAgentInit } from './plan.interface';
import { EnvironmentInspection } from './environment-inspection';
import { IEnvironment } from '../builder/environment.interface';

export default class PlanAgent implements IPlanAgent {
  readonly start: number;
  readonly end: number;
  readonly name: string;
  readonly environment: IEnvironment;
  private satisfaction: number = 1;


  constructor(
    { start, end, name, environment }: PlanAgentInit,
  ) {
    this.start = start;
    this.end = end;
    this.name = name;
    this.environment = environment;
  }

  pushMe(bound: Direction, power: number): PlanAgentInit {
    console.log(bound, power);
    return {
      start: this.start,
      end: this.end,
      name: this.name,
      environment: this.environment,
    };
  }

  getSatisfaction(): number {
    return this.satisfaction;
  }

  getEnvironment(): IEnvironment {
    return this.environment;
  }

  requestAction(eis: EnvironmentInspection): PushInfo[] {
    this.satisfaction = this.environment.computeSatisfaction(this.name);
    return eis
      .getCollisions({ start: this.start, name: this.name, end: this.end })
      .map(planInfo => ({ ...planInfo, power: this.power }));
  }

  private get power(): number {
    return this.satisfaction;
  }

  private get resistance(): number {
    return this.satisfaction;
  }
}
