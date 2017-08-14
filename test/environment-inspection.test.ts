import { } from 'jest';

import { Direction } from '../planning/plan.interface';
import PlanningState from '../planning/PlanningState';
import * as Actions from '../planning/actions';
import { EnvironmentInspection } from '../planning/environment-inspection';

let pState: PlanningState;
let eis: EnvironmentInspection;

beforeEach(() => {
  pState = new PlanningState([]);
  eis = new EnvironmentInspection(pState);
});

describe('EIS', () => {
  it('should emit split action', (done) => {
    expect.assertions(1);
    pState.actions.next(new Actions.InitPlans([{
      name: 'test',
      start: 0,
      end: 24,
    }, {
      name: 'obstacle',
      start: 10,
      end: 12,
    }]));

    pState.actions
      .filter(action => action instanceof Actions.SplitPlan)
      .subscribe((action: Actions.SplitPlan) => {
        expect(action.legacyName).toBe('test');
        done();
      });
  });

  it('should handle initPlan', (done) => {
    pState.actions.next(new Actions.InitPlans([{
      name: 'test1',
      start: 0,
      end: 12,
    }, {
      name: 'test2',
      start: 11,
      end: 15,
    }]));
    const collisions = eis.getCollisions({ name: 'test1', start: 0, end: 12 });
    expect(collisions).toHaveLength(1);
    expect(collisions[0].planName).toBe('test2');
    expect(collisions[0].bound).toBe(Direction.Right);
  });
});
