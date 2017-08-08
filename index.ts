import { normalize } from 'path';
import { readFile } from 'fs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/bindNodeCallback';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import asLogger from './asLogger';
import Builder from './builder/Builder';
import { Query } from './queries/query.interface';

function fileToJson(pathStr: string) {
  if (!pathStr) { throw new Error(`Invalid argument: ${pathStr} is not a path.`); }
  const normPath = normalize(pathStr);
  return Observable
    .bindNodeCallback(readFile)(normPath)
    .map(data => data.toJSON().data);
}

fileToJson(process.argv[2])
  .catch((err: string) => { throw new Error(err); })
  .map((queries: Query[]) => new Builder().build(queries))
  .subscribe(builder => asLogger.info(builder.toString()));


process.argv.forEach((val, index) => {
  asLogger.info(`toto[${index}]: ${val}`);
});
