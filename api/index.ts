import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { getJobsArgs } from "../types";
import { ArkErrors } from "arktype";
import { normalizeTags } from "../mcp-server/types";

const prisma = new PrismaClient();

const app = new Hono();

app.post("/get-jobs", async (c) => {
  const body = await c.req.json();

  const args = getJobsArgs({
    ...body,
    keywords: body.keywords ?? [],
    excludeKeywords: body.excludeKeywords ?? [],
  });

  if (args instanceof ArkErrors) {
    return c.json({ error: true, message: args.summary }, 400);
  }

  const {
    keywords: kw,
    excludeKeywords: ekw,
    sinceWhen,
    isRemote,
    limit,
  } = args;
  const keywords = normalizeTags(kw);
  const excludeKeywords = normalizeTags(ekw);

  const jobs = (
    await prisma.job.findMany({
      where: {
        date: { gte: sinceWhen },
        ...(isRemote && { is_remote: true }),
      },
      orderBy: { date: "desc" },
    })
  ).map((job) => ({ ...job, tags: JSON.parse(job.tags) as string[] }));

  // filter jobs by keywords/tags
  const jobsWithTagFilter = jobs.filter((job) => {
    if (keywords.length === 0) return true;
    for (const keyword of keywords) {
      if (job.tags.includes(keyword)) return true;
    }
    return false;
  });

  // filter jobs by excludeKeywords
  const jobsWithExcludeFilter = jobsWithTagFilter.filter((job) => {
    const jobTags = job.tags.flatMap((tag) => tag.split(" "));
    for (const excludeKeyword of excludeKeywords) {
      if (jobTags.includes(excludeKeyword)) return false;
    }
    return true;
  });

  return c.json({
    error: false,
    jobs: jobsWithExcludeFilter.slice(0, limit ?? 10),
  });
});

export default app;
