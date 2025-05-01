import type { PrismaClient } from "@prisma/client";
import type { JobSchema } from "./job.schema";

export async function saveJobInDb(job: JobSchema, prisma: PrismaClient): Promise<void> {
  try {
    const company = await prisma.company.upsert({
      where: { name: job.company.name },
      update: { logoUrl: job.company.logoUrl ?? undefined },
      create: {
        name: job.company.name,
        logoUrl: job.company.logoUrl ?? undefined,
      },
    });

    await prisma.job.create({
      data: {
        title: job.title,
        source: job.source,
        companyId: company.id,
        keywords: JSON.stringify(job.tags),
        location: JSON.stringify(job.location),
        publishedAt: job.publishedAt,
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        jobDescription: job.jobDescription,
        jobUrl: job.jobUrl,
        isRemote: job.isRemote ?? undefined,
      },
    });
  } catch (err) {
    console.error(`Error saving job: ${job.title} because of: ${err}`);
  }
}
