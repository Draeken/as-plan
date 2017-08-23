import { Plan } from '../planning/plan.interface';

export interface IEnvironment {
  computeSatisfaction(plan: Plan): number;
}
