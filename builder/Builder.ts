import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';

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

  private mapPotentialities(...pots: Potentiality[][]) {
    return pots.reduce((a, b) => a.concat(b), []);
  }

  private scanActions(acc: Material[], curr: Material[]): Material[] {
    const res = acc.concat(curr);
    res.sort((a, b) => a.start.getTime() - b.start.getTime());
    return res;
  }

  build(queries: Query[]): Observable<Material[]> {
    const now = (new Date()).setHours(0, 0, 0, 0);
    const boundConfig: BoundConfig = { startMin: now, endMax: now + 1 * 24 * 3600 * 1000 };
    const actions = new Subject<Material[]>();
    const pipeline = actions.scan(this.scanActions, []);
    const pipes = queries.map(query => new Pipe(boundConfig, query, actions, pipeline));
    const potentialities = Observable.zip(pipes.map(p => p.getPotentiel()), this.mapPotentialities);
    const env = new Environment(potentialities, boundConfig);
    const taskCount = pipes.map(p => p.subPipeCount()).reduce((a, b) => a + b, 0);
    return pipeline;
  }
}
