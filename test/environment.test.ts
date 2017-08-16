import { } from 'jest';

import { Query } from '../queries/query.interface';
import { QueryKind, GoalKind, RestrictionCondition } from '../queries/query.enum';
import PlanningState from '../planning/PlanningState';
import * as Actions from '../planning/actions';
import { Environment } from '../builder/environment.class';
import { IEnvironment } from '../builder/environment.interface';

let pState: PlanningState;
let environment: IEnvironment;

beforeEach(() => {
  pState = new PlanningState([]);
  environment = {
    computeSatisfaction: () => 1,
  };
});

describe('environment', () => {
  test('should take all the space without restrict', (done) => {
    expect.assertions(3);
    const query: Query = {
      name: 'test',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Discrete, quantity: 1, perTime: 24 },
    };
    new Environment({ name: 'test', start: 0, end: 24 }, query, pState);
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
    new Environment({ name: 'test', start: 0, end: 24 }, query, pState);
    pState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      expect(agents[0].start).toBeCloseTo(18);
      expect(agents[0].end).toBeCloseTo(23);
      done();
    });
  });

  it('should react to split action', (done) => {
    expect.assertions(3);
    const query: Query = {
      name: 'test',
      kind: QueryKind.Atomic,
      goal: { kind: GoalKind.Continuous, quantity: 20, perTime: 24 },
    };
    const env = new Environment({ name: 'test', start: 0, end: 24 }, query, pState);
    pState.actions.next(new Actions.SplitPlans([{
      legacyName: env.zonesNames[0],
      newPlans: [{
        environment,
        name: 'test1',
        start: 0,
        end: 11,
      }, {
        environment,
        name: 'test2',
        start: 12,
        end: 24,
      }],
    }]));
    pState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(2);
      expect(agents[0].getSatisfaction()).toBe(1);
      expect(env.zonesNames).toHaveLength(2);
      done();
    });
  });
});
