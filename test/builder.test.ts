import { } from 'jest';

import Builder from '../builder/Builder';
import { Query } from '../queries/query.interface';
import { QueryKind, GoalKind, RestrictionCondition } from '../queries/query.enum';
import { IPlanAgent } from '../planning/plan.interface';

let builder: Builder;

beforeEach(() => {
  builder = new Builder();
  builder.eConfig = {
    minTime: 0,
    maxTime: 48,
  };
});

describe('builder', () => {
  it('should create', () => {
    expect(builder).toBeTruthy();
  });

  it('should return an observable of planning', (done) => {
    expect.assertions(1);
    const queries: Query[] = [];
    builder.build(queries).subscribe((agents: IPlanAgent[]) => {
      expect(Array.isArray(agents)).toBeTruthy();
      done();
    });
  });

  it('should handle a goal of 1 per day with inRange restric.', (done) => {
    expect.assertions(5);
    const queries: Query[] = [{
      name: 'test',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
    }];
    builder.build(queries).subscribe((agents: IPlanAgent[]) => {
      expect(agents).toHaveLength(2);
      expect(agents[0].start).toBeCloseTo(18);
      expect(agents[0].end).toBeCloseTo(23);
      expect(agents[1].start).toBeCloseTo(24 + 18);
      expect(agents[1].end).toBeCloseTo(24 + 23);
      done();
    });
  });

  it('should handle two goal of 1 per day with inRange restric.', (done) => {
    expect.assertions(9);
    const queries: Query[] = [{
      name: 'test1',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[8, 10]] },
      },
    },{
      name: 'test2',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
    }];
    builder.build(queries).subscribe((agents: IPlanAgent[]) => {
      expect(agents).toHaveLength(4);
      expect(agents[0].start).toBeCloseTo(8);
      expect(agents[0].end).toBeCloseTo(10);
      expect(agents[2].start).toBeCloseTo(24 + 8);
      expect(agents[2].end).toBeCloseTo(24 + 10);
      expect(agents[1].start).toBeCloseTo(18);
      expect(agents[1].end).toBeCloseTo(23);
      expect(agents[3].start).toBeCloseTo(24 + 18);
      expect(agents[3].end).toBeCloseTo(24 + 23);
      done();
    });
  });

  it('should give priority to satisfy continuous goal planAgent', (done) => {
    expect.assertions(3);
    builder.eConfig = { minTime: 0, maxTime: 10 };
    const queries: Query[] = [{
      name: 'notSatisfied',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Continuous, quantity: 8, perTime: 10 },
    }, {
      name: 'satisfied',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Continuous, quantity: 2, perTime: 10 },
    }];
    builder.build(queries).subscribe((agents: IPlanAgent[]) => {
        // Using try to avoid timeout: https://github.com/facebook/jest/issues/1873
      try {
        expect(agents).toHaveLength(2);
        const a1Duration = agents[0].end - agents[0].start;
        const a2Duration = agents[1].end - agents[1].start;
        expect(a1Duration).toBeCloseTo(8);
        expect(a2Duration).toBeCloseTo(2);
        done();
      } catch (e) { done.fail(e); }
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
    builder.build(queries).subscribe((planning: IPlanAgent[]) => {
      expect(planning).toHaveLength(1);
      const plan = planning[0];
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
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
      duration: { min: 1.5, target: 9 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.OutRange, ranges: [[10, 20]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'work',
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
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
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
      duration: { target: 0.5 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
      kind: QueryKind.Placeholder,
    }, {
      name: 'side project',
      goal: { kind: GoalKind.Continuous, quantity: 2, perTime: 48, maximize: true },
      timeRestrictions: {
        hour: {
          condition: RestrictionCondition.OutRange, ranges: [[0, 5]],
        },
      },
      duration: { min: 0.5 },
      kind: QueryKind.Placeholder,
    }, {
      name: 'reading',
      goal: { kind: GoalKind.Continuous, quantity: 0.5, perTime: 24 },
      duration: { min: 0.01 },
      kind: QueryKind.Placeholder,
    }];
    builder.build(queries).subscribe((planning: IPlanAgent[]) => {
      expect(planning).toHaveLength(11);
      done();
    });
  });
});
