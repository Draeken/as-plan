import { IEnvironment } from './environment.interface';
import PlanningState from '../planning/PlanningState';
import { InitPlans, PlanningAction, SplitPlans } from '../planning/actions';
import { Plan } from '../planning/plan.interface';
import { Query } from '../queries/query.interface';
import { RestrictionCondition } from '../queries/query.enum';

interface Zone {
  start: number;
  end: number;
  name: string;
}

export class Environment implements IEnvironment {
  private zones: Zone[] = [];

  constructor(private init: Plan, query: Query, private pState: PlanningState) {
    if (query.timeRestrictions && query.timeRestrictions.hour) {
      const restrictions = query.timeRestrictions.hour;
      if (restrictions.condition === RestrictionCondition.InRange) {
        this.zones.push(
          ...restrictions.ranges.map(
            ([start, end]: [number, number]) =>
              ({
                start: start + init.start,
                end: end + init.start,
                name: this.nameZone(start + init.start, end + init.start),
              }),
            ),
          );
      }
    } else {
      this.zones.push({
        start: init.start,
        end: init.end,
        name: this.nameZone(init.start, init.end),
      });
    }
    this.pState.actions.next(
      new InitPlans(this.zones.map(zone => ({ ...zone, environment: this }))),
    );
    // EnvironmentInspection will trigger split action
    // Environment will react to this to update internal store.
    this.pState.actions.subscribe(this.handleSplit.bind(this));
  }

  get zonesNames(): string[] {
    return this.zones.map(z => z.name);
  }

  private nameZone(start: number, end: number): string {
    return `${this.init.name}#${start}#${end}`;
  }

  private handleSplit(action: PlanningAction): void {
    if (!(action instanceof SplitPlans)) { return; }
    action.splitInfos.forEach((info) => {
      const zoneI = this.zones.findIndex(z => z.name === info.legacyName);
      if (zoneI === -1) { return; }
      this.zones.splice(zoneI, 1, ...info.newPlans.map(p => ({ ...p })));
    });
  }
}
