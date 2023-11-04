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
export function reverseUniq(input: Tree): Record<string, string> {
  const ret: Record<string, string> = {};
  for (const k in input) {
    for (const v of input[k]) {
      if (v in ret) throw new Error("non-unique values");
      ret[v] = k;
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
export function max<T>(v: T[], map: (x: T) => number): T {
  if (v.length === 0) throw new Error("empty");
  let bestX = v[0];
  let bestY = map(bestX);
  //TODO make this iterator so we don't scan the first twice and don't slice (allocate new array)
  for (const x of v) {
    const y = map(x);
    if (y > bestY) {
      bestY = y;
      bestX = x;
    }
  }
  return bestX;
}

export function longest(v: string[]): string {
  if (v.length === 0) throw new Error("empty");
  return v.reduce((prev, curr) => (curr.length > prev.length ? curr : prev));
}
