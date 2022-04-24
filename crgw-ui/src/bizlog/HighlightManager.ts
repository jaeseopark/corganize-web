import { createRange } from "utils/arrayUtils";

export const expand = (range?: string): number[] => {
  if (!range) return [];

  return range.split(",").reduce((acc: number[], val) => {
    if (val.includes("-")) {
      const split = val.split("-");
      const lowerBound = parseInt(split[0], 10);
      const upperBound = parseInt(split[1], 10);
      acc.push(...createRange(lowerBound, upperBound));
    } else {
      acc.push(parseInt(val, 10));
    }
    return acc;
  }, []);
};

class HighlightManager {
  highlights: number[];

  /**
   * Initializes with the deep clone of initArray
   */
  constructor(highlights: number[]) {
    this.highlights = highlights;
  }

  isHighlighted = (value: number): boolean => this.highlights.includes(value);
  isEmpty = () => this.highlights.length === 0;

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
   * Gets the next highlight value with 'wraparound.' Returns undefined if the manager is empty.
   */
  next = (current: number) => {
    if (!this.isEmpty()) {
      const nextIndex = this.bsearchLargerIndex(current);
      return nextIndex < this.highlights.length ? this.highlights[nextIndex] : this.highlights[0];
    }
  };

  /**
   * Adds a new element to the manager.
   */
  add = (value: number) => {
    if (this.highlights.includes(value)) {
      return this;
    }

    const i = this.bsearchLargerIndex(value);
    this.highlights.splice(i, 0, value);
    return this;
  };

  toggle = (value: number) => {
    let i = this.highlights.indexOf(value);

    if (i !== -1) {
      this.highlights.splice(i, 1);
    } else {
      i = this.bsearchLargerIndex(value);
      this.highlights.splice(i, 0, value);
    }
    return this;
  };

  clear = () => {
    this.highlights.length = 0;
  };

  toRanges = (): number[][] => {
    if (this.highlights.length === 0) return [];
    if (this.highlights.length === 1) return [[this.highlights[0], this.highlights[0]]];

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

  toSet = () => new Set(this.highlights);

  toString = (): string =>
    this.toRanges()
      .map((r) => {
        if (r[0] === r[1]) return r[0].toString();
        return `${r[0]}-${r[1]}`;
      })
      .join();
}

export default HighlightManager;
