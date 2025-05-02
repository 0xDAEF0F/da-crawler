import { getJobsBody } from "./body.schema";
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
    k.toLowerCase(),
  );

  const jobs = (
    await prisma.job.findMany({
      where: {
        isRemote: isRemote,
        publishedAt: { gte: sinceWhen },
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
        aiAnalysis: true,
        company: true,
      },
      orderBy: { publishedAt: "desc" },
    })
  ).map((job) => ({
    ...job,
    tags: JSON.parse(job.keywords) as string[],
    aiAnalysis: {
      ...job.aiAnalysis,
      keywords: JSON.parse(job.aiAnalysis?.keywords ?? "[]") as string[],
    },
  }));

  // filter jobs by keywords/tags
  const jobsWithTagFilter = jobs.filter((job) => {
    if (keywords.length === 0) return true;
    const jobKeywords = uniq([...job.tags, ...job.aiAnalysis.keywords]);
    for (const keyword of keywords) {
      if (jobKeywords.includes(keyword)) return true;
    }
    return false;
  });

  // filter jobs by excludeKeywords
  const jobsWithExcludeFilter = jobsWithTagFilter.filter((job) => {
    if (excludeKeywords.length === 0) return true;
    const jobKeywords = uniq([...job.tags, ...job.aiAnalysis.keywords]);
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
    offsetValue + limitValue,
  );

  const jobsResponse = jobsWithLimit.map((job) => {
    const jobToValidate: JobResponse = {
      id: job.id,
      company: job.company.name,
      isRemote: job.isRemote ?? undefined,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      location:
        JSON.parse(job.location).length > 1
          ? JSON.parse(job.location)
          : JSON.parse(job.aiAnalysis.location ?? "[]"),
      publishedAt: job.publishedAt.toISOString(),
      jobDescription: job.jobDescription,
      jobUrl: job.jobUrl,
      jobTitle: job.title,
      keywords: uniq([
        ...job.tags,
        job.aiAnalysis?.optionToPayInCrypto ? "crypto-pay" : [],
      ]).flat(),
      ...(job.aiAnalysis.summary ? { jobSummary: job.aiAnalysis.summary } : {}),
      ...(job.company.logoUrl ? { companyLogoUrl: job.company.logoUrl } : {}),
    };

    return jobResponseSchema.assert(jobToValidate);
  });

  return c.json({
    error: false,
    jobs: jobsResponse,
    totalResults: jobsWithExcludeFilter.length,
  });
};
