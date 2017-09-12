import {} from 'jest';

import Builder from '../builder/Builder';
import { Query } from '../queries/query.interface';
import { QueryKind, GoalKind, RestrictionCondition } from '../queries/query.enum';
import { Potentiality, Material } from '../timeline/potentiality.interface';

let builder: Builder;

const getHours = (num: number) => num * 3600 * 1000;

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
    builder.build(queries).subscribe((planning: Material[]) => {
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
    builder.build(queries).subscribe((planning: Material[]) => {
      expect(planning).toHaveLength(1);
      const plan = planning[0];

      done();
    });
  });

  it.only('should handle multiple queries', (done) => {
    expect.assertions(1);
    const queries: Query[] = [{
      name: 'sleep',
      goal: { kind: GoalKind.Atomic, quantity: 1, time: getHours(24) },
      duration: { min: getHours(1.5), target: getHours(9) },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.OutRange, ranges: [[10, 20]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'work',
      goal: { kind: GoalKind.Atomic, quantity: 1, time: getHours(24) },
      duration: { target: getHours(10) },
      timeRestrictions: {
        hour: {
          condition: RestrictionCondition.InRange,
          ranges: [[7.5, 19.5]],
        },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'diner',
      goal: { kind: GoalKind.Atomic, quantity: 1, time: getHours(24) },
      duration: { target: getHours(0.5) },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'side project',
      goal: { kind: GoalKind.Splittable, quantity: getHours(1.5), time: getHours(24) },
      timeRestrictions: {
        hour: {
          condition: RestrictionCondition.OutRange, ranges: [[0, 5]],
        },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'reading',
      goal: { kind: GoalKind.Splittable, quantity: getHours(0.5), time: getHours(24) },
      kind: QueryKind.Placeholder,
    }];
    builder.build(queries).subscribe((planning: Material[]) => {
      expect(planning).toHaveLength(9);
      done();
    });
  });
});
