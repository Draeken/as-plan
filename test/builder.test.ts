import {  } from 'jest';

import Builder from '../builder/Builder';
import { Query } from '../queries/query.interface';
import { QueryKind, GoalKind, RestrictionCondition } from '../queries/query.enum';
import { Chunk } from '../timeline/chunk.interface';

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
    builder.build(queries).subscribe((planning: Chunk[]) => {
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
    builder.build(queries).subscribe((planning: Chunk[]) => {
      expect(planning).toHaveLength(1);
      const plan = planning[0];
      expect(plan.task).toBeTruthy();
      expect(plan.task ? plan.task.children : []).toHaveLength(0);
      expect(plan.start).toBe(0);
      expect(plan.end).toBe(2);
      expect(plan.task ? plan.task.name : false).toBe('test');
      done();
    });
  });

  it('should handle multiple queries', (done) => {
    expect.assertions(1);
    const queries: Query[] = [{
      name: 'sleep',
      goal: { kind: GoalKind.Atomic, quantity: 1, time: 24 },
      duration: { min: 1.5, target: 9 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.OutRange, ranges: [[10, 20]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'work',
      goal: { kind: GoalKind.Atomic, quantity: 1, time: 24 },
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
      goal: { kind: GoalKind.Atomic, quantity: 1, time: 24 },
      duration: { target: 0.5 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'side project',
      goal: { kind: GoalKind.Splittable, quantity: 2, time: 48, maximize: true },
      timeRestrictions: {
        hour: {
          condition: RestrictionCondition.OutRange, ranges: [[0, 5]],
        },
      },
      duration: { min: 0.5 },
      kind: QueryKind.Placeholder,
    }, {
      name: 'reading',
      goal: { kind: GoalKind.Splittable, quantity: 0.5, time: 24 },
      duration: { min: 0.01 },
      kind: QueryKind.Placeholder,
    }];
    builder.build(queries).subscribe((planning: Chunk[]) => {
      expect(planning).toHaveLength(11);
      done();
    });
  });
});
