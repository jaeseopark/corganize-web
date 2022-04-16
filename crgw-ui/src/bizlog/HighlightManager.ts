/* eslint-disable for-direction */
/* eslint-disable no-plusplus */

import { createRange } from '../utils/arrayUtils';

const expand = (range: string): number[] =>
  range.split(',').reduce((acc: number[], val) => {
    if (val.includes('-')) {
      const split = val.split('-');
      const lowerBound = parseInt(split[0], 10);
      const upperBound = parseInt(split[1], 10);
      acc.push(...createRange(lowerBound, upperBound));
    } else {
      acc.push(parseInt(val, 10));
    }
    return acc;
  }, []);

class HighlightManager {
  highlights: number[];

  /**
   * Initializes with the deep clone of initArray
   */
  constructor(range?: string) {
    this.highlights = range ? expand(range) : [];
  }

  isHighlighted = (value: number): boolean => this.highlights.includes(value);

  toRanges = (): number[][] => {
    if (this.highlights.length === 0) return [];
    if (this.highlights.length === 1)
      return [[this.highlights[0], this.highlights[0]]];

    const ranges: number[][] = [];
    let curr = [this.highlights[0], this.highlights[0]];

    // Find continuous ranges
    for (let i = 1; i < this.highlights.length; i++) {
      const element = this.highlights[i];
      if (element === curr[1] + 1) {
        curr[1] = element;
      } else {
        ranges.push(curr);
        curr = [element, element];
      }
    }

    // Push the remaining range
    ranges.push(curr);
    return ranges;
  };

  toString = (): string =>
    this.toRanges()
      .map((r) => {
        if (r[0] === r[1]) return r[0].toString();
        return `${r[0]}-${r[1]}`;
      })
      .join();

  bsearchLargerIndex = (current: number): number => {
    let lowerBound = 0;
    let upperBound = this.highlights.length;
    while (lowerBound < upperBound) {
      const midIndex = Math.floor((lowerBound + upperBound) / 2);
      const midValue = this.highlights[midIndex];
      if (midValue > current) {
        upperBound = midIndex;
      } else {
        lowerBound = midIndex + 1;
      }
    }
    return lowerBound;
  };

  /**
   * Gets the next highlight value with 'wraparound.' Returns null if the manager is empty.
   */
  next = (current: number): number | null => {
    if (this.highlights.length === 0) return null;
    const nextIndex = this.bsearchLargerIndex(current);
    return nextIndex < this.highlights.length
      ? this.highlights[nextIndex]
      : this.highlights[0];
  };

  /**
   * Adds a new element to the manager.
   */
  add = (value: number) => {
    if (this.highlights.includes(value)) {
      return;
    }

    const i = this.bsearchLargerIndex(value);
    this.highlights.splice(i, 0, value);
  };

  toggle = (value: number) => {
    let i = this.highlights.indexOf(value);

    if (i !== -1) {
      this.highlights.splice(i, 1);
    } else {
      i = this.bsearchLargerIndex(value);
      this.highlights.splice(i, 0, value);
    }
  };

  clear = () => {
    this.highlights.length = 0;
  };
}

export default HighlightManager;
