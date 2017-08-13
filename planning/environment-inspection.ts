import PlanningState from './PlanningState';
import { BoundName } from './plan.interface';
import * as Actions from './actions';

interface PlanInfo {
  planName: string;
  bound: BoundName;
}

interface Node {
  time: number;
  agents: PlanInfo[];
}

export class EnvironmentInspection {
  private collisionGraph: Node;

  constructor(pState: PlanningState) {
    pState.actions.subscribe(this.buildCollisionGraph.bind(this));
  }

  buildCollisionGraph(action: Actions.PlanningAction): void {
    if (action instanceof Actions.InitPlans) {
      this.handleInitPlan(action);
    } else if (action instanceof Actions.PushPlans) {
      this.handlePushPlan(action);
    } else if (action instanceof Actions.SplitPlan) {
      this.handleSplitPlan(action);
    }
  }

  private handleInitPlan(action: Actions.InitPlans): void {

  }

  private handlePushPlan(action: Actions.PushPlans): void {

  }

  private handleSplitPlan(action: Actions.SplitPlan): void {

  }
}