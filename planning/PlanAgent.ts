export default class PlanAgent {
  constructor(readonly name: string, private _start: number, private _end: number) {}

  get start() { return this._start; }
  get end() { return this._end; }
}
