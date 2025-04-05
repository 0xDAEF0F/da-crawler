import { readdir } from "node:fs/promises";
import { job, type Job } from "../types";
import { PrismaClient } from "@prisma/client";
import { partition, uniqBy } from "lodash";
import { ArkErrors } from "arktype";
import { cleanUrl, normalizeTags } from "../utils";

const prisma = new PrismaClient();

// Delete everything first
await prisma.job.deleteMany();

const [cryptocurrencyJobs, cryptoJobs] = partition(
  await readdir("storage/datasets"),
  (dir) => dir.includes("cryptocurrencyjobs"),
);

const dateReducer = (curr: string, acc: string) => {
  const currTimestamp = +curr.split("_")[1]!;
  const accTimestamp = +acc.split("_")[1]!;
  return currTimestamp > accTimestamp ? curr : acc;
};

const cryptocurrencyJobsScrapeDir = cryptocurrencyJobs.reduce(dateReducer);
const cryptoJobsScrapeDir = cryptoJobs.reduce(dateReducer);

console.log(
  `--- Cryptocurrency Jobs Scrape Dir: ${cryptocurrencyJobsScrapeDir}`,
);
console.log(`--- Crypto Jobs Scrape Dir: ${cryptoJobsScrapeDir}`);

const scrapedFilesA = await readdir(
  `storage/datasets/${cryptocurrencyJobsScrapeDir}`,
);
const scrapedFilesB = await readdir(`storage/datasets/${cryptoJobsScrapeDir}`);

let jobsA: Job[] = [];
for (const file of scrapedFilesA) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `storage/datasets/${cryptocurrencyJobsScrapeDir}/${file}`,
  ).json();
  const maybeParsed = job(contentJson);
  if (maybeParsed instanceof ArkErrors) {
    console.error(
      `Error parsing: "storage/datasets/${cryptocurrencyJobsScrapeDir}/${file}"`,
    );
    throw new Error(maybeParsed.summary);
  }
  jobsA.push(maybeParsed);
}

console.log(`--- Cryptocurrency Jobs: ${jobsA.length}`);

let jobsB: Job[] = [];
for (const file of scrapedFilesB) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `storage/datasets/${cryptoJobsScrapeDir}/${file}`,
  ).json();
  const maybeParsed = job(contentJson);
  if (maybeParsed instanceof ArkErrors) {
    console.error(
      `Error parsing: "storage/datasets/${cryptoJobsScrapeDir}/${file}"`,
    );
    throw new Error(maybeParsed.summary);
  }
  jobsB.push(maybeParsed);
}

console.log(`--- Crypto Jobs: ${jobsB.length}`);

const allJobs = [
  ...jobsA.map((j) => ({
    ...j,
    tags: normalizeTags(j.tags),
    source: "cryptocurrencyjobs",
  })),
  ...jobsB.map((j) => ({
    ...j,
    tags: normalizeTags(j.tags),
    source: "cryptojobs",
  })),
];

console.log(`--- All Jobs: ${allJobs.length}`);

let allJobs_ = allJobs.map((job) => ({
  ...job,
  real_job_url: cleanUrl(job.real_job_url),
}));
let allJobsUniqBy = uniqBy(allJobs_, "real_job_url");

console.log(
  `--- Unique Jobs (filtered by real_job_url): ${allJobsUniqBy.length}`,
);

for (const job of allJobsUniqBy) {
  await prisma.job.create({
    data: {
      company: job.company,
      title: job.title,
      tags: JSON.stringify(job.tags),
      date: job.date,
      is_remote: job.is_remote,
      job_description: job.job_description,
      job_url: job.real_job_url,
      source: job.source,
    },
  });
}

console.log(`--- Done!`);
