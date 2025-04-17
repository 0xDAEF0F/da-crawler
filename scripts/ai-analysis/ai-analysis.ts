import { PrismaClient } from "@prisma/client";
import { summarizeJob } from "./ai-analysis.utils";

const MIN_JOB_DESCRIPTION_LENGTH = 500;
const MAX_JOBS_TO_ANALYZE = 1;

const prisma = new PrismaClient();

const jobs_ = await prisma.job.findMany({
  where: {
    ai_analysis: null,
  },
  orderBy: {
    date: "desc",
  },
});

console.log(`Found ${jobs_.length} jobs with no ai analysis`);

const jobs = jobs_.filter((job) => {
  return job.job_description.length > MIN_JOB_DESCRIPTION_LENGTH;
});

console.log(
  `Found ${jobs.length} jobs with a description longer than ${MIN_JOB_DESCRIPTION_LENGTH} characters`
);

if (jobs.length === 0) {
  console.log("No suitable jobs found to analyze.");
  process.exit(0);
}

const maybeSummarizedResults = await Promise.allSettled(
  jobs.slice(0, MAX_JOBS_TO_ANALYZE).map(async (job) => {
    const analysis = await summarizeJob(job);
    return { job, analysis };
  })
);

let summarizationErrors = 0;
const summarizedResults = maybeSummarizedResults.flatMap((result) => {
  if (result.status === "fulfilled") return [result.value];
  summarizationErrors++;
  return [];
});

if (summarizationErrors > 0) {
  console.error(`${summarizationErrors} jobs were not summarized`);
}

// Save AI analyses to the database
for (const { job, analysis } of summarizedResults) {
  console.log(`Saving analysis for ${job.title}`);
  console.log(`Analysis: ${analysis.summary}`);
}
