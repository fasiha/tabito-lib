import test from "tape";
import { addSynonym } from "..";

test("basic", (t) => {
  t.deepEqual(
    addSynonym({ furigana: "abc".split("") }, "axyzc".split("")).synonyms,
    ["b", "xyz".split("")]
  );

  t.deepEqual(
    addSynonym({ furigana: "abc".split("") }, "abcd".split("")).synonyms,
    ["c", "cd".split("")]
  );

  t.deepEqual(
    addSynonym({ furigana: "bc".split("") }, "abc".split("")).synonyms,
    ["b", "ab".split("")]
  );

  t.deepEqual(addSynonym({ furigana: "a".split("") }, "x".split("")).synonyms, [
    "a",
    "x".split(""),
  ]);

  t.deepEqual(
    addSynonym({ furigana: "aa".split("") }, "a".split("")).synonyms,
    ["aa", "a".split("")]
  );

  t.end();
});
/*
(abc, axyzc) -> new synonym: b -> xyz
(abc, abcd) -> new synonum: c -> cd
(bc, abc) -> new synonym: b -> ab
(a, x) -> new synonum: a -> x
*/
