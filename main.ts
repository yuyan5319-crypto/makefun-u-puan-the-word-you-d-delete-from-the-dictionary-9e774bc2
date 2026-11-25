// The Word You'd Delete From the Dictionary — entry program.
// Writes a single original word to <output>/entry.txt: the one word
// this entry would erase from the dictionary forever.
//
// The word: "irregardless".
// It is the dictionary's own typo that got promoted: a word built by
// stapling a redundant "ir-" onto "regardless", so it means exactly
// what "regardless" already means — yet it sits in the dictionary,
// daring grammar pedants to look it up. Deleting it is the one
// erasure nobody would notice, because the language already has the
// correct word standing right next to it. The joke is the word itself:
// a word whose entire existence is a mistake, erased at no cost.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "irregardless";

// The gate: 1-77 UTF-8 characters, and not only whitespace.
const chars = [...WORD];
if (chars.length < 1 || chars.length > 77) {
  throw new Error(`entry word must be 1-77 characters, got ${chars.length}`);
}
if (WORD.trim().length === 0) {
  throw new Error("entry word must not be only whitespace");
}
// The entry is exact: one word, spelled correctly, nothing added.
if (/\s/.test(WORD)) {
  throw new Error("entry must be exactly one word, no spaces");
}
if (!/^[a-z]+$/.test(WORD)) {
  throw new Error("entry must contain lowercase letters only");
}
// The gate counts characters, but the file is read as UTF-8 bytes; a
// multi-byte character costs more bytes than characters, so check both.
const byteLength = Buffer.byteLength(WORD, "utf8");
if (byteLength > 77) {
  throw new Error(`word is ${byteLength} UTF-8 bytes, gate needs 1-77 chars`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
let target = join(outDir, "entry.txt");
try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(target, WORD, "utf8");
} catch (err) {
  // Running by hand outside the grader: /output may not be writable.
  // Fall back to a local ./output directory instead of failing.
  if (process.env.MAKEFUN_OUTPUT_DIR || (err as NodeJS.ErrnoException).code !== "EACCES") {
    throw err;
  }
  const fallback = join(process.cwd(), "output");
  mkdirSync(fallback, { recursive: true });
  target = join(fallback, "entry.txt");
  writeFileSync(target, WORD, "utf8");
}

// Read-back verification: the file on disk must be exactly the word,
// with no stray whitespace or encoding surprise.
const written = readFileSync(target, "utf8");
if (written !== WORD) {
  throw new Error("read-back mismatch: entry.txt does not match the word");
}

console.log(`wrote entry.txt (${chars.length} chars, ${byteLength} bytes)`);
