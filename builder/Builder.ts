import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';

import asLogger from '../asLogger';
import { Query } from '../queries/query.interface';
import PlanningState from '../planning/PlanningState';
import Coordinator from '../planning/Coordinator';
import { IPlanAgent } from '../planning/plan.interface';
import { EnvironmentManager, EnvConfig } from './environment-manager.class';


export default class Builder {
  eConfig: EnvConfig = { minTime: 0, maxTime: 48 };

  constructor() {
    asLogger.info('constructed !');
  }

  build(queries: Query[]): Observable<IPlanAgent[]> {
    const planningState = new PlanningState([]);
    const coordinator = new Coordinator(planningState);
    queries.map(query =>
        new EnvironmentManager(this.eConfig, query, planningState));
    return planningState.finalPlanAgents;
  }
}
