import { PrismaClient } from "@prisma/client";
import { jobSchema } from "./job.schema";

export async function saveJobInDb(
  job: typeof jobSchema.infer,
  prisma: PrismaClient
): Promise<void> {
  const job_ = {
    ...job,
    tags: JSON.stringify(job.tags),
    location: JSON.stringify(job.location),
  };
  if (job.job_description_url) {
    job_.job_description_url = job.job_description_url;
  }
  try {
    await prisma.job.create({
      data: job_,
    });
  } catch (e) {
    console.error(`Unable to save job ${job.title} to db. Reason: ${e}`);
  }
}
