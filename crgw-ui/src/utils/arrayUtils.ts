import { v4 as uuidv4 } from "uuid";

export function shuffle(array: any[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const sample = (array: any[], size: number) => {
  if (array.length <= size) return [...array];
  return shuffle(array).slice(0, size);
};

export const sampleOne = (array: any[]) => {
  const [s] = sample(array, 1);
  return s;
};

export const removeAll = (array: any[], elements: any[]) => {
  const indicesToRemove = elements.map((e) => array.findIndex(e));
  if (indicesToRemove.includes(-1))
    throw new Error("One or more elements missing from the array");

  for (let i = indicesToRemove.length - 1; i >= 0; i--)
    array.splice(indicesToRemove[i], 1);
};

export const createRange = (
  start: number,
  stop: number,
  step = 1,
  inclusive = true
) =>
  Array(Math.ceil((stop + (inclusive ? 1 : 0) - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

export const createRandomIds = (count: number) =>
  Array.from(Array(count).keys()).reduce((acc) => {
    acc.push(uuidv4().toString());
    return acc;
  }, new Array<string>());
