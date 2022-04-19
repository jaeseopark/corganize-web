export const dateToPosixSeconds = (d: Date) => Math.floor(d.getTime() / 1000);

export const getPosixSeconds = () => dateToPosixSeconds(new Date());

export const getPosixMilliseconds = () => new Date().getTime();

export const addDays = (d: Date, delta: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + delta);
  return copy;
};
