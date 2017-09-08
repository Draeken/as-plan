import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import asLogger from '../asLogger';
import { Query } from '../queries/query.interface';
import { Pipe } from '../pipe/pipe.class';
import { Pipeline } from '../timeline/pipes.state';
import { Environment } from '../timeline/environment.class';
import { Potentiality, Material } from '../timeline/potentiality.interface';

export interface BoundConfig {
  startMin: number;
  endMax: number;
}

export default class Builder {

  constructor() {
    asLogger.info('constructed !');
  }

  build(queries: Query[]): Observable<Material[]> {
    const now = Date.now();
    const boundConfig: BoundConfig = { startMin: now, endMax: now + 1 * 24 * 3600 * 1000 };
    const pipeline = new Pipeline([]);
    const pipes = queries.map(query => new Pipe(query, pipeline, boundConfig));
    const env = new Environment(pipeline.stateFn, boundConfig);
    const taskCount = pipes.map(p => p.subPipeCount()).reduce((a, b) => a + b, 0);
    return pipeline.stateFn.filter((state) => {
      return state.length > taskCount
        && state.every(p => !Environment.isFinite(p.potentiel));
    }).map(state => state
      .map(p => ({ start: new Date(p.start), end: new Date(p.end), name: p.name })));
  }
}
