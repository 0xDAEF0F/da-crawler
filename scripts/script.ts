import { readdir } from "node:fs/promises";
import { jobSchema, type Job } from "../src/types";

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
    `storage/datasets/${targetDir}/${file}`
  ).json();
  const maybeParsed = jobSchema.safeParse(contentJson);
  if (maybeParsed.error) {
    console.log(`Error parsing: "storage/datasets/${targetDir}/${file}"`);
    throw new Error(maybeParsed.error.message);
  }
  scrapedData.push(maybeParsed.data);
}

for (let i = 0; i < scrapedData.length; i++) {
  const job = scrapedData[i]!;
  if (job.jobDescription.toLowerCase().includes("remote")) {
    console.log(`found remote word in description: ${i}`);
  }
}
