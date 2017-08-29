import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';

import { Potentiality } from './potentiality.interface';
import {
  PipelineAction,
  InitTimeline,
  UpdateTimeline,
} from './actions';

export class Pipeline {
  readonly actions = new Subject<PipelineAction>();

  private stateFn: Observable<Potentiality[]>;

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
        } else if (action instanceof UpdateTimeline) {
          return this.handleUpdate(state, action);
        }
        return state;
      },    initState);
  }

  private handleInit(state: Potentiality[], action: PipelineAction): Potentiality[] {
    return state;
  }

  private handleUpdate(state: Potentiality[], action: PipelineAction): Potentiality[] {
    return state;
  }

}
