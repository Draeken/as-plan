import {  } from 'jest';

import Builder from '../builder/Builder';
import { Query } from '../queries/query.interface';
import { QueryKind, GoalKind, RestrictionCondition } from '../queries/query.enum';
import { Plan } from '../planning/plan.interface';

let builder: Builder;

beforeEach(() => {
  builder = new Builder();
});

describe('builder', () => {
  it('should create', () => {
    expect(builder).toBeTruthy();
  });

  it('should return an observable of planning', (done) => {
    expect.assertions(1);
    const queries: Query[] = [];
    builder.build(queries).subscribe((planning: Plan[]) => {
      expect(Array.isArray(planning)).toBeTruthy();
      done();
    });
  });

  it('should handle 1 atomic query with start/end target', (done) => {
    expect.assertions(1);
    const queries: Query[] = [{
      name: 'test',
      start: { target: 0 },
      end: { target: 2 },
      kind: QueryKind.Atomic,
    }];
    builder.build(queries).subscribe((planning: Plan[]) => {
      expect(planning).toHaveLength(1);
      const plan = planning[0];
      expect(plan.children).toHaveLength(0);
      expect(plan.start).toBe(0);
      expect(plan.end).toBe(2);
      expect(plan.name).toBe('test');
      done();
    });
  });

  it('should handle multiple queries', (done) => {
    expect.assertions(1);
    const queries: Query[] = [{
      name: 'sleep',
      goal: { kind: GoalKind.Discrete, quantity: 1, minutes: 24 },
      duration: { min: 1.5, target: 9 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.OutRange, ranges: [[10, 20]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'work',
      goal: { kind: GoalKind.Discrete, quantity: 1, minutes: 24 },
      duration: { target: 10 },
      timeRestrictions: {
        hour: {
          condition: RestrictionCondition.InRange,
          ranges: [[7.5, 19.5]],
        },
        weekday: {
          condition: RestrictionCondition.InRange,
          ranges: [[0, 1]],
        },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'diner',
      goal: { kind: GoalKind.Discrete, quantity: 1, minutes: 24 },
      duration: { target: 0.5 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'side project',
      goal: { kind: GoalKind.Continuous, quantity: 2, minutes: 48, maximize: true },
      timeRestrictions: {
        hour: {
          condition: RestrictionCondition.OutRange, ranges: [[0, 5]],
        },
      },
      duration: { min: 0.5 },
      kind: QueryKind.Placeholder,
    }, {
      name: 'reading',
      goal: { kind: GoalKind.Continuous, quantity: 0.5, minutes: 24 },
      duration: { min: 0.01 },
      kind: QueryKind.Placeholder,
    }];
    builder.build(queries).subscribe((planning: Plan[]) => {
      expect(planning).toHaveLength(11);      
      done();
    });
  });
});
