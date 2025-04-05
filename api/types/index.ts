import { type } from "arktype";
import { normalizeTags } from "../utils";

// Job schema in database
export const job = type({
  title: type("string").to("string.lower"),
  company: type("string >= 2").to("string.lower"),
  tags: type("string[]").to("string.lower[]").pipe(normalizeTags),
  date: "string.date.iso.parse",
  is_remote: "boolean",
  job_description: "string",
  real_job_url: "string.url",
});

export type Job = typeof job.infer;

// API args for `getJobs`
export const getJobsArgs = type({
  keywords: type("string[]").pipe((s) => s.map((k) => k.trim().toLowerCase())),
  excludeKeywords: type("string[]").pipe((s) =>
    s.map((k) => k.trim().toLowerCase()),
  ),
  "limit?": "number.integer <= 100",
  sinceWhen: type("/^[0-9]+[dw]$/").pipe.try((str) => {
    const amount = parseInt(str.slice(0, -1));
    const date = new Date();
    if (amount === 0) return date;
    const units = str.slice(-1); // d or w
    date.setDate(date.getDate() - amount * (units === "d" ? 1 : 7));
    return date;
  }),
  "isRemote?": "boolean",
});

export type GetJobsArgs = typeof getJobsArgs.infer;
