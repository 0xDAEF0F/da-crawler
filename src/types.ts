import { z } from "zod";
import { test, expect } from "bun:test";

export type Job = {
  title: string;
  jobUrl: string;
  company: string;
  tags: string[];
  date: string;
  jobDescription: string;
  realJobUrl: string;
};

export const jobSchema = z
  .object({
    title: z.string().min(5).max(100),
    job_url: z.string().url(),
    company: z.string().min(3).max(100),
    tags: z.array(z.string().min(3)),
    date: z.string().datetime({ local: true }),
    job_description: z.string().min(10),
    real_job_url: z.string().url(),
  })
  .transform((data) => {
    const transformed: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
      transformed[snakeToCamel(key)] = value;
    });
    return transformed as Job;
  });

// Utility function
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

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
