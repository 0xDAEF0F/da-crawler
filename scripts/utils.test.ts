import { test, expect } from "bun:test";

/**
 * Removes specified substrings from a string and cleans up whitespace.
 *
 * @param str The input string.
 * @param substr An array of substrings to remove from the input string.
 * @returns The modified string with specified substrings removed and extra whitespace cleaned up.
 */
export function trimSubstr(str: string, substr: string[]): string {
  let currentStr = str;
  for (const s of substr) {
    if (currentStr.includes(s)) {
      currentStr = currentStr.replace(s, "");
    }
  }
  return currentStr.split(" ").filter(Boolean).join(" ").trim();
}

test("trimSubstr", () => {
  expect(trimSubstr("hello world", ["world"])).toBe("hello");
  expect(trimSubstr("hola como estas putin", ["putin", "como"])).toBe("hola estas");
  expect(trimSubstr("hello world", ["world", "hello"])).toBe("");
  expect(trimSubstr("hello | smartrecruiters", ["world", "| smartrecruiters"])).toBe(
    "hello"
  );
});
