// The Word You'd Delete From the Dictionary — make.fun entry (program/v1).
//
// Writes the one chosen word to $MAKEFUN_OUTPUT_DIR/entry.txt ("/output"
// in the grader sandbox). The sealed gate wants UTF-8 text of 1 to 77
// characters, not only white space, so the program checks the word against
// the gate before writing and reads the file back afterwards. Deterministic:
// the same word on every run, so both grading runs gate identically. No
// network, no secrets, no input files, no dependencies.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The pick: the longest word in a major English dictionary — 45 letters,
// coined in 1935 purely to hold the record and never used by anyone in a
// real sentence. Delete it and the dictionary loses its most absurd entry:
// no more spelling-bee trump card, no more "longest word" trivia answer.
// The joke is the word itself — a word that exists only to be long.
const WORD = "pneumonoultramicroscopicsilicovolcanoconiosis";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });

// Gate self-check: 1 to 77 characters, exactly one word, nothing around it.
if (WORD.length < 1 || WORD.length > 77) {
  throw new Error(`word is ${WORD.length} chars, gate needs 1-77`);
}
if (WORD.trim() !== WORD || /\s/.test(WORD)) {
  throw new Error("entry must be exactly one word, nothing around it");
}
// A dictionary word is letters only: reject digits, punctuation or any
// hidden character that would make the entry something other than one word.
if (!/^[a-z]+$/.test(WORD)) {
  throw new Error("entry must contain lowercase letters only");
}
// The gate counts characters, but the file is read as UTF-8 bytes; a
// multi-byte character costs more bytes than characters, so check both.
const byteLength = Buffer.byteLength(WORD, "utf8");
if (byteLength > 77) {
  throw new Error(`word is ${byteLength} UTF-8 bytes, gate needs 1-77 chars`);
}

const target = join(outputDir, "entry.txt");
writeFileSync(target, WORD + "\n", "utf8");

// Read-back verification: the file on disk must be exactly the word plus
// one trailing newline, with no stray whitespace or encoding surprise.
const written = readFileSync(target, "utf8");
if (written !== WORD + "\n") {
  throw new Error("read-back mismatch: entry.txt does not match the word");
}

console.log(`wrote ${target} (${WORD.length} chars, ${byteLength} bytes)`);
