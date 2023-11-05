import test from "tape";
import type { Chunk, Sentence } from "../interfaces";
import { sentenceToGraph } from "..";
import { chunkInput, findGreedyPath } from "../graphSearch";
import { demo } from "../demo";

test("greedy search", (t) => {
  const fake: Sentence = {
    furigana: ["a", "b", "c", "d"],
    synonyms: { bc: ["x", "y", "b"] },
    english: [""],
    citation: "",
  };
  const graph = sentenceToGraph(fake);
  const arrEqual = (a: string[], b: string[]) =>
    t.deepEqual(a.sort(), b.sort());
  arrEqual(findGreedyPath("a", graph), ["a"]);
  arrEqual(findGreedyPath("abc", graph), ["abc"]);
  arrEqual(findGreedyPath("abec", graph), ["ab"]);
  arrEqual(findGreedyPath("aebc", graph), ["a"]);
  arrEqual(findGreedyPath("abcd", graph), ["abcd"]);
  arrEqual(findGreedyPath("abcdefg", graph), ["abcd"]);
  arrEqual(findGreedyPath("x", graph), ["x"]);
  arrEqual(findGreedyPath("xy", graph), ["xy"]);
  arrEqual(findGreedyPath("ybq", graph), ["yb"]);
  arrEqual(findGreedyPath("ybd", graph), ["ybd"]);
  arrEqual(findGreedyPath("dqq", graph), ["d"]);
  arrEqual(findGreedyPath("bcd", graph), ["b", "bcd"]);
  arrEqual(findGreedyPath("bdq", graph), ["b", "bd"]);

  arrEqual(findGreedyPath("q", graph), []);

  t.end();
});

test("hiragana normalization: return is same form as input even during background normalization", (t) => {
  const sentence: Sentence = {
    furigana: ["ラーメン", "が", "たべたい"],
    english: [""],
    citation: "",
  };
  const graph = sentenceToGraph(sentence);
  const input = "らーめんがタべたい";
  t.deepEqual(findGreedyPath(input, graph), [input]);
  t.end();
});

test("chunking", (t) => {
  const graph = sentenceToGraph(demo);

  const arrEqual = (a: string[], b: string[]) =>
    t.deepEqual(a.sort(), b.sort());
  const allStatusOk = (v: Chunk[]) => v.every((o) => o.status === "ok");

  let chunks = chunkInput("しゃしんたくさん", graph);
  allStatusOk(chunks);
  arrEqual(
    chunks.map((o) => o.text),
    ["しゃしん", "たくさん"]
  );

  chunks = chunkInput("しゃしんたくさんとった", graph);
  allStatusOk(chunks);
  arrEqual(
    chunks.map((o) => o.text),
    ["しゃしん", "たくさんとった"]
  );

  t.end();
});
