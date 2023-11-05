import test from "tape";
import type { Chunk, Sentence } from "../interfaces";
import { sentenceToGraph } from "..";
import { chunkInput, findGreedyPath } from "../graphSearch";
import { demo, fake } from "../demo";

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

  const find = (s: string) => findGreedyPath(s, graph).map((s) => s.result);
  arrEqual(find("a"), ["a"]);
  arrEqual(find("abc"), ["abc"]);
  arrEqual(find("abec"), ["ab"]);
  arrEqual(find("aebc"), ["a"]);
  arrEqual(find("abcd"), ["abcd"]);
  arrEqual(find("abcdefg"), ["abcd"]);
  arrEqual(find("x"), ["x"]);
  arrEqual(find("xy"), ["xy"]);
  arrEqual(find("ybq"), ["yb"]);
  arrEqual(find("ybd"), ["ybd"]);
  arrEqual(find("dqq"), ["d"]);
  arrEqual(find("bcd"), ["b", "bcd"]);
  arrEqual(find("bdq"), ["b", "bd"]);

  arrEqual(find("q"), []);

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
  const result = findGreedyPath(input, graph);
  t.deepEqual(
    result.map((o) => o.result),
    [input]
  );
  t.end();
});

test("deeply forking path-finding", (t) => {
  const graph = sentenceToGraph(fake);

  const helper = (s: string) =>
    t.deepEqual(
      findGreedyPath(s, graph).map((o) => o.result),
      [s]
    );

  helper("abcd");
  helper("axyzd");
  helper("axyze");
  helper("abCcCe");
  helper("AAAbCcCe");
  helper("AAAxyze"); // fully synonyms, no mainline

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
  t.ok(chunks.every((o) => o.start === false));

  chunks = chunkInput("しゃしんたくさんとった", graph);
  allStatusOk(chunks);
  arrEqual(
    chunks.map((o) => o.text),
    ["しゃしん", "たくさんとった"]
  );
  t.ok(chunks.every((o) => o.start === false));

  chunks = chunkInput("京都で撮った", graph);
  allStatusOk(chunks);
  arrEqual(
    chunks.map((o) => o.text),
    ["京都で", "撮った"]
  );
  t.ok(chunks[0].start);
  t.false(chunks[1].start);

  t.end();
});
