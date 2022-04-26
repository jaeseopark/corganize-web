import { v4 as uuidv4 } from "uuid";

export function shuffle<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const sample = <T>(array: T[], size: number, shouldShuffle = true) => {
  if (array.length <= size) return [...array];
  let maybeShuffled = shouldShuffle ? shuffle(array) : array;
  return maybeShuffled.slice(0, size);
};

export const sampleOne = <T>(array: T[]) => {
  const [s] = sample(array, 1);
  return s;
};

export const removeAll = (array: any[], elements: any[]) => {
  const indicesToRemove = elements.map((e) => array.findIndex(e));
  if (indicesToRemove.includes(-1)) throw new Error("One or more elements missing from the array");

  for (let i = indicesToRemove.length - 1; i >= 0; i--) array.splice(indicesToRemove[i], 1);
};

export const createRange = (start: number, stop: number, step = 1, inclusive = true) =>
  Array(Math.ceil((stop + (inclusive ? 1 : 0) - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

export const createRandomIds = (count: number) =>
  Array.from(Array(count).keys()).reduce((acc) => {
    acc.push(uuidv4().toString());
    return acc;
  }, new Array<string>());

export const upsert = <T>(elements: T[], key: keyof T): T[] =>
  elements.reduce((acc, next) => {
    const i = acc.findIndex((element) => element[key] === next[key]);
    if (i == -1) {
      acc.push(next);
      return acc;
    }

    acc.splice(i, 1, next);
    return acc;
  }, new Array<T>());
