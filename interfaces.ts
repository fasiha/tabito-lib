export type Furigana = string | { ruby: string; rt: string };

export interface Sentence {
  furigana: Furigana[];
  english: string[];
  synonyms?: Record<string, Furigana[]>; // keys are guaranteed to be in `furigana`. Values' entries may be empty string
  citation: string;
}

export type Tree = Record<string, string[]>;

export interface Graph {
  keyToNext: Tree;
  textToKeys: Tree;
  keyToPrev: Tree;
  keyToText: Record<string, string>;
}
