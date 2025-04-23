import { test, expect } from "bun:test";
import { type } from "arktype";
import { fetchCryptocurrencyJobs } from "./ccj.fetch";
import { ccjSchema } from "./ccj.schema";

test("ccjSchema", async () => {
  const jobs = await fetchCryptocurrencyJobs();
  const ccjJobs = jobs.map((job) => ccjSchema(job));
  expect(ccjJobs.some((job) => job instanceof type.errors)).toBe(false);
});
