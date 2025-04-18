import { prisma } from "@/.";
import type { Context } from "hono";
import { getJobSchema } from "./get-job.schema";

export async function getJob(c: Context) {
  const id = c.req.param("id");

  const job = await prisma.job.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      ai_analysis: true,
    },
  });

  if (!job) {
    return c.json({ error: true, message: "Job not found" }, 404);
  }

  const response = {
    id: job.id,
    title: job.title,
    company: job.company,
    keywords: job.tags,
    date: job.date,
    job_description: job.job_description,
    job_url: job.job_url,
    is_remote: job.is_remote,
    is_full_time: job.ai_analysis?.is_full_time,
    location: job.ai_analysis?.country,
    // ai analysis
    ai_summary: job.ai_analysis?.summary,
    ai_keywords: job.ai_analysis?.keywords,
    ai_location: job.ai_analysis?.country,
    ai_compensation_amount: job.ai_analysis?.compensation_amount,
  };

  const validated = getJobSchema.assert(response);

  return c.json(validated);
}
