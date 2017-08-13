import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeLast';

import * as Action from './actions';
import { IPlanAgent } from './plan.interface';
import PlanAgent from './PlanAgent';

export default class PlanningState {
  readonly actions = new Subject<Action.PlanningAction>();

  private planAgentsChanged: Observable<IPlanAgent[]>;
  private planAgentsComplete: Observable<IPlanAgent[]>;

  constructor(initialPlanning: IPlanAgent[]) {
    this.planAgentsChanged = this.wrapIntoBehavior(
      initialPlanning, this.planningHandler(initialPlanning));
    this.planAgentsComplete = this.planAgentsChanged
      .pairwise()
      .filter(([a, b]) => {
        if (a.length !== b.length) { return false; }
        return a.every((agentA) => {
          const agentB = b.find(agent => agent.name === agentA.name);
          if (!agentB) { return false; }
          return Math.abs(agentA.getSatisfaction() - agentB.getSatisfaction()) < 0.1;
        });
      }).map(([_, b]) => b);
    this.planAgentsComplete.subscribe(
      () => {
        console.log("complete emit !");
        (<Subject<IPlanAgent[]>>this.planAgentsChanged).complete();
      });
  }

  get finalPlanAgents() {
    return this.planAgentsChanged.takeLast(1);
  }

  get planAgents() {
    return this.planAgentsChanged;
  }

private wrapIntoBehavior(initState: IPlanAgent[], obs: Observable<IPlanAgent[]>) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  return res;
}

  private planningHandler(initState: IPlanAgent[]): Observable<IPlanAgent[]> {
    return <Observable<IPlanAgent[]>>this.actions
      .scan(
        (state: IPlanAgent[], action: Action.PlanningAction) => {
          if (action instanceof Action.InitPlans) {
            return this.handleInitPlan(state, action);
          } else if (action instanceof Action.PushPlans) {
            return this.handlePushPlan(state, action);
          } else if (action instanceof Action.SplitPlan) {
            return this.handleSplitPlan(state, action);
          }
          return state;
        },
        initState);
  }

  private handleInitPlan(state: IPlanAgent[], action: Action.InitPlans): IPlanAgent[] {
    const result = [...state];
    action.newPlans.forEach((newPlan) => {
      const index = this.indexFromName(result, newPlan.name);
      if (index !== -1) {
        result.splice(index, 1);
      }
    });
    return result
      .concat(...action.newPlans.map(newPlan => new PlanAgent(newPlan)))
      .sort((a, b) => a.start - b.start);
  }

  private handlePushPlan(state: IPlanAgent[], action: Action.PushPlans): IPlanAgent[] {
    const result = [...state];
    action.pushInfos.forEach((pushInfo) => {
      const index = this.indexFromName(result, pushInfo.targetName);
      if (index === -1) { return false; }
      const plan = result[index];
      result.splice(index, 1, new PlanAgent(plan.pushMe(pushInfo.bound, pushInfo.power)));
      return true;
    });

    return result.sort((a, b) => a.start - b.start);
  }

  private handleSplitPlan(state: IPlanAgent[], action: Action.SplitPlan): IPlanAgent[] {
    const result = [...state];
    const index = this.indexFromName(result, action.legacyName);
    if (index === -1) { return state; }
    result.splice(index, 1, ...action.newPlans.map(init => new PlanAgent(init)));
    return result/*.sort((a, b) => a.start - b.start)*/;
  }

  private indexFromName(state: IPlanAgent[], name: string): number {
    return state.findIndex(plan => plan.name === name);
  }

}
