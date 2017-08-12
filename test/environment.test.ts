import { } from 'jest';

import { Query } from '../queries/query.interface';
import { QueryKind, GoalKind, RestrictionCondition } from '../queries/query.enum';
import { IPlanAgent, PlanAgentInit, BoundName } from '../planning/plan.interface';
import PlanningState from '../planning/PlanningState';
import * as Actions from '../planning/actions';
import { Environment } from '../builder/environment.class';

let pState: PlanningState;

beforeEach(() => {
  pState = new PlanningState([]);
});

describe('environment', () => {
  test('should take all the space without restrict', (done) => {
    expect.assertions(3);
    const query: Query = {
      name: 'test',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
    };
    const env = new Environment({ name: 'test', start: 0, end: 24 }, query, pState);
    pState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      expect(agents[0].start).toBeCloseTo(0);
      expect(agents[0].end).toBeCloseTo(24);
      done();
    });
  });

  it('should handle 1 inbound time restrict', (done) => {
    expect.assertions(3);
    const query: Query = {
      name: 'test',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
      timeRestrictions: {
        hour: { condition: RestrictionCondition.InRange, ranges: [[18, 23]] },
      },
    };
    const env = new Environment({ name: 'test', start: 0, end: 24 }, query, pState);
    pState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      expect(agents[0].start).toBeCloseTo(18);
      expect(agents[0].end).toBeCloseTo(23);
      done();
    });
  });

  it('should split agent when necessary', (done) => {
    expect.assertions(1);
    pState.actions.next(new Actions.InitPlans([{
      name: 'obstacle',
      start: 5,
      end: 11,
    }]));
    const query: Query = {
      name: 'test',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Continuous, quantity: 15, perTime: 24 },
    };
    const env = new Environment({ name: 'test', start: 0, end: 24 }, query, pState);
    pState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(3);
      done();
    });
  });

});
