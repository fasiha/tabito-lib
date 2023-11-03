import type { Furigana, Sentence, Tree } from "./interfaces";
import { findOccurrences, insert } from "./utils";

/**
 * Ensures all synonyms are present and along furigana boundaries
 */
export function validateSynonyms(sentence: Sentence): boolean {
  const rawRubies = sentence.furigana.map((f) =>
    typeof f === "string" ? f : f.ruby
  );
  const rawRuby = rawRubies.join("");

  const charToMorphemeIdx = rawRubies.flatMap((str, idx) =>
    Array.from({ length: str.length }, () => idx)
  );

  for (const synonym in sentence.synonyms) {
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

  for (const [source, dest] of Object.entries(sentence.synonyms ?? {})) {
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

      let previousKeys: string[] =
        startFuriganaIdx > 0
          ? mainlineKeys(sentence, startFuriganaIdx - 1)
          : [];
      for (const [fidx, f] of dest.entries()) {
        previousKeys = insertFurigana({
          f,
          fidx: `${source}/${start}/${fidx}`,
          previousKeys,
          textToKeys,
          keyToPrev,
        });
      }
      if (sentence.furigana[endFuriganaIdx + 1]) {
        for (const nextKey of mainlineKeys(sentence, endFuriganaIdx + 1)) {
          for (const prevKey of previousKeys) {
            insert(keyToPrev, nextKey, prevKey);
          }
        }
      }
    }
  }
}

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

export function sentenceToGraph(sentence: Sentence) {
  if (!validateSynonyms(sentence)) {
    throw new Error("wat");
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
  return { textToKeys, keyToPrev };
}

type ReportState = "correct" | "misplaced" | "wrong";
type Report = { text: string; state: ReportState }[];

// export function generateReport(proposal: string, sentence: Sentence): Report {
//   // create synonyms
//   const synonymsToOriginal = reverse(sentence.synonyms ?? {});
//   for (const fv of sentence.furigana) {
//     for (const f of fv) {
//       if (typeof f !== "string") {
//         if (!(f.rt in synonymsToOriginal)) {
//           synonymsToOriginal[f.rt] = [];
//         }
//         synonymsToOriginal[f.rt].push(f.ruby);
//       }
//     }
//   }

//   //
//   const target = sentence.furigana
//     .flatMap((fv) => fv.map((f) => (typeof f === "string" ? f : f.ruby)))
//     .join("");
// }
