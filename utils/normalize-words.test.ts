import { test, expect } from "bun:test";
import { normalizeWords } from "./normalize-words";
import { KEYWORD_MAPPINGS } from "./constants";

test("normalizeWords - do nothing", () => {
  const words = ["javascript", "type script"];
  const normalizedWords = normalizeWords(words, {});
  expect(normalizedWords).toEqual(["javascript", "type script"]);
});

test("normalizeWords - normalize nextjs", () => {
  const words = ["next.js", "javascript"];
  const normalizedWords = new Set(normalizeWords(words, KEYWORD_MAPPINGS));
  expect(normalizedWords).toEqual(new Set(["nextjs", "javascript"]));
});
