import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Query, TimeRestriction } from '../queries/query.interface';
import { GoalKind, RestrictionCondition } from '../queries/query.enum';
import { Pipeline } from '../timeline/pipes.state';
import { AddPotentiality } from '../timeline/actions';
import { IPipe } from './pipe.interface';

export interface PipeConfig {
  startMin: number;
  endMax: number;
}

interface Subpipe {
  name: string;
  children: {
    start: number;
    end: number;
  }[];
  placed: boolean;
}

interface TimeMask {
  start: number;
  end: number;
  children: TimeMask[];
}

type maskFn = (tm: TimeMask) => TimeMask[];
type mapRange = (r: [number, number][], tm: TimeMask) => [number, number][];

export class Pipe implements IPipe {
  private pipes: Subpipe[] = [];

  constructor(query: Query, pipeline: Pipeline, private config: PipeConfig) {
    this.buildRestrictionMask(query);
    this.buildSubpipes(query, pipeline);
  }

  isEligible() {
    return this.pipes.some(p => !p.placed);
  }

  place() {

  }

  private buildRestrictionMask(query: Query): void {
    const tr = query.timeRestrictions;
    if (!tr) { return; }
    const mask: TimeMask = {
      start: this.config.startMin,
      end: this.config.endMax,
      children: [] };
    if (tr.month) {
      this.applyMaskFn(mask, this.getMaskFilterFn(tr.month, this.mapMonthRange));
    }
  }

  private mapMonthRange(ranges: [number, number][], timeMask: TimeMask): [number, number][] {
    const startYear = new Date(timeMask.start).getFullYear();
    const endYear = new Date(timeMask.end).getFullYear();
    if (startYear === endYear) {
      return ranges.map(r => this.mapRangeToMonthWithYear(startYear, r));
    }
    return ranges
      .map(r => this.mapRangeToMonthWithYear(startYear, r))
      .concat(ranges.map(r => this.mapRangeToMonthWithYear(endYear, r)));
  }

  private mapRangeToMonthWithYear(year: number, range: [number, number]): [number, number] {
    const start = new Date(year, range[0]);
    const end = new Date(year, range[1]);
    return <[number, number]>[
      start.setDate((range[0] % 1) * this.daysInMonth(start)),
      end.setDate((range[1] % 1) * this.daysInMonth(end)),
    ];
  }

  private daysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private getMaskFilterFn(tr: TimeRestriction, mapFn: mapRange): maskFn {
    return (timeMask: TimeMask) => {
      let ranges = mapFn(tr.ranges, timeMask)
        .filter(r => r[0] < timeMask.end && r[1] > timeMask.start)
        .sort((a, b) => a[0] - b[0])
        .map(range => <[number, number]>[
          Math.max(timeMask.start, range[0]),
          Math.min(timeMask.end, range[1])]);
      if (tr.condition === RestrictionCondition.OutRange) {
        ranges = this.convertOutboundToInbound(timeMask, ranges);
      }
      if (ranges.length === 0) {
        return [];
      }
      const result: TimeMask[] = [];
      if (tr.condition === RestrictionCondition.InRange) {
        ranges.forEach((range) => {
          const [start, end] = range;
          result.push({ start, end, children: [] });
        });
      }
      return result;
    };
  }

  private convertOutboundToInbound(mask: TimeMask, ranges: [number, number][]): [number, number][] {
    let start = mask.start;
    let end;
    const newRange: [number, number][] = [];
    ranges.forEach((range) => {
      end = range[0];
      if (end > start) { newRange.push([start, end]); }
      start = range[1];
    });
    end = mask.end;
    if (end > start) { newRange.push([start, end]); }
    return newRange;
  }

  private applyMaskFn(timeMask: TimeMask, fn: maskFn): void {
    const applyLevel = this.timeMaskDeep(timeMask);
    const masksFromLevel = this.getMaskLevel(timeMask, 0, applyLevel);
    masksFromLevel.forEach(mask => mask.children = fn(mask));
  }

  private timeMaskDeep(timeMask: TimeMask): number {
    return 1 + timeMask.children.map(this.timeMaskDeep).reduce((a, b) => a > b ? a : b, 0);
  }

  private getMaskLevel(timeMask: TimeMask, curLevel: number, tarLevel: number): TimeMask[] {
    if (curLevel === tarLevel) { return [timeMask]; }
    return timeMask.children
      .map(mask => this.getMaskLevel(mask, curLevel + 1, tarLevel))
      .reduce((a, b) => a.concat(b), []);
  }

  private buildSubpipes(query: Query, pipeline: Pipeline): void {
    if (this.handleGoal(query, pipeline)) { return; }
    if (this.handleAtomic(query, pipeline)) { return; }
  }

  private handleGoal(query: Query, pipeline: Pipeline): boolean {
    if (!query.goal) { return false; }
    const timeloop = query.goal.minutes;
    let start = this.config.startMin;
    if (query.goal.kind === GoalKind.Atomic) {
      const timeRest = query.timeRestrictions;
      if (timeRest && timeRest.hour && timeRest.hour.ranges.length > 1) {
        const startRange = timeRest.hour.ranges.find(r => r[0] < 0.1);
        const endRange = timeRest.hour.ranges.find(r => r[1] > 23.9);
        if (startRange && endRange && startRange !== endRange) {
          start = endRange[0];
        }
      }
    }
    const offsetEffect = start === this.config.startMin ? 0 : -1;
    const maxDuration = this.config.endMax - this.config.startMin;
    const subpipeCount = Math.floor(maxDuration / timeloop) + offsetEffect;
    const subpipes = [];
    for (let i = 0; i < subpipeCount; i += 1) {
      subpipes.push([start + timeloop * i, start - 1 + timeloop * (i + 1)]);
    }
  }

  private handleAtomic(query: Query, pipeline: Pipeline): boolean {
    if (!((query.duration && (query.start || query.end)) || (query.start && query.end))) {
      return false;
    }
    const start = query.start ? query.start.target || 0 : 0;
    const end = query.end ?
      query.end.target || start : query.duration ? (query.duration.target || 0) + start : start;
    this.pipes.push({
      name: 'atomic',
      placed: false,
      children: [{ start, end }],
    });
    pipeline.actions.next(new AddPotentiality({
      start,
      end,
      name: 'atomic',
      pipe: this,
    }));
    return true;
  }

}
