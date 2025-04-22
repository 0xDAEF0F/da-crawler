import { parseArgs } from "util";
import { type Browser } from "playwright";

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

/**
 * Fetches the content of a URL and checks if it contains any of the specified keywords (case-insensitive).
 *
 * @param url The URL to fetch.
 * @param keywords An array of keywords to search for in the page content.
 * @param browser The browser instance to use for fetching the page.
 * @param timeout The timeout in milliseconds for fetching the page.
 * @returns A promise that resolves to true if any keyword is found, false otherwise or if an error occurs.
 */
export async function urlSiteHasText(
  url: string,
  keywords: string[],
  browser: Browser
): Promise<boolean> {
  if (keywords.length === 0) {
    console.log("No keywords provided to urlSiteHasText, returning false.");
    return false;
  }
  let context = null;
  let page = null;
  try {
    context = await browser.newContext();
    page = await context.newPage();

    await Promise.race([
      page.goto(url, { waitUntil: "load" }),
      new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error(`Timeout fetching ${url}`)), 7000) // 7 seconds timeout
      ),
    ]);

    // @ts-ignore - document is available in the browser context
    const textContent: string = await page.evaluate(() => document.body.innerText);
    const lowerCaseText = textContent.toLowerCase();
    const foundKeyword = keywords.some((k) => lowerCaseText.includes(k.toLowerCase()));

    await page.close();
    await context.close();

    return foundKeyword;
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error);
    if (page && !page.isClosed()) {
      await page.close();
    }
    if (context) {
      await context.close();
    }
    return false;
  }
}
