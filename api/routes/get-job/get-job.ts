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
      aiAnalysis: true,
      company: true,
    },
  });

  if (!job) {
    return c.json({ error: true, message: "Job not found" }, 404);
  }

  const response = {
    id: job.id,
    title: job.title,
    company: job.company.name,
    keywords: job.keywords,
    date: job.publishedAt,
    jobDescription: job.jobDescription,
    jobUrl: job.jobUrl,
    isRemote: job.isRemote,
    isFullTime: job.aiAnalysis?.isFullTime,
    location: job.aiAnalysis?.location,
    // ai analysis
    aiSummary: job.aiAnalysis?.summary,
    aiKeywords: job.aiAnalysis?.keywords,
    aiLocation: job.aiAnalysis?.location,
    aiCompensationAmount: job.aiAnalysis?.salaryMin,
  };

  const validated = getJobSchema.assert(response);

  return c.json(validated);
}
