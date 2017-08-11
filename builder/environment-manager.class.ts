// import { Observable } from 'rxjs/Observable';

// import PlanAgent from '../planning/PlanAgent';
import PlanningState from '../planning/PlanningState';
import { Environment } from './environment.class';
import { Query } from '../queries/query.interface';
// import { IPlanAgent } from '../planning/plan.interface';


export interface EnvConfig {
  minTime: number;
  maxTime: number;
}

export class EnvironmentManager {
  private environments: Environment[] = [];

  constructor(
    private readonly config: EnvConfig,
    private readonly query: Query,
    public readonly planningState: PlanningState,
  ) {
    if (this.query.goal) {
      const goal = this.query.goal;
      const count = Math.floor((this.config.maxTime - this.config.minTime) / goal.perTime);
      for (let i = 0; i < count; i += 1) {
        const start = i * goal.perTime;
        const end = (i + 1) * goal.perTime;
        this.environments.push(new Environment(
          {
            start,
            end,
            name: query.name,
          },
          query, planningState));
      }
    } else {
      // Add atomics
    }
  }

}
