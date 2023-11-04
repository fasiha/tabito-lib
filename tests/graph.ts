import test from "tape";
import { type Sentence } from "../interfaces";
import { sentenceToGraph } from "..";
import { findGreedyPath } from "../graphSearch";

const fake: Sentence = {
  furigana: ["a", "b", "c", "d"],
  synonyms: { bc: ["x", "y", "b"] },
  english: [""],
  citation: "",
};
const graph = sentenceToGraph(fake);

test("greedy search", (t) => {
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
