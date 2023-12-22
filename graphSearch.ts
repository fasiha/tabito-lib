import { Chunk, type Graph } from "./interfaces";
import { kata2hira } from "./kana";
import { max } from "./utils";

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
): { result: string; start: boolean; end: boolean }[] {
  const inputHiragana = kata2hira(input);
  const heads = findMatchingWords(inputHiragana, graph) ?? [];
  const keys = heads.flatMap((word) => graph.textToKeys[word]) ?? [];
  return keys.map((key) => {
    const result = followGreedy(input, key, graph);
    return {
      result: result.text,
      start: graph.ancestorKeys[key] || false, // first key is a root node?
      end: !!result.end, // last key was a leaf node?
    };
  });
}

function followGreedy(
  input: string,
  startKey: string,
  graph: Graph
): { text: string; end?: boolean } {
  // base case (1) end of input
  if (!input) return { text: input };

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
  if (nextKeys.length === 0) {
    return { text: headAsInput, end: !!graph.leafKeys[startKey] };
  }

  const rest = input.slice(head.length);
  const downstream = nextKeys.map((key) => followGreedy(rest, key, graph));
  const best = max(downstream, (x) => x.text.length);
  return { text: headAsInput + best.text, end: best.end };
}

export function chunkInput(input: string, graph: Graph): Chunk[] {
  const chunks: Chunk[] = [];
  let rest = input;
  while (rest) {
    const hits = findGreedyPath(rest, graph);
    if (hits.length === 0) {
      chunks.push({
        text: rest[0],
        status: "unknown",
        start: false,
        full: false,
      });
      rest = rest.slice(1);
    } else {
      const hit = max(hits, (h) => h.result.length);
      chunks.push({
        text: hit.result,
        status: "ok",
        start: hit.start,
        full: hit.start && hit.end,
      });
      rest = rest.slice(hit.result.length);
    }
  }
  return chunks;
}
