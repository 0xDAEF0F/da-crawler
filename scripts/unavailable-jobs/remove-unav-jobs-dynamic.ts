import { checkUrlForKeywords } from "@/url-content-checker";
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

chromium.use(stealthPlugin());

const MAX_DAYS: number = 7;
const KEYWORDS: string[] = ["sorry,", "job not found", "page not found"];

const prisma = new PrismaClient();

const browser = await chromium.launch({ headless: true });

const jobs = await prisma.job.findMany({
  where: {
    publishedAt: {
      gt: new Date(Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000),
    },
  },
  select: {
    id: true,
    jobUrl: true,
  },
  take: 100,
});

const matchedJobs = jobs.flatMap(async (job) => {
  const matches = await checkUrlForKeywords(job.jobUrl, KEYWORDS, browser);
  if (matches) return [job];
  return [];
});
const matchedJobs_ = (await Promise.all(matchedJobs)).flat();

console.log(`Found ${matchedJobs.length} jobs with the matched keywords`);

for (const job of matchedJobs_) {
  await prisma.job.delete({
    where: { id: job.id },
  });
}

console.log(`Deleted ${matchedJobs.length} jobs`);

await browser.close();
await prisma.$disconnect();
