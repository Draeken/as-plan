import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import asLogger from '../asLogger';
import { Query } from '../queries/query.interface';

export default class Builder {

  constructor() {
    asLogger.info('constructed !');
  }

  build(queries: Query[]): Observable<any> {
    return Observable.of(queries);
  }
}
