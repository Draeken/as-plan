import { GoalKind, QueryKind, RestrictionCondition } from './query.enum';

export interface Goal {
  kind: GoalKind;
  quantity: number;
  time: number;
  // timeBetween?: TimeBoundary;
}

export interface TimeBoundary {
  min?: number;
  target?: number;
  max?: number;
}


export interface TimeRestriction {
  condition: RestrictionCondition;
  ranges: [number, number][];
}

export interface TimeRestrictions {
  hour?: TimeRestriction;
  weekday?: TimeRestriction;
  month?: TimeRestriction;
}

export interface Query {
  name: string;
  kind: QueryKind;
  duration?: TimeBoundary;
  start?: TimeBoundary;
  end?: TimeBoundary;
  goal?: Goal;
  timeRestrictions?: TimeRestrictions;
}
