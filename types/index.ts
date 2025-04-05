import { type } from "arktype";

export const getJobsArgs = type({
  keywords: type("string[]").pipe((s) => s.map((k) => k.trim().toLowerCase())),
  excludeKeywords: type("string[]").pipe((s) =>
    s.map((k) => k.trim().toLowerCase())
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
