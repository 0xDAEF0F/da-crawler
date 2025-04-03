import { z } from "zod";

export type Job = {
  title: string;
  jobUrl: string;
  company: string;
  tags: string[];
  date: Date;
  jobDescription: string;
  realJobUrl: string;
};

export const jobSchema = z
  .object({
    title: z.string().min(5).max(100),
    job_url: z.string().url(),
    company: z.string().min(2).max(100),
    tags: z.array(z.string().min(2)),
    date: z
      .string()
      .datetime({ local: true })
      .transform((date) => new Date(date)),
    job_description: z.string().min(10),
    real_job_url: z.string().url(),
  })
  .transform((data) => {
    const transformed: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
      transformed[snakeToCamel(key)] = value;
    });
    return transformed as Job;
  });

// Utility function
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
