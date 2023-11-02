import type { Furigana, Sentence } from "./interfaces";

const demo: Sentence = {
  furigana: [
    [
      { ruby: "京", rt: "きょう" },
      { ruby: "都", rt: "と" },
    ],
    ["で"],
    ["たくさん"],
    [
      { ruby: "写", rt: "しゃ" },
      { ruby: "真", rt: "しん" },
    ],
    ["を"],
    [{ ruby: "撮", rt: "と" }, "り"],
    ["まし"],
    ["た"],
  ].flat(),
  english: ["In Kyoto, I took a lot of photos"],
  citation: "Genki 2, 15-IV",
  synonyms: {
    たくさん: [
      { ruby: "沢", rt: "たく" },
      { ruby: "山", rt: "さん" },
    ],
    撮りました: [[{ ruby: "撮", rt: "と" }, "っ"], ["た"]].flat(),
    たくさん写真を: [
      [
        { ruby: "写", rt: "しゃ" },
        { ruby: "真", rt: "しん" },
      ],
      ["を"],
      ["たくさん"],
    ].flat(),
  },
};

export function validateSynonyms(sentence: Sentence): boolean {
  const rawRuby = sentence.furigana
    .map((f) => (typeof f === "string" ? f : f.ruby))
    .join("");
  return sentence.synonyms
    ? Object.keys(sentence.synonyms).every((key) => rawRuby.includes(key))
    : true;
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

type Tree = Record<string, string[]>;

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

function insert(
  db: Record<string, string[]>,
  newKey: string,
  newVal: string
): void {
  if (!(newKey in db)) {
    db[newKey] = [];
  }
  db[newKey].push(newVal);
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

function reverse(input: Record<string, string[]>): Record<string, string[]> {
  const ret: Record<string, string[]> = {};
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
function findOccurrences(haystack: string, needle: string): number[] {
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

function treeToDot(keyToPrev: Tree, textToKeys: Tree) {
  const keyToText = reverse(textToKeys);
  if (!Object.values(keyToText).every((v) => v.length === 1)) {
    throw new Error("key not unique?");
  }
  const links: string[] = [];
  const nodes = new Map<string, string>();

  function addNode(key: string) {
    nodes.set(key, `  ${key} [label="${keyToText[key][0]}"]`);
  }

  for (const [key, parents] of Object.entries(keyToPrev)) {
    addNode(key);
    for (const parent of parents) {
      addNode(parent);
      links.push(`  ${parent} -> ${key}`);
    }
  }
  return `digraph graphname {
${Array.from(nodes.values()).join("\n")}
${links.join("\n")}
}`.replace(/\//g, "_");
}

const res = sentenceToGraph(demo);
console.log(treeToDot(res.keyToPrev, res.textToKeys));
/*
Run this as:
```console
npx esbuild utils.ts --bundle --outfile=out.js
node out.js > out.dot
dot -Tpng out.dot > output.png
```
*/
