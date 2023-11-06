import { Chunk, type Graph } from "./interfaces";
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

export function findGreedyPath(
  input: string,
  graph: Graph
): { result: string; firstKey: string }[] {
  const inputHiragana = kata2hira(input);
  const heads = findMatchingWords(inputHiragana, graph) ?? [];
  const keys = heads.flatMap((word) => graph.textToKeys[word]) ?? [];
  return keys.map((key) => ({
    firstKey: key,
    result: followGreedy(input, key, graph),
  }));
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

  const rest = input.slice(head.length);
  const downstream = nextKeys.map((key) => followGreedy(rest, key, graph));
  return headAsInput + longest(downstream);
}

export function chunkInput(input: string, graph: Graph): Chunk[] {
  const chunks: Chunk[] = [];
  let rest = input;
  while (rest) {
    const hits = findGreedyPath(rest, graph);
    if (hits.length === 0) {
      chunks.push({ text: rest[0], status: "unknown", start: false });
      rest = rest.slice(1);
    } else {
      const hit = max(hits, (h) => h.result.length);
      chunks.push({
        text: hit.result,
        status: "ok",
        start: graph.ancestorKeys[hit.firstKey],
      });
      rest = rest.slice(hit.result.length);
    }
  }
  return chunks;
}
