import { expect, test } from "bun:test";
import { cleanUrl } from "~/utils/clean-url";
import { KEYWORD_MAPPINGS } from "~/utils/constants";
import { normalizeWords } from "~/utils/normalize-words";

test("normalize tags", () => {
  const tags = [
    "frontend",
    "frontend",
    "papa-johns",
    "front end",
    "front-end",
    "backend",
    "back end",
    "back-end",
    "fullstack",
    "full stack",
    "full-stack",
  ];
  const normalizedTags = normalizeWords(tags, KEYWORD_MAPPINGS);
  expect(new Set(normalizedTags)).toEqual(
    new Set(["frontend", "backend", "fullstack", "papa-johns"]),
  );
});

test("clean url", () => {
  const url = "https://www.example.com/job/1234567890/apply?lala=123";
  const cleanedUrl = cleanUrl(url);
  expect(cleanedUrl).toEqual("https://www.example.com/job/1234567890");
});
