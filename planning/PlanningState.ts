import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';

import PlanAgent from './PlanAgent';
import {
  PlanningAction,
  InitPlan,
  PushPlan,
  SplitPlan,
} from './actions';

export default class PlanningState {
  readonly actions = new Subject<PlanningAction>();

  private stateFn: Observable<PlanAgent[]>;

  constructor(initialPlanning: PlanAgent[]) {
    this.stateFn = this.wrapIntoBehavior(initialPlanning, this.planningHandler(initialPlanning));
  }

  private wrapIntoBehavior(initState: PlanAgent[], obs: Observable<PlanAgent[]>) {
    const res = new BehaviorSubject(initState);
    obs.subscribe(s => res.next(s));
    return res;
  }

  private planningHandler(initState: PlanAgent[]): Observable<PlanAgent[]> {
    return <Observable<PlanAgent[]>>this.actions
      .scan((state: PlanAgent[], action: PlanningAction) => {
        if (action instanceof InitPlan) {
          return this.handleInitPlan(state, action);
        } else if (action instanceof PushPlan) {
          return this.handlePushPlan(state, action);
        } else if (action instanceof SplitPlan) {
          return this.handleSplitPlan(state, action);
        }
        return state;
      },    initState);
  }

  private handleInitPlan(state: PlanAgent[], action: PlanningAction): PlanAgent[] {
    return state;
  }

  private handlePushPlan(state: PlanAgent[], action: PlanningAction): PlanAgent[] {
    return state;
  }

  private handleSplitPlan(state: PlanAgent[], action: PlanningAction): PlanAgent[] {
    return state;
  }

}
