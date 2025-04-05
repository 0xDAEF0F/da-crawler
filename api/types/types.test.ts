import { test, expect } from "bun:test";
import { ArkErrors } from "arktype";
import { job } from ".";
import { normalizeTags } from "../utils/utils";

test("job type validation", () => {
  const inputExample = {
    title: "Quantitative Trader",
    company: "Neutrl Labs",
    tags: [
      "defi",
      "delta-neutral",
      "quant",
      "stablecoin",
      "synthetic dollar",
      "trading",
    ],
    date: "2025-04-02T00:32:29",
    is_remote: true,
    job_description: "job description",
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
  const normalizedTags = normalizeTags(tags);
  expect(new Set(normalizedTags)).toEqual(
    new Set(["frontend", "backend", "fullstack", "papa-johns"]),
  );
});
