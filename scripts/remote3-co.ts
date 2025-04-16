import { type } from "arktype";
import dotenv from "dotenv";
import TurndownService from "turndown";
import { cleanUrl } from "../api/utils";
import { PrismaClient } from "@prisma/client";
import { trimSubstr } from "./utils.test";

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

// Schema for the remote3.co jobs
const remote3CoJob = type({
  id: "number",
  created_at: "string.date",
  live_at: "string.date",
  title: type("string.lower").pipe((t) => trimSubstr(t, ["| smartrecruiters"])),
  description: "string",
  description_format: "string.lower |> 'html'",
  type: "string.lower |> 'full-time' | 'contract'", // no internships
  location: "string", // worldwide
  salary_min: "number",
  on_site: "boolean",
  salary_max: "number",
  apply_url: type("string.url").pipe((url) => {
    const urlObj = new URL(url);
    return cleanUrl(`${urlObj.origin}${urlObj.pathname}`);
  }),
  slug: type("string").pipe((slug) => `https://remote3.co/remote-jobs/${slug}`),
  categories: type("string.json.parse").to("string.lower[] |> string.trim[]"),
  companies: type({
    name: type("string.lower").narrow((n, ctx) =>
      n.includes("stealth") ? ctx.mustBe("not stealth") : true
    ),
  }),
});

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

const validatedJobs: (typeof remote3CoJob.infer)[] = [];

for (const jobData of data as unknown[]) {
  const validated = remote3CoJob(jobData);
  if (validated instanceof type.errors) {
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

const nonDuplicateJobs: (typeof remote3CoJob.infer)[] = [];

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
      },
    });
  } catch (e) {
    console.error(`Error persisting job: ${job.title}`);
  }
}
