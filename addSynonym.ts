import type { Furigana, Sentence } from "./interfaces";
import {
  appearsExactlyOnce,
  furiganaEqual,
  furiganasToPlain,
  zip,
  zipRight,
} from "./utils";

export function addSynonym(original: Sentence, syn: Furigana[]): Sentence {
  let orig = original.furigana;
  const origPlain = furiganasToPlain(orig);
  const synPlain = furiganasToPlain(syn);

  let left = 0;
  for (const [a, b] of zip(orig, syn)) {
    if (furiganaEqual(a, b)) {
      const origProposed = furiganasToPlain(orig.slice(left + 1));
      const synProposed = furiganasToPlain(syn.slice(left + 1));
      if (
        origProposed &&
        synProposed &&
        appearsExactlyOnce(origPlain, origProposed) &&
        appearsExactlyOnce(synPlain, synProposed)
      ) {
        left++;
      }
    } else {
      break;
    }
  }

  orig = orig.slice(left);
  syn = syn.slice(left);

  let right = 0; // 0 means `undefined`, meaning, `slice` will include the last element!
  for (const [a, b] of zipRight(orig, syn)) {
    if (furiganaEqual(a, b)) {
      const origProposed = furiganasToPlain(orig.slice(0, right - 1));
      const synProposed = furiganasToPlain(syn.slice(0, right - 1));
      if (
        origProposed &&
        synProposed &&
        appearsExactlyOnce(origPlain, origProposed) &&
        appearsExactlyOnce(synPlain, synProposed)
      ) {
        right--;
      }
    } else {
      break;
    }
  }

  orig = orig.slice(0, right || undefined);
  syn = syn.slice(0, right || undefined);

  // early escape hatches
  const proposedOrigPlain = furiganasToPlain(orig);
  const proposedSynFull = furiganasToFull(syn);

  // don't add a tautological synonym
  if (proposedSynFull === furiganasToFull(orig)) {
    return original;
  }

  // don't duplicate an existing synonym
  if (
    original.synonyms &&
    original.synonyms.some(
      ([plain, equiv]) =>
        proposedSynFull === furiganasToFull(equiv) &&
        proposedOrigPlain === plain
    )
  ) {
    return original;
  }

  return {
    ...original,
    synonyms: (original.synonyms ?? []).concat([[proposedOrigPlain, syn]]),
  };
}

function furiganasToFull(v: Furigana[]): string {
  return v
    .map((x) => (typeof x === "string" ? x : `${x.rt}${x.ruby}`))
    .join("");
}
