import { type } from "arktype";
import { job, type Job } from "../types/job";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NUM_PAGES = 10;
const BASE_URL = "https://beincrypto.com/jobs";

// beincrypto job schema
const jobSchema = type({
  id: "number",
  title: "string",
  slug: "string",
  type: "string",
  salaryStart: "number | null",
  salaryEnd: "number | null",
  applyLink: "string",
  applyEmail: "string | null",
  shortDescription: "string | null",
  description: "string",
  applicants: "number",
  createdAt: "string",
  updatedAt: "string",
  paidInCrypto: "boolean",
  publishedDate: "string",
  unpublishedDate: "string | null",
  locale: "string",
  closed: "boolean",
  featFromDate: "string | null",
  featToDate: "string | null",
  numberOfViews: "number",
  isStartUp: "boolean",
  company: {
    id: "number",
    name: "string",
    website: "string",
    email: "string | null",
    logoURL: "string | null",
    description: "string",
    createdAt: "string",
    updatedAt: "string",
    slug: "string",
    locale: "string",
  },
  jobTags: type({
    id: "number",
    slug: "string",
    label: "string",
    createdAt: "string",
    updatedAt: "string",
    locale: "string",
    isNonTech: "boolean | null",
  }).array(),
  locationTags: type({
    id: "number",
    label: "string",
    slug: "string",
    assignable: "boolean",
    createdAt: "string",
    updatedAt: "string",
    locale: "string",
    country: "boolean",
  }).array(),
});

const jobsToPersist: Job[] = [];

for (let i = 1; i <= NUM_PAGES; i++) {
  const res = await fetch(`${BASE_URL}?page=${i}&_data=routes/jobs/index`, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      priority: "u=1, i",
      "sec-ch-ua":
        '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      "sec-ch-ua-arch": '"arm"',
      "sec-ch-ua-bitness": '"64"',
      "sec-ch-ua-full-version": '"135.0.7049.42"',
      "sec-ch-ua-full-version-list":
        '"Google Chrome";v="135.0.7049.42", "Not-A.Brand";v="8.0.0.0", "Chromium";v="135.0.7049.42"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"15.3.2"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      cookie:
        "_omappvp=1rKDt5xrtvquq7iAFA1KbsaIhGJuqpmFbvO2dNkmAqRk5dhlCOnm0jkvSltJ30tsTwa4sVs2uzepI2vQdr8meJWfsTfe4Z8l; _ga=GA1.1.1017356014.1737570230; _ga_MC3WDEPCHB=GS1.1.1740792948.6.0.1740792981.0.0.0; _ga_4W5D1QWRFV=GS1.1.1740792948.6.0.1740792981.0.0.0; _ga_QSY59MNK2N=GS1.1.1740792948.6.0.1740792981.0.0.0; ph_phc_rUQ1tiR9Z8KMUrQUu4NyLKZzfiLBA4bgevgJqxsmids_posthog=%7B%22distinct_id%22%3A%2201948f41-9e1f-7f6e-8f90-22bb86a03329%22%2C%22%24sesid%22%3A%5B1740792981974%2C%2201954f58-67f4-78ef-b3b1-22f4936368d2%22%2C1740792948724%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22u%22%3A%22https%3A%2F%2Fbeincrypto.com%2Fjobs%2F%22%7D%7D; __cf_bm=SllFm7975DrJ2E5cHgqIvIl39.9mDbsY4S1yLHdgNHE-1744331428-1.0.1.1-D0Oaixy9UZiVi.k0rY_bNSSaKHq7myo8_zE24c5cV_ufMs1_FuQma_0eK.CtrDfKT4dFfKljPI7ChlKWlrTLIlVt2diziriaBqbR.fFYHLm2hRttlWjldsFjBdnyeEuQ; cf_clearance=JgGFSg6A0t_4ywRCl4T5kmhZanQDcjche3SKlDATL6g-1744331429-1.2.1.1-CasZ1Ut9bWBWM6L4lkURTVI8zSu1yJ_I7tLUVAPYWwRVQ8sB3wiqoWG1Id.9FOz_E.LeDPw5Z7UWkVHBAE2e7wDwlDHxX7rCzl5lPzUHCrW2Uzi5S7w91nlRi74mp.9qKqZM3BRePD1MYndcbipvh14h2BqFzaqsgiGP7OR9cV7OA42EJdvtHXUyBb2XPGkXfWBRP60_tQi8_b7dX9gusvSezTcP5xz3dueatCMKUuVidox2d00u7leNUxflupr3XZMqbVR78Of4W3SfaXXNSIvxrxy8fBKlfZyrE_yUfEtLbqAx4eyTaBUejb9VlzwofRUQC01k_wveA1O8Ze92.W9bNPj2DRWqnmCa26pNqoI",
      Referer: `https://beincrypto.com/jobs/?page=${i}`,
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });
  const data = (await res.json()) as any;
  const jobs = jobSchema.array()(data.jobs.data);
  if (jobs instanceof type.errors) {
    console.error(`Unable to validate jobs on page ${i}`);
    console.log(`Reason: ${jobs.summary}`);
    continue;
  }
  const jobs_ = jobs.flatMap((j): Job[] => {
    const maybeJob = job({
      title: j.title,
      company: j.company.name,
      tags: j.jobTags.map((jt) => jt.label),
      date: j.publishedDate,
      is_remote: j.locationTags.some((lt) =>
        lt.label.toLowerCase().includes("remote")
      ),
      job_description: j.description,
      job_url: j.applyLink,
      real_job_url: j.applyLink,
    });
    if (maybeJob instanceof type.errors) {
      console.error(`Unable to validate job ${j.title}`);
      console.log(`Reason: ${maybeJob.summary}`);
      return [];
    }
    return [maybeJob];
  });

  jobsToPersist.push(...jobs_);

  console.log(`Validated ${jobs_.length} jobs on page ${i}`);

  // wait 0.5 second to avoid suspicions
  await new Promise((resolve) => setTimeout(resolve, 500));
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
    console.error(`Unable to persist job ${job.title}`);
    console.log(`Reason: ${e}`);
  }
}

console.log(`Persisted ${count} jobs`);
