import { getJobsArgs } from "../types/get-jobs-api-body";
import { ArkErrors } from "arktype";
import { normalizeWords } from "../utils";
import { KEYWORD_MAPPINGS } from "../constants";
import { uniq } from "lodash";
import { getConnInfo } from "hono/bun";
import { prisma } from "../utils/db";
import type { JobResponse } from "../types/get-jobs-api-response";
import type { Context } from "hono";

export const getJobs = async (c: Context) => {
  console.log(`Request from: ${getConnInfo(c).remote.address}`);

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
  const keywords = normalizeWords(kw, KEYWORD_MAPPINGS).map((k) =>
    k.toLowerCase()
  );
  const excludeKeywords = normalizeWords(ekw, KEYWORD_MAPPINGS).map((k) =>
    k.toLowerCase()
  );

  const jobs = (
    await prisma.job.findMany({
      where: {
        date: { gte: sinceWhen },
        ...(isRemote && { is_remote: true }),
      },
      include: {
        ai_analysis: true,
      },
      orderBy: { date: "desc" },
    })
  ).map((job) => ({
    ...job,
    tags: JSON.parse(job.tags) as string[],
    ai_analysis: {
      ...job.ai_analysis,
      keywords: JSON.parse(job.ai_analysis?.keywords ?? "[]") as string[],
    },
  }));

  // filter jobs by keywords/tags
  const jobsWithTagFilter = jobs.filter((job) => {
    if (keywords.length === 0) return true;
    const jobKeywords = uniq([...job.tags, ...job.ai_analysis.keywords]);
    for (const keyword of keywords) {
      if (jobKeywords.includes(keyword)) return true;
    }
    return false;
  });

  // filter jobs by excludeKeywords
  const jobsWithExcludeFilter = jobsWithTagFilter.filter((job) => {
    if (excludeKeywords.length === 0) return true;
    const jobKeywords = uniq([...job.tags, ...job.ai_analysis.keywords]);
    for (const excludeKeyword of excludeKeywords) {
      if (jobKeywords.includes(excludeKeyword)) return false;
    }
    return true;
  });

  const jobsWithLimit = jobsWithExcludeFilter.slice(0, limit ?? 10);

  const jobsResponse = jobsWithLimit.map(
    (job): JobResponse => ({
      company: job.company,
      date: job.date,
      job_description: job.ai_analysis?.summary || job.job_description,
      job_url: job.job_url,
      keywords: uniq([
        ...job.ai_analysis.keywords,
        ...job.tags,
        job.ai_analysis.option_to_pay_in_crypto ? "crypto-pay" : [],
      ]).flat(),
      location:
        job.ai_analysis?.country && job.ai_analysis?.region
          ? `${job.ai_analysis.country} | ${job.ai_analysis.region}`
          : job.ai_analysis?.country || job.ai_analysis?.region || undefined,
      job_title: job.ai_analysis?.job_title || job.title,
      is_remote: job.is_remote,
    })
  );

  return c.json({
    error: false,
    jobs: jobsResponse,
  });
};
