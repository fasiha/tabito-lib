import type { Tree } from "./interfaces";

export function insert(db: Tree, newKey: string, newVal: string): void {
  if (!(newKey in db)) {
    db[newKey] = [];
  }
  db[newKey].push(newVal);
}

export function reverse(input: Tree): Tree {
  const ret: Tree = {};
  for (const k in input) {
    for (const v of input[k]) {
      insert(ret, v, k);
    }
  }
  return ret;
}

function cumulativeSum(v: number[]): number[] {
  const ret = v.slice();
  for (const i of ret.keys()) {
    ret[i] += ret[i - 1] ?? 0;
  }
  return ret;
}
export function findOccurrences(haystack: string, needle: string): number[] {
  let hits: number[] = [];
  let position = -1;
  while ((position = haystack.indexOf(needle, position + 1)) >= 0) {
    hits.push(position);
  }
  return hits;
}
/**
 * A bit faster than `findOccurrences(a, b).length`
 */
function findNumOccurrences(haystack: string, needle: string): number {
  let hits = 0;
  let position = -1;
  while ((position = haystack.indexOf(needle, position + 1)) >= 0) {
    hits++;
  }
  return hits;
}
