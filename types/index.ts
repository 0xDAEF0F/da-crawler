import { type } from "arktype";

const stringArrTrimmedLower = type("string[]").pipe((s) =>
  s.map((k) => k.trim().toLowerCase())
);

export const getJobsArgs = type({
  keywords: stringArrTrimmedLower,
  excludeKeywords: stringArrTrimmedLower,
  sinceWhen: type("/^[0-9]+[dw]$/").pipe.try((str) => {
    const amount = parseInt(str.slice(0, -1));
    const date = new Date();
    if (amount === 0) return date;
    const units = str.slice(-1);
    if (units === "d") {
      date.setDate(date.getDate() - amount);
    }
    if (units === "w") {
      date.setDate(date.getDate() - amount * 7);
    }
    return date;
  }),
  isRemote: "boolean?",
});

export type GetJobsArgs = typeof getJobsArgs.infer;
