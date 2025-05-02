import { type } from "arktype";

export const trimmedLowerCaseStrings = type("string.lower[] |> string.trim[]").pipe(
  (arr) => arr.filter(Boolean),
);

// Schema for the `getJobs` API arguments/params in body
export const getJobsBody = type({
  // 1d, 1w, 2d, 42w
  sinceWhen: type("/^[0-9]+[dw]$/").pipe((str) => {
    const amount = parseInt(str.slice(0, -1));
    const date = new Date();
    if (amount === 0) return date;
    const units = str.slice(-1); // d or w
    date.setDate(date.getDate() - amount * (units === "d" ? 1 : 7));
    return date;
  }),
  keywords: trimmedLowerCaseStrings,
  // excludes jobs that contain these words in the title
  "excludeFromTitle?": trimmedLowerCaseStrings,
  // excludes jobs that contain these words in it's set of keywords/tags
  excludeKeywords: trimmedLowerCaseStrings,
  "limit?": "number.integer <= 100",
  "offset?": "number.integer",
  "isRemote?": "boolean",
});

export type GetJobsBody = typeof getJobsBody.infer;
