import type { Furigana, Sentence } from "./interfaces";
import { furiganasToPlain } from "./utils";

/**
 * Compile a list of acceptable sentences in furigana
 *
 * Intended for quiz apps to show users, so ignores hiragana/katakana
 * normalization and reading-vs-kanji (`rt` vs `ruby`)
 */
export function enumerateAcceptable(sentence: Sentence): Furigana[][] {
  const ret: Furigana[][] = [sentence.furigana];
  if (!sentence.synonyms || sentence.synonyms.length === 0) {
    return ret;
  }

  const charToFuri: (Furigana | undefined)[] = [];
  for (const f of sentence.furigana) {
    // for one character, push the string/ruby
    charToFuri.push(f);
    // for remaining characters of `f`, push undefined
    const remaining = (typeof f === "string" ? f.length : f.ruby.length) - 1;
    if (remaining >= 1) {
      charToFuri.push(...Array(remaining).fill(undefined));
    }
  }

  const plain = furiganasToPlain(sentence.furigana);
  for (const [orig, synFuri] of sentence.synonyms) {
    const hits = findAllMatches(plain, orig);
    for (const hit of hits) {
      // make a copy so we can delete chunks of it and insert other chunks
      const copy = charToFuri.slice();
      copy.splice(hit, orig.length, ...synFuri);
      ret.push(copy.filter((x): x is Furigana => !!x));
    }
  }

  return ret;
}

/**
 * Like `String.indexOf` but all results.
 *
 * Each hit will be disjoint, i.e., the search will skip `small.length`
 * characters after every instance of `small` is found in `big`.
 */
function findAllMatches(big: string, small: string): number[] {
  const hits: number[] = [];
  let hit = 0;
  while (hit >= 0) {
    hit = big.indexOf(small, hit);
    if (hit >= 0) {
      hits.push(hit);
      hit += small.length;
    }
  }
  return hits;
}
