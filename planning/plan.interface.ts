import { IEnvironment } from '../builder/environment.interface';

export interface Plan {
  readonly name: string;
  readonly start: number;
  readonly end: number;
  readonly children?: Plan[];
}

export interface PlanAgentInit {
  readonly name: string;
  readonly start: number;
  readonly end: number;
  readonly environment: IEnvironment;
}

export enum Direction {
  Right,
  Left,
}

export interface IPlanAgent extends Plan {
  pushMe(direction: Direction, power: number): PlanAgentInit;
  getSatisfaction(): number;
  getEnvironment(): IEnvironment;
}
