const demo = {
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

const graph = tabito.sentenceToGraph(demo);

document.querySelector("input#answer").addEventListener("input", (e) => {
  const chunks = tabito.chunkInput(e.target.value, graph);
  const html = chunks
    .map(
      (c) =>
        `<span
      class="${[
        "chunk",
        c.start && !c.full ? "start-chunk" : "",
        c.status === "unknown" ? "unknown-chunk" : "",
        c.full ? "full-chunk" : "",
      ].join(" ")}"
    >
      ${c.text}
    </span>`
    )
    .join("");
  document.querySelector("div#output").innerHTML = html;
});
