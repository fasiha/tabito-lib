/*
Run this as:
```console
npm run demo
```
and follow instructions
*/

import { sentenceToGraph } from ".";
import { findGreedyPath } from "./graphSearch";
import type { Sentence, Tree } from "./interfaces";
import { reverse } from "./utils";
import { writeFile } from "fs/promises";

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

export function sentenceToDot(sentence: Sentence, outfile = "demo.dot") {
  const res = sentenceToGraph(sentence);
  writeFile(outfile, treeToDot(res.keyToPrev, res.textToKeys));
  console.log(`Output ${outfile}
Now run
$ dot -Tpng ${outfile} > ${outfile}.png`);
}

if (module === require.main) {
  sentenceToDot(demo, "demo.dot");

  const fake: Sentence = {
    furigana: ["a", "b", "c", "d"],
    synonyms: { bc: ["x", "y", "b"] },
    english: [""],
    citation: "",
  };
  sentenceToDot(fake, "fake.dot");

  const graph = sentenceToGraph(fake);
  for (const input of "a,abc,abec,aebc,abcd,abcdefg,x,xy,ybd,dqq,bcd,bdq".split(
    ","
  )) {
    console.log("# " + input);
    console.log(findGreedyPath(input, graph));
  }
}
