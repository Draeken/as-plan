import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';

import {
  PlanningAction,
  InitPlan,
  PushPlan,
  SplitPlan,
} from './actions';
import { IPlanAgent } from './plan.interface';

export default class PlanningState {
  readonly actions = new Subject<PlanningAction>();

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
      .scan((state: IPlanAgent[], action: PlanningAction) => {
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

  private handleInitPlan(state: IPlanAgent[], action: PlanningAction): IPlanAgent[] {
    return state;
  }

  private handlePushPlan(state: IPlanAgent[], action: PlanningAction): IPlanAgent[] {
    return state;
  }

  private handleSplitPlan(state: IPlanAgent[], action: PlanningAction): IPlanAgent[] {
    return state;
  }

}
