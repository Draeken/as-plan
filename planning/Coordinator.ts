import { async } from 'rxjs/scheduler/async';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/observeOn';

import PlanningState from './PlanningState';
import PlanAgent from './PlanAgent';
import { PushPlans } from './actions';

const noop = () => {};

export default class Coordinator {
  constructor(private pState: PlanningState) {
    this.pState.planAgents
      .observeOn(async)
      .subscribe(
        (agents: PlanAgent[]) => {
          // console.log('test :3');
          const actions = agents
            .map(agent => agent.requestAction(agents))
            .filter(action => action.targetName !== '');
          pState.actions.next(new PushPlans(actions));
        },
        noop, () => {
          // console.log('finish!');
        });
  }


}
