import { type } from "arktype";
import { PrismaClient } from "@prisma/client";
import { isDateTooOld, parseArguments } from "../utils";
import { beInCryptoSchema } from "./beincrypto.schema";
import { fetchBeInCryptoJobs } from "./beincrypto.fetch";
import { jobSchema, type JobSchema } from "~/utils/job.schema";
import { saveJobInDb } from "~/utils/save-job-db";

const { max_jobs: MAX_JOBS, max_days: MAX_DAYS } = parseArguments();

const prisma = new PrismaClient();

const jobsToPersist = [];

// 350 JOB LISTINGS
for (let i = 1; i <= 10 /* pages */; i++) {
  let data: unknown[];
  try {
    data = await fetchBeInCryptoJobs(i);
  } catch (e) {
    console.error(`UNABLE TO FETCH JOBS FROM BEINCRYPTO.TS --- ABORTING`);
    break;
  }
  const validatedJobs: (typeof jobSchema.infer)[] = [];
  for (const job of data) {
    const validatedJob = beInCryptoSchema(job);
    if (validatedJob instanceof type.errors) {
      console.error(`Unable to validate job in page ${i} from beincrypto.ts`);
      continue;
    }
    const jobS = jobSchema({
      title: validatedJob.title,
      source: "beincrypto",
      company: {
        name: validatedJob.company.name,
      },
      tags: validatedJob.jobTags.map((jt) => jt.label),
      publishedAt: validatedJob.publishedDate,
      isRemote: validatedJob.locationTags.some((lt) =>
        lt.label.toLowerCase().includes("remote"),
      ),
      location: validatedJob.locationTags.map((lt) => lt.label),
      jobDescription: validatedJob.description,
      jobUrl: validatedJob.applyLink,
      ...(validatedJob.salaryStart && validatedJob.salaryEnd
        ? {
            salaryMin: validatedJob.salaryStart,
            salaryMax: validatedJob.salaryEnd,
          }
        : {}),
    });
    if (jobS instanceof type.errors) {
      console.error(`Unable to validate "jobSchema" in page ${i} from beincrypto.ts`);
      continue;
    }
    if (isDateTooOld(jobS.publishedAt, MAX_DAYS)) {
      console.warn(`Skipping job ${jobS.title} because it's too old`);
      continue;
    }
    validatedJobs.push(jobS);
  }

  jobsToPersist.push(...validatedJobs);

  console.log(`Validated ${validatedJobs.length} jobs on page ${i}`);

  if (jobsToPersist.length >= MAX_JOBS) {
    break;
  }

  // sleep for 0.5 seconds
  await new Promise((resolve) => setTimeout(resolve, 500));
}

if (jobsToPersist.length === 0) {
  console.log(`No jobs to persist in beincrypto.ts --- Exiting`);
  process.exit(0);
}

console.log(`Found ${jobsToPersist.length} jobs`);

const uniqueJobsToSave = await filterDuplicateJobs(jobsToPersist);

console.log(`Saving ${uniqueJobsToSave.length} jobs`);

for (const job of uniqueJobsToSave) {
  await saveJobInDb(job, prisma);
}

console.log(`Persisted ${uniqueJobsToSave.length} jobs`);

await prisma.$disconnect();

// ---

async function filterDuplicateJobs(jobs: JobSchema[]) {
  const uniqueJobs: JobSchema[] = [];
  for (const job of jobs) {
    const existingJob = await prisma.job.findUnique({
      where: {
        jobUrl: job.jobUrl,
      },
    });
    if (!existingJob) {
      uniqueJobs.push(job);
    }
  }
  console.log(`${jobs.length - uniqueJobs.length} duplicate jobs found`);
  return uniqueJobs;
}
