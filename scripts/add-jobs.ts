import { readdir } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { partition, uniqBy } from "lodash";
import { ArkErrors, type } from "arktype";
import { cleanUrl } from "~/utils/clean-url";
import { normalizeWords } from "~/utils/normalize-words";
import { KEYWORD_MAPPINGS } from "~/utils/constants";

const jobSchema = type({
  title: "string.lower |> string.trim",
  company: "string >= 2 |> string.trim |> string.lower",
  tags: type("string[]")
    .to("string.lower[] |> string.trim[]")
    .pipe((tags) => normalizeWords(tags, KEYWORD_MAPPINGS)),
  date: "string.date.iso.parse",
  is_remote: "boolean",
  job_description: "string",
  job_url: type("string"),
  // the `apply_url`
  real_job_url: type("string.url").pipe(cleanUrl),
});

type JobSchema = typeof jobSchema.infer;

const prisma = new PrismaClient();

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

let jobsA: JobSchema[] = [];
for (const file of scrapedFilesA) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `crawler/storage/datasets/${cryptocurrencyJobsScrapeDir}/${file}`
  ).json();
  const maybeParsed = jobSchema(contentJson);
  if (maybeParsed instanceof ArkErrors) {
    console.error(
      `Error parsing: "crawler/storage/datasets/${cryptocurrencyJobsScrapeDir}/${file}"`
    );
    throw new Error(maybeParsed.summary);
  }
  jobsA.push(maybeParsed);
}

console.log(`--- Cryptocurrency Jobs: ${jobsA.length}`);

let jobsB: JobSchema[] = [];
for (const file of scrapedFilesB) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `crawler/storage/datasets/${cryptoJobsScrapeDir}/${file}`
  ).json();
  const maybeParsed = jobSchema(contentJson);
  if (maybeParsed instanceof ArkErrors) {
    console.error(
      `Error parsing: "crawler/storage/datasets/${cryptoJobsScrapeDir}/${file}"`
    );
    throw new Error(maybeParsed.summary);
  }
  jobsB.push(maybeParsed);
}

console.log(`--- Crypto Jobs: ${jobsB.length}`);

const allJobs = [
  ...jobsA.map((j) => ({
    ...j,
    source: "cryptocurrencyjobs",
  })),
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
    where: { job_url: job.real_job_url },
  });

  if (alreadyExists) {
    console.log(`--- Job already exists: ${job.real_job_url}`);
    continue;
  }

  await prisma.job.create({
    data: {
      company: job.company,
      title: job.title,
      tags: JSON.stringify(job.tags),
      date: job.date,
      is_remote: job.is_remote,
      job_description: job.job_description,
      job_url: job.real_job_url,
      job_description_url: job.job_url,
      source: job.source,
    },
  });
}

console.log(`--- Done!`);
