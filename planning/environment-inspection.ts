import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import PlanningState from './PlanningState';
import { SplitInfo, SplitPlans } from './actions';
import { Direction, Plan, PlanAgentInit, IPlanAgent } from './plan.interface';

interface PlanInfo {
  targetName: string;
  bound: Direction;
}

interface Node {
  time: number;
  agents: PlanInfo[];
}

export class EnvironmentInspection {
  private newCollisionsEvent: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private collisions: Node[];

  constructor(private pState: PlanningState) {
    pState.planAgents.subscribe(this.buildCollisions.bind(this));
  }

  getCollisions(plan: Plan): PlanInfo[] {
    return this.collisions
      .slice(
        this.collisions.findIndex(node => node.time === plan.start),
        1 + this.collisions.findIndex(node => node.time === plan.end))
      .map((node, i, arr) => {
        if (i > 0 && i < arr.length - 1) { return node.agents; }
        return node.agents.filter(a => a.targetName !== plan.name);
      })
      .reduce((acc, cur) => acc.concat(cur), []);
  }

  get newCollision() {
    return this.newCollisionsEvent.filter(v => v) as Observable<boolean>;
  }

  private buildCollisions(agents: IPlanAgent[]): void {
    const splitInfos = this.checkForSplitable(agents);
    if (splitInfos.length > 0) {
      return this.pState.actions.next(new SplitPlans(splitInfos));
    }
    this.collisions = agents
      .map(this.planToNode)
      .reduce(this.reduceNodes, [])
      .sort((a, b) => a.time - b.time);
    this.newCollisionsEvent.next(true);
  }

  private checkForSplitable(agents: IPlanAgent[]): SplitInfo[] {
    const result = [...agents];
    return <SplitInfo[]>result
      .sort((a, b) => a.start - b.start)
      .map((agent, i, arr) => {
        let nextI = i + 1;
        const cuts = [];
        while (nextI < arr.length && arr[nextI].start < agent.end) {
          if (arr[nextI].end < agent.end) {
            cuts.push(this.middlePoint(arr[nextI]));
          }
          nextI += 1;
        }
        if (!cuts.length) { return undefined; }
        const environment = agent.getEnvironment();
        const newPlans: PlanAgentInit[] = [{
          environment,
          name: `${agent.name}:splitInit`,
          start: agent.start,
          end: <number>cuts.shift(),
        }];
        cuts.forEach((cut, i) => newPlans.push({
          environment,
          name: `${agent.name}:split${i}`,
          start: newPlans[i].end,
          end: cut,
        }));
        newPlans.push({
          environment,
          name: `${agent.name}:splitFinal`,
          start: newPlans[newPlans.length - 1].end,
          end: agent.end,
        });
        // console.log('cuts: ', ...newPlans.map(p => `${p.name}: ${p.start} - ${p.end}`));
        return { newPlans, legacyName: agent.name };
      }).filter(info => info !== undefined);
  }

  private middlePoint(plan: IPlanAgent): number {
    return plan.start + (plan.end - plan.start) / 2;
  }

  private reduceNodes(acc: Node[], cur: [Node, Node]): Node[] {
    const result = [...acc];
    cur.forEach((curNode) => {
      const simNode = result.find(node => node.time === curNode.time);
      if (simNode) {
        simNode.agents.push(...curNode.agents);
      } else {
        result.push(curNode);
      }
    });
    return result;
  }

  private planToNode(plan: IPlanAgent): Node[] {
    return [{
      time: plan.start,
      agents: [{ targetName: plan.name, bound: Direction.Left }],
    }, {
      time: plan.end,
      agents: [{ targetName: plan.name, bound: Direction.Right }],
    }];
  }
}
