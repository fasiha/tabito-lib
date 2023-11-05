import test from "tape";
import { Sentence } from "../interfaces";
import { sentenceToGraph } from "..";
import { reverse } from "../utils";

test("mainline, no synonyms, no repeats", (t) => {
  const sentence: Sentence = {
    furigana: ["a", "b", "c"],
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);

  for (const f of sentence.furigana) {
    t.ok((f as string) in textToKeys);
  }

  // this will always be true, even when we have repeats: key must be unique
  const keyToText = reverse(textToKeys);
  t.ok(
    Object.values(keyToText).every((v) => v.length === 1),
    "unique keys"
  );

  // a has no predecessors
  t.equal(keyToPrev[textToKeys.a[0]], undefined);
  t.deepEqual(keyToPrev[textToKeys.b[0]], textToKeys.a);
  t.deepEqual(keyToPrev[textToKeys.c[0]], textToKeys.b);

  t.end();
});

test("mainline with repeats", (t) => {
  const sentence: Sentence = {
    furigana: ["a", "b", "c", "a"],
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);

  t.false(keyToPrev[textToKeys.a[0]], "first a, no prefix");
  t.deepEqual(keyToPrev[textToKeys.a[1]], textToKeys.c, "second a, c prefix");
  t.deepEqual(keyToPrev[textToKeys.b[0]], [textToKeys.a[0]]);
  t.deepEqual(keyToPrev[textToKeys.c[0]], textToKeys.b);

  t.equal(textToKeys["a"].length, 2);

  t.ok(
    Object.values(reverse(textToKeys)).every((v) => v.length === 1),
    "unique keys"
  );
  t.end();
});

test("basic synomym", (t) => {
  const sentence: Sentence = {
    furigana: ["a", "b", "c", "d"],
    synonyms: [["bc", ["x", "y", "z"]]],
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);

  t.deepEqual(
    keyToPrev[textToKeys.x[0]],
    textToKeys.a,
    "synonym link to mainline"
  );
  t.deepEqual(keyToPrev[textToKeys.y[0]], textToKeys.x, "synonym prefix y");
  t.deepEqual(keyToPrev[textToKeys.z[0]], textToKeys.y, "synonym prefix z");
  t.deepEqual(
    keyToPrev[textToKeys.d[0]].slice().sort(),
    [textToKeys.c[0], textToKeys.z[0]].sort(),
    "d has mainline AND synonym prefixes!"
  );

  t.ok(
    Object.values(reverse(textToKeys)).every((v) => v.length === 1),
    "unique keys"
  );
  t.end();
});

test("synomym not aligned with morpheme boundary", (t) => {
  const badSentence: Sentence = {
    furigana: ["a", "Bb", "c", "d"],
    synonyms: [["bc", ["x", "y", "z"]]],
  };

  t.throws(() => sentenceToGraph(badSentence));
  t.end();
});

test("partial synomyms ignored", (t) => {
  const okSentence: Sentence = {
    furigana: ["a", "b", "bc", "cbd"],
    synonyms: [["b", ["x", "y", "z"]]],
  };

  t.ok(sentenceToGraph(okSentence), "synonym repeating only partially ok");
  t.end();
});

test("multiply-occurring synonym ok", (t) => {
  const sentence: Sentence = {
    furigana: ["a", "b", "c", "b"],
    synonyms: [["b", ["x", "y", "z"]]],
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);
  t.deepEqual(
    textToKeys.b.flatMap((b) => keyToPrev[b]).sort(),
    [textToKeys.a[0], textToKeys.c[0]].sort(),
    "mainline parents"
  );
  t.deepEqual(
    textToKeys.x.flatMap((x) => keyToPrev[x]).sort(),
    [textToKeys.a[0], textToKeys.c[0]].sort(),
    "synonym parents"
  );

  t.ok(
    Object.values(reverse(textToKeys)).every((v) => v.length === 1),
    "unique keys"
  );

  t.end();
});

test("multiple synonyms should link to each other", (t) => {
  const sentence: Sentence = {
    furigana: "abcd".split(""),
    synonyms: [
      ["bc", "xyz".split("")],
      ["c", ["1"]],
      ["d", ["e"]],
    ],
  };
  const { textToKeys, keyToPrev, keyToText } = sentenceToGraph(sentence);

  const eParents = textToKeys.e
    .flatMap((e) => keyToPrev[e].map((key) => keyToText[key]))
    .sort();
  t.deepEqual(eParents, ["1", "c", "z"].sort());

  t.end();
});

test("synonyms can be repeated", (t) => {
  const sentence: Sentence = {
    furigana: "abc".split(""),
    synonyms: [
      ["b", ["x"]],
      ["b", ["y"]],
      ["b", ["z"]],
    ],
  };
  const { textToKeys, keyToPrev, keyToText } = sentenceToGraph(sentence);
  const cParents = textToKeys.c
    .flatMap((cKey) => keyToPrev[cKey])
    .map((key) => keyToText[key]);
  t.deepEqual(cParents.sort(), ["b", "x", "y", "z"].sort());

  t.end();
});
