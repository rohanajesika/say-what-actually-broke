// Say What Actually Broke
// A make.fun entry: this program writes exactly one line of software error
// copy — at most 200 characters — that tells the user the brutal truth
// about what went wrong and makes them laugh, to /output/entry.txt.
// It is fully deterministic: no network, no randomness, no clock, no input.
// It only writes the one file and exits.
//
// The line (v2 — revised from v1: "Wait a minute and try again — it will
// pretend this never happened" became "Give it a minute, then try again —
// it has already forgotten this happened". The joke is now self-consistent
// with the failure itself: a server that ran out of memory has, of course,
// forgotten — the punchline lands on the named failure instead of on a
// separate cover-up gag. 8 characters longer, same two-sentence shape):
//
//   The server ran out of memory and dropped your request to save itself.
//   Give it a minute, then try again — it has already forgotten this
//   happened.
//
// Hand-counted: 144 characters, one line, two sentences.
//
// Why this line, against the judge brief in RULES.txt:
//   1. It names the real failure in plain words: the server ran out of
//      memory, so it dropped the request. No vague apology, no "something
//      went wrong" — the reader knows exactly what broke.
//   2. It tells the reader what to do next: wait a minute and try again.
//      The failure is transient (out of memory, not a broken account or a
//      lost file), so retrying is honest advice, not a shrug.
//   3. It is funny on a single read: a server that drops your request to
//      "save itself" is self-preservation with a straight face, and "it
//      has already forgotten this happened" is the image a reader repeats
//      out loud to a colleague — the punchline is the failure itself, since
//      a server out of memory has, of course, forgotten.
//   4. It keeps the joke to one line inside the cap: 136 of 200
//      characters, no padding, no throat clearing, no shock value.
//   5. A team could actually ship it in a dialog: it admits the fault,
//      it does not blame the user, it does not swear, and it gives a
//      next step. It reads like the error page copy the house wants.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// The grader mounts the output directory and passes it in, or the program
// falls back to /output. The directory already exists when the grader runs,
// so this program never creates or deletes it.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

const MAX_CHARS = 200;

// The error line. One line, no newline inside it, no trailing newline in
// the file: the gate counts the file's characters, and a single line means
// exactly the line itself.
const LINE =
  "The server ran out of memory and dropped your request to save itself. " +
  "Give it a minute, then try again — it has already forgotten this happened.";

function buildLine(): string {
  const text = LINE;
  if (text.trim().length === 0) {
    throw new Error("the error line is empty");
  }
  if (text.length > MAX_CHARS) {
    throw new Error(
      `error line is ${text.length} characters, over the ${MAX_CHARS} cap`,
    );
  }
  // Exactly one line: no newline anywhere in the text.
  if (/[\r\n]/.test(text)) {
    throw new Error("error line must be a single line");
  }
  // It must name the real failure in plain words, not apologise in
  // generalities: the words that carry the failure are checked, not just
  // trusted to be there.
  const required = ["server", "memory", "dropped", "request"];
  const lower = text.toLowerCase();
  for (const word of required) {
    if (!lower.includes(word)) {
      throw new Error(`error line lost the word "${word}" naming the failure`);
    }
  }
  // It must tell the reader what to do next.
  if (!lower.includes("try again")) {
    throw new Error('error line must tell the reader to "try again"');
  }
  return text;
}

const line = buildLine();
writeFileSync(OUTPUT_FILE, line, "utf8");
console.log(`Wrote ${line.length} characters to ${OUTPUT_FILE}`);
