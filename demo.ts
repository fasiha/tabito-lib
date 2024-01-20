/*
Run this as:
```console
npm run demo
```
This will save some output files.
*/

import { sentenceToGraph } from "./index";
import type { Sentence, Tree } from "./interfaces";
import { reverse } from "./utils";
import { writeFileSync } from "fs";
import { execSync } from "child_process";

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

export const demo: Sentence = {
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
  // english: ["In Kyoto, I took a lot of photos"],
  // citation: "Genki 2, 15-IV",
  synonyms: [
    [
      "たくさん",
      [
        { ruby: "沢", rt: "たく" },
        { ruby: "山", rt: "さん" },
      ],
    ],
    ["撮りました", [{ ruby: "撮", rt: "と" }, "っ", "た"]],
    [
      "たくさん写真を",
      [
        { ruby: "写", rt: "しゃ" },
        { ruby: "真", rt: "しん" },
        "を",
        "たくさん",
      ],
    ],
  ],
};

export const fake: Sentence = {
  furigana: "abcd".split(""),
  synonyms: [
    ["bc", "xyz".split("")],
    ["d", ["e"]],
    ["c", ["CcC"]],
    ["a", ["AAA"]],
  ],
};

export function sentenceToDot(sentence: Sentence, outfile = "demo.dot") {
  const res = sentenceToGraph(sentence);
  writeFileSync(outfile, treeToDot(res.keyToPrev, res.textToKeys));
  const cmds = [
    `dot -Tsvg ${outfile} -o${outfile}.svg`,
    `dot -Tpng ${outfile} -o${outfile}.png`,
  ];
  try {
    for (const cmd of cmds) execSync(cmd);
  } catch {
    console.error(`Unable to generate PNG graph. Maybe 'dot' isn't installed? I tried to run
$ ${cmds.join("; ")}`);
  }
}

if (module === require.main) {
  sentenceToDot(demo, "demo.dot");

  sentenceToDot(fake, "fake.dot");

  const ex: Sentence = {
    furigana: [
      ["これ"],
      ["は"],
      [{ ruby: "兄", rt: "あに" }],
      ["が"],
      [
        { ruby: "予", rt: "よ" },
        { ruby: "約", rt: "やく" },
      ],
      ["し"],
      ["た"],
      [
        { ruby: "旅", rt: "りょ" },
        { ruby: "館", rt: "かん" },
      ],
      ["です"],
    ].flat(),
    // english: [
    //   "This is the Japanese inn that my older brother made a reservation at",
    // ],
    // citation:
    //   "My answer to Genki II Workbook, Lesson 15, Topic 4, section II, question 1",
  };
  console.log(sentenceToGraph(ex));
}
