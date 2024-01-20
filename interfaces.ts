export type Furigana = string | { ruby: string; rt: string };

export interface Sentence {
  furigana: Furigana[];

  // tuple's first element must be in `furigana` (string or `ruby`) along element boundaries.
  // Entries of the 2nd (array) may be empty string
  synonyms?: [string, Furigana[]][];
}

export type Tree = Record<string, string[]>;

export interface Graph {
  keyToNext: Tree;
  textToKeys: Tree;
  keyToPrev: Tree;
  keyToText: Record<string, string>;
  ancestorKeys: Record<string, true>;
  leafKeys: Record<string, true>;
}

export interface Chunk {
  text: string;
  status: "unknown" | "ok";
  start: boolean;
  full: boolean;
}
