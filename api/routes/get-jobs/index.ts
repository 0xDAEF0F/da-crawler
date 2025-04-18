import { getJobsBody } from "./body-schema";
import { ArkErrors } from "arktype";
import { normalizeWords } from "~/utils/normalize-words";
import { KEYWORD_MAPPINGS } from "~/utils/constants";
import { uniq } from "lodash";
import { prisma } from "@/.";
import { jobResponseSchema, type JobResponse } from "./get-jobs-res";
import type { Context } from "hono";

export const getJobs = async (c: Context) => {
  const body = await c.req.json();

  const args = getJobsBody({
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
    excludeFromTitle,
    sinceWhen,
    isRemote,
    limit,
    offset,
  } = args;
  const keywords = normalizeWords(kw, KEYWORD_MAPPINGS).map((k) => k.toLowerCase());
  const excludeKeywords = normalizeWords(ekw, KEYWORD_MAPPINGS).map((k) =>
    k.toLowerCase()
  );

  const jobs = (
    await prisma.job.findMany({
      where: {
        is_remote: isRemote,
        date: { gte: sinceWhen },
        AND: [
          ...(excludeFromTitle ?? []).map((term) => ({
            NOT: {
              title: {
                contains: term,
              },
            },
          })),
        ],
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

  // Apply offset and limit
  const offsetValue = offset ?? 0;
  const limitValue = limit ?? 10;
  const jobsWithLimit = jobsWithExcludeFilter.slice(
    offsetValue,
    offsetValue + limitValue
  );

  const jobsResponse: JobResponse[] = jobsWithLimit.map((job) => {
    const jobToValidate: JobResponse = {
      id: job.id,
      company: job.company,
      date: job.date.toISOString(),
      job_description: job.ai_analysis?.summary || job.job_description,
      job_url: job.job_url,
      keywords: uniq([
        ...job.ai_analysis.keywords,
        ...job.tags,
        job.ai_analysis?.option_to_pay_in_crypto ? "crypto-pay" : [],
      ]).flat(),
      job_title: job.ai_analysis?.job_title || job.title,
      is_remote: job.is_remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
    };

    if (job.ai_analysis.country) {
      jobToValidate.location = job.ai_analysis.country;
    }

    if (job.ai_analysis.region) {
      jobToValidate.location += ` | ${job.ai_analysis.region}`;
    }

    return jobResponseSchema.assert(jobToValidate);
  });

  return c.json({
    error: false,
    jobs: jobsResponse,
    totalResults: jobsWithExcludeFilter.length,
  });
};
