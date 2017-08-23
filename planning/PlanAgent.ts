import { PushInfo } from './actions';
import { IPlanAgent, Direction, PlanAgentInit } from './plan.interface';
import { EnvironmentInspection } from './environment-inspection';
import { IEnvironment } from '../builder/environment.interface';

export default class PlanAgent implements IPlanAgent {
  readonly initStart: number;
  readonly initEnd: number;
  readonly start: number;
  readonly end: number;
  readonly name: string;
  readonly environment: IEnvironment;
  private satisfaction: number = 1;


  constructor(
    { start, end, name, environment }: PlanAgentInit,
  ) {
    this.start = start;
    this.initStart = start;
    this.end = end;
    this.initEnd = end;
    this.name = name;
    this.environment = environment;
  }

  pushMe(bound: Direction, power: number): PlanAgentInit {
    console.log(bound, power);
    if (power > this.resistance) {
      return {
        start: this.pushBound(this.start, 1, bound),
        end: this.pushBound(this.end, 1, bound),
        name: this.name,
        environment: this.environment,
      };
    }
    return {
      start: this.start,
      end: this.end,
      name: this.name,
      environment: this.environment,
    };
  }

  private pushBound(bound: number, quantity: number, dir: Direction): number {
    const factor = dir === Direction.Right ? -1 : 1;
    return this.clamp(bound + factor * quantity, this.initStart, this.initEnd);
  }

  private clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  getSatisfaction(): number {
    return this.satisfaction;
  }

  getEnvironment(): IEnvironment {
    return this.environment;
  }

  requestAction(eis: EnvironmentInspection): PushInfo[] {
    this.satisfaction = this.environment.computeSatisfaction(this);
    return eis
      .getCollisions({ start: this.start, name: this.name, end: this.end })
      .map(planInfo => ({ ...planInfo, power: this.power }));
  }

  private get power(): number {
    return 1 - this.satisfaction;
  }

  private get resistance(): number {
    return 1 - this.satisfaction;
  }
}
