import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';

import asLogger from '../asLogger';
import { Query } from '../queries/query.interface';
import { Pipe } from '../pipe/pipe.class';
import { Pipeline } from '../timeline/pipes.state';
import { Environment } from '../timeline/environment.class';

export interface BoundConfig {
  startMin: number;
  endMax: number;
}

export default class Builder {

  constructor() {
    asLogger.info('constructed !');
  }

  build(queries: Query[]): Observable<any> {
    const boundConfig: BoundConfig = { startMin: 0, endMax: 48 };
    const pipeline = new Pipeline([]);
    const pipes = queries.map(query => new Pipe(query, pipeline, boundConfig));
    const env = new Environment(pipeline.stateFn, boundConfig);

    return Observable.of();
  }
}
