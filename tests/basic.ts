import test from "tape";
import { Sentence } from "../interfaces";
import { sentenceToGraph } from "..";
import { reverse } from "../utils";

const superfluous = { english: [], citation: "" };

test("mainline, no synonyms, no repeats", (t) => {
  const sentence: Sentence = {
    ...superfluous,
    furigana: ["a", "b", "c"],
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);

  for (const f of sentence.furigana) {
    t.ok((f as string) in textToKeys);
  }

  // this will always be true, even when we have repeats: key must be unique
  const keyToText = reverse(textToKeys);
  t.ok(Object.values(keyToText).every((v) => v.length === 1));

  // a has no predecessors
  t.equal(keyToPrev[textToKeys.a[0]], undefined);
  t.deepEqual(keyToPrev[textToKeys.b[0]], textToKeys.a);
  t.deepEqual(keyToPrev[textToKeys.c[0]], textToKeys.b);

  t.end();
});

test("mainline with repeats", (t) => {
  const sentence: Sentence = {
    ...superfluous,
    furigana: ["a", "b", "c", "a"],
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);

  // this will always be true, even when we have repeats: key must be unique
  const keyToText = reverse(textToKeys);
  t.ok(
    Object.values(keyToText).every((v) => v.length === 1),
    "unique keys"
  );

  t.false(keyToPrev[textToKeys.a[0]], "first a, no prefix");
  t.deepEqual(keyToPrev[textToKeys.a[1]], textToKeys.c, "second a, c prefix");
  t.deepEqual(keyToPrev[textToKeys.b[0]], [textToKeys.a[0]]);
  t.deepEqual(keyToPrev[textToKeys.c[0]], textToKeys.b);

  t.equal(textToKeys["a"].length, 2);

  t.end();
});

test("basic synomym", (t) => {
  const sentence: Sentence = {
    ...superfluous,
    furigana: ["a", "b", "c", "d"],
    synonyms: { bc: ["x", "y", "z"] },
  };

  const { textToKeys, keyToPrev } = sentenceToGraph(sentence);

  // this will always be true, even when we have repeats: key must be unique
  const keyToText = reverse(textToKeys);
  t.ok(
    Object.values(keyToText).every((v) => v.length === 1),
    "unique keys"
  );

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

  t.end();
});
