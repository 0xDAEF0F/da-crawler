import {
  addCompanyLogoIfMissing,
  checkIfUrlFetchReturnsText,
  parseArguments,
} from "@/utils";
import { PrismaClient } from "@prisma/client";
import TurndownService from "turndown";
import { saveJobInDb } from "~/utils/save-job-db";
import { fetchRemote3CoJobs } from "./remote3-co.fetch";
import type { Remote3CoJob } from "./remote3-co.schema";

const { max_jobs: MAX_JOBS, max_days: MAX_DAYS } = parseArguments();

const prisma = new PrismaClient();

const turndownService = new TurndownService({
  linkReferenceStyle: "collapsed",
  linkStyle: "referenced",
});

const remote3Jobs: Remote3CoJob[] = await fetchRemote3CoJobs({
  maxDays: MAX_DAYS,
  limit: MAX_JOBS,
});

await Promise.all(
  remote3Jobs.map(async (job) => {
    await addCompanyLogoIfMissing(job.companies.logo, job.companies.name, prisma);
  }),
);

console.log(`Found ${remote3Jobs.length} jobs from remote3.co`);

// Filter out no longer available jobs
const jobsToSave = (
  await Promise.all(
    remote3Jobs.flatMap(async (job) => {
      const isNoLongerAvailable = await checkIfUrlFetchReturnsText(
        job.apply_url,
        "Sorry, we couldn't find anything here",
      );
      if (isNoLongerAvailable) return [];
      const markdown = turndownService.turndown(job.description).trim();
      return [{ ...job, description: markdown }];
    }),
  )
).flat();

console.log(
  `After filtering for no longer available jobs, ${jobsToSave.length} remained.`,
);

const nonDuplicateJobs: Remote3CoJob[] = [];

// Filter out duplicate jobs
for (const job of jobsToSave) {
  const alreadySavedJob = await prisma.job.findFirst({
    where: {
      jobUrl: job.apply_url,
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
  } duplicate jobs. Saving ${nonDuplicateJobs.length} jobs to db.`,
);

// Save the unique jobs to the database
for (const job of nonDuplicateJobs) {
  try {
    const jobToSave = {
      title: job.title,
      source: "remote3-co",
      company: {
        name: job.companies.name,
        logoUrl: job.companies.logo,
      },
      tags: Array.isArray(job.categories)
        ? job.categories
        : job.categories
          ? [job.categories]
          : [],
      location: job.location ? job.location.split(",").map((s) => s.trim()) : [],
      publishedAt: new Date(job.live_at),
      salaryMin: job.salary_min ?? undefined,
      salaryMax: job.salary_max ?? undefined,
      jobDescription: job.description,
      jobUrl: job.apply_url,
      isRemote: !job.on_site,
    };
    await saveJobInDb(jobToSave, prisma);
  } catch (e) {
    console.error(`Error persisting job: ${job.title}`);
  }
}

await prisma.$disconnect();
