import { PrismaClient } from "@prisma/client";
import { readdir } from "node:fs/promises";
import { jobSchema, type Job } from "./types";

const prisma = new PrismaClient();

const dirContents = await readdir("storage/datasets");

let targetDir = "";
for (const dir of dirContents) {
  if (dir.includes("cryptocurrencyjobs")) {
    targetDir = `storage/datasets/${dir}`;
    break;
  }
}

const scrapedFiles = await readdir(targetDir);

let scrapedData: Job[] = [];
for (const file of scrapedFiles) {
  if (file.includes("__meta")) {
    continue;
  }
  const contentJson = await Bun.file(`${targetDir}/${file}`).json();
  const parsed = jobSchema.parse(contentJson);
  scrapedData.push(parsed);
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
