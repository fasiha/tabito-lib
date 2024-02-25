import test from "tape";
import { type Sentence, enumerateAcceptable, type Furigana } from "..";

test("enumerate", (t) => {
  const y: Furigana[] = [{ ruby: "y", rt: "Y" }];
  const s: Sentence = {
    furigana: ["a", { ruby: "bc", rt: "BC" }, "d", "ef", "d"],
    synonyms: [
      ["abc", ["x"]],
      ["a", []],
      ["a", y],
      ["d", ["Dalt"]],
    ],
  };

  const res = enumerateAcceptable(s);

  t.deepEqual(res[0], s.furigana);
  t.deepEqual(res[1], ["x", s.furigana[2], s.furigana[3], s.furigana[4]]);
  t.deepEqual(res[2], s.furigana.slice(1));
  t.deepEqual(res[3], y.concat(s.furigana.slice(1)));
  t.deepEqual(
    res[4],
    s.furigana.slice(0, 2).concat(["Dalt", s.furigana[3], s.furigana[4]])
  );
  t.deepEqual(res[5], s.furigana.slice(0, 4).concat(["Dalt"]));
  t.equal(res.length, 6);

  t.end();
});
