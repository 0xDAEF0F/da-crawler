import { readdir } from "node:fs/promises";
import { jobSchema, type Job } from "../src/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// they are ordered by unix timestamp
const targetDir = (await readdir("storage/datasets")).reduce((curr, acc) => {
  const currTimestamp = +curr.split("_")[1]!;
  const accTimestamp = +acc.split("_")[1]!;
  return currTimestamp > accTimestamp ? curr : acc;
});

const scrapedFiles = await readdir(`storage/datasets/${targetDir}`);

let scrapedData: Job[] = [];

for (const file of scrapedFiles) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `storage/datasets/${targetDir}/${file}`
  ).json();
  const maybeParsed = jobSchema.safeParse(contentJson);
  if (maybeParsed.error) {
    console.error(`Error parsing: "storage/datasets/${targetDir}/${file}"`);
    throw new Error(maybeParsed.error.message);
  }
  scrapedData.push(maybeParsed.data);
}

for (const job of scrapedData) {
  await prisma.job.create({
    data: {
      is_remote: job.isRemote,
      title: job.title,
      source: "cryptocurrencyjobs",
      company: job.company,
      tags: JSON.stringify(job.tags),
      date: job.date,
      job_description: job.jobDescription,
      job_url: job.realJobUrl,
    },
  });
}
