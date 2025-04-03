import { readdir } from "node:fs/promises";
import { jobSchema, type Job } from "./types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Delete all existing jobs
await prisma.job.deleteMany();

// they are ordered by unix timestamp
const dirContents = await readdir("storage/datasets");
const targetDir = dirContents[dirContents.length - 1];

if (!targetDir) {
  throw new Error("No target directory found");
}

const scrapedFiles = await readdir(`storage/datasets/${targetDir}`);

let scrapedData: Job[] = [];
for (const file of scrapedFiles) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(
    `storage/datasets/${targetDir}/${file}`,
  ).json();
  const maybeParsed = jobSchema.safeParse(contentJson);
  if (maybeParsed.error) {
    console.log(`Error parsing: "storage/datasets/${targetDir}/${file}"`);
    throw new Error(maybeParsed.error.message);
  }
  scrapedData.push(maybeParsed.data);
}

for (const job of scrapedData) {
  await prisma.job.create({
    data: {
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
