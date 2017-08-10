import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';

import * as Action from './actions';
import { IPlanAgent } from './plan.interface';
import PlanAgent from './PlanAgent';

export default class PlanningState {
  readonly actions = new Subject<Action.PlanningAction>();

  private stateFn: Observable<IPlanAgent[]>;

  constructor(initialPlanning: IPlanAgent[]) {
    this.stateFn = this.wrapIntoBehavior(initialPlanning, this.planningHandler(initialPlanning));
  }

  get planAgents() {
    return this.stateFn.distinctUntilChanged();
  }

  complete() {
    (<BehaviorSubject<IPlanAgent[]>>this.stateFn).complete();
  }

  private wrapIntoBehavior(initState: IPlanAgent[], obs: Observable<IPlanAgent[]>) {
    const res = new BehaviorSubject(initState);
    obs.subscribe(s => res.next(s));
    return res;
  }

  private planningHandler(initState: IPlanAgent[]): Observable<IPlanAgent[]> {
    return <Observable<IPlanAgent[]>>this.actions
      .scan((state: IPlanAgent[], action: Action.PlanningAction) => {
        if (action instanceof Action.InitPlan) {
          return this.handleInitPlan(state, action);
        } else if (action instanceof Action.PushPlan) {
          return this.handlePushPlan(state, action);
        } else if (action instanceof Action.SplitPlan) {
          return this.handleSplitPlan(state, action);
        }
        return state;
      },    initState);
  }

  private handleInitPlan(state: IPlanAgent[], action: Action.InitPlan): IPlanAgent[] {
    return [...state, new PlanAgent(action.newPlan)];
  }

  private handlePushPlan(state: IPlanAgent[], action: Action.PushPlan): IPlanAgent[] {
    const result = [...state];
    const index = this.indexFromName(result, action.planName);
    if (index === -1) { return state; }
    const plan = result[index];
    result.splice(index, 1, new PlanAgent(plan.pushMe(action.bound, action.power)));
    return result;
  }

  private handleSplitPlan(state: IPlanAgent[], action: Action.SplitPlan): IPlanAgent[] {
    const result = [...state];
    const index = this.indexFromName(result, action.legacyName);
    if (index === -1) { return state; }
    result.splice(index, 1, ...action.newPlans.map(init => new PlanAgent(init)));
    return result;
  }

  private indexFromName(state: IPlanAgent[], name: string): number {
    return state.findIndex(plan => plan.name === name);
  }

}
