import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';

import { Chunk } from './chunk.interface';

import {
  TimelineAction,
  InitTimeline,
  UpdateTimeline,
} from './actions';

export default class Timeline {
  readonly actions = new Subject<TimelineAction>();

  private stateFn: Observable<Chunk[]>;

  constructor(initialTimeline: Chunk[]) {
    this.stateFn = this.wrapIntoBehavior(initialTimeline, this.timelineHandler(initialTimeline));
  }

  private wrapIntoBehavior(initState: Chunk[], obs: Observable<Chunk[]>) {
    const res = new BehaviorSubject(initState);
    obs.subscribe(s => res.next(s));
    return res;
  }

  private timelineHandler(initState: Chunk[]): Observable<Chunk[]> {
    return <Observable<Chunk[]>>this.actions
      .scan((state: Chunk[], action: TimelineAction) => {
        if (action instanceof InitTimeline) {
          return this.handleInit(state, action);
        } else if (action instanceof UpdateTimeline) {
          return this.handleUpdate(state, action);
        }
        return state;
      },    initState);
  }

  private handleInit(state: Chunk[], action: TimelineAction): Chunk[] {
    return state;
  }

  private handleUpdate(state: Chunk[], action: TimelineAction): Chunk[] {
    return state;
  }

}
