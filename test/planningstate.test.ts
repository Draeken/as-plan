import { } from 'jest';

import PlanningState from '../planning/PlanningState';
import * as Actions from '../planning/actions';
import { IPlanAgent, PlanAgentInit, Direction } from '../planning/plan.interface';
import { IEnvironment } from '../builder/environment.interface';

function testAgent(init: PlanAgentInit, agent: IPlanAgent): void {
  expect(agent.start).toBe(init.start);
  expect(agent.end).toBe(init.end);
  expect(agent.name).toBe(init.name);
  expect(agent).not.toBe(init);
}

let environment: IEnvironment;

beforeEach(() => {
  environment = {};
});

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
    const initAgent: PlanAgentInit = { environment, name: 'test', start: 0, end: 1 };
    planState.actions.next(new Actions.InitPlans([initAgent]));
    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      testAgent(initAgent, agents[0]);
      done();
    });
  });

  it('should replace existing plan', (done) => {
    expect.assertions(6);
    const legacyAgent: IPlanAgent = {
      name: 'test',
      start: 0,
      end: 2,
      pushMe: jest.fn(),
      getSatisfaction: jest.fn(),
      getEnvironment: jest.fn(),
    };
    const planState = new PlanningState([legacyAgent]);
    const initAgent: PlanAgentInit = { environment, name: 'test', start: 0, end: 1 };
    planState.actions.next(new Actions.InitPlans([initAgent]));
    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      expect(agents[0]).not.toBe(legacyAgent);
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
      getSatisfaction: jest.fn(),
      getEnvironment: jest.fn(),
    };
    const newAgentInit: PlanAgentInit = {
      environment,
      name: 'test',
      start: 0,
      end: 1,
    };
    const planState = new PlanningState([legacyAgent]);
    planState.actions.next(new Actions.PushPlans([
      {
        power: 1,
        targetName: 'test',
        bound: Direction.Left,
      }]));

    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(1);
      testAgent(newAgentInit, agents[0]);
      expect(legacyAgent.pushMe).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should handle split plan', (done) => {
    expect.assertions(9);
    const legacyAgent: IPlanAgent = {
      name: 'test',
      start: 0,
      end: 2,
      pushMe: jest.fn(),
      getSatisfaction: jest.fn(),
      getEnvironment: jest.fn(),
    };
    const newAgents: PlanAgentInit[] = [
      {
        environment,
        name: 'test#1',
        start: 0,
        end: 1,
      },
      {
        environment,
        name: 'test#2',
        start: 1,
        end: 2,
      },
    ];
    const planState = new PlanningState([legacyAgent]);
    planState.actions.next(new Actions.SplitPlans([{ legacyName:'test', newPlans: newAgents }]));
    planState.planAgents.subscribe((agents) => {
      expect(agents).toHaveLength(2);
      agents.forEach((agent, i) => testAgent(newAgents[i], agent));
      done();
    });
  });


});
