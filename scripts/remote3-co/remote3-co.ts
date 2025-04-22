import { type } from "arktype";
import TurndownService from "turndown";
import { PrismaClient } from "@prisma/client";
import { isDateTooOld, parseArguments } from "../utils";
import { remote3CoSchema } from "./remote3-co.schema";
import { fetchRemote3CoJobs } from "./remote3-co.fetch";

const { max_jobs: MAX_JOBS, max_days: MAX_DAYS } = parseArguments();

const prisma = new PrismaClient();

async function checkUrlContainsText(url: string, searchText: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return text.includes(searchText);
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error);
    return false;
  }
}

const turndownService = new TurndownService({
  linkReferenceStyle: "collapsed",
  linkStyle: "referenced",
});

const remote3Jobs = await fetchRemote3CoJobs({ maxDays: MAX_DAYS, limit: MAX_JOBS });

console.log(`Found ${remote3Jobs.length} jobs from remote3.co`);

// Filter out no longer available jobs
const jobsToSave = await Promise.all(
  remote3Jobs.filter(async (job) => {
    const isNoLongerAvailable = await checkUrlContainsText(
      job.apply_url,
      "Sorry, we couldn't find anything here"
    );
    return !isNoLongerAvailable;
  })
);

console.log(
  `After filtering for no longer available jobs, ${jobsToSave.length} remained.`
);

const nonDuplicateJobs: (typeof remote3CoSchema.infer)[] = [];

// Filter out duplicate jobs
for (const job of jobsToSave) {
  const alreadySavedJob = await prisma.job.findFirst({
    where: {
      OR: [{ job_url: job.apply_url }, { job_description_url: job.slug }],
    },
  });
  if (!alreadySavedJob) {
    nonDuplicateJobs.push(job);
  }
  if (nonDuplicateJobs.length >= MAX_JOBS) {
    break;
  }
}

console.log(
  `Found ${
    jobsToSave.length - nonDuplicateJobs.length
  } duplicate jobs. Saving ${nonDuplicateJobs.length} jobs to db.`
);

// Save the unique jobs to the database
for (const job of nonDuplicateJobs) {
  try {
    await prisma.job.create({
      data: {
        company: job.companies.name,
        date: job.live_at,
        job_description: job.description,
        job_url: job.apply_url,
        job_description_url: job.slug,
        title: job.title,
        source: "remote3-co",
        tags: JSON.stringify(job.categories),
        is_remote: job.on_site ? false : true,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
      },
    });
  } catch (e) {
    console.error(`Error persisting job: ${job.title}`);
  }
}
