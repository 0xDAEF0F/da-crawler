import { test, expect } from "bun:test";
import { getJobsBody, trimmedLowerCaseStrings } from "./body.schema";

test("get jobs args", () => {
  const args = getJobsBody({
    sinceWhen: "100d",
    keywords: ["Frontend", "Backend", "Fullstack"],
    excludeKeywords: ["PHP", "Wordpress"],
    limit: 10,
    isRemote: true,
  });

  expect(args).toEqual({
    sinceWhen: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    keywords: ["frontend", "backend", "fullstack"],
    excludeFromTitle: undefined,
    excludeKeywords: ["php", "wordpress"],
    limit: 10,
    isRemote: true,
  });
});

test("lower case and trim works", () => {
  const result = trimmedLowerCaseStrings(["  Hello World  ", "Hello World", "", "  "]);
  expect(result).toEqual(["hello world", "hello world"]);
});
