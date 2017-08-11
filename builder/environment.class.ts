import PlanningState from '../planning/PlanningState';
import { InitPlans } from '../planning/actions';
import { PlanAgentInit } from '../planning/plan.interface';
import { Query } from '../queries/query.interface';
import { RestrictionCondition } from '../queries/query.enum';

export class Environment {
  private zones: { start: number, end: number}[] = [];

  constructor(init: PlanAgentInit, query: Query, private pState: PlanningState) {
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
    this.pState.actions.next(
      new InitPlans(
        this.zones.map(
          zone =>
            ({
              start: zone.start,
              end: zone.end,
              name: `${init.name}#${zone.start}#${zone.end}`,
            }))));
  }
}
