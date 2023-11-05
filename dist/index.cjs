"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var tabito_lib_exports = {};
__export(tabito_lib_exports, {
  _findGreedyPath: () => findGreedyPath,
  chunkInput: () => chunkInput,
  sentenceToGraph: () => sentenceToGraph
});
module.exports = __toCommonJS(tabito_lib_exports);

// utils.ts
function insert(db, newKey, newVal, dedupe = false) {
  if (!(newKey in db)) {
    db[newKey] = [];
  }
  if (dedupe ? !db[newKey].includes(newVal) : true) {
    db[newKey].push(newVal);
  }
}
function reverse(input) {
  const ret = {};
  for (const k in input) {
    for (const v of input[k]) {
      insert(ret, v, k);
    }
  }
  return ret;
}
function reverseUniq(input) {
  const ret = {};
  for (const k in input) {
    for (const v of input[k]) {
      if (v in ret)
        throw new Error("non-unique values");
      ret[v] = k;
    }
  }
  return ret;
}
function findOccurrences(haystack, needle) {
  let hits = [];
  let position = -1;
  while ((position = haystack.indexOf(needle, position + 1)) >= 0) {
    hits.push(position);
  }
  return hits;
}
function max(v, map) {
  if (v.length === 0)
    throw new Error("empty");
  let bestX = v[0];
  let bestY = map(bestX);
  for (const x of v) {
    const y = map(x);
    if (y > bestY) {
      bestY = y;
      bestX = x;
    }
  }
  return bestX;
}
function longest(v) {
  if (v.length === 0)
    throw new Error("empty");
  return v.reduce((prev, curr) => curr.length > prev.length ? curr : prev);
}

// kana.ts
var hiragana = "\u3041\u3042\u3043\u3044\u3045\u3046\u3047\u3048\u3049\u304A\u304B\u304C\u304D\u304E\u304F\u3050\u3051\u3052\u3053\u3054\u3055\u3056\u3057\u3058\u3059\u305A\u305B\u305C\u305D\u305E\u305F\u3060\u3061\u3062\u3063\u3064\u3065\u3066\u3067\u3068\u3069\u306A\u306B\u306C\u306D\u306E\u306F\u3070\u3071\u3072\u3073\u3074\u3075\u3076\u3077\u3078\u3079\u307A\u307B\u307C\u307E\u307F\u3080\u3081\u3082\u3083\u3084\u3085\u3086\u3087\u3088\u3089\u308A\u308B\u308C\u308D\u308E\u308F\u3090\u3091\u3092\u3093\u3094\u3095\u3096";
var katakana = "\u30A1\u30A2\u30A3\u30A4\u30A5\u30A6\u30A7\u30A8\u30A9\u30AA\u30AB\u30AC\u30AD\u30AE\u30AF\u30B0\u30B1\u30B2\u30B3\u30B4\u30B5\u30B6\u30B7\u30B8\u30B9\u30BA\u30BB\u30BC\u30BD\u30BE\u30BF\u30C0\u30C1\u30C2\u30C3\u30C4\u30C5\u30C6\u30C7\u30C8\u30C9\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D0\u30D1\u30D2\u30D3\u30D4\u30D5\u30D6\u30D7\u30D8\u30D9\u30DA\u30DB\u30DC\u30DE\u30DF\u30E0\u30E1\u30E2\u30E3\u30E4\u30E5\u30E6\u30E7\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EE\u30EF\u30F0\u30F1\u30F2\u30F3\u30F4\u30F5\u30F6";
if (hiragana.length !== katakana.length) {
  throw new Error("Kana strings not same length?");
}
var kata2hiraMap = /* @__PURE__ */ new Map([]);
var hira2kataMap = /* @__PURE__ */ new Map([]);
hiragana.split("").forEach((h, i) => {
  kata2hiraMap.set(katakana[i], h);
  hira2kataMap.set(h, katakana[i]);
});
function kata2hira(s) {
  return s.split("").map((c) => kata2hiraMap.get(c) || c).join("");
}

// graphSearch.ts
function findMatchingWords(inputHiragana, { textToKeys }) {
  if (!inputHiragana)
    return void 0;
  const matchingWords = [];
  for (const word in textToKeys) {
    if (inputHiragana.startsWith(kata2hira(word))) {
      matchingWords.push(word);
    }
  }
  return matchingWords;
}
function findGreedyPath(input, graph) {
  const inputHiragana = kata2hira(input);
  const heads = findMatchingWords(inputHiragana, graph) ?? [];
  const keys = heads.flatMap((word) => graph.textToKeys[word]) ?? [];
  return keys.map((key) => ({
    firstKey: key,
    result: followGreedy(input, key, graph)
  }));
}
function followGreedy(input, startKey, graph) {
  if (!input)
    return input;
  const { keyToNext, keyToText } = graph;
  const head = keyToText[startKey];
  const headHiragana = kata2hira(head);
  const inputHiragana = kata2hira(input);
  if (!inputHiragana.startsWith(headHiragana))
    throw new Error("bad startKey");
  const nextKeys = keyToNext[startKey]?.filter(
    (key) => inputHiragana.startsWith(headHiragana + kata2hira(keyToText[key]))
  ) ?? [];
  const headAsInput = input.slice(0, head.length);
  if (nextKeys.length === 0)
    return headAsInput;
  const rest = input.slice(head.length);
  const downstream = nextKeys.map((key) => followGreedy(rest, key, graph));
  return headAsInput + longest(downstream);
}
function chunkInput(input, graph) {
  const chunks = [];
  let rest = input;
  while (rest) {
    const hits = findGreedyPath(rest, graph);
    if (hits.length === 0) {
      chunks.push({ text: rest[0], status: "unknown", start: false });
      rest = rest.slice(1);
    } else {
      const hit = max(hits, (h) => h.result.length);
      chunks.push({
        text: hit.result,
        status: "ok",
        start: graph.ancestorKeys.has(hit.firstKey)
      });
      rest = rest.slice(hit.result.length);
    }
  }
  return chunks;
}

// index.ts
function validateSynonyms(sentence) {
  const rawRubies = sentence.furigana.map(
    (f) => typeof f === "string" ? f : f.ruby
  );
  const rawRuby = rawRubies.join("");
  const charToMorphemeIdx = rawRubies.flatMap(
    (str, idx) => Array.from({ length: str.length }, () => idx)
  );
  for (const [synonym] of sentence.synonyms ?? []) {
    const start = rawRuby.indexOf(synonym);
    if (start < 0)
      return false;
    const end = start + synonym.length - 1;
    if (start > 0 && charToMorphemeIdx[start] === charToMorphemeIdx[start - 1])
      return false;
    if (end < rawRuby.length - 1 && // not last character?
    charToMorphemeIdx[end] === charToMorphemeIdx[end + 1])
      return false;
  }
  return true;
}
function parseSynonyms(sentence, textToKeys, keyToPrev) {
  const rawRubies = sentence.furigana.map(
    (f) => typeof f === "string" ? f : f.ruby
  );
  const rawRuby = rawRubies.join("");
  const entryNumber = rawRubies.flatMap(
    (str, idx) => Array.from({ length: str.length }, () => idx)
  );
  for (const [source, dest] of sentence.synonyms ?? []) {
    const starts = findOccurrences(rawRuby, source);
    if (starts.length === 0) {
      throw new Error("synonym not found in raw sentence? " + source);
    }
    for (const start of starts) {
      const end = start + source.length - 1;
      const startFuriganaIdx = entryNumber[start];
      const endFuriganaIdx = entryNumber[end];
      let previousKeys = mainlineKeys(
        sentence,
        startFuriganaIdx
      ).flatMap((key) => keyToPrev[key] ?? []);
      for (const [fidx, f] of dest.entries()) {
        previousKeys = insertFurigana({
          f,
          fidx: `${source}/${start}/${fidx}`,
          previousKeys,
          textToKeys,
          keyToPrev
        });
      }
      if (sentence.furigana[endFuriganaIdx + 1]) {
        for (const nextKey of mainlineKeys(sentence, endFuriganaIdx + 1)) {
          for (const prevKey of previousKeys) {
            insert(keyToPrev, nextKey, prevKey);
          }
        }
      }
      const mainlineOutflows = mainlineKeys(sentence, endFuriganaIdx);
      const allOutflows = Object.entries(keyToPrev).filter(
        ([, parents]) => mainlineOutflows.some(
          (targetParent) => parents.includes(targetParent)
        )
      ).map(([key]) => key);
      for (const nextKey of allOutflows) {
        for (const prevKey of previousKeys) {
          insert(keyToPrev, nextKey, prevKey, DEDUPE_PLEASE);
        }
      }
    }
  }
}
var DEDUPE_PLEASE = true;
function mainlineKeys(sentence, currentIndex) {
  if (currentIndex < 0 || currentIndex >= sentence.furigana.length) {
    throw new Error("weird index");
  }
  const f = sentence.furigana[currentIndex];
  if (typeof f === "string") {
    return [`${f}/${currentIndex}`];
  }
  return [`${f.rt}/${currentIndex}`, `${f.ruby}/${currentIndex}`];
}
function insertFurigana({
  f,
  fidx,
  previousKeys,
  textToKeys,
  keyToPrev
}) {
  if (typeof f === "string") {
    const newKey = `${f}/${fidx}`;
    insert(textToKeys, f, newKey);
    for (const prev of previousKeys) {
      insert(keyToPrev, newKey, prev);
    }
    return [newKey];
  }
  const keysGenerated = [];
  {
    const newRubyKey = `${f.ruby}/${fidx}`;
    insert(textToKeys, f.ruby, newRubyKey);
    for (const prev of previousKeys) {
      insert(keyToPrev, newRubyKey, prev);
    }
    keysGenerated.push(newRubyKey);
  }
  {
    const newRtKey = `${f.rt}/${fidx}`;
    insert(textToKeys, f.rt, newRtKey);
    for (const prev of previousKeys) {
      insert(keyToPrev, newRtKey, prev);
    }
    keysGenerated.push(newRtKey);
  }
  return keysGenerated;
}
function sentenceToGraph(sentence) {
  if (!validateSynonyms(sentence)) {
    throw new Error("Invalid synonyms");
  }
  const textToKeys = {};
  const keyToPrev = {};
  let previousKeys = [];
  for (const [fidx, f] of sentence.furigana.entries()) {
    previousKeys = insertFurigana({
      f,
      fidx,
      previousKeys,
      textToKeys,
      keyToPrev
    });
  }
  parseSynonyms(sentence, textToKeys, keyToPrev);
  const keyToNext = reverse(keyToPrev);
  const keyToText = reverseUniq(textToKeys);
  const allKeys = Object.keys(keyToText);
  const ancestorKeys = new Set(
    allKeys.filter((key) => !(key in keyToPrev) || keyToPrev[key].length === 0)
  );
  const leafKeys = new Set(
    allKeys.filter((key) => !(key in keyToNext) || keyToNext[key].length === 0)
  );
  return {
    textToKeys,
    keyToPrev,
    keyToText,
    keyToNext,
    ancestorKeys,
    leafKeys
  };
}
