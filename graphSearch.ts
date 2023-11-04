import { type Graph } from "./interfaces";
import { kata2hira } from "./kana";
import { longest, max } from "./utils";

function findMatchingWords(inputHiragana: string, { textToKeys }: Graph) {
  if (!inputHiragana) return undefined;
  const matchingWords: string[] = [];
  for (const word in textToKeys) {
    if (inputHiragana.startsWith(kata2hira(word))) {
      matchingWords.push(word);
    }
  }
  return matchingWords;
}

export function findGreedyPath(input: string, graph: Graph) {
  const inputHiragana = kata2hira(input);
  const heads = findMatchingWords(inputHiragana, graph) ?? [];
  const keys = heads.flatMap((word) => graph.textToKeys[word]) ?? [];
  return keys.map((key) => followGreedy(input, key, graph));
}

function followGreedy(input: string, startKey: string, graph: Graph): string {
  // base case (1) end of input
  if (!input) return input;

  const { keyToNext, keyToText } = graph;
  const head = keyToText[startKey];
  const headHiragana = kata2hira(head);
  const inputHiragana = kata2hira(input);

  // validation
  if (!inputHiragana.startsWith(headHiragana)) throw new Error("bad startKey");

  const nextKeys =
    keyToNext[startKey]?.filter((key) =>
      inputHiragana.startsWith(headHiragana + kata2hira(keyToText[key]))
    ) ?? [];

  const headAsInput = input.slice(0, head.length);

  // base case (2) end of graph
  if (nextKeys.length === 0) return headAsInput;

  const bestKey = max(nextKeys, (key) => keyToText[key].length);
  return headAsInput + followGreedy(input.slice(head.length), bestKey, graph);
}

export function chunkInput(input: string, graph: Graph) {
  const chunks: { text: string; status: "unknown" | "ok" }[] = [];
  let rest = input;
  while (rest) {
    const hits = findGreedyPath(rest, graph);
    if (hits.length === 0) {
      chunks.push({ text: rest[0], status: "unknown" });
      rest = rest.slice(1);
    } else {
      const hit = longest(hits);
      chunks.push({ text: hit, status: "ok" });
      rest = rest.slice(hit.length);
    }
  }
  return chunks;
}
