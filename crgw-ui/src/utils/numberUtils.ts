/* eslint-disable no-restricted-properties */
const FILESIZE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB"];
const METRIC = ["", "k", "M", "G", "T", "P"];

export const shorten = (n: number, log = 1000, units = METRIC) => {
  const i = Math.floor(Math.log(n) / Math.log(log));
  const value = (n / Math.pow(log, i)).toFixed(i < 3 ? 0 : 2);
  return `${value} ${units[i]}`.trimEnd();
};

export const toHumanFileSize = (sizeInBytes: number): string =>
  shorten(sizeInBytes, 1024, FILESIZE_UNITS);

// min and max included
export const randomIntFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const closeEnough = (val1: number, val2: number, margin: number) =>
  Math.abs(val1 - val2) < margin;

export const toHumanDuration = (seconds: number): string =>
  new Date(seconds * 1000)
    .toISOString()
    .substr(seconds < 3600 ? 14 : 11, seconds < 3600 ? 5 : 8)
    .substr(seconds < 600 ? 1 : 0)
    .replaceAll("-", ":");

export const toRelativeHumanTime = (timestamp: number) => {
  // Assume 'timestamp' is always > Year 2001 (min. 13 digits)
  const multiplier = timestamp >= 10 ** 13 ? 1 : 1000;
  const diff = Math.abs(Date.now() / multiplier - timestamp);
  if (diff < 60) {
    return `${Math.ceil(diff).toString()}s`;
  }
  // up to 60min
  if (diff < 3600) return `${Math.floor(diff / 60).toString()}m`;
  // up to 36 hours
  if (diff < 3600 * 36) return `${Math.floor(diff / 3600).toString()}h`;
  // up to 90 days
  if (diff < 3600 * 24 * 90) return `${Math.floor(diff / 86400).toString()}d`;
  // else
  return `${Math.floor(diff / 2592000).toString()}mo`;
};
