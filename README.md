# Tabito (library)

Suppose you are making an app to help Japanese language learners, and you want users to learn a sentence like,
> <ruby>京<rt>きょう</rt></ruby><ruby>都<rt>と</rt></ruby>でたくさん<ruby>写<rt>しゃ</rt></ruby><ruby>真<rt>しん</rt></ruby>を<ruby>撮<rt>と</rt></ruby>りました

Specifically, suppose you want to show them the English translation, something like *"In Kyoto, (I) took a lot of photos"*, and you want them to type in the above sentence, or something like it. 

- "たくさん" ("lots") can function as an adverb so you want to allow: <ruby>京<rt>きょう</rt></ruby><ruby>都<rt>と</rt></ruby>で<ruby>写<rt>しゃ</rt></ruby><ruby>真<rt>しん</rt></ruby>をたくさん<ruby>撮<rt>と</rt></ruby>りました
- Of course you want to allow the informal conjugation of <ruby>撮<rt>と</rt></ruby>りました, so: <ruby>撮<rt>と</rt></ruby>った
- Oh, sometimes IME will convert たくさん to kanji: <ruby>沢<rt>たく</rt></ruby><ruby>山<rt>さん</rt></ruby>
- And in fact you want to allow any combination of kanji and kana.

In summary, your simple sentence is actually this directed acyclic graph (DAG):

![Graph (with nodes and edges) of the words of a Japanese sentence with forks for kanji-vs-kana and synonymous alternatives](./graph.png)

Tabito (<ruby>旅<rt>ta</rt></ruby><ruby>人<rt>bito</rt></ruby>, "travel person") is a dependency-free public-domain JavaScript/TypeScript library that helps with this. It exports two functions, `sentenceToGraph` and `chunkInput`, which constructs the graph above from a simpler editor-friendly representation and then break up user input into walks along the graph.

## API

### `Sentence`
Before we start, this is the shape of the data to represent your sentence (from [`interfaces.ts`](./interfaces.js)):
```ts
export type Furigana = string | { ruby: string; rt: string };

export interface Sentence {
  furigana: Furigana[];
  synonyms?: Record<string, Furigana[]>; // keys are guaranteed to be in `furigana`. Values' entries may be empty string
}
```
The `furigana` array represents the raw text of the sentence, with optional readings (using the `<ruby>` and `<rt>` HTML tags for [Ruby characters](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby), which are easy to hand-write as well as obtain from dictionaries like [JmdictFurigana](https://github.com/Doublevil/JmdictFurigana)).
