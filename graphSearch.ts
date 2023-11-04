import { Graph } from "./interfaces";
import { max } from "./utils";

export function findMatchingWords(input: string, { textToKeys }: Graph) {
  if (!input) return undefined;
  const matchingWords = Object.keys(textToKeys).filter((word) =>
    input.startsWith(word)
  );
  return matchingWords;
}

export function findGreedyPath(input: string, graph: Graph) {
  const heads = findMatchingWords(input, graph) ?? [];
  const keys = heads.flatMap((word) => graph.textToKeys[word]) ?? [];
  return keys.map((key) => followGreedy(input, key, graph));
}

export function followGreedy(
  input: string,
  startKey: string,
  graph: Graph
): string {
  // base case (1) end of input
  if (!input) return input;

  const { keyToNext, keyToText } = graph;
  const head = keyToText[startKey];

  // validation
  if (!input.startsWith(head)) throw new Error("bad startKey");

  const nextKeys =
    keyToNext[startKey]?.filter((key) =>
      input.startsWith(head + keyToText[key])
    ) ?? [];

  // base case (2) end of graph
  if (nextKeys.length === 0) return head;

  const bestKey = max(nextKeys, (key) => keyToText[key].length);
  // return head + keyToText[bestKey] + ;
  return head + followGreedy(input.slice(head.length), bestKey, graph);
}
