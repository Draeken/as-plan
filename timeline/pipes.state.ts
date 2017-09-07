import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';

import { Potentiality } from './potentiality.interface';
import {
  PipelineAction,
  AddPotentialities,
  InitTimeline,
  UpdateTimeline,
  Materialize,
} from './actions';

export class Pipeline {
  readonly actions = new Subject<PipelineAction>();
  readonly stateFn: Observable<Potentiality[]>;

  constructor(initialPipeline: Potentiality[]) {
    this.stateFn = this.wrapIntoBehavior(initialPipeline, this.pipelineHandler(initialPipeline));
  }

  private wrapIntoBehavior(initState: Potentiality[], obs: Observable<Potentiality[]>) {
    const res = new BehaviorSubject(initState);
    obs.subscribe(s => res.next(s));
    return res;
  }

  private pipelineHandler(initState: Potentiality[]): Observable<Potentiality[]> {
    return <Observable<Potentiality[]>>this.actions
      .scan((state: Potentiality[], action: PipelineAction) => {
        if (action instanceof InitTimeline) {
          return this.handleInit(state, action);
        } else if (action instanceof AddPotentialities) {
          return this.handleAddPotentialities(state, action);
        } else if (action instanceof Materialize) {
          return this.handleMaterialize(state, action);
        } else if (action instanceof UpdateTimeline) {
          return this.handleUpdate(state, action);
        }
        return state;
      },    initState);
  }

  private handleAddPotentialities(
    state: Potentiality[],
    action: AddPotentialities,
  ): Potentiality[] {
    const result = [...state, ...action.potentialities];
    result.sort((a, b) => a.start - b.start);
    return result;
  }

  private handleMaterialize(
    state: Potentiality[],
    action: Materialize,
  ): Potentiality[] {
    const result = state.filter(p => p.name !== action.name).concat(action.potentialities);
    result.sort((a, b) => a.start - b.start);
    return result;
  }

  private handleInit(state: Potentiality[], action: PipelineAction): Potentiality[] {
    return state;
  }

  private handleUpdate(state: Potentiality[], action: PipelineAction): Potentiality[] {
    return state;
  }

}
