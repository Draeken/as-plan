import { async } from 'rxjs/scheduler/async';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/observeOn';

import PlanningState from './PlanningState';
import PlanAgent from './PlanAgent';
import { PushPlans } from './actions';
import { EnvironmentInspection } from './environment-inspection';

const noop = () => {};

export default class Coordinator {
  constructor(pState: PlanningState, eis: EnvironmentInspection) {
    eis.newCollision
      .withLatestFrom(pState.planAgents)
      .observeOn(async)
      .subscribe(
        ([_, agents]: [boolean, PlanAgent[]]) => {
          // console.log('test :3');
          const actions = agents
            .map(agent => agent.requestAction(eis))
            .filter(action => action.length > 0)
            .reduce((acc, cur) => acc.concat(cur), []);
          pState.actions.next(new PushPlans(actions));
        },
        noop, () => {
          // console.log('finish!');
        });
  }


}
