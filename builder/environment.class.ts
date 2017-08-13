import PlanningState from '../planning/PlanningState';
import { InitPlans, PlanningAction, SplitPlan } from '../planning/actions';
import { PlanAgentInit, IPlanAgent } from '../planning/plan.interface';
import { Query } from '../queries/query.interface';
import { RestrictionCondition } from '../queries/query.enum';

interface zone {
  start: number;
  end: number;
}

export class Environment {
  private zones: zone[] = [];

  constructor(private init: PlanAgentInit, query: Query, private pState: PlanningState) {
    if (query.timeRestrictions && query.timeRestrictions.hour) {
      const restrictions = query.timeRestrictions.hour;
      if (restrictions.condition === RestrictionCondition.InRange) {
        this.zones.push(
          ...restrictions.ranges.map(
            ([start, end]: [number, number]) =>
              ({ start: start + init.start, end: end + init.start }),
            ),
          );
      }
    } else {
      this.zones.push({ start: init.start, end: init.end });
    }
    // EnvironmentInspection will trigger split action
    // Environment will react to this to update internal store.
    this.pState.actions.subscribe(this.handleSplit.bind(this));
    this.pState.actions.next(
      new InitPlans(
        this.zones.map(
          zone =>
            ({
              start: zone.start,
              end: zone.end,
              name: this.nameZone(zone),
            }))));
  }

  private nameZone({ start, end }: zone): string {
    return `${this.init.name}#${start}#${end}`;
  }

  private handleSplit(action: PlanningAction): void {
    if (!(action instanceof SplitPlan)) { return; }
  }
}
