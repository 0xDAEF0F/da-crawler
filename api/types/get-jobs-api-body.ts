import { type } from "arktype";

// Schema for the `getJobs` API arguments/params in body
export const getJobsArgs = type({
  // 1d, 1w, 2d, 42w
  sinceWhen: type("/^[0-9]+[dw]$/").pipe((str) => {
    const amount = parseInt(str.slice(0, -1));
    const date = new Date();
    if (amount === 0) return date;
    const units = str.slice(-1); // d or w
    date.setDate(date.getDate() - amount * (units === "d" ? 1 : 7));
    return date;
  }),
  keywords: type("string.lower[] |> string.trim[]"),
  excludeKeywords: type("string.lower[] |> string.trim[]"),
  "limit?": "number.integer <= 100",
  "isRemote?": "boolean",
});

export type GetJobsArgs = typeof getJobsArgs.infer;
