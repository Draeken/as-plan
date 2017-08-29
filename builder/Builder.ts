import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';

import asLogger from '../asLogger';
import { Query } from '../queries/query.interface';
import { Pipe, PipeConfig } from '../pipe/pipe.class';
import { Pipeline } from '../timeline/pipes.state';

export default class Builder {

  constructor() {
    asLogger.info('constructed !');
  }

  build(queries: Query[]): Observable<any> {

    const queriesObs = Observable.of(queries);
    const pipeline = new Pipeline([]);
    const pipesObs = queriesObs
      .map(queries => queries.map(query => new Pipe(query, pipeline, { startMin: 0, endMax: 48 })));
    return queriesObs;
  }
}
