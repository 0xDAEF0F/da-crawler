import { type } from "arktype";
import { job, type Job } from "../api/types/job";
import { PrismaClient } from "@prisma/client";
import { isDateTooOld, parseArguments } from "./utils";
import { beInCryptoSchema } from "./beincrypto.schema";
import { fetchBeInCryptoJobs } from "./beincrypto-fetch";

const { max_jobs: MAX_JOBS, max_days: MAX_DAYS } = parseArguments();

const prisma = new PrismaClient();

const jobsToPersist: Job[] = [];

// 350 JOB LISTINGS
for (let i = 1; i <= 10 /* pages */; i++) {
  let data: unknown[];
  try {
    data = await fetchBeInCryptoJobs(i);
  } catch (e) {
    console.error(`UNABLE TO FETCH JOBS FROM BEINCRYPTO.TS --- ABORTING`);
    break;
  }
  const validatedJobs: (typeof beInCryptoSchema.infer)[] = [];
  for (const job of data) {
    const validatedJob = beInCryptoSchema(job);
    if (validatedJob instanceof type.errors) {
      console.error(`Unable to validate job in page ${i} from beincrypto.ts`);
      continue;
    }
    validatedJobs.push(validatedJob);
  }

  const jobs_ = validatedJobs.flatMap((j): Job[] => {
    const maybeJob = job({
      title: j.title,
      company: j.company.name,
      tags: j.jobTags.map((jt) => jt.label),
      date: j.publishedDate,
      is_remote: j.locationTags.some((lt) => lt.label.toLowerCase().includes("remote")),
      job_description: j.description,
      job_url: j.applyLink,
      real_job_url: j.applyLink,
    });
    if (maybeJob instanceof type.errors) {
      console.error(`Error validating job ${j.title} from beincrypto.ts`);
      return [];
    } else if (isDateTooOld(maybeJob.date, MAX_DAYS)) {
      console.warn(`Skipping job ${maybeJob.title} because it's too old`);
      return [];
    }
    return [maybeJob];
  });

  jobsToPersist.push(...jobs_);

  console.log(`Validated ${jobs_.length} jobs on page ${i}`);

  if (jobsToPersist.length >= MAX_JOBS) {
    break;
  }
  // wait 0.5 second to avoid suspicions
  await new Promise((resolve) => setTimeout(resolve, 500));
}

if (jobsToPersist.length === 0) {
  console.log(`No jobs to persist in beincrypto.ts --- Exiting`);
  process.exit(0);
}

console.log(`Found ${jobsToPersist.length} jobs`);

let count = 0;
for (const job of jobsToPersist) {
  try {
    await prisma.job.create({
      data: {
        source: "beincrypto",
        company: job.company,
        is_remote: job.is_remote,
        date: job.date,
        job_description: job.job_description,
        job_url: job.real_job_url,
        tags: JSON.stringify(job.tags),
        title: job.title,
      },
    });
    count++;
  } catch (e) {
    console.error(`Unable to persist job in db ${job.title} from beincrypto.ts`);
    console.log(`Reason: ${e}`);
  }
}

console.log(`Persisted ${count} jobs`);
