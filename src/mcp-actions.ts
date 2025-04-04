import { z } from "zod";
import { prisma } from "./index";
import { uniq } from "lodash";
import { normalizeTags } from "./types";

const sinceWhenSchema = z
  .string()
  .regex(/^\d+[dwm]$/)
  .refine((a) => a[0] && +a[0] !== 0, "First digit must not be zero");

const argsSchema = z.object({
  sinceWhen: sinceWhenSchema,
  isRemote: z.boolean().optional(),
  keywords: z
    .array(z.string())
    .default([])
    .transform((keywords) => uniq(keywords.map((w) => w.toLowerCase())))
    .transform(normalizeTags),
  excludeKeywords: z
    .array(z.string())
    .default([])
    .transform((keywords) => uniq(keywords.map((w) => w.toLowerCase())))
    .transform(normalizeTags),
});

export async function getJobs(args: unknown) {
  const { sinceWhen, isRemote, keywords, excludeKeywords } =
    argsSchema.parse(args);

  const date: Date = getDateFromSinceWhen(sinceWhen);

  const jobs = (
    await prisma.job.findMany({
      where: { date: { gte: date } },
    })
  ).map((job) => ({
    ...job,
    tags: JSON.parse(job.tags) as string[],
  }));

  // filter jobs by remote
  const jobsWithRemoteFilter = jobs.flatMap((job) => {
    switch (isRemote) {
      case undefined:
        return [job];
      case true:
        return job.is_remote ? [job] : [];
      case false:
        return job.is_remote ? [] : [job];
    }
  });

  // filter jobs by keywords/tags
  const jobsWithTagFilter = jobsWithRemoteFilter.filter((job) => {
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

  // sorted by date descending
  const sortedFilteredJobs = jobsWithExcludeFilter.sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });

  return {
    content: [{ type: "text", text: JSON.stringify(sortedFilteredJobs) }],
  };
}

export async function getJobKeywords(args: unknown) {
  const { sinceWhen } = z.object({ sinceWhen: sinceWhenSchema }).parse(args);
  const date: Date = getDateFromSinceWhen(sinceWhen);

  const jobs = await prisma.job.findMany({
    where: { date: { gte: date } },
    select: { tags: true },
  });

  const keywords = uniq(
    jobs.flatMap((job) => JSON.parse(job.tags) as string[])
  ).sort();

  return {
    content: [{ type: "text", text: JSON.stringify(keywords) }],
  };
}

function getDateFromSinceWhen(sinceWhen: string) {
  const amount = parseInt(sinceWhen.slice(0, -1));

  const units = sinceWhen.slice(-1);

  const date = new Date();

  switch (units) {
    case "d":
      date.setDate(date.getDate() - amount);
      break;
    case "w":
      date.setDate(date.getDate() - amount * 7);
      break;
    default:
      throw new Error(`Invalid unit: ${units}`);
  }

  return date;
}
