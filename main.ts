// Entry point for the "Post the Meme, Win the Feed" bounty on make.fun.
//
// The real deliverable of this bounty is the X post itself: a meme image
// published natively from a public account, with POST.json naming the post.
// This program has one small job — hand the grader a byte-for-byte copy of
// POST.json, taken from the bot directory and placed in the output
// directory, so the post can be found and scored.
//
// MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR say where those directories live;
// outside the grader they may point anywhere, so both fall back to the
// conventional /bot and /output when unset.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function dirFromEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value !== undefined && value !== "" ? value : fallback;
}

const botDir = dirFromEnv("MAKEFUN_BOT_DIR", "/bot");
const outputDir = dirFromEnv("MAKEFUN_OUTPUT_DIR", "/output");

const sourceFile = join(botDir, "POST.json");
const targetFile = join(outputDir, "POST.json");

let payload: Buffer;
try {
  payload = readFileSync(sourceFile);
} catch (err) {
  console.error(`could not read ${sourceFile}: ${(err as Error).message}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(targetFile, payload);

// Read the copy back and compare: the gate trusts these bytes to name the
// post, so a silent short write would be worse than a loud failure.
const delivered = readFileSync(targetFile);
if (!delivered.equals(payload)) {
  console.error(`copy mismatch: wrote ${delivered.length} of ${payload.length} bytes to ${targetFile}`);
  process.exit(1);
}

console.log(`POST.json delivered to ${targetFile} (${payload.length} bytes, verified identical)`);
