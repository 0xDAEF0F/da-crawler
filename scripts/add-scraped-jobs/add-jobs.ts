import { readdir } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { partition, uniqBy } from "lodash";
import { ArkErrors } from "arktype";
import { scrapedJobSchema, type ScrapedJobSchema } from "./scraped-job.schema";

const prisma = new PrismaClient();

await prisma.jobAiAnalysis.deleteMany();
await prisma.job.deleteMany({
  where: { source: { in: ["cryptocurrencyjobs", "cryptojobs"] } },
});

const [cryptocurrencyJobs, cryptoJobs] = partition(
  await readdir("crawler/storage/datasets"),
  (dir) => dir.includes("cryptocurrencyjobs")
);

const dateReducer = (curr: string, acc: string) => {
  const currTimestamp = +curr.split("_")[1]!;
  const accTimestamp = +acc.split("_")[1]!;
  return currTimestamp > accTimestamp ? curr : acc;
};

const cryptocurrencyJobsScrapeDir = cryptocurrencyJobs.reduce(dateReducer);
const cryptoJobsScrapeDir = cryptoJobs.reduce(dateReducer);

console.log(`--- Cryptocurrency Jobs Scrape Dir: ${cryptocurrencyJobsScrapeDir}`);
console.log(`--- Crypto Jobs Scrape Dir: ${cryptoJobsScrapeDir}`);

const scrapedFilesA = await readdir(
  `crawler/storage/datasets/${cryptocurrencyJobsScrapeDir}`
);
const scrapedFilesB = await readdir(`crawler/storage/datasets/${cryptoJobsScrapeDir}`);

let jobsA: ScrapedJobSchema[] = [];
for (const file of scrapedFilesA) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `crawler/storage/datasets/${cryptocurrencyJobsScrapeDir}/${file}`
  ).json();
  const maybeParsed = scrapedJobSchema(contentJson);
  if (maybeParsed instanceof ArkErrors) {
    console.error(
      `Error parsing: "crawler/storage/datasets/${cryptocurrencyJobsScrapeDir}/${file}"`
    );
    console.error(maybeParsed.summary);
    continue;
  }
  jobsA.push(maybeParsed);
}

console.log(`--- Cryptocurrency Jobs: ${jobsA.length}`);

let jobsB: ScrapedJobSchema[] = [];
for (const file of scrapedFilesB) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `crawler/storage/datasets/${cryptoJobsScrapeDir}/${file}`
  ).json();
  const maybeParsed = scrapedJobSchema(contentJson);
  if (maybeParsed instanceof ArkErrors) {
    console.error(
      `Error parsing: "crawler/storage/datasets/${cryptoJobsScrapeDir}/${file}"`
    );
    console.error(maybeParsed.summary);
    continue;
  }
  jobsB.push(maybeParsed);
}

console.log(`--- Crypto Jobs: ${jobsB.length}`);

const allJobs = [
  ...jobsA.map((j) => {
    return {
      ...j,
      source: "cryptocurrencyjobs",
    };
  }),
  ...jobsB.map((j) => ({
    ...j,
    source: "cryptojobs",
  })),
];

console.log(`--- All Jobs: ${allJobs.length}`);

let allJobsUniqBy = uniqBy(allJobs, "real_job_url");

console.log(`--- Unique Jobs (filtered by real_job_url): ${allJobsUniqBy.length}`);

for (const job of allJobsUniqBy) {
  const alreadyExists = await prisma.job.findUnique({
    where: { jobUrl: job.real_job_url },
  });

  if (alreadyExists) {
    console.log(`--- Job already exists: ${job.real_job_url}`);
    continue;
  }

  await prisma.job.create({
    data: {
      company: {
        connectOrCreate: {
          where: { name: job.company },
          create: { name: job.company },
        },
      },
      title: job.title,
      keywords: JSON.stringify(job.tags),
      publishedAt: job.date,
      isRemote: job.is_remote,
      jobDescription: job.job_description,
      jobUrl: job.real_job_url,
      source: job.source,
      salaryMin: job.min_salary,
      salaryMax: job.max_salary,
    },
  });
}

console.log(`--- Done!`);

await prisma.$disconnect();
