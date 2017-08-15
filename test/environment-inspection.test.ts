import { } from 'jest';

import { IEnvironment } from '../builder/environment.interface';
import { Direction } from '../planning/plan.interface';
import PlanningState from '../planning/PlanningState';
import * as Actions from '../planning/actions';
import { EnvironmentInspection } from '../planning/environment-inspection';

let pState: PlanningState;
let eis: EnvironmentInspection;
let environment: IEnvironment;

beforeEach(() => {
  pState = new PlanningState([]);
  eis = new EnvironmentInspection(pState);
  environment = {};
});

describe('EIS', () => {
  it('should emit split action', (done) => {
    expect.assertions(7);
    pState.actions
      .filter(action => action instanceof Actions.SplitPlans)
      .subscribe((action: Actions.SplitPlans) => {
        expect(action.splitInfos).toHaveLength(1);
        const splitInfo = action.splitInfos[0];
        expect(splitInfo.legacyName).toBe('test');
        expect(splitInfo.newPlans).toHaveLength(2);
        expect(splitInfo.newPlans[0].start).toBe(0);
        expect(splitInfo.newPlans[0].end).toBe(11);
        expect(splitInfo.newPlans[1].start).toBe(11);
        expect(splitInfo.newPlans[1].end).toBe(24);
        done();
      });

    pState.actions.next(new Actions.InitPlans([{
      environment,
      name: 'test',
      start: 0,
      end: 24,
    }, {
      environment,
      name: 'obstacle',
      start: 10,
      end: 12,
    }]));
  });

  it('should handle pState change', (done) => {
    pState.actions.next(new Actions.InitPlans([{
      environment,
      name: 'test1',
      start: 0,
      end: 12,
    }, {
      environment,
      name: 'test2',
      start: 11,
      end: 15,
    }]));
    eis.newCollision.subscribe(() => {
      const collisions = eis.getCollisions({ name: 'test1', start: 0, end: 12 });
      expect(collisions).toHaveLength(1);
      expect(collisions[0].targetName).toBe('test2');
      expect(collisions[0].bound).toBe(Direction.Left);
      done();
    });
  });
});
