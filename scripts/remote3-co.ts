import { type } from "arktype";
import dotenv from "dotenv";
import TurndownService from "turndown";
import { PrismaClient } from "@prisma/client";
import { isDateTooOld, parseArguments } from "./utils";
import { remote3CoSchema } from "./remote3-co.schema";

const { max_jobs: MAX_JOBS, max_days: MAX_DAYS } = parseArguments();

const prisma = new PrismaClient();

dotenv.config();

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

const getJobsUrl =
  "https://ojpncdvueyetebptprsv.supabase.co/rest/v1/jobs?select=*%2Ccompanies%28*%29&is_draft=eq.false&order=live_at.desc&offset=0&limit=200";

const res = await fetch(getJobsUrl, {
  headers: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "accept-profile": "public",
    apikey: process.env.REMOTE3_CO_API_KEY!,
    pragma: "no-cache",
    priority: "u=1, i",
    "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "x-client-info": "supabase-ssr/0.5.2",
    Referer: "https://www.remote3.co/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
  method: "GET",
});

const data = (await res.json()) as [];

console.log(`Initially found ${data.length} jobs`);

const validatedJobs: (typeof remote3CoSchema.infer)[] = [];

for (const jobData of data as unknown[]) {
  const validated = remote3CoSchema(jobData);
  if (validated instanceof type.errors) {
    console.error(`Skipping job from remote3.co because it did not pass validation`);
    continue;
  }
  if (isDateTooOld(validated.live_at, MAX_DAYS)) {
    console.error(`Skipping job ${validated.title} from remote3.co because it's too old`);
    continue;
  }
  if (validated.description_format === "html") {
    validated.description = turndownService.turndown(validated.description);
  }
  validatedJobs.push(validated);
}

console.log(`${data.length - validatedJobs.length} jobs did not pass validation filter`);

// Filter out no longer available jobs
const jobsToSave = await Promise.all(
  validatedJobs.filter(async (job) => {
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
