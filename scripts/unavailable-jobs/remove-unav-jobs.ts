import { PrismaClient, type Job } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch jobs posted in the last 5 days and remove any that redirect elsewhere
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

console.log(`Checking jobs since ${fiveDaysAgo.toISOString()} for redirects`);
const jobs = await prisma.job.findMany({
  where: { publishedAt: { gte: fiveDaysAgo } },
});

console.log(`Found ${jobs.length} jobs to check`);

// Perform all fetches concurrently and collect jobs redirecting to error locations
const redirectChecks = jobs.map(async (job) => {
  if (job.jobUrl.startsWith("mailto:")) return null;
  try {
    const response = await fetch(job.jobUrl, { redirect: "manual" });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      const isError = ["error", "not_found", "not-found"].some((e) =>
        location?.includes(e)
      );
      if (location && isError) {
        return { job, location };
      }
    }
  } catch (error) {
    console.error(`Error fetching URL ${job.jobUrl}:`, error);
  }
  return null;
});
const redirectResults = await Promise.all(redirectChecks);
const failedRedirects = redirectResults.filter(
  (r): r is { job: Job; location: string } => r !== null
);

console.log(`Found ${failedRedirects.length} jobs with error redirects`);

let deletedCount = 0;
for (const { job, location } of failedRedirects) {
  await prisma.job.delete({
    where: { id: job.id },
  });
  deletedCount++;
}

console.log(`Deleted ${deletedCount} jobs`);

await prisma.$disconnect();
