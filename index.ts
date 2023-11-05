import type { Furigana, Graph, Sentence, Tree } from "./interfaces";
import { findOccurrences, insert, reverse, reverseUniq } from "./utils";

/**
 * Ensures all synonyms are present and along furigana boundaries
 */
function validateSynonyms(sentence: Sentence): boolean {
  const rawRubies = sentence.furigana.map((f) =>
    typeof f === "string" ? f : f.ruby
  );
  const rawRuby = rawRubies.join("");

  const charToMorphemeIdx = rawRubies.flatMap((str, idx) =>
    Array.from({ length: str.length }, () => idx)
  );

  for (const [synonym] of sentence.synonyms ?? []) {
    const start = rawRuby.indexOf(synonym);
    if (start < 0) return false;
    const end = start + synonym.length - 1;
    // start and end are character indexes

    // the character before this synonym (if it exists) has to be in a different morpheme than
    // the first character of the synonym
    if (start > 0 && charToMorphemeIdx[start] === charToMorphemeIdx[start - 1])
      return false;

    // similarly, the character after this synonym (if it exists) has to be in a different
    // morpheme than the synonym's last character
    if (
      end < rawRuby.length - 1 && // not last character?
      charToMorphemeIdx[end] === charToMorphemeIdx[end + 1]
    )
      return false;
  }
  return true;
}

// records must have the mainline sentence furigana loaded
function parseSynonyms(
  sentence: Sentence,
  textToKeys: Record<string, string[]>,
  keyToPrev: Record<string, string[]>
) {
  // boundaries are sub-morpheme, per JMDict-Furigana
  const rawRubies = sentence.furigana.map((f) =>
    typeof f === "string" ? f : f.ruby
  );
  const rawRuby = rawRubies.join("");

  const entryNumber = rawRubies.flatMap((str, idx) =>
    Array.from({ length: str.length }, () => idx)
  );
  for (const [source, dest] of sentence.synonyms ?? []) {
    const starts = findOccurrences(rawRuby, source);
    if (starts.length === 0) {
      // this should never happen since `validateSynonyms` runs earlier
      throw new Error("synonym not found in raw sentence? " + source);
    }
    for (const start of starts) {
      const end = start + source.length - 1;
      // start and end are character indexes

      const startFuriganaIdx = entryNumber[start];
      const endFuriganaIdx = entryNumber[end];
      // these are furigana indexes

      let previousKeys: string[] = mainlineKeys(
        sentence,
        startFuriganaIdx
      ).flatMap((key) => keyToPrev[key] ?? []);
      for (const [fidx, f] of dest.entries()) {
        previousKeys = insertFurigana({
          f,
          fidx: `${source}/${start}/${fidx}`,
          previousKeys,
          textToKeys,
          keyToPrev,
        });
      }
      // outflow: mainline
      if (sentence.furigana[endFuriganaIdx + 1]) {
        for (const nextKey of mainlineKeys(sentence, endFuriganaIdx + 1)) {
          for (const prevKey of previousKeys) {
            insert(keyToPrev, nextKey, prevKey);
          }
        }
      }
      // outflow: others
      const mainlineOutflows = mainlineKeys(sentence, endFuriganaIdx);
      const allOutflows = Object.entries(keyToPrev)
        .filter(([, parents]) =>
          mainlineOutflows.some((targetParent) =>
            parents.includes(targetParent)
          )
        )
        .map(([key]) => key);

      for (const nextKey of allOutflows) {
        for (const prevKey of previousKeys) {
          insert(keyToPrev, nextKey, prevKey, DEDUPE_PLEASE);
        }
      }
    }
  }
}
const DEDUPE_PLEASE = true;

function mainlineKeys(sentence: Sentence, currentIndex: number): string[] {
  if (currentIndex < 0 || currentIndex >= sentence.furigana.length) {
    throw new Error("weird index");
  }
  const f = sentence.furigana[currentIndex];
  if (typeof f === "string") {
    return [`${f}/${currentIndex}`];
  }
  return [`${f.rt}/${currentIndex}`, `${f.ruby}/${currentIndex}`];
}

interface InsertFuriganaArgs {
  f: Furigana;
  fidx: number | string;
  previousKeys: string[];
  textToKeys: Tree;
  keyToPrev: Tree;
}
function insertFurigana({
  f,
  fidx,
  previousKeys,
  textToKeys,
  keyToPrev,
}: InsertFuriganaArgs): string[] {
  if (typeof f === "string") {
    const newKey = `${f}/${fidx}`;
    // Step 1. Enroll into text->key map
    insert(textToKeys, f, newKey);
    // Step 2. Enroll into key->prev keys map
    for (const prev of previousKeys) {
      insert(keyToPrev, newKey, prev);
    }
    // Step 3. Last but not least, update prev keys memo
    return [newKey];
  }
  const keysGenerated: string[] = [];
  {
    const newRubyKey = `${f.ruby}/${fidx}`;
    insert(textToKeys, f.ruby, newRubyKey);
    for (const prev of previousKeys) {
      insert(keyToPrev, newRubyKey, prev);
    }
    keysGenerated.push(newRubyKey);
  }
  {
    const newRtKey = `${f.rt}/${fidx}`;
    insert(textToKeys, f.rt, newRtKey);
    for (const prev of previousKeys) {
      insert(keyToPrev, newRtKey, prev);
    }
    keysGenerated.push(newRtKey);
  }
  return keysGenerated;
}

export function sentenceToGraph(sentence: Sentence): Graph {
  if (!validateSynonyms(sentence)) {
    throw new Error("Invalid synonyms");
  }
  const textToKeys: Tree = {};
  const keyToPrev: Tree = {};

  // Go through the straight-line sentence and add furigana as branches
  let previousKeys: string[] = [];
  for (const [fidx, f] of sentence.furigana.entries()) {
    previousKeys = insertFurigana({
      f,
      fidx,
      previousKeys,
      textToKeys,
      keyToPrev,
    });
  }

  // Now add synonyms
  parseSynonyms(sentence, textToKeys, keyToPrev);

  // Wrap up
  const keyToNext = reverse(keyToPrev);
  const keyToText = reverseUniq(textToKeys);
  const allKeys = Object.keys(keyToText);
  const ancestorKeys = new Set(
    allKeys.filter((key) => !(key in keyToPrev) || keyToPrev[key].length === 0)
  );
  const leafKeys = new Set(
    allKeys.filter((key) => !(key in keyToNext) || keyToNext[key].length === 0)
  );
  return {
    textToKeys,
    keyToPrev,
    keyToText,
    keyToNext,
    ancestorKeys,
    leafKeys,
  };
}

export { chunkInput, findGreedyPath as _findGreedyPath } from "./graphSearch";
export type * from "./interfaces";
