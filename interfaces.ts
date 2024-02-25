export type Furigana = string | { ruby: string; rt: string };

/**
 * A target sentence (in furigana) as well as a set of synonyms
 *
 * Synonyms consist of text in the target sentence (consecutive plain
 * strings or `ruby` parts of furigana) and alternative furigana
 */
export interface Sentence {
  furigana: Furigana[];

  /**
   * Tuple's first element must be found in `furigana` (string or
   * `ruby`) along element boundaries. Entries of the 2nd (array) may be
   * empty string
   */
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
