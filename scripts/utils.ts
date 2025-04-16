import { parseArgs } from "util";

/**
 * Removes specified substrings from a string and cleans up whitespace.
 *
 * @param str The input string.
 * @param substr An array of substrings to remove from the input string.
 * @returns The modified string with specified substrings removed and extra whitespace cleaned up.
 */
export function trimSubstr(str: string, substr: string[]): string {
  let currentStr = str;
  for (const s of substr) {
    if (currentStr.includes(s)) {
      currentStr = currentStr.replace(s, "");
    }
  }
  return currentStr.split(" ").filter(Boolean).join(" ").trim();
}

/**
 * Checks if a date is older than a specified number of days.
 *
 * @param date The date to check.
 * @param max_days The maximum number of days ago the date can be.
 * @returns True if the date is older than the specified number of days, false otherwise.
 */
export function isDateTooOld(date: Date, max_days: number): boolean {
  const now = Date.now(); // now in ms
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in ms
  return now - date.getTime() > max_days * oneDay;
}

export function parseArguments(): {
  max_jobs: number;
  max_days: number;
} {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      max_jobs: {
        type: "string",
        default: "20",
      },
      max_days: {
        type: "string",
        default: "5",
      },
    },
    strict: true,
    allowPositionals: true,
  });
  return {
    max_jobs: parseInt(values.max_jobs),
    max_days: parseInt(values.max_days),
  };
}
