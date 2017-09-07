import { Query, TimeRestriction } from '../queries/query.interface';
import { GoalKind, RestrictionCondition } from '../queries/query.enum';
import { Pipeline } from '../timeline/pipes.state';
import { AddPotentialities, Materialize } from '../timeline/actions';
import { Potentiality } from '../timeline/potentiality.interface';
import { PressureChunk } from '../timeline/environment.class';
import { IPipe } from './pipe.interface';
import { BoundConfig } from '../builder/Builder';

export interface PipeConfig extends BoundConfig {
}

interface Subpipe {
  name: string;
  children: TimeMask[];
  duration: number;
}

interface TimeMask {
  start: number;
  end: number;
}

type maskFn = (tm: TimeMask) => TimeMask[];
type mapRange = (r: TimeMask[], tm: TimeMask) => TimeMask[];

export class Pipe implements IPipe {
  private pipes: Subpipe[] = [];
  private isSplittable: boolean;

  constructor(private query: Query, private pipeline: Pipeline, private config: PipeConfig) {
    this.isSplittable = query.goal ? query.goal.kind === GoalKind.Splittable : false;
    this.buildSubpipes();
  }

  isEligible() {
    return this.pipes.some(p => Number.isFinite(p.duration));
  }

  place(name: string, env: PressureChunk[]) {
    const pipe = this.pipes.find(p => p.name === name);
    if (!pipe) { console.warn(`Pipe ${name} not found.`); return; }
    let result: PressureChunk[] = [];
    const chunks = env
      .filter(chunk => pipe.children.some(p => p.start <= chunk.start && chunk.end <= p.end))
      .sort((c1, c2) => c2.pressure - c1.pressure);
    if (this.isSplittable) {
      result = this.handleSplittablePlacement(chunks, pipe.duration);
    } else {
      result = this.handleAtomicPlacement(chunks, pipe);
    }
    this.pipeline.actions.next(new Materialize(name, result.map(r => ({
      name,
      start: r.start,
      end: r.end,
      potentiel: Infinity,
      pipe: this,
    }))));
  }

  private handleAtomicPlacement(chunks: PressureChunk[], pipe: Subpipe): PressureChunk[] {
    let bestPlace: PressureChunk = { start: 0, end: 0, pressure: Infinity };
    const whichBetter = (c: PressureChunk, b: PressureChunk) => {
      if (!pipe.children.some(p => p.start <= c.start && c.end <= p.end)) { return b; }
      return c.pressure < b.pressure ? c : b;
    };
    chunks.forEach((chunk) => {
      this.getAtomicPressureChunk(chunks, chunk, pipe.duration)
        .forEach((challenger) => {
          bestPlace = whichBetter(challenger, bestPlace);
        });
    });
    return[bestPlace];
  }

  private handleSplittablePlacement(chunks: PressureChunk[], duration: number): PressureChunk[] {
    let materializedSpace = 0;
    const result = [];
    while (materializedSpace < duration && chunks.length > 0) {
      const best = <PressureChunk>chunks.pop();
      const bestDur = best.end - best.start;
      if (bestDur > duration) {
        best.end = best.start + duration;
      }
      materializedSpace += bestDur;
      result.push(best);
    }
    return result;
  }

  private getAtomicPressureChunk(
    chunks: PressureChunk[],
    chunk: PressureChunk,
    duration: number,
  ): PressureChunk[] {
    const getPressureChunk = (start: number, end: number) => {
      const pressure = chunks
        .map((c) => {
          if (!(c.start < end && c.end > start)) { return 0; }
          const cDur = c.end - c.start;
          const actDur = Math.min(cDur, Math.min(c.end, end) - Math.max(c.start, start));
          return actDur * c.pressure / cDur;
        })
        .reduce((a, b) => a + b);
      return { start, end, pressure };
    };
    return [
      getPressureChunk(chunk.start, chunk.start + duration),
      getPressureChunk(chunk.end - duration, chunk.end),
    ];
  }

  private buildPermissionMask(): TimeMask[] {
    const tr = this.query.timeRestrictions;
    if (!tr) { return []; }
    let masks: TimeMask[] = [{
      start: this.config.startMin,
      end: this.config.endMax }];
    if (tr.month) {
      masks = masks
      .map(this.getMaskFilterFn(tr.month, this.mapMonthRange))
      .reduce((a, b) => a.concat(b));
    }
    if (tr.weekday) {
      masks = masks
      .map(this.getMaskFilterFn(tr.weekday, this.mapWeekdayRange))
      .reduce((a, b) => a.concat(b));
    }
    if (tr.hour) {
      masks = masks
      .map(this.getMaskFilterFn(tr.hour, this.mapHourRange))
      .reduce((a, b) => a.concat(b));
    }
    return masks;
  }

  private mapHourRange(ranges: TimeMask[], timeMask: TimeMask): TimeMask[] {
    return ranges.map((range) => {
      const end = new Date(timeMask.end).setHours(23, 59, 59, 999);
      const currentRange = this.getFirstHourRange(range, timeMask);
      const result: TimeMask[] = [];
      result.push({ ...currentRange });
      while (currentRange.start < end) {
        currentRange.start += 24 * 3600 * 1000;
        currentRange.end += 24 * 3600 * 1000;
        result.push({ ...currentRange });
      }
      return result;
    }).reduce((a, b) => a.concat(b));
  }

  private getFirstHourRange(range: TimeMask, timeMask: TimeMask): TimeMask {
    const startDate = new Date(timeMask.start);
    startDate.setHours(0, 0, 0, 0);
    let date = +startDate - 24 * 3600 * 1000;
    let hour = startDate.getHours();
    const getNextHour = (target: number) => {
      while (hour !== target) {
        hour += (hour + 1) % 24;
        date += 3600 * 1000;
      }
    };
    getNextHour(range.start);
    const start = date + (range.start % 1) * 3600 * 1000;
    getNextHour(range.end);
    const end = date + (range.end % 1) * 3600 * 1000;
    return { start, end };
  }

  private mapWeekdayRange(ranges: TimeMask[], timeMask: TimeMask): TimeMask[] {
    return ranges.map((range) => {
      const end = new Date(timeMask.end).setHours(23, 59, 59, 999);
      const currentRange = this.getFirstWeekdayRange(range, timeMask);
      const result: TimeMask[] = [];
      result.push({ ...currentRange });
      while (currentRange.start < end) {
        currentRange.start += 7 * 24 * 3600 * 1000;
        currentRange.end += 7 * 24 * 3600 * 1000;
        result.push({ ...currentRange });
      }
      return result;
    }).reduce((a, b) => a.concat(b));
  }

  private getFirstWeekdayRange(range: TimeMask, timeMask: TimeMask): TimeMask {
    const startDate = new Date(timeMask.start);
    startDate.setHours(0, 0, 0, 0);
    let date = +startDate - 7 * 24 * 3600 * 1000;
    let day = startDate.getDay();
    const getNextDay = (target: number) => {
      while (day !== target) {
        day += (day + 1) % 7;
        date += 24 * 3600 * 1000;
      }
    };
    getNextDay(range.start);
    const start = date + (range.start % 1) * 24 * 3600 * 1000;
    getNextDay(range.end);
    const end = date + (range.end % 1) * 24 * 3600 * 1000;
    return { start, end };
  }

  private mapMonthRange(ranges: TimeMask[], timeMask: TimeMask): TimeMask[] {
    const startYear = new Date(timeMask.start).getFullYear();
    const endYear = new Date(timeMask.end).getFullYear();
    if (startYear === endYear) {
      return ranges.map(r => this.mapRangeToMonthWithYear(startYear, r));
    }
    return ranges
      .map(r => this.mapRangeToMonthWithYear(startYear, r))
      .concat(ranges.map(r => this.mapRangeToMonthWithYear(endYear, r)));
  }

  private mapRangeToMonthWithYear(year: number, range: TimeMask): TimeMask {
    const start = new Date(year, range.start);
    const end = new Date(year, range.end);
    return {
      start: start.setDate((range.start % 1) * this.daysInMonth(start)),
      end: end.setDate((range.end % 1) * this.daysInMonth(end)),
    };
  }

  private daysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private getMaskFilterFn(tr: TimeRestriction, mapFn: mapRange): maskFn {
    return (timeMask: TimeMask) => {
      let ranges = this.maskRangeUnion(
        mapFn(tr.ranges.map(r => ({ start: r[0], end: r[1] })), timeMask),
        timeMask);

      if (tr.condition === RestrictionCondition.OutRange) {
        ranges = this.convertOutboundToInbound(timeMask, ranges);
      }
      return ranges;
    };
  }

  private maskRangeUnion(ranges: TimeMask[], mask: TimeMask): TimeMask[] {
    return ranges
      .filter(r => r.start < mask.end && r.end > mask.start)
      .sort((a, b) => a.start - b.start)
      .map(range => ({
        start: Math.max(mask.start, range.start),
        end: Math.min(mask.end, range.end),
      }));
  }

  private convertOutboundToInbound(mask: TimeMask, ranges: TimeMask[]): TimeMask[] {
    let start = mask.start;
    let end;
    const newRange: TimeMask[] = [];
    ranges.forEach((range) => {
      end = range.start;
      if (end > start) { newRange.push({ start, end }); }
      start = range.end;
    });
    end = mask.end;
    if (end > start) { newRange.push({ start, end }); }
    return newRange;
  }

  private buildSubpipes(): void {
    const subPipes: Subpipe[] = [];
    subPipes.concat(this.handleGoal(), this.handleAtomic());
    const permissionMask = this.buildPermissionMask();
    subPipes.forEach(s => s.children = this.maskRangeUnion(permissionMask, s.children[0]));
    this.pipeline.actions.next(new AddPotentialities(subPipes
      .map(this.subPipeToPotentiality)
      .reduce((a, b) => a.concat(b))));
  }

  private subPipeToPotentiality(subpipe: Subpipe): Potentiality[] {
    console.log('this must be Pipe', this);
    const availableSpace = subpipe.children.map(s => s.end - s.start).reduce((a, b) => a + b);
    return subpipe.children.map(child => ({
      start: child.start,
      end: child.end,
      name: subpipe.name,
      pipe: this,
      potentiel: subpipe.duration / availableSpace,
    }));
  }

  private handleGoal(): Subpipe[] {
    const query = this.query;
    if (!query.goal) { return []; }
    let timeloop = query.goal.time;
    let start = this.config.startMin;
    let duration = 0;
    if (!this.isSplittable) {
      timeloop /= query.goal.quantity;
      duration = query.duration ? query.duration.target || 0 : 0;
      const timeRest = query.timeRestrictions;
      if (timeRest && timeRest.hour && timeRest.hour.ranges.length > 1) {
        const startRange = timeRest.hour.ranges.find(r => r[0] < 0.1);
        const endRange = timeRest.hour.ranges.find(r => r[1] > 23.9);
        if (startRange && endRange && startRange !== endRange) {
          start = endRange[0];
        }
      }
    } else {
      duration = query.goal.quantity;
    }
    const offsetEffect = start === this.config.startMin ? 0 : -1;
    const maxDuration = this.config.endMax - this.config.startMin;
    const subpipeCount = Math.floor(maxDuration / timeloop) + offsetEffect;
    const pipesChildren: TimeMask[] = [];
    for (let i = 0; i < subpipeCount; i += 1) {
      pipesChildren.push({
        start: start + timeloop * i,
        end:  start - 1 + timeloop * (i + 1),
      });
    }
    return pipesChildren.map((mask, i) => ({
      duration,
      children: [mask],
      name: `${query.name}-goal-${i}`,
    }));
  }

  private handleAtomic(): Subpipe[] {
    const query = this.query;
    if (!(query.duration || (query.start && query.end))) {
      return [];
    }
    const children: TimeMask[] = [];
    let duration = 0;
    if (query.start && query.end) {
      children.push({
        start: query.start.target || 0,
        end: query.end.target || 0,
      });
      duration = children[0].end - children[0].start;
    } else {
      children.push({
        start: this.config.startMin,
        end: this.config.endMax,
      });
      duration = query.duration ? query.duration.target || 0 : 0;
    }
    return [{
      duration,
      children,
      name: `${query.name}-atomic`,
    }];
  }

}
