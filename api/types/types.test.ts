import { test, expect } from "bun:test";
import { ArkErrors, type } from "arktype";
import { job } from "./job";
import { cleanUrl, normalizeWords } from "../utils";
import { KEYWORD_MAPPINGS } from "../constants";

test("job type validation", () => {
  const inputExample = {
    title: "Quantitative Trader",
    company: "Neutrl Labs",
    tags: ["defi", "delta-neutral", "quant", "stablecoin", "synthetic dollar", "trading"],
    date: "2025-04-02T00:32:29",
    is_remote: true,
    job_description: "job description",
    job_url: "https://www.example.com/job/1234567890/apply?lala=123",
    real_job_url: "mailto:admin@neutrl.xyz",
  };
  const result = job(inputExample);
  expect(result).not.toBeInstanceOf(ArkErrors);
});

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
    new Set(["frontend", "backend", "fullstack", "papa-johns"])
  );
});

test("clean url", () => {
  const url = "https://www.example.com/job/1234567890/apply?lala=123";
  const cleanedUrl = cleanUrl(url);
  expect(cleanedUrl).toEqual("https://www.example.com/job/1234567890");
});

test("check something", () => {
  const aSchema = type({
    "a?": "number",
    b: "number",
  });
  const a = aSchema.assert({ b: 2, ...(false ? { a: 1 } : {}) });
});
