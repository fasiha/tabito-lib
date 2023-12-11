import type { Furigana, Tree } from "./interfaces";

export function insert(
  db: Tree,
  newKey: string,
  newVal: string,
  dedupe = false
): void {
  if (!(newKey in db)) {
    db[newKey] = [];
  }
  if (dedupe ? !db[newKey].includes(newVal) : true) {
    db[newKey].push(newVal);
  }
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

export function groupBy<X, Y extends number | string>(
  xs: X[],
  f: (x: X) => Y
): Map<Y, X[]> {
  const ret = new Map<Y, X[]>();
  for (const x of xs) {
    const y = f(x);
    const hit = ret.get(y);
    if (!hit) {
      ret.set(y, [x]);
    } else {
      hit.push(x);
    }
  }
  return ret;
}

export function countElements<X>(xs: X[]): Map<X, number> {
  const ret = new Map<X, number>();
  for (const x of xs) {
    ret.set(x, (ret.get(x) ?? 0) + 1);
  }
  return ret;
}

export function furiganaEqual(a: Furigana, b: Furigana): boolean {
  return (
    typeof a === typeof b &&
    (typeof a === "string"
      ? a === b // a and b will both be strings here without any further runtime checks
      : (a as Exclude<Furigana, string>).rt ===
        (b as Exclude<Furigana, string>).rt)
  );
}

export function furiganasToPlain(v: Furigana[]): string {
  return v.map((x) => (typeof x === "string" ? x : x.ruby)).join("");
}

export function appearsExactlyOnce(haystack: string, needle: string): boolean {
  const hit = haystack.indexOf(needle);
  return hit >= 0 && haystack.indexOf(needle, hit + 1) < 0;
}

export function* zip<T, U>(ts: T[], us: U[]): IterableIterator<[T, U]> {
  const smaller = Math.min(ts.length, us.length);
  for (let idx = 0; idx < smaller; ++idx) {
    yield [ts[idx], us[idx]];
  }
}

export function* zipRight<T, U>(ts: T[], us: U[]): IterableIterator<[T, U]> {
  for (let t = ts.length - 1, u = us.length - 1; t >= 0 && u >= 0; --t, --u) {
    yield [ts[t], us[u]];
  }
}
