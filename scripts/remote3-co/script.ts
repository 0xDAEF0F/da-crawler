import pLimit from "p-limit";
import { urlSiteHasText } from "../utils";
import { fetchRemote3CoJobs } from "./remote3-co.fetch";
import { chromium, type Browser } from "playwright";

const MAX_DAYS: number = 7;
const KEYWORDS: string[] = ["Sorry,", "Job Not Found"];
const MAX_CONCURRENCY: number = 5;

async function getJobSlugs(): Promise<string[]> {
  const jobs = await fetchRemote3CoJobs({ maxDays: MAX_DAYS, limit: 500 });
  const slugs = jobs.map((job) => job.slug);
  return slugs;
}

async function filterSlugsByKeywords(
  slugs: string[],
  keywords: string[]
): Promise<string[]> {
  if (keywords.length === 0 || slugs.length === 0) {
    return [];
  }

  console.log(
    `Filtering ${slugs.length} slugs using Playwright via urlSiteHasText based on keywords: [${keywords.join(", ")}]`
  );

  const limit = pLimit(MAX_CONCURRENCY);
  const filteredSlugs: string[] = [];
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });

    const keywordChecks = slugs.map((slug) =>
      limit(async () => {
        const hasKeyword = await urlSiteHasText(slug, keywords, browser as Browser);
        if (hasKeyword) {
          console.log(`Slug ${slug} contains keywords.`);
        } else {
          console.log(`Slug ${slug} does not contain keywords.`);
        }
        return { slug, hasKeyword };
      })
    );

    const results = await Promise.all(keywordChecks);

    for (const result of results) {
      if (result.hasKeyword) {
        filteredSlugs.push(result.slug);
      }
    }

    console.log(
      `Found ${filteredSlugs.length} slugs containing keywords after checking content.`
    );
    return filteredSlugs;
  } catch (error) {
    console.error("Error during slug filtering:", error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function main() {
  const validSlugs = await getJobSlugs();

  if (validSlugs.length === 0) {
    console.log("No valid job slugs found. Exiting.");
    return;
  }

  const slugsWithKeywords = await filterSlugsByKeywords(validSlugs, KEYWORDS);

  console.log("--- Final Slugs Matching Keywords ---");
  if (slugsWithKeywords.length > 0) {
    slugsWithKeywords.forEach((slug) => console.log(slug));
  } else {
    console.log("No slugs matched the specified keywords after checking content.");
  }
  console.log("------------------------------------");
}

main();
