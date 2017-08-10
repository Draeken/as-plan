import { } from 'jest';

import PlanningState from '../planning/PlanningState';
import * as Actions from '../planning/actions';
import { IPlanAgent, PlanAgentInit, BoundName } from '../planning/plan.interface';

function testAgent(init: PlanAgentInit, agent: IPlanAgent): void {
  expect(agent.start).toBe(init.start);
  expect(agent.end).toBe(init.end);
  expect(agent.name).toBe(init.name);
  expect(agent).not.toBe(init);
}

const noop = () => {};

describe('Planning state', () => {
  it('should create', (done) => {
    expect.assertions(2);
    const planState = new PlanningState([]);
    expect(planState).toBeTruthy();
    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(0);
      done();
    });
  });

  it('should handle initPlan', (done) => {
    expect.assertions(5);
    const planState = new PlanningState([]);
    const initAgent: PlanAgentInit = { name: 'test', start: 0, end: 1 };
    planState.actions.next(new Actions.InitPlan(initAgent));
    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      testAgent(initAgent, agents[0]);
      done();
    });
  });

  it('should handle push plan', (done) => {
    expect.assertions(6);
    const legacyAgent: IPlanAgent = {
      name: 'test',
      start: 0,
      end: 2,
      pushMe: jest.fn(() => newAgentInit),
    };
    const newAgentInit: PlanAgentInit = {
      name: 'test',
      start: 0,
      end: 1,
    };
    const planState = new PlanningState([legacyAgent]);
    planState.actions.next(new Actions.PushPlan(1, 'test', BoundName.Left));

    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      testAgent(newAgentInit, agents[0]);
      expect(legacyAgent.pushMe).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should not handle non existent push plan', (done) => {
    expect.assertions(4);
    const legacyAgent: IPlanAgent = {
      name: 'test',
      start: 0,
      end: 2,
      pushMe: jest.fn(),
    };
    const planState = new PlanningState([legacyAgent]);
    let totalEmissions = 0;
    planState.planAgents.subscribe(
      (agents) => {
        expect(agents).toHaveLength(1);
        expect(agents[0]).toBe(legacyAgent);
        expect(agents[0].pushMe).not.toBeCalled();
        totalEmissions += 1;
      },
      noop, () => {
        expect(totalEmissions).toBe(1);
        done();
      });
    planState.actions.next(new Actions.PushPlan(1, 'nihil', BoundName.Left));
    planState.complete();
  });

  it('should handle split plan', (done) => {
    expect.assertions(9);
    const legacyAgent: IPlanAgent = {
      name: 'test',
      start: 0,
      end: 2,
      pushMe: jest.fn(),
    };
    const newAgents: PlanAgentInit[] = [
      {
        name: 'test#1',
        start: 0,
        end: 1,
      },
      {
        name: 'test#2',
        start: 1,
        end: 2,
      },
    ];
    const planState = new PlanningState([legacyAgent]);
    planState.actions.next(new Actions.SplitPlan('test', newAgents));
    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(2);
      agents.forEach((agent, i) => testAgent(newAgents[i], agent));
      done();
    });
  });


});
