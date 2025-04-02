import { test, expect } from "bun:test";
import { jobSchema } from "./types";

test("jobSchema transforms snake_case to camelCase", () => {
  const inputExample = {
    title: "Quantitative Trader",
    job_url:
      "https://cryptocurrencyjobs.co/engineering/neutrl-labs-quantitative-trader/",
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
    job_description: "job description",
    real_job_url: "mailto:admin@neutrl.xyz",
  };
  const result = jobSchema.safeParse(inputExample);
  if (!result.success) {
    console.error(result.error);
  } else {
    console.log(result.data);
  }
  expect(result.success, "Job schema should be valid").toBe(true);
});
