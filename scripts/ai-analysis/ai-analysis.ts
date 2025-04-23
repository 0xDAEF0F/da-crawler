import { PrismaClient } from "@prisma/client";
import { summarizeJob } from "./ai-analysis.utils";

const MIN_JOB_DESCRIPTION_LENGTH = 500;
const MAX_JOBS_TO_ANALYZE = 100;

const prisma = new PrismaClient();

const jobs_ = await prisma.job.findMany({
  where: {
    OR: [{ aiAnalysis: null }, { aiAnalysis: { summary: undefined } }],
  },
  orderBy: {
    publishedAt: "desc",
  },
});

console.log(`Found ${jobs_.length} jobs with no ai analysis`);

const jobs = jobs_.filter((job) => {
  return job.jobDescription.length > MIN_JOB_DESCRIPTION_LENGTH;
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

let successfulUpdates = 0;
let failedUpdates = 0;

// Save AI analyses to the database
for (const { job, analysis } of summarizedResults) {
  if (!analysis.summary) {
    console.log(`Skipping job ${job.id} - no summary available`);
    failedUpdates++; // Count skipped jobs as failures for this context
    continue;
  }

  console.log(`${job.id} - ${analysis.summary}`);

  try {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        aiAnalysis: {
          upsert: {
            create: {
              summary: analysis.summary,
              keywords: JSON.stringify(analysis.keywords),
              salaryMin: analysis.minSalary === 0 ? null : analysis.minSalary,
              salaryMax: analysis.maxSalary === 0 ? null : analysis.maxSalary,
            },
            update: {
              summary: analysis.summary,
              keywords: JSON.stringify(analysis.keywords),
              salaryMin: analysis.minSalary === 0 ? null : analysis.minSalary,
              salaryMax: analysis.maxSalary === 0 ? null : analysis.maxSalary,
            },
          },
        },
      },
    });
    successfulUpdates++;
  } catch (error) {
    console.error(`Failed to update job ${job.id}:`, error);
    failedUpdates++;
  }
}

console.log(`Successfully saved/updated AI analysis for ${successfulUpdates} jobs.`);
if (failedUpdates > 0) {
  console.error(`Failed to save/update AI analysis for ${failedUpdates} jobs.`);
}

await prisma.$disconnect();
